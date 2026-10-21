const { pool } = require('../config/db');

class ProductionRepository {
  // Production Orders (LSX)
  async getAllProductionOrders() {
    const [rows] = await pool.query('SELECT * FROM production_orders ORDER BY id DESC');
    return rows;
  }

  async getProductionOrderById(id) {
    const [rows] = await pool.query('SELECT * FROM production_orders WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async createProductionOrder(data) {
    const {
      code, so_id, part_name, drawing_code, target_qty, routing,
      current_step, workshop_name, status, start_date, end_date
    } = data;

    const routingStr = typeof routing === 'object' ? JSON.stringify(routing) : routing;

    const [result] = await pool.query(
      `INSERT INTO production_orders (code, so_id, part_name, drawing_code, target_qty, completed_qty, ng_qty, routing, current_step, workshop_name, status, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?)`,
      [
        code, so_id || null, part_name, drawing_code || '', target_qty,
        routingStr || '[]', current_step || 'Cắt phôi', workshop_name || 'Xưởng A (Phay Mazak, Tiện Doosan)', status || 'running',
        start_date || null, end_date || null
      ]
    );
    return this.getProductionOrderById(result.insertId);
  }

  async updateProductionOrder(id, data) {
    const { target_qty, workshop_name, priority, notes, current_step, status } = data;
    await pool.query(
      `UPDATE production_orders SET
        target_qty = COALESCE(?, target_qty),
        workshop_name = COALESCE(?, workshop_name),
        priority = COALESCE(?, priority),
        notes = COALESCE(?, notes),
        current_step = COALESCE(?, current_step),
        status = COALESCE(?, status)
      WHERE id = ?`,
      [target_qty, workshop_name, priority, notes, current_step, status, id]
    );
    return this.getProductionOrderById(id);
  }

  async updateProductionStep(id, { current_step, workshop_name, completed_qty, ng_qty, status }) {
    const updates = [];
    const params = [];

    if (current_step) {
      updates.push('current_step = ?');
      params.push(current_step);
    }
    if (completed_qty !== undefined) {
      updates.push('completed_qty = ?');
      params.push(completed_qty);
    }
    if (ng_qty !== undefined) {
      updates.push('ng_qty = ?');
      params.push(ng_qty);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) return this.getProductionOrderById(id);

    params.push(id);
    await pool.query(`UPDATE production_orders SET ${updates.join(', ')} WHERE id = ?`, params);
    return this.getProductionOrderById(id);
  }

  // WIP Movements
  async getAllWipMovements() {
    const [rows] = await pool.query('SELECT * FROM wip_movements ORDER BY id DESC');
    return rows;
  }

  async createWipMovement(data) {
    const {
      code, production_order_id, from_step, to_step, operator,
      machine_name, qty_passed, qty_failed, fail_reason
    } = data;

    const [result] = await pool.query(
      `INSERT INTO wip_movements (code, production_order_id, from_step, to_step, operator, machine_name, qty_passed, qty_failed, fail_reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, production_order_id || null, from_step, to_step, operator || '',
        machine_name || '', qty_passed, qty_failed || 0, fail_reason || ''
      ]
    );
    const [rows] = await pool.query('SELECT * FROM wip_movements WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  // Subcontracting Orders
  async getAllSubcontractingOrders() {
    const [rows] = await pool.query('SELECT * FROM subcontracting_orders ORDER BY id DESC');
    return rows;
  }

  async getSubcontractingOrderById(id) {
    const [rows] = await pool.query('SELECT * FROM subcontracting_orders WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async createSubcontractingOrder(data) {
    const {
      code, production_order_id, vendor_name, process_type, part_name,
      send_qty, unit_cost, promise_date
    } = data;

    const total_cost = (Number(send_qty) || 0) * (Number(unit_cost) || 0);

    const [result] = await pool.query(
      `INSERT INTO subcontracting_orders (code, production_order_id, vendor_name, process_type, part_name, send_qty, received_qty, qc_passed_qty, unit_cost, total_cost, promise_date, status)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, 'sent')`,
      [
        code, production_order_id || null, vendor_name, process_type, part_name,
        send_qty, unit_cost || 0, total_cost, promise_date || null
      ]
    );
    return this.getSubcontractingOrderById(result.insertId);
  }

  async updateSubcontractingStatus(id, { status, received_qty, qc_passed_qty }) {
    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (received_qty !== undefined) {
      updates.push('received_qty = ?');
      params.push(received_qty);
    }
    if (qc_passed_qty !== undefined) {
      updates.push('qc_passed_qty = ?');
      params.push(qc_passed_qty);
    }

    params.push(id);
    await pool.query(`UPDATE subcontracting_orders SET ${updates.join(', ')} WHERE id = ?`, params);
    return this.getSubcontractingOrderById(id);
  }

  async deleteProductionOrder(id) {
    await pool.query('DELETE FROM production_orders WHERE id = ?', [id]);
    return true;
  }

  async deleteWipMovement(id) {
    await pool.query('DELETE FROM wip_movements WHERE id = ?', [id]);
    return true;
  }

  async deleteSubcontractingOrder(id) {
    await pool.query('DELETE FROM subcontracting_orders WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new ProductionRepository();
