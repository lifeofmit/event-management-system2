const Event = require('../models/Event');

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
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    // RBAC Filtering Logic
    let filter = {};
    if (req.user.role === 'COORDINATOR') filter.coordinatorId = req.user._id;
    if (req.user.role === 'DEAN') filter.deanId = req.user._id;
    // SUPER_ADMIN and ADMIN see all (no filter applied)

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