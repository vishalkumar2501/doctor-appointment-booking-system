import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'appointment',
        required: true,
        unique: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctor',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        },
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        trim: true
    },
    doctorReply: {
        type: String,
        trim: true
    },
    editedAt: {
        type: Date
    }
}, { timestamps: true })

// Index on doctorId and patientId for fast queries
feedbackSchema.index({ doctorId: 1, createdAt: -1 })
feedbackSchema.index({ patientId: 1 })

const feedbackModel = mongoose.models.feedback || mongoose.model('feedback', feedbackSchema)

export default feedbackModel
