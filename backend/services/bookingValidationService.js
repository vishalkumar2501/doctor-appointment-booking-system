import doctorModel from '../models/doctorModel.js';
import doctorAvailabilityModel from '../models/doctorAvailabilityModel.js';
import blockedSlotModel from '../models/blockedSlotModel.js';
import appointmentModel from '../models/appointmentModel.js';
import { timeToMinutes, getWeekdayOfDate, minutesToTimeStr } from '../utils/timeHelper.js';

class BookingValidationService {
    /**
     * Validates all booking constraints for a doctor, date, and slot time boundaries.
     * Checks database configurations, working days/hours, lunch exclusions, 
     * blocked slots, and existing active appointments.
     * @param {string} doctorId - Unique identifier of the doctor
     * @param {string} appointmentDate - Booking target date (format D_M_YYYY or YYYY-MM-DD)
     * @param {string} slotStartTime - Slot start time (24h format, e.g., "10:30")
     * @param {string} [slotEndTime] - Optional slot end time (24h format, e.g., "11:00"). Derived if omitted.
     * @param {string} patientId - Unique identifier of the patient
     * @returns {Promise<Object>} Object containing isValid (boolean) and message (string)
     */
    async validateBooking(doctorId, appointmentDate, slotStartTime, slotEndTime, patientId) {
        // 1. Verify doctor exists
        const doctor = await doctorModel.findById(doctorId);
        if (!doctor) {
            return { isValid: false, message: "Doctor does not exist." };
        }

        // 2. Verify DoctorAvailability exists
        const availability = await doctorAvailabilityModel.findOne({ doctorId });
        if (!availability) {
            return { isValid: false, message: "Doctor availability has not been configured." };
        }

        // 3. Verify doctor works that day
        const weekday = getWeekdayOfDate(appointmentDate);
        const dayConfig = availability.workingDays.find(d => d.day === weekday);
        if (!dayConfig || !dayConfig.isWorking) {
            return { isValid: false, message: `Doctor is unavailable on ${weekday}.` };
        }

        // 4. Verify slot lies inside working hours
        const startMin = timeToMinutes(dayConfig.startTime);
        const endMin = timeToMinutes(dayConfig.endTime);
        const slotStart = timeToMinutes(slotStartTime);
        
        let slotEnd;
        if (!slotEndTime) {
            slotEnd = slotStart + 30;
            slotEndTime = minutesToTimeStr(slotEnd);
        } else {
            slotEnd = timeToMinutes(slotEndTime);
        }

        if (slotStart < startMin || slotEnd > endMin) {
            return { isValid: false, message: "Requested time slot falls outside the doctor's working hours." };
        }

        // 5. Verify slot is not during lunch
        if (dayConfig.lunchStart && dayConfig.lunchEnd) {
            const lunchStartMin = timeToMinutes(dayConfig.lunchStart);
            const lunchEndMin = timeToMinutes(dayConfig.lunchEnd);
            if (slotStart < lunchEndMin && slotEnd > lunchStartMin) {
                return { isValid: false, message: "Requested time slot falls during the doctor's lunch break." };
            }
        }

        // 6. Verify slot duration is exactly 30 minutes
        if (slotEnd - slotStart !== 30) {
            return { isValid: false, message: "Appointment slot duration must be exactly 30 minutes." };
        }

        // 7. Verify slot is not blocked
        const isBlocked = await blockedSlotModel.findOne({
            doctorId,
            appointmentDate,
            $or: [
                {
                    slotStartTime: { $lt: slotEndTime },
                    slotEndTime: { $gt: slotStartTime }
                }
            ]
        });
        if (isBlocked) {
            return { isValid: false, message: "Requested slot is temporarily blocked." };
        }

        // 8. Verify slot is not already booked
        const isBooked = await appointmentModel.findOne({
            docId: doctorId.toString(),
            slotDate: appointmentDate,
            slotTime: slotStartTime,
            cancelled: false
        });
        if (isBooked) {
            return { isValid: false, message: "Requested slot is already booked." };
        }

        // 8.5 Verify patient has at most 3 active/upcoming appointments
        if (patientId) {
            const activeAppointments = await appointmentModel.find({
                userId: patientId.toString(),
                cancelled: false,
                isCompleted: false
            });

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const currentActiveCount = activeAppointments.filter(app => {
                if (!app.slotDate) return false;
                const [d, m, y] = app.slotDate.split('_').map(Number);
                const appDate = new Date(y, m - 1, d);
                return appDate.getTime() >= today.getTime();
            }).length;

            if (currentActiveCount >= 3) {
                return { isValid: false, message: "You can have a maximum of 3 active appointments at one time." };
            }
        }

        // 9. Return validation success
        return { isValid: true, message: "Slot is available for booking." };
    }
}

export default new BookingValidationService();
