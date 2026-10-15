const financeService = require('../services/finance.service');

class FinanceController {
  // Advances
  async getAdvances(req, res, next) {
    try {
      const data = await financeService.getAdvances();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async createAdvance(req, res, next) {
    try {
      const data = await financeService.createAdvance(req.body);
      res.status(201).json({ success: true, message: 'Tạo phiếu đề nghị tạm ứng thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async approveAdvance(req, res, next) {
    try {
      const approver = req.user ? req.user.name : 'Giám Đốc Kỹ Thuật';
      const data = await financeService.approveAdvance(req.params.id, approver);
      res.json({ success: true, message: 'Phê duyệt đề nghị tạm ứng thành công', data });
    } catch (err) {
      next(err);
    }
  }

  // Payments
  async getPayments(req, res, next) {
    try {
      const data = await financeService.getPayments();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async createPayment(req, res, next) {
    try {
      const data = await financeService.createPayment(req.body);
      res.status(201).json({ success: true, message: 'Tạo đề nghị thanh toán thành công', data });
    } catch (err) {
      next(err);
    }
  }

  // Debts
  async getDebts(req, res, next) {
    try {
      const data = await financeService.getDebts();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async createDebt(req, res, next) {
    try {
      const data = await financeService.createDebt(req.body);
      res.status(201).json({ success: true, message: 'Ghi nhận công nợ thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async payDebt(req, res, next) {
    try {
      const { amount } = req.body;
      const data = await financeService.payDebt(req.params.id, amount);
      res.json({ success: true, message: 'Ghi nhận thanh toán công nợ thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async deleteAdvance(req, res, next) {
    try {
      await financeService.deleteAdvance(req.params.id);
      res.json({ success: true, message: 'Đã xóa phiếu tạm ứng' });
    } catch (err) {
      next(err);
    }
  }

  async deletePayment(req, res, next) {
    try {
      await financeService.deletePayment(req.params.id);
      res.json({ success: true, message: 'Đã xóa phiếu thanh toán' });
    } catch (err) {
      next(err);
    }
  }

  async deleteDebt(req, res, next) {
    try {
      await financeService.deleteDebt(req.params.id);
      res.json({ success: true, message: 'Đã xóa hồ sơ công nợ' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FinanceController();
