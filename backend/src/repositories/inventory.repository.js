const { pool } = require('../config/db');

class InventoryRepository {
  async getAll({ category, search } = {}) {
    let query = 'SELECT * FROM materials WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR code LIKE ? OR spec LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM materials WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async getLowStock() {
    const [rows] = await pool.query('SELECT * FROM materials WHERE quantity <= min_stock ORDER BY quantity ASC');
    return rows;
  }

  async create(material) {
    const { code, name, category, spec, unit, quantity, min_stock, unit_price, location, batch_no } = material;
    const [result] = await pool.query(
      `INSERT INTO materials (code, name, category, spec, unit, quantity, min_stock, unit_price, location, batch_no)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, name, category, spec || '', unit, quantity || 0, min_stock || 0, unit_price || 0, location || '', batch_no || '']
    );
    return this.getById(result.insertId);
  }

  async update(id, data) {
    const fields = [];
    const params = [];

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      params.push(value);
    }

    if (fields.length === 0) return this.getById(id);

    params.push(id);
    await pool.query(`UPDATE materials SET ${fields.join(', ')} WHERE id = ?`, params);
    return this.getById(id);
  }

  async delete(id) {
    const [result] = await pool.query('DELETE FROM materials WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }


  async getAllVouchers({ type, search } = {}) {
    let query = 'SELECT * FROM inventory_vouchers WHERE 1=1';
    const params = [];
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (search) {
      query += ' AND (code LIKE ? OR material_name LIKE ? OR partner_name LIKE ? OR advance_code LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    query += ' ORDER BY id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async getVoucherById(id) {
    const [rows] = await pool.query('SELECT * FROM inventory_vouchers WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async createVoucher(voucher) {
    const {
      code, type, material_id, material_name, material_code,
      quantity, unit, unit_price, total_amount, partner_name,
      advance_code, lsx_code, created_by, note
    } = voucher;

    const [res] = await pool.query(
      `INSERT INTO inventory_vouchers 
       (code, type, material_id, material_name, material_code, quantity, unit, unit_price, total_amount, partner_name, advance_code, lsx_code, created_by, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, type, material_id || null, material_name, material_code || '',
        quantity, unit, unit_price || 0, total_amount || (quantity * (unit_price || 0)),
        partner_name || '', advance_code || null, lsx_code || null, created_by || '', note || ''
      ]
    );

    // Auto update stock in materials
    if (material_id) {
      if (type === 'in') {
        await pool.query('UPDATE materials SET quantity = quantity + ? WHERE id = ?', [quantity, material_id]);
      } else if (type === 'out') {
        await pool.query('UPDATE materials SET quantity = quantity - ? WHERE id = ?', [quantity, material_id]);
      }
    }

    return this.getVoucherById(res.insertId);
  }

  async deleteVoucher(id) {
    const voucher = await this.getVoucherById(id);
    if (!voucher) return false;

    // Rollback stock
    if (voucher.material_id) {
      if (voucher.type === 'in') {
        await pool.query('UPDATE materials SET quantity = quantity - ? WHERE id = ?', [voucher.quantity, voucher.material_id]);
      } else if (voucher.type === 'out') {
        await pool.query('UPDATE materials SET quantity = quantity + ? WHERE id = ?', [voucher.quantity, voucher.material_id]);
      }
    }

    const [res] = await pool.query('DELETE FROM inventory_vouchers WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }

  async updateStock(id, changeAmount) {
    await pool.query('UPDATE materials SET quantity = quantity + ? WHERE id = ?', [changeAmount, id]);
    return this.getById(id);
  }
}

module.exports = new InventoryRepository();
