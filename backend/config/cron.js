import cron from 'node-cron';
import reminderService from '../services/reminderService.js';

let scheduledTask = null;

/**
 * Initializes and registers the hourly appointment reminder cron job.
 * Runs once every hour (at minute 0) and processes email reminder dispatches.
 */
export const initReminderCron = () => {
  if (scheduledTask) {
    console.log('[Reminder Cron] Scheduler already active. Skipping duplicate registration.');
    return;
  }

  scheduledTask = cron.schedule('0 * * * *', async () => {
    console.log('[Reminder Cron] Triggered: Reminder Cron Started');
    try {
      const result = await reminderService.processReminders();
      
      console.log(`[Reminder Cron] Eligible Appointments Found: ${result.processed}`);
      console.log(`[Reminder Cron] Emails Sent Successfully: ${result.succeeded}`);
      console.log(`[Reminder Cron] Email Failures: ${result.failed}`);
      console.log('[Reminder Cron] Triggered: Reminder Cron Finished');
    } catch (error) {
      // Catch error to prevent Node.js crash, ensuring scheduler persists on subsequent ticks
      console.error('[Reminder Cron] Process failure occurred during execution:', error);
      console.log('[Reminder Cron] Triggered: Reminder Cron Finished (Failed Run)');
    }
  });

  console.log('[Reminder Cron] Scheduler registered successfully. Running once every hour.');
};
