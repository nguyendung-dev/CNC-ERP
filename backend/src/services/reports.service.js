const { pool } = require('../config/db');

class ReportsService {
  async getDashboardSummary() {
    // 1. Quotations and SO
    const [[soStats]] = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_price), 0) as total_order_value,
        COALESCE(SUM(order_qty), 0) as total_order_qty,
        COALESCE(SUM(delivered_qty), 0) as total_delivered_qty
      FROM sales_orders
    `);

    // 2. Production stats
    const [[prodStats]] = await pool.query(`
      SELECT 
        COUNT(*) as active_lsx_count,
        COALESCE(SUM(target_qty), 0) as target_qty_sum,
        COALESCE(SUM(completed_qty), 0) as completed_qty_sum,
        COALESCE(SUM(ng_qty), 0) as ng_qty_sum
      FROM production_orders
    `);

    // 3. Inventory valuation and low stock
    const [[invStats]] = await pool.query(`
      SELECT 
        COUNT(*) as total_materials,
        COALESCE(SUM(quantity * unit_price), 0) as total_inventory_value,
        SUM(CASE WHEN quantity <= min_stock THEN 1 ELSE 0 END) as low_stock_count
      FROM materials
    `);

    // 4. Subcontracting count and costs
    const [[subStats]] = await pool.query(`
      SELECT 
        COUNT(*) as total_subcontracts,
        COALESCE(SUM(total_cost), 0) as total_subcontract_cost
      FROM subcontracting_orders
    `);

    // 5. Finance Debts
    const [[debtStats]] = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'receivable' THEN remaining_amount ELSE 0 END), 0) as total_receivable,
        COALESCE(SUM(CASE WHEN type = 'payable' THEN remaining_amount ELSE 0 END), 0) as total_payable
      FROM debts
    `);

    const ngRate = prodStats.target_qty_sum > 0
      ? ((prodStats.ng_qty_sum / prodStats.target_qty_sum) * 100).toFixed(2)
      : '0.00';

    return {
      sales: {
        total_orders: soStats.total_orders,
        total_order_value: Number(soStats.total_order_value),
        total_order_qty: Number(soStats.total_order_qty),
        total_delivered_qty: Number(soStats.total_delivered_qty),
      },
      production: {
        active_lsx_count: prodStats.active_lsx_count,
        completed_qty: Number(prodStats.completed_qty_sum),
        ng_qty: Number(prodStats.ng_qty_sum),
        ng_rate_percent: Number(ngRate),
      },
      inventory: {
        total_materials: invStats.total_materials,
        total_inventory_value: Number(invStats.total_inventory_value),
        low_stock_count: Number(invStats.low_stock_count),
      },
      subcontracting: {
        total_subcontracts: subStats.total_subcontracts,
        total_cost: Number(subStats.total_subcontract_cost),
      },
      finance: {
        total_receivable: Number(debtStats.total_receivable),
        total_payable: Number(debtStats.total_payable),
      },
    };
  }
}

module.exports = new ReportsService();
