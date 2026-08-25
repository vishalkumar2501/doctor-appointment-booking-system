import validator from 'validator'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import feedbackModel from '../models/feedbackModel.js'
import bookingValidationService from '../services/bookingValidationService.js'
import otpModel from '../models/otpModel.js'
import transporter, { isMailConfigured } from '../config/nodemailer.js'
import paymentModel from '../models/paymentModel.js'
import paymentService from '../services/paymentService.js'


//API to register user

const registerUser = async(req, res) => {
    try{
        const {name, email, password} = req.body

        if(!name || !password || !email){
            return res.json({
                success:false,
                message:"Missing Details"
            })
        }

        //validating email format
        if(!validator.isEmail(email)){
            return res.json({
                success:false,
                message:"Enter a valid email"
            })
        }

        //validating strong password
        if(password.length < 8){
            return res.json({
                success:false,
                message:"Enter a strong password"
            })
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '24h' })

        res.json({
            success:true,
            token
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


// API to send OTP for registration
const sendRegisterOTP = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !password || !email) {
            return res.json({
                success: false,
                message: "Missing Details"
            })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({
                success: false,
                message: "Enter a valid email"
            })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({
                success: false,
                message: "Enter a strong password"
            })
        }

        // check if user already exists
        const userExists = await userModel.findOne({ email })
        if (userExists) {
            return res.json({
                success: false,
                message: "Email already registered"
            })
        }

        // Rate limit OTP requests (cooldown: 60 seconds)
        const existingOTP = await otpModel.findOne({ email })
        if (existingOTP) {
            const timeDifference = new Date() - new Date(existingOTP.createdAt)
            if (timeDifference < 60 * 1000) {
                return res.json({
                    success: false,
                    message: "Please wait at least 60 seconds before requesting another OTP."
                })
            }
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex')
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiration

        // Save or update temporary OTP
        if (existingOTP) {
            existingOTP.otpHash = otpHash
            existingOTP.expiresAt = expiresAt
            existingOTP.attempts = 0
            existingOTP.createdAt = new Date()
            await existingOTP.save()
        } else {
            const newOTP = new otpModel({
                email,
                otpHash,
                expiresAt,
                attempts: 0,
                createdAt: new Date()
            })
            await newOTP.save()
        }

        // Send Email
        const mailOptions = {
            from: process.env.SMTP_FROM || '"DocBook Support" <support@docbook.com>',
            to: email,
            subject: "DocBook Email Verification OTP",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #5F6FFF; text-align: center;">DocBook Email Verification</h2>
                    <p>Hello,</p>
                    <p>Your DocBook verification OTP is:</p>
                    <div style="background-color: #f2f3ff; border: 1px dashed #5F6FFF; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #5F6FFF; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This OTP is valid for 5 minutes and can only be used once.</p>
                    <p>If you did not request this verification, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #888; text-align: center;">This is an automated message. Please do not reply directly to this email.</p>
                </div>
            `
        }

        if (!isMailConfigured) {
            console.log("====================================")
            console.log("[User Verification OTP] SMTP not configured. OTP generated:")
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
            message: "Verification OTP sent to your email."
        })

    } catch (error) {
        console.error(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

// API to verify OTP and complete registration
const verifyRegisterOTP = async (req, res) => {
    try {
        const { name, email, password, otp } = req.body

        if (!name || !email || !password || !otp) {
            return res.json({
                success: false,
                message: "Missing Details"
            })
        }

        // Find temporary OTP record
        const otpRecord = await otpModel.findOne({ email })
        if (!otpRecord) {
            return res.json({
                success: false,
                message: "OTP verification record not found. Please request a new OTP."
            })
        }

        // Check if OTP is expired
        if (new Date(otpRecord.expiresAt) < new Date()) {
            await otpModel.deleteOne({ email })
            return res.json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            })
        }

        // Check if max attempts exceeded (limit: 5 attempts)
        if (otpRecord.attempts >= 5) {
            await otpModel.deleteOne({ email })
            return res.json({
                success: false,
                message: "Maximum verification attempts exceeded. Please request a new OTP."
            })
        }

        // Verify OTP match
        const submittedHash = crypto.createHash('sha256').update(otp).digest('hex')
        if (submittedHash !== otpRecord.otpHash) {
            otpRecord.attempts += 1
            await otpRecord.save()
            
            if (otpRecord.attempts >= 5) {
                await otpModel.deleteOne({ email })
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

        // Check one last time if email got registered while verifying
        const userExists = await userModel.findOne({ email })
        if (userExists) {
            await otpModel.deleteOne({ email })
            return res.json({
                success: false,
                message: "Email already registered"
            })
        }

        // OTP is correct! Complete Account registration
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        // Clean up OTP record
        await otpModel.deleteOne({ email })

        // Generate session JWT token
        const token = jwt.sign({ id: user._id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '24h' })

        res.json({
            success: true,
            token,
            message: "Account verified and registered successfully!"
        })

    } catch (error) {
        console.error(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}


// API to send OTP for password reset
const sendResetOTP = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.json({
                success: false,
                message: "Email is required"
            })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({
                success: false,
                message: "Enter a valid email"
            })
        }

        // check if user exists
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({
                success: false,
                message: "User with this email does not exist"
            })
        }

        // Rate limit OTP requests (cooldown: 60 seconds)
        const existingOTP = await otpModel.findOne({ email })
        if (existingOTP) {
            const timeDifference = new Date() - new Date(existingOTP.createdAt)
            if (timeDifference < 60 * 1000) {
                return res.json({
                    success: false,
                    message: "Please wait at least 60 seconds before requesting another OTP."
                })
            }
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex')
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiration

        // Save or update temporary OTP
        if (existingOTP) {
            existingOTP.otpHash = otpHash
            existingOTP.expiresAt = expiresAt
            existingOTP.attempts = 0
            existingOTP.createdAt = new Date()
            await existingOTP.save()
        } else {
            const newOTP = new otpModel({
                email,
                otpHash,
                expiresAt,
                attempts: 0,
                createdAt: new Date()
            })
            await newOTP.save()
        }

        // Send Email
        const mailOptions = {
            from: process.env.SMTP_FROM || '"DocBook Support" <support@docbook.com>',
            to: email,
            subject: "DocBook Password Reset OTP",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #5F6FFF; text-align: center;">DocBook Password Reset</h2>
                    <p>Hello,</p>
                    <p>Your DocBook password reset verification OTP is:</p>
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
            console.log("[User Password Reset OTP] SMTP not configured. OTP generated:")
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
            message: "Verification OTP sent to your email."
        })

    } catch (error) {
        console.error(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

// API to verify OTP for password reset
const verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body

        if (!email || !otp) {
            return res.json({
                success: false,
                message: "Missing Details"
            })
        }

        // Find temporary OTP record
        const otpRecord = await otpModel.findOne({ email })
        if (!otpRecord) {
            return res.json({
                success: false,
                message: "OTP verification record not found. Please request a new OTP."
            })
        }

        // Check if OTP is expired
        if (new Date(otpRecord.expiresAt) < new Date()) {
            await otpModel.deleteOne({ email })
            return res.json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            })
        }

        // Check if max attempts exceeded
        if (otpRecord.attempts >= 5) {
            await otpModel.deleteOne({ email })
            return res.json({
                success: false,
                message: "Maximum verification attempts exceeded. Please request a new OTP."
            })
        }

        // Verify OTP match
        const submittedHash = crypto.createHash('sha256').update(otp).digest('hex')
        if (submittedHash !== otpRecord.otpHash) {
            otpRecord.attempts += 1
            await otpRecord.save()
            
            if (otpRecord.attempts >= 5) {
                await otpModel.deleteOne({ email })
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
        res.json({
            success: false,
            message: error.message
        })
    }
}

// API to reset user password
const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body

        if (!email || !otp || !password) {
            return res.json({
                success: false,
                message: "Missing Details"
            })
        }

        // Find and verify OTP record one more time to validate the action
        const otpRecord = await otpModel.findOne({ email })
        if (!otpRecord) {
            return res.json({
                success: false,
                message: "OTP verification record not found. Please request a new OTP."
            })
        }

        if (new Date(otpRecord.expiresAt) < new Date()) {
            await otpModel.deleteOne({ email })
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

        // validating strong password
        if (password.length < 8) {
            return res.json({
                success: false,
                message: "Enter a strong password"
            })
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        // Update the user password in database
        const user = await userModel.findOneAndUpdate({ email }, { password: hashPassword })
        if (!user) {
            return res.json({
                success: false,
                message: "User not found."
            })
        }

        // Delete temporary OTP record
        await otpModel.deleteOne({ email })

        res.json({
            success: true,
            message: "Password reset successfully! You can now log in with your new password."
        })

    } catch (error) {
        console.error(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}


//API for user login

const loginUser = async(req, res) => {
    try{
        const {email, password} = req.body
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({
                success:false,
                message:'User does not exist'
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(isMatch){
            const token = jwt.sign({ id: user._id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '24h' })
            res.json({
                success:true,
                token
            })
        } 
        else{
            res.json({
                success:false,
                message:'Invalid credentials'
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


// API to get user profile data

const getProfile = async(req, res) => {
    try{
        const userId = req.userId

        const userData = await userModel.findById(userId).select('-password')

        res.json({
            success:true,
            userData
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


//API to update user profile
const updateProfile = async(req, res) => {
    try{
        const userId = req.userId
        const {name, phone, address, dob, gender} = req.body
        const imageFile = req.file

        if(!name || !name.trim() || !phone || !phone.trim() || !dob || !gender){
            return res.json({
                success:false,
                message:'Data Missing or Invalid'
            })
        }

        const parsedAddress = address ? JSON.parse(address) : undefined

        await userModel.findByIdAndUpdate(userId, {name, phone, address: parsedAddress, dob, gender})

        if(imageFile){
            //upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:'image'})

            const imageUrl = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, {image:imageUrl})
        }

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


//API to book appointment

const bookAppointment = async(req, res) => {
    try{
        const userId = req.userId
        const {docId, slotDate, slotTime} = req.body

        // Run validation checks
        const validation = await bookingValidationService.validateBooking(docId, slotDate, slotTime, null, userId)
        if (!validation.isValid) {
            return res.json({
                success: false,
                message: validation.message
            })
        }

        const docData = await doctorModel.findById(docId).select('-password')

        if(!docData.available){
            return res.json({
                success:false,
                message:'Doctor not available'
            })
        }

        let slots_booked = docData.slots_booked

        // Synchronize and update doctor.slots_booked for backward compatibility
        if (slots_booked[slotDate]) {
            if (!slots_booked[slotDate].includes(slotTime)) {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = [slotTime]
        }

        const userData = await userModel.findById(userId).select('-password')
        if (!userData) {
            return res.json({ success: false, message: "User not found" })
        }

        delete docData.slots_booked

        const [day, month, year] = slotDate.split('_').map(Number)
        const appointmentDate = new Date(year, month - 1, day)
        const bookingDate = new Date()
        bookingDate.setHours(0, 0, 0, 0)
        const diffTime = appointmentDate.getTime() - bookingDate.getTime()
        const diffDays = diffTime / (1000 * 60 * 60 * 24)
        const reminderEligible = diffDays >= 2

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount:docData.fees,
            slotTime,
            slotDate,
            date: Date.now(),
            reminderEligible,
            reminderSent: false,
            appointmentLocation: {
                line1: docData.address?.line1 || null,
                line2: docData.address?.line2 || null,
                city: docData.city || null
            }
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        //save new slots data in doctors data
        await doctorModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({
            success:true,
            message:'Appointment Booked'
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

//API to get user appointments for frontend my-appointment page

const listAppointment = async(req, res) => {
    try{
        const userId = req.userId
        const appointments = await appointmentModel.find({userId})

        // Fetch corresponding Payment records to enrich user's appointments
        const appointmentIds = appointments.map(appt => appt._id)
        const payments = await paymentModel.find({ appointmentId: { $in: appointmentIds } })

        const paymentMap = {}
        for (const payment of payments) {
            const apptId = payment.appointmentId.toString()
            const existing = paymentMap[apptId]
            if (!existing) {
                paymentMap[apptId] = payment
            } else {
                if (payment.paymentStatus === 'Paid') {
                    if (existing.paymentStatus !== 'Paid' || payment.createdAt > existing.createdAt) {
                        paymentMap[apptId] = payment
                    }
                } else if (existing.paymentStatus !== 'Paid') {
                    if (payment.createdAt > existing.createdAt) {
                        paymentMap[apptId] = payment
                    }
                }
            }
        }

        // Optimize: Fetch all feedbacks submitted by this user to determine hasFeedback
        const feedbacks = await feedbackModel.find({ patientId: userId }).select('appointmentId')
        const reviewedApptIds = new Set(feedbacks.map(f => f.appointmentId.toString()))

        const appointmentsWithFeedback = appointments.map(appt => {
            const apptObj = appt.toObject()
            apptObj.hasFeedback = reviewedApptIds.has(appt._id.toString())

            const payment = paymentMap[appt._id.toString()]
            if (payment) {
                apptObj.refundStatus = payment.refundStatus || 'None'
                apptObj.refundAmount = payment.refundAmount || 0
                apptObj.refundReason = payment.refundReason || null
                apptObj.paymentStatus = payment.paymentStatus || apptObj.paymentStatus
            } else {
                apptObj.refundStatus = 'None'
                apptObj.refundAmount = 0
                apptObj.refundReason = null
            }

            return apptObj
        })

        res.json({
            success:true,
            appointments: appointmentsWithFeedback
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


//API to cancel appointment
const cancelAppointment = async(req, res) => {
    try{
        const userId = req.userId
        const {appointmentId} = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({
                success: false,
                message: 'Appointment not found'
            })
        }

        //verify appointment user
        if(appointmentData.userId.toString() !== userId.toString()){
            return res.json({
                success:false,
                message:'Unauthorized action'
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

        const updatedAppointment = await appointmentModel.findOneAndUpdate(
            { _id: appointmentId, userId: userId.toString(), cancelled: false, isCompleted: false },
            { $set: { cancelled: true } },
            { new: true }
        )

        if (!updatedAppointment) {
            return res.json({
                success: false,
                message: 'Appointment is already cancelled'
            })
        }

        // Determine refund eligibility
        const payment = await paymentModel.findOne({ appointmentId, paymentStatus: 'Paid' })
        if (payment) {
            const refundCheck = paymentService.calculateRefundEligibility(
                'patient',
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
                    console.error("Async refund execution failed on patient cancellation:", refundError)
                }
            } else {
                payment.refundReason = refundCheck.reason
                await payment.save()
            }
        }

        //releasing doctor slot

        const {docId, slotDate, slotTime} = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        if (slots_booked && slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
            await doctorModel.findByIdAndUpdate(docId, {slots_booked})
        }

        res.json({
            success:true,
            message:'Appointment cancelled'
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




export {registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, sendRegisterOTP, verifyRegisterOTP, sendResetOTP, verifyResetOTP, resetPassword}