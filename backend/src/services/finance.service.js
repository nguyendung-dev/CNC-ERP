const financeRepo = require('../repositories/finance.repository');

class FinanceService {
  // Advances
  async getAdvances() {
    return await financeRepo.getAllAdvances();
  }

  async createAdvance(data) {
    if (!data.code) {
      data.code = `TU-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }
    return await financeRepo.createAdvance(data);
  }

  async approveAdvance(id, approverName) {
    return await financeRepo.updateAdvanceStatus(id, 'approved', approverName || 'Ban Giám Đốc');
  }

  async rejectAdvance(id, approverName) {
    return await financeRepo.updateAdvanceStatus(id, 'rejected', approverName || 'Ban Giám Đốc');
  }

  // Payments
  async getPayments() {
    return await financeRepo.getAllPayments();
  }

  async createPayment(data) {
    if (!data.code) {
      data.code = `TT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }
    if (!data.status) {
      data.status = 'pending';
    }
    return await financeRepo.createPayment(data);
  }

  async approvePayment(id) {
    return await financeRepo.updatePaymentStatus(id, 'paid');
  }

  async rejectPayment(id) {
    return await financeRepo.updatePaymentStatus(id, 'cancelled');
  }

  // Debts
  async getDebts() {
    return await financeRepo.getAllDebts();
  }

  async createDebt(data) {
    return await financeRepo.createDebt(data);
  }

  async payDebt(id, paymentAmount) {
    return await financeRepo.recordDebtPayment(id, paymentAmount);
  }

  async updateAdvance(id, data) {
    return await financeRepo.updateAdvance(id, data);
  }

  async updatePayment(id, data) {
    return await financeRepo.updatePayment(id, data);
  }

  async updateDebt(id, data) {
    return await financeRepo.updateDebt(id, data);
  }

  async deleteAdvance(id) {
    return await financeRepo.deleteAdvance(id);
  }

  async deletePayment(id) {
    return await financeRepo.deletePayment(id);
  }

  async deleteDebt(id) {
    return await financeRepo.deleteDebt(id);
  }
}

module.exports = new FinanceService();
