import express from 'express'
import { doctorList, loginDoctor, appointmentsDoctor, appointmentCancel, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile, acceptInvitation, sendDoctorResetOTP, verifyDoctorResetOTP, resetDoctorPassword } from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDoctor.js'

import { getDoctorAvailability, updateDoctorAvailability } from '../controllers/availabilityController.js'
import { blockSlots, unblockSlots, getBlockedSlots } from '../controllers/blockedSlotController.js'
import { validateAvailability, validateBlockedSlot } from '../middlewares/validation.js'
import { getDoctorFeedback } from '../controllers/feedbackController.js'

const doctorRouter = express.Router()

doctorRouter.get('/list', doctorList)
doctorRouter.post('/login', loginDoctor)
doctorRouter.post('/accept-invite', acceptInvitation)
doctorRouter.post('/send-reset-otp', sendDoctorResetOTP)
doctorRouter.post('/verify-reset-otp', verifyDoctorResetOTP)
doctorRouter.post('/reset-password', resetDoctorPassword)
doctorRouter.get('/appointment', authDoctor, appointmentsDoctor)
doctorRouter.post('/complete-appointment', authDoctor, appointmentComplete)
doctorRouter.post('/cancel-appointment', authDoctor, appointmentCancel)
doctorRouter.get('/dashboard', authDoctor, doctorDashboard)
doctorRouter.get('/profile', authDoctor, doctorProfile)
doctorRouter.post('/update-profile', authDoctor, updateDoctorProfile)

// --- Doctor Availability & Blocked Slots Routes ---
doctorRouter.get('/profile/availability', authDoctor, getDoctorAvailability)
doctorRouter.post('/profile/availability', authDoctor, validateAvailability, updateDoctorAvailability)
doctorRouter.post('/block-slot', authDoctor, validateBlockedSlot, blockSlots)
doctorRouter.post('/unblock-slot/:blockId', authDoctor, unblockSlots)
doctorRouter.get('/blocked-slots', authDoctor, getBlockedSlots)

// --- Public Doctor Feedback Route ---
doctorRouter.get('/:doctorId/feedback', getDoctorFeedback)

export default doctorRouter