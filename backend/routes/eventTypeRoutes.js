const express = require('express');
const router = express.Router();
const { 
  getEventTypes, getActiveEventTypes, createEventType, updateEventType, deleteEventType 
} = require('../controllers/eventTypeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public/Protected route for the Add Event Form dropdown
router.get('/active', protect, getActiveEventTypes);

// Super Admin Only Routes
router.use(protect, authorize('SUPER_ADMIN'));

router.route('/')
  .get(getEventTypes)
  .post(createEventType);

router.route('/:id')
  .put(updateEventType)
  .delete(deleteEventType);

module.exports = router;