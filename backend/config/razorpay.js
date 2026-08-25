import Razorpay from 'razorpay';
import 'dotenv/config';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

// Gracefully handle missing environment variables (e.g. log warnings rather than crashing process)
if (!keyId || !keySecret) {
  console.warn(
    "[Razorpay Config Warning]: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables are missing. Checkout operations will run in fallback configurations."
  );
}

const razorpayInstance = keyId && keySecret ? new Razorpay({
  key_id: keyId,
  key_secret: keySecret
}) : null;

export default razorpayInstance;
