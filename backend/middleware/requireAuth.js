const db = require('../db');

const requireAuth = async (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, username, role, is_active FROM users WHERE id = ?',
      [req.session.user.id]
    );

    if (rows.length === 0 || Number(rows[0].is_active) !== 1) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Failed to destroy session:', err);
        }
      });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = {
      id: rows[0].id,
      username: rows[0].username,
      role: rows[0].role,
    };

    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = requireAuth;
