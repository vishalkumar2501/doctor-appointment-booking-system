import transporter, { isMailConfigured } from '../config/nodemailer.js';
import appointmentModel from '../models/appointmentModel.js';
import { buildReminderEmail } from '../utils/reminderEmailTemplate.js';

/**
 * Service orchestrating database queries, state tracking, and reminder processes.
 */
class ReminderService {

  /**
   * Helper to compute tomorrow's date string in D_M_YYYY format
   * @returns {string}
   */
  getTomorrowDateStr() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return `${tomorrow.getDate()}_${tomorrow.getMonth() + 1}_${tomorrow.getFullYear()}`;
  }

  /**
   * Find appointments eligible for reminder.
   * @param {string} targetDateStr
   * @returns {Promise<Array>}
   */
  async findEligibleAppointments(targetDateStr) {
    return await appointmentModel.find({
      reminderEligible: true,
      reminderSent: false,
      cancelled: false,
      slotDate: targetDateStr
    });
  }

  /**
   * Send reminder email.
   * @param {Object} appointment
   * @param {string} emailHtml
   * @returns {Promise<boolean>}
   */
  async sendReminder(appointment, emailHtml) {

    const toEmail = appointment.userData?.email;

    if (!toEmail) {
      throw new Error(
        `Patient email missing for appointment ${appointment._id}`
      );
    }

    const mailOptions = {
      from:
        process.env.SMTP_FROM ||
        '"DocBook Reminders" <reminders@docbook.com>',
      to: toEmail,
      subject: `Upcoming Appointment Reminder: Tomorrow with ${appointment.docData?.name || "Doctor"}`,
      html: emailHtml
    };

    if (!isMailConfigured) {
      console.log("====================================");
      console.log("SMTP not configured.");
      console.log("Running ReminderService in Draft Mode.");
      console.log("To:", toEmail);
      console.log("Subject:", mailOptions.subject);
      console.log("====================================");

      return true;
    }

    await transporter.sendMail(mailOptions);

    console.log(`Reminder email sent to ${toEmail}`);

    return true;
  }

  /**
   * Mark reminder as sent.
   * @param {string} appointmentId
   * @returns {Promise<Object>}
   */
  async markReminderSent(appointmentId) {
    return await appointmentModel.findByIdAndUpdate(
      appointmentId,
      {
        reminderSent: true
      },
      {
        new: true
      }
    );
  }

  /**
   * Process reminders.
   * @param {string} targetDateStr
   * @returns {Promise<Object>}
   */
  async processReminders(targetDateStr) {

    const targetDate = targetDateStr || this.getTomorrowDateStr();

    console.log(
      `[ReminderService] Executing reminders for ${targetDate}`
    );

    const appointments =
      await this.findEligibleAppointments(targetDate);

    console.log(
      `[ReminderService] Found ${appointments.length} appointment(s).`
    );

    let succeeded = 0;
    let failed = 0;

    for (const appointment of appointments) {

      try {

        const html =
          buildReminderEmail(appointment);

        await this.sendReminder(
          appointment,
          html
        );

        await this.markReminderSent(
          appointment._id
        );

        succeeded++;

      } catch (err) {

        console.error(
          `[ReminderService] Failed for appointment ${appointment._id}`
        );

        console.error(err);

        failed++;
      }
    }

    console.log(
      `[ReminderService] Completed. Success=${succeeded}, Failed=${failed}`
    );

    return {
      processed: appointments.length,
      succeeded,
      failed
    };
  }
}

export default new ReminderService();