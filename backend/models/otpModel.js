import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    otpHash: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Mongoose TTL index to automatically delete records after they expire.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const otpModel = mongoose.models.EmailVerificationOTP || mongoose.model('EmailVerificationOTP', otpSchema)

export default otpModel
