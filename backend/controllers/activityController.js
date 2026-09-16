const db = require('../db');

const getActivityLogsController = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.id, u.username, a.action, a.entity_type, a.entity_id, a.details, a.created_at
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.id DESC
      LIMIT 100
    `);

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Activity log fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getActivityLogsController };
