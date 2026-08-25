import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"
import paymentModel from "../models/paymentModel.js"
import paymentService from "../services/paymentService.js"
import crypto from 'crypto'
import otpModel from '../models/otpModel.js'
import transporter, { isMailConfigured } from '../config/nodemailer.js'
import doctorReviewStatsModel from '../models/doctorReviewStatsModel.js'



const acceptInvitation = async (req, res) => {
    try {
        const { token, email, password, confirmPassword } = req.body

        if (!token || !email || !password || !confirmPassword) {
            return res.json({ success: false, message: 'Missing required parameters.' })
        }

        if (password !== confirmPassword) {
            return res.json({ success: false, message: 'Password confirmation does not match.' })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: 'Please enter a strong password (minimum 8 characters).' })
        }

        const doctor = await doctorModel.findOne({ email })
        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found.' })
        }

        if (doctor.status !== 'INVITED') {
            return res.json({ success: false, message: 'This invitation has already been accepted or is invalid.' })
        }

        // Compare hashed token
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
        if (doctor.invitationToken !== tokenHash) {
            return res.json({ success: false, message: 'Invalid invitation token.' })
        }

        // Check expiration
        if (new Date() > new Date(doctor.invitationExpires)) {
            return res.json({ success: false, message: 'Invitation link has expired.' })
        }

        // Hash and update password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        doctor.password = hashedPassword
        doctor.status = 'ACTIVE'
        doctor.invitationToken = null
        doctor.invitationExpires = null

        await doctor.save()

        res.json({
            success: true,
            message: 'Account successfully activated. You can now login.'
        })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}


const changeAvailability = async(req, res) => {
    try{
        const {docId} = req.body

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, {available: !docData.available})
        res.json({
            success:true,
            message:'Availability Changed'
        })
    }
    catch(error){
        console.log(error)
        res.json({
            success:false,
            message:error.message
        })
    }
}


const doctorList = async(req, res) => {
    try{
        const { city, speciality } = req.query

        const query = { status: 'ACTIVE' }

        if (city && typeof city === 'string' && city.trim() !== '') {
            query.city = new RegExp('^' + city.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')
        }

        if (speciality && typeof speciality === 'string' && speciality.trim() !== '') {
            query.speciality = new RegExp('^' + speciality.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')
        }

        const doctors = await doctorModel.find(query).select(['-password', '-email', '-verificationCity', '-verifiedBy', '-verifiedAt'])

        // Fetch corresponding DoctorReviewStats records to enrich doctors
        const doctorIds = doctors.map(doc => doc._id)
        const stats = await doctorReviewStatsModel.find({ doctorId: { $in: doctorIds } })

        const statsMap = {}
        for (const stat of stats) {
            statsMap[stat.doctorId.toString()] = stat
        }

        const doctorsWithStats = doctors.map(doc => {
            const docObj = doc.toObject()
            const stat = statsMap[doc._id.toString()]
            docObj.averageRating = stat ? (stat.averageRating || 0) : 0
            docObj.totalReviews = stat ? (stat.totalReviews || 0) : 0
            return docObj
        })

        res.json({
            success:true,
            doctors: doctorsWithStats
        })
    }
    catch(error){
        console.log(error)
        res.json({
            success:false,
            message:error.message
        })
    }
}


//API for doctor Login
const loginDoctor = async(req, res) => {
    try{
        const {email, password} = req.body
        const doctor = await doctorModel.findOne({email})

        if(!doctor){
            return res.json({
                success:false,
                message:'Invalid Credentials'
            })
        }

        if (doctor.status === 'INVITED') {
            return res.json({
                success: false,
                message: 'Your account is invited but not active. Please set your password using the invitation link.'
            })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if(isMatch){
            const token = jwt.sign({id:doctor._id}, process.env.JWT_SECRET, { expiresIn: '24h' })

            res.json({
                success:true,
                token
            })
        }
        else{
            return res.json({
                success:false,
                message:'Invalid Credentials'
            })
        }
    }
    catch(error){
        console.log(error)
        res.json({
            success:false,
            message:error.message,
        })
    }
}


//API to get doctor appointments for doctor panel
const appointmentsDoctor = async(req, res) => {
    try{
        const docId = req.docId
        const appointments = await appointmentModel.find({docId})

        res.json({
            success:true,
            appointments
        })
    }
    catch(error){
        console.log(error)
        res.json({
            success:false,
            message:error.message
        })
    }
}


//API to mark appointment completed for doctor panel
const appointmentComplete = async(req, res) => {
    try{
        const docId = req.docId
        const {appointmentId} = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        
        if (appointmentData && appointmentData.cancelled) {
            return res.json({
                success: false,
                message: 'Cannot complete a cancelled appointment'
            })
        }

        if(appointmentData && appointmentData.docId.toString() === docId){
            await appointmentModel.findByIdAndUpdate(appointmentId, {isCompleted:true})
            return res.json({
                success:true,
                message:'Appointment Completed'
            })
        }
        else{
            return res.json({
                success:false,
                message:'Mark Failed'
            })   
        }
    }
    catch(error){
        console.log(error)
        res.json({
            success:false,
            message:error.message
        })
    }
}


//API to cancel appointment completed for doctor panel
const appointmentCancel = async(req, res) => {
    try{
        const docId = req.docId
        const {appointmentId} = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({
                success: false,
                message: 'Appointment not found'
            })
        }

        if (appointmentData.docId.toString() !== docId) {
            return res.json({
                success: false,
                message: 'Cancellation Failed: Doctor mismatch'
            })
        }

        if (appointmentData.cancelled) {
            return res.json({
                success: false,
                message: 'Appointment is already cancelled'
            })
        }

        if (appointmentData.isCompleted) {
            return res.json({
                success: false,
                message: 'Completed appointments cannot be cancelled'
            })
        }

        // Determine refund eligibility
        const payment = await paymentModel.findOne({ appointmentId, paymentStatus: 'Paid' })
        if (payment) {
            const refundCheck = paymentService.calculateRefundEligibility(
                'doctor',
                appointmentData.slotDate,
                appointmentData.slotTime,
                payment.amount,
                payment.paymentStatus,
                appointmentData.isCompleted
            )
            if (refundCheck.eligible) {
                payment.refundStatus = 'Initiated'
                payment.refundAmount = refundCheck.refundAmount
                payment.refundReason = refundCheck.reason
                await payment.save()

                // Execute Razorpay refund asynchronously (safeguarded via try-catch)
                try {
                    await paymentService.executeRazorpayRefund(payment._id)
                } catch (refundError) {
                    console.error("Async refund execution failed on doctor cancellation:", refundError)
                }
            } else {
                payment.refundReason = refundCheck.reason
                await payment.save()
            }
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled:true})

        // releasing doctor slot
        const { slotDate, slotTime } = appointmentData
        const doctorData = await doctorModel.findById(docId)
        let slots_booked = doctorData.slots_booked
        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
            await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        }

        return res.json({
            success:true,
            message:'Appointment Cancelled'
        })
    }
    catch(error){
        res.json({
            success:false,
            message:error.message
        })
    }
}


//API to get dashboard data for doctor panel
const doctorDashboard = async(req, res) => {
    try{
        const docId = req.docId
        const appointments = await appointmentModel.find({docId})

        // Fetch all payment records for this doctor to determine true payment statuses
        const payments = await paymentModel.find({ doctorId: docId })
        const paymentMap = {}
        payments.forEach(p => {
            const apptId = p.appointmentId.toString()
            if (!paymentMap[apptId]) {
                paymentMap[apptId] = []
            }
            paymentMap[apptId].push(p)
        })

        let earnings = 0;

        appointments.map((item) => {
            const apptId = item._id.toString()
            let isPaid = false

            if (paymentMap[apptId]) {
                // Check if any payment attempt was successful and has not been refunded
                isPaid = paymentMap[apptId].some(p => p.paymentStatus === 'Paid' && p.refundStatus !== 'Processed')
            } else {
                // Fallback: check legacy appointment fields for historical transactions
                isPaid = item.payment === true || item.paymentStatus === 'Paid'
            }

            if (item.isCompleted || isPaid) {
                earnings += item.amount
            }
        })

        let patients = []

        appointments.map((item) => {
            if(!patients.includes(item.userId)){
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments : appointments.length,
            patients : patients.length,
            latestAppointments : appointments.reverse().slice(0, 5)
        }

        res.json({
            success:true,
            dashData,
        })
    }
    catch(error){
        res.json({
            success:false,
            message:error.message
        })
    }
}


//API to get doctor profile for doctor panel
const doctorProfile = async(req, res) => {
    try{
        const docId = req.docId
        const profileData = await doctorModel.findById(docId).select('-password')

        if (profileData) {
            const docObj = profileData.toObject()
            const stat = await doctorReviewStatsModel.findOne({ doctorId: docId })
            docObj.averageRating = stat ? (stat.averageRating || 0) : 0
            docObj.totalReviews = stat ? (stat.totalReviews || 0) : 0

            res.json({
                success:true,
                profileData: docObj
            })
        } else {
            res.json({
                success:false,
                message: "Doctor profile not found."
            })
        }
    }
    catch(error){
        console.log(error)
        res.json({
            success:false,
            message:error.message
        })
    }
}


//API to update doctor profile data from doctor panel
const updateDoctorProfile = async(req, res) => {
    try{
        const docId = req.docId
        const {fees, address, available} = req.body

        await doctorModel.findByIdAndUpdate(docId, {fees, address, available})

        res.json({
            success:true,
            message:'Profile Updated'
        })
    }
    catch(error){
        console.log(error)
        res.json({
            success:false,
            message:error.message
        })
    }
}

const sendDoctorResetOTP = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.json({ success: false, message: "Email is required." })
        }

        const doctor = await doctorModel.findOne({ email })
        if (!doctor) {
            return res.json({ success: false, message: "Doctor with this email does not exist." })
        }

        const otpEmailKey = `doctor:${email}`

        const existingOTP = await otpModel.findOne({ email: otpEmailKey })
        if (existingOTP) {
            const timeDifference = new Date() - new Date(existingOTP.createdAt)
            if (timeDifference < 60 * 1000) {
                return res.json({
                    success: false,
                    message: "Please wait at least 60 seconds before requesting another OTP."
                })
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex')
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

        if (existingOTP) {
            existingOTP.otpHash = otpHash
            existingOTP.expiresAt = expiresAt
            existingOTP.attempts = 0
            existingOTP.createdAt = new Date()
            await existingOTP.save()
        } else {
            const newOTP = new otpModel({
                email: otpEmailKey,
                otpHash,
                expiresAt,
                attempts: 0,
                createdAt: new Date()
            })
            await newOTP.save()
        }

        const mailOptions = {
            from: process.env.SMTP_FROM || '"DocBook Support" <support@docbook.com>',
            to: email,
            subject: "DocBook Doctor Password Reset OTP",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #5F6FFF; text-align: center;">DocBook Doctor Password Reset</h2>
                    <p>Hello,</p>
                    <p>Your DocBook Doctor password reset verification OTP is:</p>
                    <div style="background-color: #f2f3ff; border: 1px dashed #5F6FFF; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #5F6FFF; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This OTP is valid for 5 minutes and can only be used once.</p>
                    <p>If you did not request a password reset, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #888; text-align: center;">This is an automated message. Please do not reply directly to this email.</p>
                </div>
            `
        }

        if (!isMailConfigured) {
            console.log("====================================")
            console.log("[Doctor Password Reset OTP] SMTP not configured. OTP generated:")
            console.log("To:", email)
            console.log("OTP Code:", otp)
            console.log("====================================")
            return res.json({
                success: true,
                message: `Dev Mode (SMTP not set): Your OTP is ${otp}`
            })
        }

        await transporter.sendMail(mailOptions)
        res.json({
            success: true,
            message: "OTP sent successfully."
        })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyDoctorResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body

        if (!email || !otp) {
            return res.json({ success: false, message: "Missing Details" })
        }

        const otpEmailKey = `doctor:${email}`

        const otpRecord = await otpModel.findOne({ email: otpEmailKey })
        if (!otpRecord) {
            return res.json({
                success: false,
                message: "OTP verification record not found. Please request a new OTP."
            })
        }

        if (new Date(otpRecord.expiresAt) < new Date()) {
            await otpModel.deleteOne({ email: otpEmailKey })
            return res.json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            })
        }

        if (otpRecord.attempts >= 5) {
            await otpModel.deleteOne({ email: otpEmailKey })
            return res.json({
                success: false,
                message: "Maximum verification attempts exceeded. Please request a new OTP."
            })
        }

        const submittedHash = crypto.createHash('sha256').update(otp).digest('hex')
        if (submittedHash !== otpRecord.otpHash) {
            otpRecord.attempts += 1
            await otpRecord.save()
            
            if (otpRecord.attempts >= 5) {
                await otpModel.deleteOne({ email: otpEmailKey })
                return res.json({
                    success: false,
                    message: "Incorrect OTP. Maximum attempts reached. Please request a new OTP."
                })
            }
            return res.json({
                success: false,
                message: `Incorrect OTP. ${5 - otpRecord.attempts} attempts remaining.`
            })
        }

        res.json({
            success: true,
            message: "OTP verified successfully. You can now reset your password."
        })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}

const resetDoctorPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body

        if (!email || !otp || !password) {
            return res.json({ success: false, message: "Missing Details" })
        }

        const otpEmailKey = `doctor:${email}`

        const otpRecord = await otpModel.findOne({ email: otpEmailKey })
        if (!otpRecord) {
            return res.json({
                success: false,
                message: "OTP verification record not found. Please request a new OTP."
            })
        }

        if (new Date(otpRecord.expiresAt) < new Date()) {
            await otpModel.deleteOne({ email: otpEmailKey })
            return res.json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            })
        }

        const submittedHash = crypto.createHash('sha256').update(otp).digest('hex')
        if (submittedHash !== otpRecord.otpHash) {
            return res.json({
                success: false,
                message: "Invalid OTP. Password reset authorization failed."
            })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong password" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const doctor = await doctorModel.findOneAndUpdate({ email }, { password: hashPassword })
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found." })
        }

        await otpModel.deleteOne({ email: otpEmailKey })

        res.json({
            success: true,
            message: "Password reset successfully! You can now log in with your new password."
        })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    changeAvailability, doctorList, 
    loginDoctor, appointmentsDoctor, 
    appointmentCancel, appointmentComplete, 
    doctorDashboard, doctorProfile, 
    updateDoctorProfile, acceptInvitation,
    sendDoctorResetOTP, verifyDoctorResetOTP, resetDoctorPassword
}