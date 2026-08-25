import doctorAvailabilityModel from '../models/doctorAvailabilityModel.js';

class AvailabilityService {
    /**
     * Retrieves the availability configuration document for a specific doctor.
     * Returns a default configuration template if no document is stored.
     * @param {string} doctorId - Unique identifier of the doctor
     * @returns {Promise<Object>} Mongoose document or default template object
     */
    async getAvailability(doctorId) {
        const availability = await doctorAvailabilityModel.findOne({ doctorId });
        if (!availability) {
            return {
                doctorId,
                slotDuration: 30,
                workingDays: []
            };
        }
        return availability;
    }

    /**
     * Creates a new availability document or updates the existing configuration for a doctor.
     * Triggers all schema-level checks and time calculations on save.
     * @param {string} doctorId - Unique identifier of the doctor
     * @param {Object} data - Configuration parameters (slotDuration, workingDays array)
     * @returns {Promise<Object>} Updated Mongoose document
     */
    async updateAvailability(doctorId, data) {
        let availability = await doctorAvailabilityModel.findOne({ doctorId });

        if (!availability) {
            availability = new doctorAvailabilityModel({
                doctorId,
                slotDuration: data.slotDuration,
                workingDays: data.workingDays
            });
        } else {
            availability.slotDuration = data.slotDuration;
            availability.workingDays = data.workingDays;
        }

        // Save will trigger Mongoose validations and pre-validate/pre-save hooks
        await availability.save();
        return availability;
    }
}

export default new AvailabilityService();
