const EventType = require('../models/EventType');

const getEventTypes = async (req, res) => {
  try {
    const types = await EventType.find({ status: true });
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event types' });
  }
};

const createEventType = async (req, res) => {
  try {
    const { name } = req.body;
    const type = await EventType.create({ name, createdBy: req.user._id });
    res.status(201).json(type);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event type' });
  }
};

module.exports = { getEventTypes, createEventType };