import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true,
    }, 
    docId:{
        type:String,
        required:true,
    },
    slotDate:{
        type:String,
        required:true,
    },
    slotTime:{
        type:String,
        required:true,
    },
    userData:{
        type:Object,
        required:true,
    },
    docData:{
        type:Object,
        required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    date:{
        type:Number,
        required:true,
    },
    cancelled:{
        type:Boolean,
        default:false,
    },
    payment:{
        type:Boolean,
        default:false,
    },
    isCompleted:{
        type:Boolean,
        default:false
    },
    reminderEligible: {
        type: Boolean,
        default: false
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        default: 'Razorpay'
    },
    razorpayOrderId: {
        type: String,
        default: null
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    paidAt: {
        type: Date,
        default: null
    },
    appointmentLocation: {
        line1: {
            type: String,
            default: null
        },
        line2: {
            type: String,
            default: null
        },
        city: {
            type: String,
            default: null
        }
    }
})

// Compound index for SlotGenerationService and BookingValidationService queries
appointmentSchema.index({ docId: 1, slotDate: 1, slotTime: 1, cancelled: 1 })

// Unique partial index to prevent concurrent booking race conditions (double bookings)
appointmentSchema.index(
    { docId: 1, slotDate: 1, slotTime: 1 },
    { unique: true, partialFilterExpression: { cancelled: false } }
)

// Compound index for ReminderService crons lookup
appointmentSchema.index({ reminderEligible: 1, reminderSent: 1, cancelled: 1 })

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema)

export default appointmentModel