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
    return await financeRepo.updateAdvanceStatus(id, 'approved', approverName || 'Giám Đốc Kỹ Thuật');
  }

  // Payments
  async getPayments() {
    return await financeRepo.getAllPayments();
  }

  async createPayment(data) {
    if (!data.code) {
      data.code = `TT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }
    return await financeRepo.createPayment(data);
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
