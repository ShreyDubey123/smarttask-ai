const cron = require('node-cron');
const { sendDailySummariesToAllUsers } = require('../services/emailService');

// Daily job - 8:00 AM every day
const startDailyEmailJob = () => {
  // Format: minute hour day month dayOfWeek
  // '0 8 * * *' = 8:00 AM every day
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily email job at 8:00 AM');
    await sendDailySummariesToAllUsers();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // IST timezone
  });
  
  console.log('✅ Daily email job scheduled for 8:00 AM IST');
  
  // Optional: Test immediately (remove in production)
  // setTimeout(async () => {
  //   console.log('🧪 Running test email...');
  //   await sendDailySummariesToAllUsers();
  // }, 5000);
};

// Manual trigger function (for testing via API)
const triggerDailyEmails = async () => {
  console.log('🚀 Manually triggering daily emails...');
  await sendDailySummariesToAllUsers();
  return { message: 'Daily emails triggered successfully' };
};

module.exports = {
  startDailyEmailJob,
  triggerDailyEmails
};