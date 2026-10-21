const express = require('express');
const reportsController = require('../controllers/reports.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

// All authenticated users can read dashboard KPI summary for the main overview
router.get('/dashboard', reportsController.getDashboardSummary);

module.exports = router;
