const { pool } = require('../config/db');

class WorkshopRepository {
  async getAll(search) {
    let query = `SELECT w.*, 
       COALESCE((SELECT COUNT(*) FROM operators o WHERE o.workshop_id = w.id), w.operator_count) as operator_count
       FROM workshops w`;
    const params = [];
    if (search) {
      query += ' WHERE w.name LIKE ? OR w.code LIKE ? OR w.manager_name LIKE ? OR w.main_machines LIKE ?';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    query += ' ORDER BY w.id ASC';
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM workshops WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async getByCode(code) {
    const [rows] = await pool.query('SELECT * FROM workshops WHERE code = ?', [code]);
    return rows[0] || null;
  }

  async create(data) {
    const [result] = await pool.query(
      `INSERT INTO workshops (code, name, manager_name, phone, machine_count, operator_count, main_machines, location, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.code,
        data.name,
        data.manager_name || '',
        data.phone || '',
        Number(data.machine_count) || 1,
        Number(data.operator_count) || 1,
        data.main_machines || '',
        data.location || '',
        data.status || 'active',
        data.description || '',
      ]
    );
    return await this.getById(result.insertId);
  }

  async update(id, data) {
    await pool.query(
      `UPDATE workshops SET
         code = COALESCE(?, code),
         name = COALESCE(?, name),
         manager_name = COALESCE(?, manager_name),
         phone = COALESCE(?, phone),
         machine_count = COALESCE(?, machine_count),
         operator_count = COALESCE(?, operator_count),
         main_machines = COALESCE(?, main_machines),
         location = COALESCE(?, location),
         status = COALESCE(?, status),
         description = COALESCE(?, description)
       WHERE id = ?`,
      [
        data.code,
        data.name,
        data.manager_name,
        data.phone,
        data.machine_count !== undefined ? Number(data.machine_count) : undefined,
        data.operator_count !== undefined ? Number(data.operator_count) : undefined,
        data.main_machines,
        data.location,
        data.status,
        data.description,
        id,
      ]
    );
    return await this.getById(id);
  }

  async delete(id) {
    const [result] = await pool.query('DELETE FROM workshops WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new WorkshopRepository();
