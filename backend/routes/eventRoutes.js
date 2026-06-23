const express = require('express');
const router = express.Router();
const { createEvent, getEvents, uploadReport } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Base route: /api/events/
router.get('/', protect, getEvents);

router.post('/', 
  protect, 
  // FIXED: All four roles are now explicitly authorized to create events
  authorize('SUPER_ADMIN', 'ADMIN', 'DEAN', 'COORDINATOR'), 
  upload.fields([
    { name: 'geoLocationPhotos', maxCount: 30 },
    { name: 'eventPhotos', maxCount: 30 },
    { name: 'eventReport', maxCount: 1 }
  ]), 
  createEvent
);

// CRITICAL FIX: Ensure this is spelled exactly like this and registered correctly
router.post('/:id/report', 
  protect, 
  authorize('SUPER_ADMIN', 'ADMIN', 'DEAN', 'COORDINATOR'), 
  upload.single('eventReport'), 
  uploadReport
);

module.exports = router;