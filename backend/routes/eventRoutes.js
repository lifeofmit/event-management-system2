const express = require('express');
const router = express.Router();
const { createEvent, getEvents } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, getEvents);

// Expected fields from the frontend FormData
router.post('/', 
  protect, 
  authorize('SUPER_ADMIN', 'COORDINATOR'), 
  upload.fields([
    { name: 'geoLocationPhotos', maxCount: 5 },
    { name: 'eventPhotos', maxCount: 10 },
    { name: 'eventReport', maxCount: 1 }
  ]), 
  createEvent
);

module.exports = router;