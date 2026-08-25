import blockedSlotService from '../services/blockedSlotService.js';

const blockSlots = async (req, res) => {
    try {
        const doctorId = req.docId || req.body.doctorId; // docId set by authDoctor middleware
        const callerDocId = req.docId; // For ownership verification

        if (!doctorId) {
            return res.status(400).json({ success: false, message: "Doctor ID is required." });
        }

        const result = await blockedSlotService.blockSlots(doctorId, req.body, callerDocId);
        res.status(201).json({ success: true, ...result });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError' || error.message.includes('duration') || error.message.includes('Overlap') || error.message.includes('hours') || error.message.includes('lunch') || error.message.includes('appointment')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const unblockSlots = async (req, res) => {
    try {
        const doctorId = req.docId || req.body.doctorId;
        const callerDocId = req.docId;
        const { blockId } = req.params;

        if (!doctorId || !blockId) {
            return res.status(400).json({ success: false, message: "Doctor ID and Block ID are required." });
        }

        const result = await blockedSlotService.unblockSlots(doctorId, blockId, callerDocId);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error(error);
        if (error.message.includes('non-existing') || error.message.includes('Unauthorized')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBlockedSlots = async (req, res) => {
    try {
        const doctorId = req.docId || req.params.doctorId || req.query.doctorId;
        const { appointmentDate } = req.query;

        if (!doctorId) {
            return res.status(400).json({ success: false, message: "Doctor ID is required." });
        }

        const result = await blockedSlotService.getBlockedSlots(doctorId, appointmentDate);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { blockSlots, unblockSlots, getBlockedSlots };
