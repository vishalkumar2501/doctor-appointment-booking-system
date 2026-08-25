import feedbackService from '../services/feedbackService.js';

/**
 * Controller handling feedback operations.
 */

/**
 * Registers new feedback for a completed appointment.
 * Endpoint: POST /api/user/feedback
 */
const addFeedback = async (req, res) => {
    try {
        const patientId = req.userId; // Populated by authUser middleware
        if (!patientId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Patient credentials missing." });
        }

        const result = await feedbackService.addFeedback(patientId, req.body);
        
        return res.status(201).json({
            success: true,
            message: result.message,
            feedback: result.feedback,
            doctorStats: result.doctorStats
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Retrieves all review comments and stars for a doctor.
 * Endpoint: GET /api/doctor/:doctorId/feedback
 */
const getDoctorFeedback = async (req, res) => {
    try {
        const doctorId = req.params.doctorId || req.params.docId;
        if (!doctorId) {
            return res.status(400).json({ success: false, message: "Doctor ID is required." });
        }

        const feedbacks = await feedbackService.getDoctorFeedback(doctorId);
        
        return res.status(200).json({
            success: true,
            feedbacks
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export { addFeedback, getDoctorFeedback };
