const express = require('express');
const router = express.Router();
const { exportEvents } = require('../controllers/exportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only Super Admins and Admins can export system-wide data
router.get('/events', protect, authorize('SUPER_ADMIN', 'ADMIN'), exportEvents);

module.exports = router;