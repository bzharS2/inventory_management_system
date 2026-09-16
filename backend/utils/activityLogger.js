const db = require('../db');

async function logActivity({
  userId = null,
  action = null,
  targetType = null,
  targetId = null,
  details = null,
  sessionId = null,
} = {}) {
  if (!action) {
    return null;
  }

  let safeDetails = details;
  if (typeof safeDetails === 'object') {
    safeDetails = JSON.stringify(safeDetails).slice(0, 1000);
  } else if (typeof safeDetails === 'string') {
    safeDetails = safeDetails.slice(0, 1000);
  }

  try {
    const [result] = await db.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, session_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, action, targetType, targetId, safeDetails, sessionId]
    );

    return result;
  } catch (error) {
    console.error('Activity log failed:', error);
    return null;
  }
}

module.exports = { logActivity };
