import mongoose from 'mongoose';
import feedbackModel from '../models/feedbackModel.js';
import appointmentModel from '../models/appointmentModel.js';
import doctorReviewStatsModel from '../models/doctorReviewStatsModel.js';

/**
 * Service class handling all Patient Feedback operations, calculations,
 * and automatic doctor rating statistics syncs.
 */
class FeedbackService {
  /**
   * Verifies all feedback constraints for an appointment before submission.
   * @param {string} patientId - Unique identifier of the patient (from authUser)
   * @param {Object} data - Feedback inputs (appointmentId, doctorId, rating, comment)
   * @returns {Promise<Object>} Verification status and matched appointment document
   * @throws {Error} If validation checks fail
   */
  async validateFeedback(patientId, data) {
    const { appointmentId, doctorId, rating, comment } = data;

    // 1. Verify rating range
    if (rating === undefined || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error("Rating must be an integer between 1 and 5.");
    }

    // 2. Verify comment length if provided
    if (comment && comment.trim().length > 1000) {
      throw new Error("Review comment cannot exceed 1000 characters.");
    }

    // 3. Verify appointment exists
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      throw new Error("Appointment does not exist.");
    }

    // 4. Verify ownership
    if (appointment.userId.toString() !== patientId.toString()) {
      throw new Error("Unauthorized: You can only submit feedback for your own appointments.");
    }

    // 5. Verify doctor alignment
    if (appointment.docId.toString() !== doctorId.toString()) {
      throw new Error("Doctor ID mismatch for the target appointment.");
    }

    // 6. Verify completion
    if (!appointment.isCompleted) {
      throw new Error("Feedback can only be submitted for completed appointments.");
    }

    // 7. Verify not cancelled
    if (appointment.cancelled) {
      throw new Error("Cannot submit feedback for a cancelled appointment.");
    }

    // 8. Verify feedback doesn't already exist
    const alreadyReviewed = await this.hasPatientAlreadyReviewed(appointmentId);
    if (alreadyReviewed) {
      throw new Error("Feedback has already been submitted for this appointment.");
    }

    return appointment;
  }

  /**
   * Checks if feedback has already been submitted for a target appointment.
   * @param {string} appointmentId - Unique identifier of the appointment
   * @returns {Promise<boolean>} True if feedback exists, false otherwise
   */
  async hasPatientAlreadyReviewed(appointmentId) {
    const feedback = await feedbackModel.findOne({ appointmentId });
    return !!feedback;
  }

  /**
   * Recalculates a doctor's overall rating statistics and persists them.
   * Computes average rating (rounded to 1 decimal place) and review count.
   * @param {string} doctorId - Unique identifier of the doctor
   * @returns {Promise<Object>} Object containing the computed averageRating and totalReviews
   */
  async updateDoctorRating(doctorId) {
    const stats = await feedbackModel.aggregate([
      { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } },
      {
        $group: {
          _id: '$doctorId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    let averageRating = 0;
    let totalReviews = 0;

    if (stats.length > 0) {
      averageRating = Math.round(stats[0].averageRating * 10) / 10;
      totalReviews = stats[0].totalReviews;
    }

    await doctorReviewStatsModel.findOneAndUpdate(
      { doctorId },
      { $set: { averageRating, totalReviews } },
      { upsert: true, new: true }
    );

    return { averageRating, totalReviews };
  }

  /**
   * Registers a new patient review and comment, updating the doctor statistics.
   * @param {string} patientId - Unique identifier of the patient (from authUser)
   * @param {Object} data - Feedback fields (appointmentId, doctorId, rating, comment)
   * @returns {Promise<Object>} Saved feedback document and updated rating statistics
   */
  async addFeedback(patientId, data) {
    // Run validations
    await this.validateFeedback(patientId, data);

    const { appointmentId, doctorId, rating, comment } = data;

    // Create feedback
    const feedback = new feedbackModel({
      appointmentId,
      doctorId,
      patientId,
      rating,
      comment: comment ? comment.trim() : ""
    });

    let savedFeedback;
    try {
      savedFeedback = await feedback.save();
    } catch (err) {
      if (err.code === 11000) {
        throw new Error("Feedback has already been submitted for this appointment.");
      }
      throw err;
    }

    // Recalculate doctor rating and count
    const updatedStats = await this.updateDoctorRating(doctorId);

    return {
      message: "Feedback submitted successfully.",
      feedback: savedFeedback,
      doctorStats: updatedStats
    };
  }

  /**
   * Retrieves all reviews submitted for a doctor, populated with patient profiles.
   * @param {string} doctorId - Unique identifier of the doctor
   * @returns {Promise<Array>} List of feedback documents
   */
  async getDoctorFeedback(doctorId) {
    return await feedbackModel
      .find({ doctorId })
      .populate('patientId', 'name image')
      .sort({ createdAt: -1 });
  }
}

export default new FeedbackService();
