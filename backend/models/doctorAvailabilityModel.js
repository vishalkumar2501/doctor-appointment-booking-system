import mongoose from 'mongoose'
import { timeToMinutes } from '../utils/timeHelper.js'

const workingDaySchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    isWorking: {
        type: Boolean,
        default: true
    },
    startTime: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: props => `${props.value} is not a valid 24-hour time format (HH:MM)!`
        }
    },
    endTime: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: props => `${props.value} is not a valid 24-hour time format (HH:MM)!`
        }
    },
    lunchStart: {
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: props => `${props.value} is not a valid 24-hour time format (HH:MM)!`
        }
    },
    lunchEnd: {
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: props => `${props.value} is not a valid 24-hour time format (HH:MM)!`
        }
    }
}, { _id: false })

const doctorAvailabilitySchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctor',
        required: true,
        unique: true
    },
    slotDuration: {
        type: Number,
        default: 30,
        required: true,
        validate: {
            validator: function(v) {
                return v === 30;
            },
            message: 'slotDuration must always equal 30.'
        }
    },
    workingDays: {
        type: [workingDaySchema],
        required: true,
        validate: {
            validator: function(val) {
                // 1. Ensure all days are unique in the configuration
                const days = val.map(item => item.day);
                if (days.length !== new Set(days).size) {
                    throw new Error('Duplicate days are not allowed in workingDays configuration.');
                }

                // 2. Validate time chronology
                for (const item of val) {
                    if (item.isWorking) {
                        const start = timeToMinutes(item.startTime);
                        const end = timeToMinutes(item.endTime);

                        if (item.lunchStart && item.lunchEnd) {
                            const lStart = timeToMinutes(item.lunchStart);
                            const lEnd = timeToMinutes(item.lunchEnd);
                            if (!(start < lStart && lStart < lEnd && lEnd < end)) {
                                throw new Error(`Working hours chronology for ${item.day} is invalid: Start Time < Lunch Start < Lunch End < End Time.`);
                            }
                        } else if (start >= end) {
                            throw new Error(`Working hours chronology for ${item.day} is invalid: Start Time must be before End Time.`);
                        }
                    }
                }
                return true;
            }
        }
    }
}, { timestamps: true }) 

const doctorAvailabilityModel = mongoose.models.doctorAvailability || mongoose.model('doctorAvailability', doctorAvailabilitySchema)

export default doctorAvailabilityModel
