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

  async updateStock(id, changeAmount) {
    await pool.query('UPDATE materials SET quantity = quantity + ? WHERE id = ?', [changeAmount, id]);
    return this.getById(id);
  }
}

module.exports = new InventoryRepository();
