const Event = require('../models/Event');
const logAudit = require('../utils/auditLogger');

const createEvent = async (req, res) => {
  try {
    const { eventName, eventDate, eventType, objective, description, latitude, longitude } = req.body;

    // Process uploaded files mapped by Multer
    const formatFiles = (fileArray, folder) => {
      if (!fileArray) return [];
      return fileArray.map(file => ({
        fileName: file.filename,
        fileUrl: `/uploads/${folder}/${file.filename}`
      }));
    };

    const newEvent = new Event({
      eventName,
      eventDate,
      eventType,
      objective,
      description,
      latitude,
      longitude,
      geoLocationPhotos: formatFiles(req.files['geoLocationPhotos'], 'images'),
      eventPhotos: formatFiles(req.files['eventPhotos'], 'images'),
      eventReport: req.files['eventReport'] ? {
        fileName: req.files['eventReport'][0].filename,
        fileUrl: `/uploads/reports/${req.files['eventReport'][0].filename}`,
        uploadedAt: Date.now()
      } : null,
      coordinatorId: req.user._id, // Assign to logged-in coordinator
      deanId: req.user.assignedDean || req.user._id, // Fallback for testing
      createdBy: req.user._id
    });

    await newEvent.save();
    await logAudit(req, 'EVENT_CREATION', `Created event: ${newEvent.eventName}`);
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const { search, startDate, endDate, eventType } = req.query;
    let filter = {};

    // 1. RBAC Filtering (Base Security)
    if (req.user.role === 'COORDINATOR') filter.coordinatorId = req.user._id;
    if (req.user.role === 'DEAN') filter.deanId = req.user._id;

    // 2. User-Applied Filters
    if (search) {
      // Case-insensitive regex search on the event name
      filter.eventName = { $regex: search, $options: 'i' };
    }
    if (eventType) {
      filter.eventType = eventType;
    }
    if (startDate || endDate) {
      filter.eventDate = {};
      if (startDate) filter.eventDate.$gte = new Date(startDate);
      if (endDate) filter.eventDate.$lte = new Date(endDate);
    }

    const events = await Event.find(filter)
      .populate('eventType', 'name')
      .populate('coordinatorId', 'name')
      .populate('deanId', 'name')
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

module.exports = { createEvent, getEvents };