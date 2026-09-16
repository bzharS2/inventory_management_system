const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const {
  getUsersController,
  createUserController,
  updateUserStatusController,
  resetUserPasswordController,
} = require('../controllers/userController');

const csrfProtection = csrf({ cookie: false });

router.get('/', requireAuth, requireRole('admin'), getUsersController);
router.post('/', requireAuth, requireRole('admin'), csrfProtection, createUserController);
router.patch('/:id/status', requireAuth, requireRole('admin'), csrfProtection, updateUserStatusController);
router.patch('/:id/password', requireAuth, requireRole('admin'), csrfProtection, resetUserPasswordController);

module.exports = router;
