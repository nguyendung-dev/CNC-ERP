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
      'SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async create(user) {
    const { username, email, password, full_name, role } = user;
    const [result] = await pool.query(
      `INSERT INTO users (username, email, password, full_name, role)
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, password, full_name, role || 'sales']
    );
    return this.findById(result.insertId);
  }
  async getAllUsers() {
    const [rows] = await pool.query(
      'SELECT id, username, email, full_name, role, created_at FROM users ORDER BY id ASC'
    );
    return rows;
  }

  async update(id, data) {
    const { full_name, role } = data;
    await pool.query(
      'UPDATE users SET full_name = ?, role = ? WHERE id = ?',
      [full_name, role, id]
    );
    return this.findById(id);
  }

  async delete(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new AuthRepository();
