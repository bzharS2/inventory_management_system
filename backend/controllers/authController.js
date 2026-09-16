const bcrypt = require('bcrypt');
const db = require('../db');
const { logActivity } = require('../utils/activityLogger');

function normalizeUsername(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const username = value.trim();
  if (!username || username.length < 3 || username.length > 50) {
    return null;
  }

  return username;
}

function normalizePassword(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const password = value.trim();
  if (!password || password.length < 4) {
    return null;
  }

  return password;
}

async function findActiveWorkSession(userId) {
  const [sessions] = await db.query(
    'SELECT id FROM work_sessions WHERE user_id = ? AND status = "active" ORDER BY login_at DESC LIMIT 1',
    [userId]
  );

  return sessions[0] || null;
}

const loginController = async (req, res) => {
  const username = normalizeUsername(req.body.username);
  const password = normalizePassword(req.body.password);

  if (!username || !password) {
    return res.status(400).json({ error: 'Invalid username or password.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];

    if (!user || Number(user.is_active) !== 1) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    const [sessionResult] = await db.query(
      'INSERT INTO work_sessions (user_id, status) VALUES (?, "active")',
      [user.id]
    );

    await logActivity({
      userId: user.id,
      action: 'LOGIN',
      targetType: 'user',
      targetId: user.id,
      details: `User ${user.username} logged in`,
      sessionId: sessionResult.insertId,
    });

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const logoutController = async (req, res) => {
  const userId = req.user?.id || req.session?.user?.id;

  if (userId) {
    try {
      const activeSession = await findActiveWorkSession(userId);
      if (activeSession) {
        await db.query(
          'UPDATE work_sessions SET logout_at = CURRENT_TIMESTAMP, status = "completed" WHERE id = ?',
          [activeSession.id]
        );
      }

      await logActivity({
        userId,
        action: 'LOGOUT',
        targetType: 'user',
        targetId: userId,
        details: 'User logged out',
      });
    } catch (error) {
      console.error('Logout audit error:', error);
    }
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Destroy session error:', err);
    }
  });

  return res.status(200).json({ message: 'Logged out successfully' });
};

const meController = (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ authenticated: false, user: null });
  }

  return res.status(200).json({
    authenticated: true,
    user: {
      id: req.session.user.id,
      username: req.session.user.username,
      role: req.session.user.role,
    },
  });
};

const changePasswordController = async (req, res) => {
  const currentPassword = normalizePassword(req.body.currentPassword);
  const newPassword = normalizePassword(req.body.newPassword);

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'A valid current and new password are required.' });
  }

  try {
    const [rows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const matches = await bcrypt.compare(currentPassword, user.password_hash);
    if (!matches) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [
      passwordHash,
      req.user.id,
    ]);

    await logActivity({
      userId: req.user.id,
      action: 'CHANGE_PASSWORD',
      targetType: 'user',
      targetId: req.user.id,
      details: 'Password changed',
    });

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  loginController,
  logoutController,
  meController,
  changePasswordController,
};
