import razorpayInstance from '../config/razorpay.js'
import crypto from 'crypto'
import paymentModel from '../models/paymentModel.js'
import Razorpay from 'razorpay'

class PaymentService {
    /**
     * Create Razorpay Order
     */
    async createRazorpayOrder(appointmentId, amount) {
        if (!razorpayInstance) {
            throw new Error("Razorpay instance is not configured. Key variables are missing.");
        }

        const options = {
            amount: amount * 100, // convert INR to paise
            currency: "INR",
            receipt: appointmentId.toString()
        };

        return await razorpayInstance.orders.create(options);
    }

    /**
     * Verify payment signature
     */
    async verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            throw new Error("RAZORPAY_KEY_SECRET is not configured on the server.");
        }

        const text = razorpayOrderId + "|" + razorpayPaymentId;
        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(text)
            .digest('hex');

        return generatedSignature === razorpaySignature;
    }

    /**
     * Create a Pending Payment record in database
     */
    async createPaymentRecord(userId, appointmentId, doctorId, amount, razorpayOrderId) {
        const paymentData = {
            userId: userId.toString(),
            appointmentId,
            doctorId: doctorId.toString(),
            amount,
            currency: 'INR',
            paymentStatus: 'Pending',
            razorpayOrderId,
            refundStatus: 'None'
        };

        const payment = new paymentModel(paymentData);
        return await payment.save();
    }

    /**
     * Parse slotDate and slotTime into a JS Date object.
     * slotDate format: "D_M_YYYY" (e.g. "13_8_2026")
     * slotTime format: "HH:MM AM/PM" (e.g. "10:00 AM")
     */
    parseAppointmentDateTime(slotDate, slotTime) {
        try {
            const dateParts = slotDate.split('_');
            if (dateParts.length !== 3) {
                throw new Error("Invalid slotDate format");
            }
            const day = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10);
            const year = parseInt(dateParts[2], 10);

            const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i;
            const match = slotTime.match(timeRegex);
            if (!match) {
                throw new Error("Invalid slotTime format");
            }

            let hour = parseInt(match[1], 10);
            const minute = parseInt(match[2], 10);
            const meridian = match[3] ? match[3].toUpperCase() : null;

            if (meridian) {
                if (hour < 1 || hour > 12) {
                    throw new Error("Invalid slotTime format");
                }
                if (meridian === 'PM' && hour < 12) {
                    hour += 12;
                } else if (meridian === 'AM' && hour === 12) {
                    hour = 0;
                }
            } else {
                // 24-hour format
                if (hour < 0 || hour > 23) {
                    throw new Error("Invalid slotTime format");
                }
            }

            if (minute < 0 || minute > 59) {
                throw new Error("Invalid slotTime format");
            }

            // Construct local date time object
            return new Date(year, month - 1, day, hour, minute, 0, 0);
        } catch (error) {
            console.error("Error parsing appointment date/time:", error);
            throw new Error(`Failed to parse appointment date/time: ${error.message}`);
        }
    }

    /**
     * Calculate refund eligibility for cancellation
     */
    calculateRefundEligibility(actor, slotDate, slotTime, amount, paymentStatus, isCompleted) {
        if (isCompleted) {
            return {
                eligible: false,
                refundAmount: 0,
                refundPercentage: 0,
                reason: "Appointment already completed"
            };
        }

        if (paymentStatus !== 'Paid') {
            return {
                eligible: false,
                refundAmount: 0,
                refundPercentage: 0,
                reason: "Payment was not captured"
            };
        }

        // If Doctor or Admin cancels, 100% refund is always eligible
        if (actor === 'doctor') {
            return {
                eligible: true,
                refundAmount: amount,
                refundPercentage: 100,
                reason: "Doctor cancelled appointment"
            };
        }

        if (actor === 'admin') {
            return {
                eligible: true,
                refundAmount: amount,
                refundPercentage: 100,
                reason: "Admin cancelled appointment"
            };
        }

        // If patient cancels, apply the 24-hour rule
        const now = new Date();
        const appointmentStart = this.parseAppointmentDateTime(slotDate, slotTime);
        const diffMs = appointmentStart.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours >= 24) {
            return {
                eligible: true,
                refundAmount: amount,
                refundPercentage: 100,
                reason: "Patient cancelled more than 24 hours before appointment"
            };
        } else {
            return {
                eligible: false,
                refundAmount: 0,
                refundPercentage: 0,
                reason: "Patient cancelled less than 24 hours before appointment"
            };
        }
    }

    /**
     * Execute Razorpay Refund
     */
    async executeRazorpayRefund(paymentId) {
        // Concurrency lock: claim the execution of refund atomically
        const payment = await paymentModel.findOneAndUpdate(
            {
                _id: paymentId,
                paymentStatus: 'Paid',
                refundStatus: { $in: ['Initiated', 'Failed'] },
                refundId: { $nin: ['refunding_in_progress'] }
            },
            { $set: { refundId: 'refunding_in_progress', refundStatus: 'Initiated' } },
            { new: true }
        );

        if (!payment) {
            // Either already processed, not Paid, or already in progress concurrently
            const existingPayment = await paymentModel.findById(paymentId);
            if (existingPayment && (existingPayment.refundStatus === 'Processed' || existingPayment.refundId === 'refunding_in_progress')) {
                return existingPayment;
            }
            throw new Error("Only successfully captured Paid transactions can be refunded, or a refund is already in progress.");
        }

        // Validate refund amount limits
        if (payment.refundAmount <= 0) {
            payment.refundStatus = 'None';
            payment.refundId = null;
            await payment.save();
            return payment;
        }

        if (payment.refundAmount > payment.amount) {
            payment.refundStatus = 'Failed';
            payment.refundId = null;
            payment.refundReason = `Refund amount (${payment.refundAmount}) cannot exceed paid amount (${payment.amount})`;
            await payment.save();
            throw new Error(`Refund amount (${payment.refundAmount}) cannot exceed the paid amount (${payment.amount}).`);
        }

        if (!razorpayInstance) {
            const isProd = process.env.NODE_ENV === 'production';
            const allowMock = process.env.ALLOW_MOCK_REFUNDS === 'true';

            if (isProd || !allowMock) {
                payment.refundStatus = 'Failed';
                payment.refundId = null;
                payment.refundReason = "Razorpay credentials are not configured on the server.";
                await payment.save();
                throw new Error("Razorpay credentials are not configured. Cannot process refund in production or without mock permission.");
            }

            // Mock fallback simulation mode (for local test validation when keys are missing)
            console.warn("[Razorpay Refund Fallback]: Razorpay instance is not configured. Simulating successful mock refund.");
            payment.refundId = "mock_rfnd_" + crypto.randomBytes(8).toString('hex');
            payment.refundStatus = 'Processed';
            payment.refundedAt = new Date();
            return await payment.save();
        }

        try {
            const refundResponse = await razorpayInstance.payments.refund(payment.razorpayPaymentId, {
                amount: payment.refundAmount * 100, // paise
                notes: {
                    reason: payment.refundReason || "Cancellation refund",
                    appointmentId: payment.appointmentId.toString()
                }
            });

            payment.refundId = refundResponse.id;
            if (refundResponse.status === 'processed') {
                payment.refundStatus = 'Processed';
                payment.refundedAt = new Date();
            } else {
                payment.refundStatus = 'Initiated';
            }
            return await payment.save();

        } catch (error) {
            console.error("Razorpay API refund execution failed:", error);
            // Handle error states
            if (error.message && error.message.includes('already been refunded')) {
                payment.refundStatus = 'Processed';
                payment.refundedAt = new Date();
                payment.refundId = payment.refundId === 'refunding_in_progress' ? null : payment.refundId;
            } else {
                payment.refundStatus = 'Failed';
                payment.refundId = null;
            }
            await payment.save();
            throw error;
        }
    }

    /**
     * Validate Razorpay Webhook signature
     */
    validateWebhookSignature(rawBody, signature) {
        try {
            const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
            if (!secret) {
                console.warn("[Razorpay Webhook Warning]: RAZORPAY_WEBHOOK_SECRET is not configured on the server.");
                return false;
            }
            return Razorpay.validateWebhookSignature(rawBody, signature, secret);
        } catch (error) {
            console.error("Webhook signature validation error:", error);
            return false;
        }
    }
}

export default new PaymentService();
