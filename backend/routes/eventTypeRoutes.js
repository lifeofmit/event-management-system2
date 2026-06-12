const express = require('express');
const router = express.Router();
const { getEventTypes, createEventType } = require('../controllers/eventTypeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getEventTypes);
router.post('/', protect, authorize('SUPER_ADMIN'), createEventType);

module.exports = router;