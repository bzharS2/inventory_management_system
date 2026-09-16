const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const requireAuth = require('../middleware/requireAuth');
const { loginController, logoutController, meController, changePasswordController } = require('../controllers/authController');

const csrfProtection = csrf({ cookie: false });

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

router.post('/login', loginLimiter, loginController);
router.post('/logout', requireAuth, csrfProtection, logoutController);
router.get('/me', requireAuth, meController);
router.post('/change-password', requireAuth, csrfProtection, changePasswordController);

module.exports = router;
