import availabilityService from '../services/availabilityService.js';
import slotGenerationService from '../services/slotGenerationService.js';

const getDoctorAvailability = async (req, res) => {
    try {
        const doctorId = req.docId || req.params.docId;
        if (!doctorId) {
            return res.status(400).json({ success: false, message: "Doctor ID is required." });
        }
        const availability = await availabilityService.getAvailability(doctorId);
        res.status(200).json({ success: true, availability });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateDoctorAvailability = async (req, res) => {
    try {
        const doctorId = req.docId; // Set by authDoctor middleware
        if (!doctorId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Doctor ID missing." });
        }

        const availability = await availabilityService.updateAvailability(doctorId, req.body);
        res.status(200).json({ success: true, message: "Availability updated successfully.", availability });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAvailableSlots = async (req, res) => {
    const { docId } = req.params;
    const { appointmentDate } = req.query;
    try {
        if (!docId) {
            return res.status(400).json({ success: false, message: "Doctor ID is required." });
        }
        if (!appointmentDate) {
            return res.status(400).json({ success: false, message: "appointmentDate parameter is required." });
        }

        const result = await slotGenerationService.generateSlots(docId, appointmentDate);
        res.status(200).json(result);
    } catch (error) {
        if (error.message === "Doctor is unavailable on this day.") {
            console.warn(`[Availability Warning]: Doctor ${docId} is unavailable on day ${appointmentDate}.`);
        } else {
            console.error(error);
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

export { getDoctorAvailability, updateDoctorAvailability, getAvailableSlots };
