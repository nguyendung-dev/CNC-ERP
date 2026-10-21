const express = require('express');
const reportsController = require('../controllers/reports.controller');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

// Only admin and accountant can access executive KPI report
router.get('/dashboard', authorizeRoles('accountant'), reportsController.getDashboardSummary);

module.exports = router;
