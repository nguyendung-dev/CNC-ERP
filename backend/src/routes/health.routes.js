const express = require('express');
const { testConnection } = require('../config/db');

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint for verifying server status & database connection
 */
router.get('/health', async (req, res) => {
  const dbConnected = await testConnection();

  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      server: 'running',
      database: dbConnected ? 'connected' : 'disconnected (or not configured)',
    },
    port: process.env.PORT || 5002,
  };

  res.status(200).json(status);
});

module.exports = router;
