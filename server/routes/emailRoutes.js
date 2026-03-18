const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendTestEmail } = require('../services/emailService');
const { triggerDailyEmails } = require('../utils/cronJobs');

// @desc    Send test email to logged in user
// @route   POST /api/email/test
router.post('/test', protect, async (req, res) => {
  try {
    const result = await sendTestEmail(req.user._id);
    if (result) {
      res.json({ success: true, message: 'Test email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send test email' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Manually trigger daily emails (Admin only)
// @route   POST /api/email/trigger-daily
router.post('/trigger-daily', protect, async (req, res) => {
  try {
    const result = await triggerDailyEmails();
    res.json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;