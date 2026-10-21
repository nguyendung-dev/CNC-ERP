const { pool } = require('../config/db');

class AuthRepository {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  }

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, email, phone, full_name, role, status, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async create(user) {
    const { username, email, phone, password, full_name, role, status } = user;
    const [result] = await pool.query(
      `INSERT INTO users (username, email, phone, password, full_name, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, email, phone || '', password, full_name, role || 'sales', status || 'active']
    );
    return this.findById(result.insertId);
  }

  async getAllUsers() {
    const [rows] = await pool.query(
      'SELECT id, username, email, phone, full_name, role, status, created_at FROM users ORDER BY id ASC'
    );
    return rows;
  }

  async update(id, data) {
    const fields = [];
    const values = [];

    if (data.full_name !== undefined) {
      fields.push('full_name = ?');
      values.push(data.full_name);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      values.push(data.phone);
    }
    if (data.role !== undefined) {
      fields.push('role = ?');
      values.push(data.role);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.password !== undefined && String(data.password).trim() !== '') {
      fields.push('password = ?');
      values.push(data.password);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  async delete(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new AuthRepository();
