import bcrypt from 'bcrypt';
import adminModel from '../models/adminModel.js';

/**
 * Idempotently seeds the default Admin document based on environment variables.
 * Keeps the database password in sync if ADMIN_PASSWORD is changed in the environment.
 */
const seedAdmin = async () => {
    try {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            console.log("[Admin Seed] Warning: ADMIN_EMAIL or ADMIN_PASSWORD not configured in environment variables.");
            return;
        }

        const existingAdmin = await adminModel.findOne({ email: email.toLowerCase().trim() });

        if (!existingAdmin) {
            console.log("[Admin Seed] Default Admin not found. Seeding admin document...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newAdmin = new adminModel({
                email: email.toLowerCase().trim(),
                password: hashedPassword
            });

            await newAdmin.save();
            console.log("[Admin Seed] Default Admin seeded successfully.");
        } else {
            // Verify if environment password matches the hashed password
            const isMatch = await bcrypt.compare(password, existingAdmin.password);
            if (!isMatch) {
                console.log("[Admin Seed] ADMIN_PASSWORD environment change detected. Updating database password...");
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                existingAdmin.password = hashedPassword;
                await existingAdmin.save();
                console.log("[Admin Seed] Database password updated successfully.");
            } else {
                console.log("[Admin Seed] Default Admin verified and up-to-date.");
            }
        }
    } catch (error) {
        console.error("[Admin Seed] Error seeding default admin:", error);
    }
};

export default seedAdmin;
