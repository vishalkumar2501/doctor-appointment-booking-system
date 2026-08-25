import validator from 'validator'
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import userModel from '../models/userModel.js'
import crypto from 'crypto'
import transporter, { isMailConfigured } from '../config/nodemailer.js'
import paymentModel from '../models/paymentModel.js'
import paymentService from '../services/paymentService.js'
import doctorReviewStatsModel from '../models/doctorReviewStatsModel.js'
import adminModel from '../models/adminModel.js'

//API for adding doctor

const addDoctor = async(req, res) => {
    try{
        if (!req.adminId) {
            return res.json({
                success: false,
                message: 'Not Authorized Login Again'
            })
        }

        const {name, email, speciality, degree, experience, about, fees, address, city, verificationCity} = req.body
        const imageFile = req.file
        
        //checking for all data to add doctor
        if( !name || !email || !speciality || !degree || !experience || !about || !fees || !address){
            return res.json({
                success:false,
                message:'Missing Details'
            })
        }

        const normalizedCity = typeof city === 'string' ? city.trim() : '';
        const normalizedVerificationCity = typeof verificationCity === 'string' ? verificationCity.trim() : '';

        if (!normalizedCity) {
            return res.json({
                success: false,
                message: 'Doctor working city is required.'
            });
        }

        if (!normalizedVerificationCity) {
            return res.json({
                success: false,
                message: 'Verification city is required.'
            });
        }

        //validating email format
        if(!validator.isEmail(email)){
            return res.json({
                success:false,
                message:'Please enter a valid email'
            })
        }

        // check whether a doctor with the submitted email already exists
        const existingDoctor = await doctorModel.findOne({ email })
        if (existingDoctor) {
            return res.json({
                success: false,
                message: 'Doctor with this email already exists.'
            })
        }

        //upload image to cloudinary
        let imageUrl = 'https://raw.githubusercontent.com/avinashdm/gs-images/main/prescripto/doc1.png'
        if (imageFile) {
            try {
                const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:"image"})
                imageUrl = imageUpload.secure_url
            } catch (cloudErr) {
                console.warn("Cloudinary upload failed or not configured, using fallback image:", cloudErr.message)
            }
        }

        // Generate invitation token
        const invitationToken = crypto.randomBytes(32).toString('hex')
        const invitationTokenHash = crypto.createHash('sha256').update(invitationToken).digest('hex')
        const invitationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        const doctorData = {
            name,
            email,
            image:imageUrl,
            speciality,
            degree,
            experience,
            about,
            fees,
            address:JSON.parse(address),
            date:Date.now(),
            status:'INVITED',
            invitationToken:invitationTokenHash,
            invitationExpires,
            city: normalizedCity,
            verificationCity: normalizedVerificationCity,
            verifiedBy: req.adminId,
            verifiedAt: new Date()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        // Send invitation email
        const adminFrontendUrl = process.env.ADMIN_FRONTEND_URL || 'http://localhost:5174'
        const invitationLink = `${adminFrontendUrl}/accept-invite?token=${invitationToken}&email=${email}`
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER || '"DocBook Support" <support@docbook.com>',
            to: email,
            subject: 'DocBook Doctor Panel Invitation',
            html: `
                <h2>Welcome to DocBook!</h2>
                <p>You have been added to DocBook as a Doctor by the administrator.</p>
                <p>Please click the link below to set your password and activate your account:</p>
                <p><a href="${invitationLink}">${invitationLink}</a></p>
                <p>This invitation link will expire in 24 hours.</p>
            `
        }

        if (isMailConfigured) {
            try {
                await transporter.sendMail(mailOptions)
            } catch (emailError) {
                console.error("Failed to send invitation email:", emailError)
                await doctorModel.findByIdAndDelete(newDoctor._id)
                return res.json({
                    success: false,
                    message: `Failed to send invitation email: ${emailError.message}`
                })
            }
        } else {
            console.log("====================================")
            console.log("[Doctor Invite] SMTP not configured. Generated invitation link:")
            console.log("Doctor:", email)
            console.log("Invitation Link:", invitationLink)
            console.log("====================================")
        }

        res.json({
            success:true,
            message: isMailConfigured ? 'Doctor Added and Invitation Sent' : 'Doctor Added! Invitation link logged to console (SMTP unconfigured)'
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

//API for the Admin Login
const loginAdmin = async(req, res) => {
    try{
        const {email, password} = req.body

        const admin = await adminModel.findOne({ email: email.toLowerCase().trim() })
        if (!admin) {
            return res.json({
                success:false,
                message:'Invalid credentials'
            })
        }

        const isMatch = await bcrypt.compare(password, admin.password)
        if (isMatch) {
            const token = jwt.sign({ email: admin.email, id: admin._id }, process.env.JWT_SECRET, { expiresIn: '24h' })
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


// API to get all doctors list for Admin Panel
const allDoctors = async(req, res) => {
    try{
        const doctors = await doctorModel.find({}).select('-password')

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


//API to get all appointments list
const appointmentAdmin = async(req, res) => {
    try{
        const appointments = await appointmentModel.find({})

        res.json({
            success:true,
            appointments,
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


//API for appointment cancellation
const appointmentCancel = async(req, res) => {
    try{
        const {appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({
                success: false,
                message: 'Appointment not found'
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
            { _id: appointmentId, cancelled: false, isCompleted: false },
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
                'admin',
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
                    console.error("Async refund execution failed on admin cancellation:", refundError)
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


//API to get dashboard data for admin panel
const adminDashboard = async(req, res) => {
    try{
        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({
            success:true,
            dashData,
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


const resendInvitation = async (req, res) => {
    try {
        const { docId } = req.body

        if (!docId) {
            return res.json({ success: false, message: 'Doctor ID is required.' })
        }

        const doctor = await doctorModel.findById(docId)
        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found.' })
        }

        if (doctor.status !== 'INVITED') {
            return res.json({ success: false, message: 'Cannot resend invitation for an active or non-invited doctor.' })
        }

        if (!isMailConfigured) {
            return res.json({
                success: false,
                message: 'SMTP server is not configured. Cannot send invitation email.'
            })
        }

        // Generate new invitation token
        const invitationToken = crypto.randomBytes(32).toString('hex')
        const invitationTokenHash = crypto.createHash('sha256').update(invitationToken).digest('hex')
        const invitationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        // Temporarily store old values in case email fails to restore stability
        const oldToken = doctor.invitationToken
        const oldExpires = doctor.invitationExpires

        doctor.invitationToken = invitationTokenHash
        doctor.invitationExpires = invitationExpires
        await doctor.save()

        // Send new invitation email
        const adminFrontendUrl = process.env.ADMIN_FRONTEND_URL || 'http://localhost:5174'
        const invitationLink = `${adminFrontendUrl}/accept-invite?token=${invitationToken}&email=${doctor.email}`
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER || '"DocBook Support" <support@docbook.com>',
            to: doctor.email,
            subject: 'DocBook Doctor Panel Invitation (Resent)',
            html: `
                <h2>Welcome to DocBook!</h2>
                <p>Your administrator has resent your invitation to join DocBook as a Doctor.</p>
                <p>Please click the link below to set your password and activate your account:</p>
                <p><a href="${invitationLink}">${invitationLink}</a></p>
                <p>This new invitation link will expire in 24 hours.</p>
            `
        }

        if (isMailConfigured) {
            try {
                await transporter.sendMail(mailOptions)
            } catch (emailError) {
                console.error("Failed to resend invitation email:", emailError)
                // Restore previous state
                doctor.invitationToken = oldToken
                doctor.invitationExpires = oldExpires
                await doctor.save()
                return res.json({
                    success: false,
                    message: `Failed to send invitation email: ${emailError.message}`
                })
            }
        } else {
            console.log("====================================")
            console.log("[Resend Doctor Invite] SMTP not configured. Generated invitation link:")
            console.log("Doctor:", doctor.email)
            console.log("Invitation Link:", invitationLink)
            console.log("====================================")
        }

        res.json({
            success: true,
            message: isMailConfigured ? 'Invitation resent successfully.' : 'Invitation regenerated. Link logged to console (SMTP unconfigured).'
        })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}


export {addDoctor, loginAdmin, allDoctors, appointmentAdmin, appointmentCancel, adminDashboard, resendInvitation}