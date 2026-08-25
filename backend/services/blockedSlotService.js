import blockedSlotModel from '../models/blockedSlotModel.js';

// Service layer for Blocked Slot management
class BlockedSlotService {
    /**
     * Blocks specific time intervals for a doctor on a given date.
     * Prevents patients from booking slots within this timeframe.
     * @param {string} doctorId - Unique identifier of the doctor
     * @param {Object} data - Blocking parameters (appointmentDate, slots array or startTime/endTime, reason, blockedBy)
     * @param {string} [callerDocId] - Verification ID of the calling doctor for authorization
     * @returns {Promise<Object>} Operational result containing summary and saved documents
     */
    async blockSlots(doctorId, data, callerDocId) {
        if (callerDocId && doctorId.toString() !== callerDocId.toString()) {
            throw new Error("Unauthorized: You can only block slots for your own calendar.");
        }

        const { appointmentDate, blockedBy, reason, slotStartTime, slotEndTime, slots } = data;

        let slotsToBlock = [];
        if (slots && Array.isArray(slots)) {
            slotsToBlock = slots;
        } else {
            slotsToBlock = [{ slotStartTime, slotEndTime }];
        }

        const blockedDocuments = [];
        // Sequential saving to execute schema validations and overlap checks atomically
        for (const slot of slotsToBlock) {
            const blockedSlot = new blockedSlotModel({
                doctorId,
                appointmentDate,
                slotStartTime: slot.slotStartTime,
                slotEndTime: slot.slotEndTime,
                blockedBy,
                reason
            });
            await blockedSlot.save(); // Triggers Mongoose schema validations
            blockedDocuments.push(blockedSlot);
        }

        return {
            message: `${blockedDocuments.length} slot(s) successfully blocked.`,
            blockedSlots: blockedDocuments
        };
    }

    /**
     * Removes a blocked slot exception, restoring standard weekly availability settings.
     * Throws an error if the target blocked slot does not exist.
     * @param {string} doctorId - Unique identifier of the doctor
     * @param {string} blockId - Unique identifier of the BlockedSlot record to remove
     * @param {string} [callerDocId] - Verification ID of the calling doctor for authorization
     * @returns {Promise<Object>} Confirmation message
     */
    async unblockSlots(doctorId, blockId, callerDocId) {
        if (callerDocId && doctorId.toString() !== callerDocId.toString()) {
            throw new Error("Unauthorized: You can only unblock slots for your own calendar.");
        }

        const block = await blockedSlotModel.findOne({ _id: blockId, doctorId });
        if (!block) {
            throw new Error("Attempted to unblock a non-existing blocked slot.");
        }

        await blockedSlotModel.deleteOne({ _id: blockId });
        return { message: "Slot successfully unblocked." };
    }

    /**
     * Retrieves all temporary schedule exception blocks registered for a doctor, optionally filtered by date.
     * @param {string} doctorId - Unique identifier of the doctor
     * @param {string} [appointmentDate] - Optional specific date filter (format D_M_YYYY or YYYY-MM-DD)
     * @returns {Promise<Object>} List of blocked slots
     */
    async getBlockedSlots(doctorId, appointmentDate) {
        const query = { doctorId };
        if (appointmentDate) {
            query.appointmentDate = appointmentDate;
        }
        const blockedSlots = await blockedSlotModel.find(query);
        return { blockedSlots };
    }
}

export default new BlockedSlotService();
