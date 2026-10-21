const { pool } = require('../config/db');

class SalesRepository {
  // Quotations
  async getAllQuotations() {
    const [rows] = await pool.query('SELECT * FROM quotations ORDER BY id DESC');
    return rows;
  }

  async getQuotationById(id) {
    const [rows] = await pool.query('SELECT * FROM quotations WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async createQuotation(data) {
    const {
      code, customer_name, customer_phone, part_name, drawing_code,
      quantity, raw_material_cost, machine_hours, machine_hourly_rate,
      subcontract_cost, transport_cost, total_amount, status
    } = data;

    const [result] = await pool.query(
      `INSERT INTO quotations (code, customer_name, customer_phone, part_name, drawing_code,
        quantity, raw_material_cost, machine_hours, machine_hourly_rate, subcontract_cost,
        transport_cost, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, customer_name, customer_phone || '', part_name, drawing_code || '',
        quantity, raw_material_cost || 0, machine_hours || 0, machine_hourly_rate || 0,
        subcontract_cost || 0, transport_cost || 0, total_amount, status || 'draft'
      ]
    );
    return this.getQuotationById(result.insertId);
  }

  async updateQuotationStatus(id, status) {
    await pool.query('UPDATE quotations SET status = ? WHERE id = ?', [status, id]);
    return this.getQuotationById(id);
  }

  // Sales Orders (SO)
  async getAllOrders() {
    const [rows] = await pool.query('SELECT * FROM sales_orders ORDER BY id DESC');
    return rows;
  }

  async getOrderById(id) {
    const [rows] = await pool.query('SELECT * FROM sales_orders WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async createOrder(data) {
    const {
      code, quotation_id, customer_name, part_name, drawing_code,
      order_qty, total_price, delivery_deadline, status
    } = data;

    const [result] = await pool.query(
      `INSERT INTO sales_orders (code, quotation_id, customer_name, part_name, drawing_code,
        order_qty, machined_qty, delivered_qty, wip_qty, total_price, delivery_deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?)`,
      [
        code, quotation_id || null, customer_name, part_name, drawing_code || '',
        order_qty, order_qty, total_price, delivery_deadline, status || 'in_production'
      ]
    );
    return this.getOrderById(result.insertId);
  }

  async updateOrderProgress(id, { machined_qty, delivered_qty, status }) {
    const [rows] = await pool.query('SELECT order_qty FROM sales_orders WHERE id = ?', [id]);
    if (!rows.length) return null;
    const orderQty = rows[0].order_qty;

    const updates = [];
    const params = [];

    if (machined_qty !== undefined) {
      updates.push('machined_qty = ?');
      params.push(machined_qty);
    }
    if (delivered_qty !== undefined) {
      updates.push('delivered_qty = ?');
      params.push(delivered_qty);
      updates.push('wip_qty = ?');
      params.push(Math.max(0, orderQty - delivered_qty));
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    params.push(id);
    await pool.query(`UPDATE sales_orders SET ${updates.join(', ')} WHERE id = ?`, params);
    return this.getOrderById(id);
  }

  // Delivery Notes
  async getAllDeliveryNotes() {
    const [rows] = await pool.query('SELECT * FROM delivery_notes ORDER BY id DESC');
    return rows;
  }

  async getDeliveryNoteById(id) {
    const [rows] = await pool.query('SELECT * FROM delivery_notes WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async createDeliveryNote(data) {
    const { code, so_id, customer_name, drawing_code, delivery_qty, receiver_name, note, status, created_by, checked_by } = data;
    const [result] = await pool.query(
      `INSERT INTO delivery_notes (code, so_id, customer_name, drawing_code, delivery_qty, receiver_name, note, status, created_by, checked_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        so_id || null,
        customer_name,
        drawing_code || '',
        delivery_qty,
        receiver_name || '',
        note || '',
        status || 'exported',
        created_by || '',
        checked_by || '',
      ]
    );
    return await this.getDeliveryNoteById(result.insertId);
  }

  async updateDeliveryNoteStatus(id, status, checked_by) {
    await pool.query(
      'UPDATE delivery_notes SET status = ?, checked_by = ? WHERE id = ?',
      [status, checked_by || '', id]
    );
    return await this.getDeliveryNoteById(id);
  }

  async updateQuotation(id, data) {
    const {
      customer_name, customer_phone, part_name, drawing_code,
      quantity, raw_material_cost, machine_hours, machine_hourly_rate,
      subcontract_cost, transport_cost, total_amount, status
    } = data;
    await pool.query(
      `UPDATE quotations SET 
        customer_name = COALESCE(?, customer_name),
        customer_phone = COALESCE(?, customer_phone),
        part_name = COALESCE(?, part_name),
        drawing_code = COALESCE(?, drawing_code),
        quantity = COALESCE(?, quantity),
        raw_material_cost = COALESCE(?, raw_material_cost),
        machine_hours = COALESCE(?, machine_hours),
        machine_hourly_rate = COALESCE(?, machine_hourly_rate),
        subcontract_cost = COALESCE(?, subcontract_cost),
        transport_cost = COALESCE(?, transport_cost),
        total_amount = COALESCE(?, total_amount),
        status = COALESCE(?, status)
      WHERE id = ?`,
      [
        customer_name, customer_phone, part_name, drawing_code,
        quantity, raw_material_cost, machine_hours, machine_hourly_rate,
        subcontract_cost, transport_cost, total_amount, status,
        id
      ]
    );
    return this.getQuotationById(id);
  }

  async updateOrder(id, data) {
    const {
      customer_name, part_name, drawing_code,
      order_qty, total_price, delivery_deadline, status
    } = data;
    await pool.query(
      `UPDATE sales_orders SET
        customer_name = COALESCE(?, customer_name),
        part_name = COALESCE(?, part_name),
        drawing_code = COALESCE(?, drawing_code),
        order_qty = COALESCE(?, order_qty),
        total_price = COALESCE(?, total_price),
        delivery_deadline = COALESCE(?, delivery_deadline),
        status = COALESCE(?, status)
      WHERE id = ?`,
      [
        customer_name, part_name, drawing_code,
        order_qty, total_price, delivery_deadline, status,
        id
      ]
    );
    return this.getOrderById(id);
  }

  async updateDeliveryNote(id, data) {
    const {
      customer_name, drawing_code, delivery_qty, receiver_name, note, status
    } = data;
    await pool.query(
      `UPDATE delivery_notes SET
        customer_name = COALESCE(?, customer_name),
        drawing_code = COALESCE(?, drawing_code),
        delivery_qty = COALESCE(?, delivery_qty),
        receiver_name = COALESCE(?, receiver_name),
        note = COALESCE(?, note),
        status = COALESCE(?, status)
      WHERE id = ?`,
      [
        customer_name, drawing_code, delivery_qty, receiver_name, note, status,
        id
      ]
    );
    return this.getDeliveryNoteById(id);
  }

  async deleteQuotation(id) {
    await pool.query('DELETE FROM quotations WHERE id = ?', [id]);
    return true;
  }

  async deleteOrder(id) {
    await pool.query('DELETE FROM sales_orders WHERE id = ?', [id]);
    return true;
  }

  async deleteDeliveryNote(id) {
    await pool.query('DELETE FROM delivery_notes WHERE id = ?', [id]);
    return true;
  }

  // Parts Catalog CRUD
  async getAllParts() {
    const [rows] = await pool.query('SELECT * FROM parts ORDER BY id DESC');
    return rows;
  }

  async getPartById(id) {
    const [rows] = await pool.query('SELECT * FROM parts WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async createPart(data) {
    const { code, name, drawing_code, material_category, unit, unit_price_estimate, note } = data;
    const finalCode = code || ('CT-' + Date.now().toString().slice(-6));
    const [result] = await pool.query(
      `INSERT INTO parts (code, name, drawing_code, material_category, unit, unit_price_estimate, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [finalCode, name, drawing_code || '', material_category || '', unit || 'Cái', unit_price_estimate || 0, note || '']
    );
    return this.getPartById(result.insertId);
  }

  async updatePart(id, data) {
    const { code, name, drawing_code, material_category, unit, unit_price_estimate, note } = data;
    await pool.query(
      `UPDATE parts SET
        code = COALESCE(?, code),
        name = COALESCE(?, name),
        drawing_code = COALESCE(?, drawing_code),
        material_category = COALESCE(?, material_category),
        unit = COALESCE(?, unit),
        unit_price_estimate = COALESCE(?, unit_price_estimate),
        note = COALESCE(?, note)
      WHERE id = ?`,
      [code, name, drawing_code, material_category, unit, unit_price_estimate, note, id]
    );
    return this.getPartById(id);
  }

  async deletePart(id) {
    await pool.query('DELETE FROM parts WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new SalesRepository();
