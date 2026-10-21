const { pool } = require('../config/db');

class CustomerRepository {
  async getAll(search) {
    let query = 'SELECT * FROM customers';
    const params = [];
    if (search) {
      query += ' WHERE name LIKE ? OR code LIKE ? OR phone LIKE ? OR email LIKE ?';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    query += ' ORDER BY id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async getByCode(code) {
    const [rows] = await pool.query('SELECT * FROM customers WHERE code = ?', [code]);
    return rows[0] || null;
  }

  async create(data) {
    const [result] = await pool.query(
      `INSERT INTO customers (code, name, phone, email, address, tax_code, contact_person, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.code,
        data.name,
        data.phone || '',
        data.email || '',
        data.address || '',
        data.tax_code || '',
        data.contact_person || '',
        data.note || '',
      ]
    );
    return await this.getById(result.insertId);
  }

  async update(id, data) {
    await pool.query(
      `UPDATE customers SET 
         code = COALESCE(?, code),
         name = COALESCE(?, name),
         phone = COALESCE(?, phone),
         email = COALESCE(?, email),
         address = COALESCE(?, address),
         tax_code = COALESCE(?, tax_code),
         contact_person = COALESCE(?, contact_person),
         note = COALESCE(?, note)
       WHERE id = ?`,
      [
        data.code,
        data.name,
        data.phone,
        data.email,
        data.address,
        data.tax_code,
        data.contact_person,
        data.note,
        id,
      ]
    );
    return await this.getById(id);
  }

  async delete(id) {
    const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new CustomerRepository();
