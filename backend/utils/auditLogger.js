const AuditLog = require('../models/AuditLog');

const logAudit = async (req, action, details) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    await AuditLog.create({
      user: req.user._id,
      action,
      details,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to save audit log:', error);
  }
};

module.exports = logAudit;