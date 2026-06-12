const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventType: { type: mongoose.Schema.Types.ObjectId, ref: 'EventType', required: true },
  objective: { type: String, required: true },
  description: { type: String },
  latitude: { type: String },
  longitude: { type: String },
  geoLocationPhotos: [{ fileName: String, fileUrl: String }],
  eventPhotos: [{ fileName: String, fileUrl: String }],
  eventReport: {
    fileName: String,
    fileUrl: String,
    uploadedAt: Date
  },
  coordinatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deanId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);