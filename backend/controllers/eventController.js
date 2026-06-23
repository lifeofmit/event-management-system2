const Event = require('../models/Event');
const logAudit = require('../utils/auditLogger');

const createEvent = async (req, res) => {
  try {
    const { eventName, eventDate, eventType, objective, description, latitude, longitude } = req.body;

    const formatFiles = (fileArray, folder) => {
      if (!fileArray) return [];
      return fileArray.map(file => ({ fileName: file.filename, fileUrl: `/uploads/${folder}/${file.filename}` }));
    };

    // Dynamic Hierarchy Mapping based on who is creating the event
    let coordinatorId = null;
    let deanId = null;
    let adminId = null;

    if (req.user.role === 'COORDINATOR') {
      coordinatorId = req.user._id;
      deanId = req.user.assignedDean;
      // Fetch the dean to find their assigned Admin
      if (deanId) {
        const dean = await User.findById(deanId);
        adminId = dean?.assignedAdmin || null;
      }
    } else if (req.user.role === 'DEAN') {
      deanId = req.user._id;
      adminId = req.user.assignedAdmin;
    } else if (req.user.role === 'ADMIN') {
      adminId = req.user._id;
    }

    const newEvent = new Event({
      eventName, eventDate, eventType, objective, description, latitude, longitude,
      geoLocationPhotos: formatFiles(req.files['geoLocationPhotos'], 'images'),
      eventPhotos: formatFiles(req.files['eventPhotos'], 'images'),
      eventReport: req.files['eventReport'] ? {
        fileName: req.files['eventReport'][0].filename,
        fileUrl: `/uploads/reports/${req.files['eventReport'][0].filename}`,
        uploadedAt: Date.now()
      } : null,
      coordinatorId, deanId, adminId,
      createdBy: req.user._id
    });

    await newEvent.save();
    await logAudit(req, 'EVENT_CREATION', `Created event: ${newEvent.eventName}`);
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const { search, startDate, endDate, eventType } = req.query;
    let filter = {};

    // 1. RBAC Hierarchy Filtering 
    if (req.user.role === 'COORDINATOR') filter.coordinatorId = req.user._id;
    if (req.user.role === 'DEAN') filter.deanId = req.user._id;
    if (req.user.role === 'ADMIN') filter.adminId = req.user._id;
    // SUPER_ADMIN sees all

    if (search) filter.eventName = { $regex: search, $options: 'i' };
    if (eventType) filter.eventType = eventType;
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

// Add this function below your existing getEvents function
const uploadReport = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log('Report upload request for event ID:', id);
    
    // Find the event
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // FIXED: Strict check - only the exact user who created it can upload the report, regardless of role.
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only upload reports for events you created' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Update the event record
    event.eventReport = {
      fileName: req.file.filename,
      fileUrl: `/uploads/reports/${req.file.filename}`,
      uploadedAt: Date.now()
    };

    await event.save();

    // Log the action (since we built Audit Logs in the last step!)
    const logAudit = require('../utils/auditLogger');
    await logAudit(req, 'REPORT_UPLOAD', `Uploaded report for event: ${event.eventName}`);

    res.json({ message: 'Report uploaded successfully', eventReport: event.eventReport });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload report' });
  }
};

// Don't forget to export it!
module.exports = { createEvent, getEvents, uploadReport };