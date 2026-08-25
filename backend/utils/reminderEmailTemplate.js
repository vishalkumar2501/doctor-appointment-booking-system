/**
 * Formats a D_M_YYYY string into a human-readable date.
 * @param {string} dateStr - Date string in D_M_YYYY format
 * @returns {string} Human-readable date string (e.g. "Monday, July 20, 2026")
 */
export const formatReadableDate = (dateStr) => {
  if (!dateStr) return '';
  const [d, m, y] = dateStr.split('_').map(Number);
  const tempDate = new Date(y, m - 1, d);
  return tempDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Compiles a professional HTML email body for appointment reminders.
 * @param {Object} appointment - Mongoose appointment document
 * @returns {string} Compiled HTML template string
 */
export const buildReminderEmail = (appointment) => {
  const patientName = appointment.userData?.name || 'Valued Patient';
  const doctorName = appointment.docData?.name || 'Doctor';
  const readableDate = formatReadableDate(appointment.slotDate);
  const time = appointment.slotTime || '';
  
  const addressLine1 = appointment.docData?.address?.line1 || '';
  const addressLine2 = appointment.docData?.address?.line2 || '';
  const clinicAddress = addressLine2 
    ? `${addressLine1}, ${addressLine2}`
    : addressLine1 || 'DocBook Clinic Location';

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="text-align: center; border-bottom: 2px solid #5F6FFF; padding-bottom: 16px; margin-bottom: 24px;">
        <h2 style="color: #5F6FFF; margin: 0; font-size: 24px;">Appointment Reminder</h2>
      </div>
      <p>Dear <strong>${patientName}</strong>,</p>
      <p>This is a friendly reminder that you have an upcoming appointment scheduled for tomorrow.</p>
      
      <div style="background-color: #F8F9FD; border-left: 4px solid #5F6FFF; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #333; font-size: 16px;">Appointment Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; font-weight: bold; color: #666; width: 120px;">Doctor:</td>
            <td style="padding: 4px 0; color: #333;">${doctorName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold; color: #666;">Date:</td>
            <td style="padding: 4px 0; color: #333;">${readableDate}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold; color: #666;">Time:</td>
            <td style="padding: 4px 0; color: #333;">${time}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold; color: #666; vertical-align: top;">Location:</td>
            <td style="padding: 4px 0; color: #333;">${clinicAddress}</td>
          </tr>
        </table>
      </div>

      <p>If you need to make changes or cancel your appointment, please log in to your dashboard at least 24 hours prior.</p>
      <p>Thank you for choosing DocBook!</p>
      <div style="border-top: 1px solid #eeeeee; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 12px; color: #999;">
        This is an automated system notification. Please do not reply directly to this email.
      </div>
    </div>
  `;
};
