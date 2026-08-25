import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'appointment',
        required: true,
    },
    doctorId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending',
    },
    razorpayOrderId: {
        type: String,
        required: true,
    },
    razorpayPaymentId: {
        type: String,
        default: null,
    },
    razorpaySignature: {
        type: String,
        default: null,
    },
    refundId: {
        type: String,
        default: null,
    },
    refundAmount: {
        type: Number,
        default: 0,
    },
    refundStatus: {
        type: String,
        enum: ['None', 'Initiated', 'Processed', 'Failed'],
        default: 'None',
    },
    refundReason: {
        type: String,
        default: null,
    },
    paidAt: {
        type: Date,
        default: null,
    },
    refundedAt: {
        type: Date,
        default: null,
    }
}, {
    timestamps: true
})

// Index fields for efficient lookup
paymentSchema.index({ appointmentId: 1 })
paymentSchema.index({ userId: 1 })
paymentSchema.index({ doctorId: 1 })
paymentSchema.index({ razorpayOrderId: 1 })
paymentSchema.index({ razorpayPaymentId: 1 })
paymentSchema.index({ refundId: 1 })

const paymentModel = mongoose.models.payment || mongoose.model('payment', paymentSchema)

export default paymentModel
