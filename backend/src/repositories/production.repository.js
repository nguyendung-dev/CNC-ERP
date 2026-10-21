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
       VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, ?)`,
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

  // Production Steps CRUD
  async getAllSteps(workshopId) {
    let query = `
      SELECT s.*, w.name as workshop_name, w.code as workshop_code
      FROM production_steps s
      LEFT JOIN workshops w ON s.workshop_id = w.id
    `;
    const params = [];
    if (workshopId) {
      query += ' WHERE s.workshop_id = ?';
      params.push(workshopId);
    }
    query += ' ORDER BY s.step_order ASC, s.id ASC';
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async getStepById(id) {
    const [rows] = await pool.query(
      `SELECT s.*, w.name as workshop_name, w.code as workshop_code
       FROM production_steps s
       LEFT JOIN workshops w ON s.workshop_id = w.id
       WHERE s.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async createStep(data) {
    const { step_order, name, assigned_role, description, workshop_id } = data;
    const [result] = await pool.query(
      'INSERT INTO production_steps (step_order, name, assigned_role, description, workshop_id) VALUES (?, ?, ?, ?, ?)',
      [Number(step_order) || 1, name, assigned_role || '', description || '', workshop_id ? Number(workshop_id) : null]
    );
    return this.getStepById(result.insertId);
  }

  async updateStep(id, data) {
    const { step_order, name, assigned_role, description, workshop_id } = data;
    await pool.query(
      `UPDATE production_steps SET
        step_order = COALESCE(?, step_order),
        name = COALESCE(?, name),
        assigned_role = COALESCE(?, assigned_role),
        description = COALESCE(?, description),
        workshop_id = ?
      WHERE id = ?`,
      [
        step_order !== undefined ? Number(step_order) : null,
        name,
        assigned_role,
        description,
        workshop_id !== undefined ? (workshop_id ? Number(workshop_id) : null) : null,
        id
      ]
    );
    return this.getStepById(id);
  }

  async deleteStep(id) {
    await pool.query('DELETE FROM production_steps WHERE id = ?', [id]);
    return true;
  }

  // Operators (Thợ máy CNC)
  async getOperators(workshopId) {
    let query = `
      SELECT o.*, w.name as workshop_name, w.code as workshop_code
      FROM operators o
      LEFT JOIN workshops w ON o.workshop_id = w.id
    `;
    const params = [];
    if (workshopId) {
      query += ' WHERE o.workshop_id = ?';
      params.push(workshopId);
    }
    query += ' ORDER BY o.id ASC';
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async getOperatorById(id) {
    const [rows] = await pool.query(
      `SELECT o.*, w.name as workshop_name, w.code as workshop_code
       FROM operators o
       LEFT JOIN workshops w ON o.workshop_id = w.id
       WHERE o.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async createOperator(data) {
    const { code, name, phone, workshop_id, skill_level, shift, status, notes } = data;
    const opCode = code || `THO-${Date.now().toString().slice(-4)}`;
    const [result] = await pool.query(
      `INSERT INTO operators (code, name, phone, workshop_id, skill_level, shift, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [opCode, name, phone || '', workshop_id || null, skill_level || 'Thợ đứng máy CNC', shift || 'Ca 1 (Hành chính)', status || 'active', notes || '']
    );
    return this.getOperatorById(result.insertId);
  }

  async updateOperator(id, data) {
    const { code, name, phone, workshop_id, skill_level, shift, status, notes } = data;
    await pool.query(
      `UPDATE operators SET
        code = COALESCE(?, code),
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        workshop_id = COALESCE(?, workshop_id),
        skill_level = COALESCE(?, skill_level),
        shift = COALESCE(?, shift),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes)
      WHERE id = ?`,
      [code, name, phone, workshop_id !== undefined ? workshop_id : null, skill_level, shift, status, notes, id]
    );
    return this.getOperatorById(id);
  }

  async deleteOperator(id) {
    await pool.query('DELETE FROM operators WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new ProductionRepository();
