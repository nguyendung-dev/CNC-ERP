const express = require('express');
const reportsController = require('../controllers/reports.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', reportsController.getDashboardSummary);

module.exports = router;
