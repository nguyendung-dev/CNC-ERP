require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Infrastructure & Config
const { testConnection } = require('./config/db');
const { initializeDatabase } = require('./config/initDb');
const { setupSwagger } = require('./config/swagger');

// Layered Routes
const authRoutes = require('./routes/auth.routes');
const healthRoutes = require('./routes/health.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const salesRoutes = require('./routes/sales.routes');
const productionRoutes = require('./routes/production.routes');
const financeRoutes = require('./routes/finance.routes');
const reportsRoutes = require('./routes/reports.routes');
const searchRoutes = require('./routes/search.routes');

const app = express();
const PORT = process.env.PORT || 5002;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3001';

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      CLIENT_URL,
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:3000',
    ];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Setup Swagger UI Documentation on /api-docs
setupSwagger(app);

// Mount API Routes (Layered architecture)
app.use('/api/auth', authRoutes);
app.use('/api', healthRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/search', searchRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'CNC-ERP API Service (HTSOFTTECH)',
    version: '1.0.0',
    status: 'running',
    port: PORT,
    swaggerDocs: `http://localhost:${PORT}/api-docs`,
    healthCheck: `http://localhost:${PORT}/api/health`,
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy endpoint: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[Error Handler]:', err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server and Initialize Database
app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 CNC-ERP Backend server listening on port ${PORT}`);
  console.log(`🌐 Allowed Frontend Origin: ${CLIENT_URL}`);
  console.log(`📖 Swagger API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🩺 Health check URL: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);

  // Initialize DB tables and seed data
  await initializeDatabase();
});

module.exports = app;
