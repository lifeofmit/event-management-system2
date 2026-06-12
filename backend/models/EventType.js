const mongoose = require('mongoose');

const eventTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  status: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('EventType', eventTypeSchema);