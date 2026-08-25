import paymentModel from '../models/paymentModel.js'
import appointmentModel from '../models/appointmentModel.js'
import paymentService from '../services/paymentService.js'

/**
 * API to create Razorpay Order for appointment
 */
const createRazorpayOrder = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.userId; // Populated by authUser middleware

        if (!appointmentId) {
            return res.status(400).json({ success: false, message: "Appointment ID is required." });
        }

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }

        // Validate appointment belongs to logged-in patient
        if (appointment.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized access: You can only pay for your own appointments." });
        }

        // Validate appointment is not cancelled
        if (appointment.cancelled) {
            return res.status(400).json({ success: false, message: "Cannot pay for a cancelled appointment." });
        }

        // Validate appointment is not already paid
        if (appointment.payment || appointment.paymentStatus === "Paid") {
            return res.status(400).json({ success: false, message: "Appointment is already paid." });
        }

        // Create Razorpay Order options
        const order = await paymentService.createRazorpayOrder(appointmentId, appointment.amount);

        // Store the generated Razorpay Order ID inside appointment.razorpayOrderId
        appointment.razorpayOrderId = order.id;
        await appointment.save();

        // Create Pending Payment record in database
        await paymentService.createPaymentRecord(
            userId,
            appointmentId,
            appointment.docId,
            appointment.amount,
            order.id
        );

        // Return only the data required by Razorpay Checkout
        return res.status(201).json({
            success: true,
            key: process.env.RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            orderId: order.id,
            appointmentId: appointmentId,
            doctorName: appointment.docData.name
        });

    } catch (error) {
        console.error("Razorpay order creation error:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to create Razorpay order." });
    }
};

/**
 * API to verify Razorpay Payment for appointment
 */
const verifyRazorpayPayment = async (req, res) => {
    try {
        const { appointmentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const userId = req.userId; // Populated by authUser middleware

        // Validate malformed request parameters
        if (!appointmentId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing required verification fields: appointmentId, razorpay_order_id, razorpay_payment_id, and razorpay_signature are required." });
        }

        // Check for duplicate verification: check if this payment ID has already been successfully verified
        const existingPaidPayment = await paymentModel.findOne({
            razorpayPaymentId: razorpay_payment_id,
            paymentStatus: "Paid"
        });

        if (existingPaidPayment) {
            return res.status(200).json({
                success: true,
                message: "Payment successfully verified and updated.",
                paymentStatus: "Paid",
                appointmentId: appointmentId
            });
        }

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }

        // Validate appointment belongs to authenticated patient
        if (appointment.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized access: You can only verify payments for your own appointments." });
        }

        // Validate appointment is not cancelled
        if (appointment.cancelled) {
            return res.status(400).json({ success: false, message: "Cannot verify payment for a cancelled appointment." });
        }

        // Validate received razorpay_order_id matches stored razorpayOrderId
        if (appointment.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ success: false, message: "Razorpay Order ID mismatch." });
        }

        // Verify Razorpay signature
        const isSignatureValid = await paymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isSignatureValid) {
            // Update corresponding payment status to Failed in database
            const payment = await paymentModel.findOne({ razorpayOrderId: razorpay_order_id });
            if (payment) {
                payment.paymentStatus = 'Failed';
                await payment.save();
            }
            return res.status(400).json({ success: false, message: "Razorpay payment signature verification failed. Invalid transaction." });
        }

        // Fetch and update the corresponding payment record
        const payment = await paymentModel.findOne({ razorpayOrderId: razorpay_order_id });
        const paidAtDate = new Date();

        if (payment) {
            payment.paymentStatus = 'Paid';
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.paidAt = paidAtDate;
            await payment.save();
        } else {
            // Fallback: Create a new Paid Payment record if not found
            await paymentModel.create({
                userId: userId.toString(),
                appointmentId,
                doctorId: appointment.docId.toString(),
                amount: appointment.amount,
                currency: 'INR',
                paymentStatus: 'Paid',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                paidAt: paidAtDate,
                refundStatus: 'None'
            });
        }

        // Update Appointment legacy payment fields
        appointment.payment = true;
        appointment.paymentStatus = "Paid";
        appointment.razorpayPaymentId = razorpay_payment_id;
        appointment.paidAt = paidAtDate;
        await appointment.save();

        return res.status(200).json({
            success: true,
            message: "Payment successfully verified and updated.",
            paymentStatus: appointment.paymentStatus,
            appointmentId: appointmentId
        });

    } catch (error) {
        console.error("Razorpay verification error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal server error during payment verification." });
    }
};

/**
 * API to get payment status details
 */
const getPaymentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.query;
        if (!appointmentId) {
            return res.status(400).json({ success: false, message: "Appointment ID is required." });
        }

        const payment = await paymentModel.findOne({ appointmentId, paymentStatus: 'Paid' });
        if (!payment) {
            return res.status(404).json({ success: false, message: "No successful payment found for this appointment." });
        }

        // Validate payment belongs to authenticated patient
        if (payment.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized access." });
        }

        return res.json({ success: true, payment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

/**
 * API to manually retry/initiate a refund (e.g. for failed refunds retry)
 */
const initiateRefund = async (req, res) => {
    try {
        const { paymentId } = req.body;
        if (!paymentId) {
            return res.status(400).json({ success: false, message: "Payment ID is required." });
        }

        const payment = await paymentModel.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment record not found." });
        }

        // Validate payment belongs to authenticated patient
        if (payment.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access: You can only refund your own payments."
            });
        }

        const result = await paymentService.executeRazorpayRefund(payment._id);
        return res.json({
            success: true,
            message: "Refund processed successfully.",
            payment: result
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

/**
 * Razorpay Webhook signature verification and sync
 */
const handlePaymentWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        if (!signature && process.env.RAZORPAY_WEBHOOK_SECRET) {
            return res.status(400).json({ success: false, message: "Missing x-razorpay-signature header." });
        }

        // Verify webhook signature (if secret configuration exists)
        if (process.env.RAZORPAY_WEBHOOK_SECRET) {
            const isValid = paymentService.validateWebhookSignature(req.rawBody, signature);
            if (!isValid) {
                return res.status(400).json({ success: false, message: "Invalid webhook signature." });
            }
        }

        const event = req.body;
        if (!event || !event.event) {
            return res.status(400).json({ success: false, message: "Invalid webhook payload." });
        }

        console.log(`[Razorpay Webhook Received]: event = ${event.event}`);

        if (event.event === 'refund.processed') {
            const refundEntity = event.payload.refund.entity;
            const payment = await paymentModel.findOne({
                $or: [
                    { refundId: refundEntity.id },
                    { razorpayPaymentId: refundEntity.payment_id }
                ]
            });

            if (payment) {
                if (payment.refundStatus === 'Processed') {
                    console.log(`[Razorpay Webhook]: Webhook event already processed for Payment ${payment._id}`);
                    return res.status(200).json({ success: true, message: "Webhook already processed." });
                }
                payment.refundId = refundEntity.id;
                payment.refundStatus = 'Processed';
                payment.refundedAt = new Date(refundEntity.created_at * 1000);
                payment.refundAmount = refundEntity.amount / 100; // convert to main currency units
                await payment.save();

                // Synchronize Appointment legacy status fields
                const appointment = await appointmentModel.findById(payment.appointmentId);
                if (appointment) {
                    appointment.paymentStatus = 'Refunded';
                    await appointment.save();
                }
                console.log(`[Razorpay Webhook]: Refund successfully processed for Payment ${payment._id}`);
            }
        } else if (event.event === 'refund.failed') {
            const refundEntity = event.payload.refund.entity;
            const payment = await paymentModel.findOne({
                $or: [
                    { refundId: refundEntity.id },
                    { razorpayPaymentId: refundEntity.payment_id }
                ]
            });

            if (payment) {
                if (payment.refundStatus === 'Failed') {
                    console.log(`[Razorpay Webhook]: Webhook event already failed for Payment ${payment._id}`);
                    return res.status(200).json({ success: true, message: "Webhook already processed." });
                }
                payment.refundId = refundEntity.id;
                payment.refundStatus = 'Failed';
                await payment.save();
                console.log(`[Razorpay Webhook]: Refund execution failed for Payment ${payment._id}`);
            }
        }

        // Webhooks must always return a fast 200 OK to Razorpay
        return res.status(200).json({ success: true, message: "Webhook processed." });

    } catch (error) {
        console.error("Razorpay webhook error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal server error." });
    }
}

export {
    createRazorpayOrder,
    verifyRazorpayPayment,
    getPaymentStatus,
    initiateRefund,
    handlePaymentWebhook
}
