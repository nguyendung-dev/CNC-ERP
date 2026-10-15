const { pool } = require('../src/config/db');

async function resetDatabase() {
  console.log('Resetting CNC-ERP database: truncating transactional tables...');
  const conn = await pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    const tables = [
      'wip_movements',
      'subcontracting_orders',
      'delivery_notes',
      'production_orders',
      'sales_orders',
      'quotations',
      'payment_requests',
      'advances',
      'debts',
      'materials',
    ];

    for (const table of tables) {
      await conn.query(`TRUNCATE TABLE \`${table}\``);
      console.log(`✓ Cleaned table: ${table}`);
    }

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ All business data successfully cleared! Database is completely fresh.');
  } catch (err) {
    console.error('Failed to reset database:', err);
  } finally {
    conn.release();
    pool.end();
  }
}

resetDatabase();
