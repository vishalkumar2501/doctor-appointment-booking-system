// Middleware for request body validation

export const validateAvailability = (req, res, next) => {
    const { slotDuration, workingDays } = req.body;

    if (slotDuration !== undefined && slotDuration !== 30) {
        return res.status(400).json({ success: false, message: "slotDuration must always equal 30." });
    }

    if (workingDays) {
        if (!Array.isArray(workingDays)) {
            return res.status(400).json({ success: false, message: "workingDays must be an array." });
        }

        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

        for (const item of workingDays) {
            if (!validDays.includes(item.day)) {
                return res.status(400).json({ success: false, message: `Invalid day name: ${item.day}` });
            }
            if (item.isWorking) {
                if (!item.startTime || !item.endTime) {
                    return res.status(400).json({ success: false, message: "startTime and endTime are required for working days." });
                }
                if (!timeRegex.test(item.startTime) || !timeRegex.test(item.endTime)) {
                    return res.status(400).json({ success: false, message: "startTime and endTime must be in HH:MM format." });
                }
                if (item.lunchStart && !timeRegex.test(item.lunchStart)) {
                    return res.status(400).json({ success: false, message: "lunchStart must be in HH:MM format." });
                }
                if (item.lunchEnd && !timeRegex.test(item.lunchEnd)) {
                    return res.status(400).json({ success: false, message: "lunchEnd must be in HH:MM format." });
                }
            }
        }
    }

    next();
};

export const validateBlockedSlot = (req, res, next) => {
    const { appointmentDate, slotStartTime, slotEndTime, reason } = req.body;

    if (!appointmentDate || !slotStartTime || !slotEndTime || !reason) {
        return res.status(400).json({ success: false, message: "Missing required fields: appointmentDate, slotStartTime, slotEndTime, and reason are required." });
    }

    const dateRegex = /^\d{1,4}[_-]\d{1,2}[_-]\d{1,4}$/;
    const timeBoundaryRegex = /^([0-1]?[0-9]|2[0-3]):(00|30)$/;

    if (!dateRegex.test(appointmentDate)) {
        return res.status(400).json({ success: false, message: "Invalid date format. Must be like D_M_YYYY or YYYY-MM-DD." });
    }

    let parsedDate;
    if (appointmentDate.includes('_')) {
        const [d, m, y] = appointmentDate.split('_').map(Number);
        parsedDate = new Date(y, m - 1, d);
    } else if (appointmentDate.includes('-')) {
        const parts = appointmentDate.split('-').map(Number);
        if (parts[0] > 1000) {
            parsedDate = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
            parsedDate = new Date(parts[2], parts[1] - 1, parts[0]);
        }
    } else {
        parsedDate = new Date(appointmentDate);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (parsedDate.getTime() < today.getTime()) {
        return res.status(400).json({ success: false, message: "Cannot block slots for a past date." });
    }

    if (!timeBoundaryRegex.test(slotStartTime) || !timeBoundaryRegex.test(slotEndTime)) {
        return res.status(400).json({ success: false, message: "Times must be in HH:MM format and align with 30-minute boundaries (HH:00 or HH:30)." });
    }

    next();
};

export const validateFeedback = (req, res, next) => {
    const { appointmentId, doctorId, rating } = req.body;

    if (!appointmentId || !doctorId || rating === undefined) {
        return res.status(400).json({ success: false, message: "Missing required fields: appointmentId, doctorId, and rating are required." });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be an integer between 1 and 5." });
    }

    next();
};
