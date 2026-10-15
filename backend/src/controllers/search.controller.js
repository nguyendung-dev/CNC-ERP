const { pool } = require('../config/db');

class SearchController {
  async globalSearch(req, res, next) {
    try {
      const q = (req.query.q || '').trim();
      if (!q || q.length < 2) {
        return res.json({ success: true, count: 0, data: [] });
      }

      const pattern = `%${q}%`;
      const results = [];

      // 1. Search Materials (Inventory)
      const [materials] = await pool.query(
        `SELECT id, code, name as title, CONCAT(category, ' - ', spec) as subtitle, 'inventory' as module, 'Kho vật tư' as module_label 
         FROM materials 
         WHERE code LIKE ? OR name LIKE ? OR spec LIKE ? LIMIT 5`,
        [pattern, pattern, pattern]
      );
      results.push(...materials);

      // 2. Search Quotations (Sales)
      const [quotes] = await pool.query(
        `SELECT id, code, CONCAT('Báo giá: ', part_name) as title, CONCAT('KH: ', customer_name, ' (', drawing_code, ')') as subtitle, 'sales' as module, 'Bán hàng' as module_label 
         FROM quotations 
         WHERE code LIKE ? OR customer_name LIKE ? OR part_name LIKE ? OR drawing_code LIKE ? LIMIT 5`,
        [pattern, pattern, pattern, pattern]
      );
      results.push(...quotes);

      // 3. Search Sales Orders (Sales)
      const [orders] = await pool.query(
        `SELECT id, code, CONCAT('Đơn hàng SO: ', part_name) as title, CONCAT('KH: ', customer_name, ' (SL: ', order_qty, ')') as subtitle, 'sales' as module, 'Bán hàng' as module_label 
         FROM sales_orders 
         WHERE code LIKE ? OR customer_name LIKE ? OR part_name LIKE ? OR drawing_code LIKE ? LIMIT 5`,
        [pattern, pattern, pattern, pattern]
      );
      results.push(...orders);

      // 4. Search Production Orders (Production)
      const [lsx] = await pool.query(
        `SELECT id, code, CONCAT('Lệnh SX: ', part_name) as title, CONCAT('Tiến độ: ', current_step, ' (Mục tiêu: ', target_qty, ')') as subtitle, 'production' as module, 'Sản xuất' as module_label 
         FROM production_orders 
         WHERE code LIKE ? OR part_name LIKE ? OR drawing_code LIKE ? LIMIT 5`,
        [pattern, pattern, pattern]
      );
      results.push(...lsx);

      // 5. Search Subcontracting (Production)
      const [subs] = await pool.query(
        `SELECT id, code, CONCAT('Gia công ngoài: ', process_type) as title, CONCAT('Xưởng: ', vendor_name, ' - ', part_name) as subtitle, 'production' as module, 'Sản xuất' as module_label 
         FROM subcontracting_orders 
         WHERE code LIKE ? OR vendor_name LIKE ? OR part_name LIKE ? LIMIT 5`,
        [pattern, pattern, pattern]
      );
      results.push(...subs);

      // 6. Search Advances & Payments (Finance)
      const [advances] = await pool.query(
        `SELECT id, code, CONCAT('Tạm ứng: ', purpose) as title, CONCAT('Người đề nghị: ', requester, ' (', FORMAT(amount, 0), ' đ)') as subtitle, 'finance' as module, 'Tài chính' as module_label 
         FROM advances 
         WHERE code LIKE ? OR requester LIKE ? OR purpose LIKE ? LIMIT 5`,
        [pattern, pattern, pattern]
      );
      results.push(...advances);

      const [payments] = await pool.query(
        `SELECT id, code, CONCAT('Thanh toán NCC: ', recipient) as title, CONCAT('Số tiền: ', FORMAT(net_amount, 0), ' đ (', category, ')') as subtitle, 'finance' as module, 'Tài chính' as module_label 
         FROM payment_requests 
         WHERE code LIKE ? OR recipient LIKE ? OR category LIKE ? LIMIT 5`,
        [pattern, pattern, pattern]
      );
      results.push(...payments);

      // 7. Search Delivery Notes (Sales)
      const [deliveries] = await pool.query(
        `SELECT id, code, CONCAT('Phiếu xuất kho: ', customer_name) as title, CONCAT('Người nhận: ', receiver_name, ' (SL: ', delivery_qty, ')') as subtitle, 'sales' as module, 'Bán hàng' as module_label 
         FROM delivery_notes 
         WHERE code LIKE ? OR customer_name LIKE ? OR receiver_name LIKE ? LIMIT 5`,
        [pattern, pattern, pattern]
      );
      results.push(...deliveries);

      res.json({
        success: true,
        count: results.length,
        data: results,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SearchController();
