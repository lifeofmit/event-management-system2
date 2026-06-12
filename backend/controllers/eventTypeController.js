const EventType = require('../models/EventType');

// Get all event types (Admin view needs all, including inactive)
const getEventTypes = async (req, res) => {
  try {
    const types = await EventType.find().sort({ createdAt: -1 });
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event types' });
  }
};

// Get active event types (For the Event Submission Form dropdown)
const getActiveEventTypes = async (req, res) => {
  try {
    const types = await EventType.find({ status: true }).sort({ name: 1 });
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active event types' });
  }
};

// Create
const createEventType = async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await EventType.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Event type already exists' });

    const type = await EventType.create({ name, createdBy: req.user._id });
    res.status(201).json(type);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event type' });
  }
};

// Update
const updateEventType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    
    const updatedType = await EventType.findByIdAndUpdate(
      id, 
      { name, status }, 
      { new: true }
    );
    res.json({ message: 'Updated successfully', type: updatedType });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update event type' });
  }
};

// Delete
const deleteEventType = async (req, res) => {
  try {
    const { id } = req.params;
    await EventType.findByIdAndDelete(id);
    res.json({ message: 'Event type deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event type' });
  }
};

module.exports = { 
  getEventTypes, getActiveEventTypes, createEventType, updateEventType, deleteEventType 
};