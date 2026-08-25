import doctorAvailabilityModel from '../models/doctorAvailabilityModel.js';
import blockedSlotModel from '../models/blockedSlotModel.js';
import appointmentModel from '../models/appointmentModel.js';
import { timeToMinutes, minutesToTimeStr, getWeekdayOfDate } from '../utils/timeHelper.js';

class SlotGenerationService {
    /**
     * Dynamically calculates and returns all available appointment time slots
     * for a specific doctor on a target date, subtracting lunch breaks,
     * blocked exceptions, and active pre-existing appointments.
     * @param {string} doctorId - Unique identifier of the doctor
     * @param {string} appointmentDate - Target booking date string (format: D_M_YYYY or YYYY-MM-DD)
     * @returns {Promise<Object>} Object containing doctorId, date, and array of available slots
     */
    async generateSlots(doctorId, appointmentDate) {
        // Step 1: Fetch DoctorAvailability
        const availability = await doctorAvailabilityModel.findOne({ doctorId });
        if (!availability) {
            throw new Error("Doctor availability has not been configured.");
        }

        // Step 2: Determine weekday
        const weekday = getWeekdayOfDate(appointmentDate);

        // Step 3: Locate weekday configuration
        const dayConfig = availability.workingDays.find(d => d.day === weekday);
        if (!dayConfig || !dayConfig.isWorking) {
            throw new Error("Doctor is unavailable on this day.");
        }

        // Step 4: Generate all 30-minute slots
        const startMin = timeToMinutes(dayConfig.startTime);
        const endMin = timeToMinutes(dayConfig.endTime);
        const duration = availability.slotDuration || 30;

        let availableSlots = [];
        for (let min = startMin; min + duration <= endMin; min += duration) {
            availableSlots.push({
                startTime: minutesToTimeStr(min),
                endTime: minutesToTimeStr(min + duration)
            });
        }

        // Step 5: Remove lunch break slots
        if (dayConfig.lunchStart && dayConfig.lunchEnd) {
            const lunchStartMin = timeToMinutes(dayConfig.lunchStart);
            const lunchEndMin = timeToMinutes(dayConfig.lunchEnd);

            availableSlots = availableSlots.filter(slot => {
                const sStart = timeToMinutes(slot.startTime);
                const sEnd = timeToMinutes(slot.endTime);
                // Exclude if slot overlaps with lunch break
                return !(sStart < lunchEndMin && sEnd > lunchStartMin);
            });
        }

        // Step 6: Query BlockedSlot and filter out blocked slots
        const blockedSlots = await blockedSlotModel.find({
            doctorId,
            appointmentDate
        });

        availableSlots = availableSlots.filter(slot => {
            const sStart = timeToMinutes(slot.startTime);
            const sEnd = timeToMinutes(slot.endTime);
            for (const block of blockedSlots) {
                const bStart = timeToMinutes(block.slotStartTime);
                const bEnd = timeToMinutes(block.slotEndTime);
                if (sStart < bEnd && sEnd > bStart) {
                    return false; // Slot overlaps with a block
                }
            }
            return true;
        });

        // Step 7: Query Appointment collection and filter booked slots
        const appointments = await appointmentModel.find({
            docId: doctorId.toString(),
            slotDate: appointmentDate,
            cancelled: false // Ignore cancelled appointments
        });

        availableSlots = availableSlots.filter(slot => {
            const isBooked = appointments.some(appt => appt.slotTime === slot.startTime);
            return !isBooked;
        });

        // Step 8: If appointmentDate is today, remove slots that are already in the past
        const now = new Date();
        const todayDay = now.getDate();
        const todayMonth = now.getMonth() + 1;
        const todayYear = now.getFullYear();
        const todayStr = `${todayDay}_${todayMonth}_${todayYear}`;

        if (appointmentDate === todayStr) {
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            availableSlots = availableSlots.filter(slot => timeToMinutes(slot.startTime) > currentMinutes);
        }

        // Step 9: Return structured response
        return {
            success: true,
            doctorId,
            appointmentDate,
            availableSlots
        };
    }
}

export default new SlotGenerationService();
