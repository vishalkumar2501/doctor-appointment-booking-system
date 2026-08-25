import mongoose from 'mongoose'
import { timeToMinutes, getWeekdayOfDate } from '../utils/timeHelper.js'

const blockedSlotSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctor',
        required: true
    },
    appointmentDate: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // Accepts date formats like D_M_YYYY or YYYY-MM-DD
                return /^\d{1,4}[_-]\d{1,2}[_-]\d{1,4}$/.test(v);
            },
            message: props => `${props.value} is not a valid date format!`
        }
    },
    slotStartTime: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // Enforce 30-minute boundaries: MM must be 00 or 30
                return /^([0-1]?[0-9]|2[0-3]):(00|30)$/.test(v);
            },
            message: props => `${props.value} is not a valid time format aligned to a 30-minute boundary (HH:00 or HH:30)!`
        }
    },
    slotEndTime: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // Enforce 30-minute boundaries: MM must be 00 or 30
                return /^([0-1]?[0-9]|2[0-3]):(00|30)$/.test(v);
            },
            message: props => `${props.value} is not a valid time format aligned to a 30-minute boundary (HH:00 or HH:30)!`
        }
    },
    blockedBy: { 
        type: String,
        required: true,
        enum: ['Doctor', 'Admin']
    },
    reason: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

// Validate slotStartTime < slotEndTime
blockedSlotSchema.pre('validate', function() {
    if (this.slotStartTime && this.slotEndTime) {
        if (timeToMinutes(this.slotStartTime) >= timeToMinutes(this.slotEndTime)) {
            this.invalidate('slotStartTime', 'Start Time must be before End Time.');
        }
    }
});

// Pre-save hook: Overlap check, Working days/hours check, Lunch break check, and Existing appointment check
blockedSlotSchema.pre('save', async function() {
    const BlockedSlot = mongoose.model('blockedSlot');
    const DoctorAvailability = mongoose.model('doctorAvailability');
    const Appointment = mongoose.model('appointment');

    const blockStart = timeToMinutes(this.slotStartTime);
    const blockEnd = timeToMinutes(this.slotEndTime);

    // 0. Prevent blocking slots for past dates
    let parsedDate;
    if (this.appointmentDate.includes('_')) {
        const [d, m, y] = this.appointmentDate.split('_').map(Number);
        parsedDate = new Date(y, m - 1, d);
    } else if (this.appointmentDate.includes('-')) {
        const parts = this.appointmentDate.split('-').map(Number);
        if (parts[0] > 1000) {
            parsedDate = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
            parsedDate = new Date(parts[2], parts[1] - 1, parts[0]);
        }
    } else {
        parsedDate = new Date(this.appointmentDate);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (parsedDate.getTime() < today.getTime()) {
        throw new Error('Cannot block slots for a past date.');
    }

    // 1. Validate slot duration is exactly 30 minutes
    if (blockEnd - blockStart !== 30) {
        throw new Error('Blocked slot duration must be exactly 30 minutes.');
    }

    // 2. Prevent overlapping blocked slots for same doctor and date
    const overlap = await BlockedSlot.findOne({
        _id: { $ne: this._id },
        doctorId: this.doctorId,
        appointmentDate: this.appointmentDate,
        $or: [
            {
                slotStartTime: { $lt: this.slotEndTime },
                slotEndTime: { $gt: this.slotStartTime }
            }
        ]
    });

    if (overlap) {
        throw new Error('Overlapping blocked slot exists for the same doctor and date.');
    }

    // 3. Validate Blocked Slots can only exist on doctor's configured working days
    const availability = await DoctorAvailability.findOne({ doctorId: this.doctorId });
    if (!availability) {
        throw new Error('Doctor availability configuration not found. Blocked slot cannot be created.');
    }

    const weekday = getWeekdayOfDate(this.appointmentDate);
    const workingDay = availability.workingDays.find(d => d.day === weekday);

    if (!workingDay || !workingDay.isWorking) {
        throw new Error(`Blocked slots can only be created on configured working days. Doctor is not scheduled to work on ${weekday} (${this.appointmentDate}).`);
    }

    // 4. Validate slot falls within working hours
    const startMin = timeToMinutes(workingDay.startTime);
    const endMin = timeToMinutes(workingDay.endTime);

    if (blockStart < startMin || blockEnd > endMin) {
        throw new Error(`Blocked slot timing [${this.slotStartTime} - ${this.slotEndTime}] falls outside configured working hours [${workingDay.startTime} - ${workingDay.endTime}].`);
    }

    // 5. Validate slot does not overlap with lunch break
    if (workingDay.lunchStart && workingDay.lunchEnd) {
        const lunchStartMin = timeToMinutes(workingDay.lunchStart);
        const lunchEndMin = timeToMinutes(workingDay.lunchEnd);
        if (blockStart < lunchEndMin && blockEnd > lunchStartMin) {
            throw new Error('Cannot block slots during the configured lunch break.');
        }
    }

    // 6. Validate slot does not have an active booking (PENDING, CONFIRMED, COMPLETED)
    const appointmentConflict = await Appointment.findOne({
        docId: this.doctorId.toString(),
        slotDate: this.appointmentDate,
        slotTime: this.slotStartTime,
        cancelled: false
    });

    if (appointmentConflict) {
        throw new Error(`Cannot block slot. An active appointment exists at ${this.slotStartTime}.`);
    }
});

// Indexes for fast lookup 
blockedSlotSchema.index({ doctorId: 1, appointmentDate: 1 })

const blockedSlotModel = mongoose.models.blockedSlot || mongoose.model('blockedSlot', blockedSlotSchema)

export default blockedSlotModel
