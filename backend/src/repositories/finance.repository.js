const { pool } = require('../config/db');

class FinanceRepository {
  // Advances (Đề nghị tạm ứng)
  async getAllAdvances() {
    const [rows] = await pool.query('SELECT * FROM advances ORDER BY id DESC');
    return rows;
  }

  async getAdvanceById(id) {
    const [rows] = await pool.query('SELECT * FROM advances WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async createAdvance(data) {
    const { code, requester, purpose, amount, status, approved_by } = data;
    const [result] = await pool.query(
      `INSERT INTO advances (code, requester, purpose, amount, status, approved_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [code, requester, purpose, amount, status || 'pending', approved_by || '']
    );
    return this.getAdvanceById(result.insertId);
  }

  async updateAdvanceStatus(id, status, approved_by) {
    await pool.query(
      'UPDATE advances SET status = ?, approved_by = COALESCE(?, approved_by) WHERE id = ?',
      [status, approved_by, id]
    );
    return this.getAdvanceById(id);
  }

  // Payment Requests (Đề nghị thanh toán)
  async getAllPayments() {
    const [rows] = await pool.query('SELECT * FROM payment_requests ORDER BY id DESC');
    return rows;
  }

  async getPaymentById(id) {
    const [rows] = await pool.query('SELECT * FROM payment_requests WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async updatePaymentStatus(id, status) {
    await pool.query('UPDATE payment_requests SET status = ? WHERE id = ?', [status, id]);
    return this.getPaymentById(id);
  }

  async createPayment(data) {
    const { code, recipient, category, gross_amount, deduct_advance_amount, status, note } = data;
    const gross = Number(gross_amount) || 0;
    const deduct = Number(deduct_advance_amount) || 0;
    const net = Math.max(0, gross - deduct);

    const [result] = await pool.query(
      `INSERT INTO payment_requests (code, recipient, category, gross_amount, deduct_advance_amount, net_amount, status, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, recipient, category, gross, deduct, net, status || 'pending', note || '']
    );
    return this.getPaymentById(result.insertId);
  }

  // Debts (Quản lý công nợ)
  async getAllDebts() {
    const [rows] = await pool.query('SELECT * FROM debts ORDER BY id DESC');
    return rows;
  }

  async getDebtById(id) {
    const [rows] = await pool.query('SELECT * FROM debts WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async createDebt(data) {
    const { partner_name, type, total_amount, paid_amount, due_date } = data;
    const total = Number(total_amount) || 0;
    const paid = Number(paid_amount) || 0;
    const remaining = Math.max(0, total - paid);
    const status = remaining === 0 ? 'paid' : paid > 0 ? 'partially_paid' : 'unpaid';

    const [result] = await pool.query(
      `INSERT INTO debts (partner_name, type, total_amount, paid_amount, remaining_amount, due_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [partner_name, type, total, paid, remaining, due_date || null, status]
    );
    return this.getDebtById(result.insertId);
  }

  async recordDebtPayment(id, paymentAmount) {
    const debt = await this.getDebtById(id);
    if (!debt) return null;

    const newPaid = Number(debt.paid_amount) + Number(paymentAmount);
    const newRemaining = Math.max(0, Number(debt.total_amount) - newPaid);
    const newStatus = newRemaining === 0 ? 'paid' : 'partially_paid';

    await pool.query(
      'UPDATE debts SET paid_amount = ?, remaining_amount = ?, status = ? WHERE id = ?',
      [newPaid, newRemaining, newStatus, id]
    );
    return this.getDebtById(id);
  }

  async updateAdvance(id, data) {
    const { requester, purpose, amount, status } = data;
    await pool.query(
      `UPDATE advances SET
        requester = COALESCE(?, requester),
        purpose = COALESCE(?, purpose),
        amount = COALESCE(?, amount),
        status = COALESCE(?, status)
      WHERE id = ?`,
      [requester, purpose, amount, status, id]
    );
    return this.getAdvanceById(id);
  }

  async updatePayment(id, data) {
    const { recipient, category, gross_amount, deduct_advance_amount, note, status } = data;
    const payment = await this.getPaymentById(id);
    if (!payment) return null;
    const gross = gross_amount !== undefined ? Number(gross_amount) : Number(payment.gross_amount);
    const deduct = deduct_advance_amount !== undefined ? Number(deduct_advance_amount) : Number(payment.deduct_advance_amount);
    const net = Math.max(0, gross - deduct);

    await pool.query(
      `UPDATE payment_requests SET
        recipient = COALESCE(?, recipient),
        category = COALESCE(?, category),
        gross_amount = ?,
        deduct_advance_amount = ?,
        net_amount = ?,
        note = COALESCE(?, note),
        status = COALESCE(?, status)
      WHERE id = ?`,
      [recipient, category, gross, deduct, net, note, status, id]
    );
    return this.getPaymentById(id);
  }

  async updateDebt(id, data) {
    const { partner_name, type, total_amount, due_date, status } = data;
    await pool.query(
      `UPDATE debts SET
        partner_name = COALESCE(?, partner_name),
        type = COALESCE(?, type),
        total_amount = COALESCE(?, total_amount),
        due_date = COALESCE(?, due_date),
        status = COALESCE(?, status)
      WHERE id = ?`,
      [partner_name, type, total_amount, due_date, status, id]
    );
    return this.getDebtById(id);
  }

  async deleteAdvance(id) {
    await pool.query('DELETE FROM advances WHERE id = ?', [id]);
    return true;
  }

  async deletePayment(id) {
    await pool.query('DELETE FROM payment_requests WHERE id = ?', [id]);
    return true;
  }

  async deleteDebt(id) {
    await pool.query('DELETE FROM debts WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new FinanceRepository();
