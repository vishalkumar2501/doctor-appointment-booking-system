import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/mongodb.js';
import feedbackModel from '../models/feedbackModel.js';
import doctorModel from '../models/doctorModel.js';
import doctorReviewStatsModel from '../models/doctorReviewStatsModel.js';

const runMigration = async () => {
    try {
        console.log("--- Starting Feedback to DoctorReviewStats Backfill ---");
        await connectDB();

        // Fetch all feedback documents
        const allFeedbacks = await feedbackModel.find({});
        console.log(`Found total ${allFeedbacks.length} feedback documents.`);

        // Fetch all doctors from database
        const allDoctors = await doctorModel.find({});
        const doctorMap = new Map(allDoctors.map(doc => [doc._id.toString(), doc]));
        console.log(`Found total ${allDoctors.length} doctor documents.`);

        // 1. Audit and filter valid, invalid, and orphaned feedbacks
        let validFeedbacksCount = 0;
        let invalidFeedbacksCount = 0;
        let orphanedFeedbacksCount = 0;

        const doctorFeedbacksMap = {}; // doctorId -> Array of ratings

        for (const fb of allFeedbacks) {
            if (!fb.doctorId || fb.rating === undefined || fb.rating === null) {
                invalidFeedbacksCount++;
                continue;
            }

            const docIdStr = fb.doctorId.toString();
            if (!doctorMap.has(docIdStr)) {
                orphanedFeedbacksCount++;
                continue;
            }

            validFeedbacksCount++;
            if (!doctorFeedbacksMap[docIdStr]) {
                doctorFeedbacksMap[docIdStr] = [];
            }
            doctorFeedbacksMap[docIdStr].push(fb.rating);
        }

        console.log("\n--- Feedback Quality Audit ---");
        console.log(`Valid Feedbacks: ${validFeedbacksCount}`);
        console.log(`Invalid Feedbacks (missing ID/rating): ${invalidFeedbacksCount}`);
        console.log(`Orphaned Feedbacks (doctor deleted): ${orphanedFeedbacksCount}`);

        // 2. Calculate and Upsert Stats
        console.log("\n--- Computing & Writing Stats ---");
        let doctorsWithReviewsCount = 0;
        let docsCreatedOrUpdated = 0;
        let zeroReviewDoctorsCount = 0;

        const resultsTable = [];
        const legacyComparison = [];

        for (const doc of allDoctors) {
            const docIdStr = doc._id.toString();
            const ratings = doctorFeedbacksMap[docIdStr] || [];

            let totalReviews = 0;
            let averageRating = 0;

            if (ratings.length > 0) {
                doctorsWithReviewsCount++;
                totalReviews = ratings.length;
                const sum = ratings.reduce((acc, curr) => acc + curr, 0);
                const avgRaw = sum / totalReviews;
                // Round consistently with feedbackService.js: Math.round(avg * 10) / 10
                averageRating = Math.round(avgRaw * 10) / 10;
            } else {
                zeroReviewDoctorsCount++;
            }

            // Upsert stats document
            const statsDoc = await doctorReviewStatsModel.findOneAndUpdate(
                { doctorId: doc._id },
                { $set: { averageRating, totalReviews } },
                { upsert: true, new: true }
            );

            docsCreatedOrUpdated++;

            // Verification matching check
            const matchStatus = (statsDoc.totalReviews === totalReviews && statsDoc.averageRating === averageRating) ? "MATCH" : "MISMATCH";

            resultsTable.push({
                name: doc.name,
                feedbackCount: totalReviews,
                feedbackAverage: averageRating,
                statsCount: statsDoc.totalReviews,
                statsAverage: statsDoc.averageRating,
                match: matchStatus
            });

            // Diagnostic check with legacy fields
            const legacyAvg = doc.averageRating || 0;
            const legacyCount = doc.totalReviews || 0;
            if (legacyAvg !== averageRating || legacyCount !== totalReviews) {
                legacyComparison.push({
                    name: doc.name,
                    calculatedAvg: averageRating,
                    calculatedCount: totalReviews,
                    legacyAvg,
                    legacyCount
                });
            }
        }

        // Output Verification Table
        console.log("\n--- Verification Table ---");
        console.table(resultsTable);

        // Output Legacy Discrepancies
        if (legacyComparison.length > 0) {
            console.log("\n--- Legacy Doctor Document Discrepancies (Diagnostic) ---");
            console.table(legacyComparison);
            console.log("NOTE: Legacy doctor documents were NOT modified; these values are for reference only.");
        } else {
            console.log("\n--- Legacy Doctor Document Discrepancies ---");
            console.log("No discrepancies found. All legacy doctor ratings match calculated values.");
        }

        console.log("\n--- Migration Summary ---");
        console.log(`Total Doctors: ${allDoctors.length}`);
        console.log(`Doctors with Reviews: ${doctorsWithReviewsCount}`);
        console.log(`Doctors with 0 Reviews: ${zeroReviewDoctorsCount}`);
        console.log(`Stats Documents Upserted: ${docsCreatedOrUpdated}`);
        console.log("Migration finished successfully.");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed.");
    }
};

runMigration();
