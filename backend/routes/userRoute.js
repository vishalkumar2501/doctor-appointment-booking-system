import express from 'express'
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, sendRegisterOTP, verifyRegisterOTP, sendResetOTP, verifyResetOTP, resetPassword } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'


import { getAvailableSlots } from '../controllers/availabilityController.js'
import { addFeedback, getDoctorFeedback } from '../controllers/feedbackController.js'
import { validateFeedback } from '../middlewares/validation.js'
import { createRazorpayOrder, verifyRazorpayPayment, getPaymentStatus, initiateRefund, handlePaymentWebhook } from '../controllers/paymentController.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/send-register-otp', sendRegisterOTP)
userRouter.post('/verify-register-otp', verifyRegisterOTP)
userRouter.post('/send-reset-otp', sendResetOTP)
userRouter.post('/verify-reset-otp', verifyResetOTP)
userRouter.post('/reset-password', resetPassword)
userRouter.post('/login', loginUser)

userRouter.get('/get-profile', authUser, getProfile)
userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile)
userRouter.post('/book-appointment', authUser, bookAppointment)
userRouter.get('/appointments', authUser, listAppointment)
userRouter.post('/cancel-appointment', authUser, cancelAppointment)

userRouter.post('/payment/create-order', authUser, createRazorpayOrder)
userRouter.post('/payment/verify', authUser, verifyRazorpayPayment)
userRouter.get('/payment/status', authUser, getPaymentStatus)
userRouter.post('/payment/refund', authUser, initiateRefund)
userRouter.post('/payment/webhook', handlePaymentWebhook)

// --- Doctor Availability & Feedback Routes ---
userRouter.get('/doctor/:docId/slots', getAvailableSlots)
userRouter.post('/feedback', authUser, validateFeedback, addFeedback)

export default userRouter