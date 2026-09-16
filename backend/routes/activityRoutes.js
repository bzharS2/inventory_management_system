const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { getActivityLogsController } = require('../controllers/activityController');

router.get('/', requireAuth, requireRole('admin'), getActivityLogsController);

module.exports = router;
