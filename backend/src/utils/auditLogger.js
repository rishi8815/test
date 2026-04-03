const AuditLog = require('../models/AuditLog');

const logAudit = async (req, action, details = {}) => {
  try {
    const userId = req.user ? req.user.id : null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await AuditLog.create({
      userId,
      action,
      details,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
    // Fail silently to not block main flow
  }
};

module.exports = logAudit;
