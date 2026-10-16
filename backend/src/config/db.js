const mysql = require('mysql2/promise');
require('dotenv').config();

const connectionUri = process.env.MYSQL_URL || process.env.DATABASE_URL;

let connectionConfig;

if (connectionUri) {
  try {
    const parsed = new URL(connectionUri);
    connectionConfig = {
      host: parsed.hostname,
      port: parseInt(parsed.port || '3306', 10),
      user: decodeURIComponent(parsed.username || 'root'),
      password: decodeURIComponent(parsed.password || ''),
      database: parsed.pathname ? parsed.pathname.replace(/^\//, '') : 'default',
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };
  } catch (err) {
    console.warn(`[Database] Failed to parse DATABASE_URL, using URI string directly: ${err.message}`);
    connectionConfig = connectionUri;
  }
} else {
  connectionConfig = {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10),
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'cnc_erp',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
}

const pool = mysql.createPool(connectionConfig);

/**
 * Test database connectivity
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.warn(`[Database] Connection check failed: ${error.message}`);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
};
