import mongoose from 'mongoose';

const doctorReviewStatsSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctor',
        required: true,
        unique: true
    },
    averageRating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot exceed 5']
    },
    totalReviews: {
        type: Number,
        default: 0,
        min: [0, 'Total reviews cannot be negative']
    }
}, { timestamps: true });

const doctorReviewStatsModel = mongoose.models.doctorReviewStats || mongoose.model('doctorReviewStats', doctorReviewStatsSchema);

export default doctorReviewStatsModel;
