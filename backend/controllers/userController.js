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
  if (!password || password.length < 6) {
    return null;
  }

  return password;
}

function normalizeRole(value) {
  if (value !== 'admin' && value !== 'staff') {
    return null;
  }

  return value;
}

const getUsersController = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const createUserController = async (req, res) => {
  const username = normalizeUsername(req.body.username);
  const password = normalizePassword(req.body.password);
  const role = normalizeRole(req.body.role);

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required.' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'User already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (username, password_hash, role, is_active) VALUES (?, ?, ?, 1)',
      [username, passwordHash, role]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'User could not be created.' });
    }

    await logActivity({
      userId: req.user.id,
      action: 'CREATE_USER',
      targetType: 'user',
      targetId: result.insertId,
      details: `Created user ${username}`,
    });

    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUserStatusController = async (req, res) => {
  const userId = Number(req.params.id);
  const status = req.body.status;

  if (!Number.isInteger(userId) || userId <= 0 || (status !== 'active' && status !== 'inactive')) {
    return res.status(400).json({ error: 'Invalid user status.' });
  }

  try {
    const [target] = await db.query('SELECT id, role, is_active FROM users WHERE id = ?', [userId]);
    if (target.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (target[0].role === 'admin' && Number(target[0].is_active) === 1 && status === 'inactive') {
      const [adminCount] = await db.query(
        'SELECT COUNT(*) AS activeAdmins FROM users WHERE role = "admin" AND is_active = 1'
      );

      if (Number(adminCount[0].activeAdmins) <= 1) {
        return res.status(400).json({ error: 'Cannot disable the only active admin.' });
      }
    }

    const isActive = status === 'active' ? 1 : 0;
    const [result] = await db.query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [isActive, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Status update failed.' });
    }

    await logActivity({
      userId: req.user.id,
      action: status === 'active' ? 'ENABLE_USER' : 'DISABLE_USER',
      targetType: 'user',
      targetId: userId,
      details: `User ${userId} set to ${status}`,
    });

    return res.status(200).json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Status update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const resetUserPasswordController = async (req, res) => {
  const userId = Number(req.params.id);
  const newPassword = normalizePassword(req.body.newPassword);

  if (!Number.isInteger(userId) || userId <= 0 || !newPassword) {
    return res.status(400).json({ error: 'A valid user ID and password are required.' });
  }

  try {
    const [target] = await db.query('SELECT id, username FROM users WHERE id = ?', [userId]);
    if (target.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [
      passwordHash,
      userId,
    ]);

    await logActivity({
      userId: req.user.id,
      action: 'RESET_PASSWORD',
      targetType: 'user',
      targetId: userId,
      details: `Password reset for ${target[0].username}`,
    });

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getUsersController,
  createUserController,
  updateUserStatusController,
  resetUserPasswordController,
};
