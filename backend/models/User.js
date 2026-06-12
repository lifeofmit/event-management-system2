const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["SUPER_ADMIN", "ADMIN", "DEAN", "COORDINATOR"], 
    required: true 
  },
  assignedDean: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Only for Coordinators
  status: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);