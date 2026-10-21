const salesService = require('../services/sales.service');

class SalesController {
  // Quotations
  async getQuotations(req, res, next) {
    try {
      const data = await salesService.getQuotations();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async getQuotationById(req, res, next) {
    try {
      const data = await salesService.getQuotationById(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createQuotation(req, res, next) {
    try {
      const data = await salesService.createQuotation(req.body);
      res.status(201).json({ success: true, message: 'Tạo báo giá CNC thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async convertToOrder(req, res, next) {
    try {
      const data = await salesService.convertQuotationToOrder(req.params.id);
      res.status(201).json({ success: true, message: 'Đã chuyển Báo giá thành Đơn đặt hàng (SO)', data });
    } catch (err) {
      next(err);
    }
  }

  // Sales Orders
  async getOrders(req, res, next) {
    try {
      const data = await salesService.getOrders();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async createOrder(req, res, next) {
    try {
      const data = await salesService.createOrder(req.body);
      res.status(201).json({ success: true, message: 'Tạo đơn hàng SO thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async updateOrderProgress(req, res, next) {
    try {
      const data = await salesService.updateOrderProgress(req.params.id, req.body);
      res.json({ success: true, message: 'Cập nhật tiến độ đơn hàng thành công', data });
    } catch (err) {
      next(err);
    }
  }

  // Delivery Notes
  async getDeliveryNotes(req, res, next) {
    try {
      const data = await salesService.getDeliveryNotes();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async createDeliveryNote(req, res, next) {
    try {
      const data = await salesService.createDeliveryNote(req.body, req.user);
      const isPending = data.status === 'pending_warehouse';
      const msg = isPending
        ? 'Đã lập phiếu đề xuất xuất kho. Phiếu đang chờ Thủ kho kiểm tra thực tế và xác nhận xuất kho.'
        : 'Thủ kho đã xác nhận kiểm tra và xuất kho thành công!';
      res.status(201).json({ success: true, message: msg, data });
    } catch (err) {
      next(err);
    }
  }

  async confirmDeliveryExport(req, res, next) {
    try {
      const data = await salesService.confirmDeliveryExport(req.params.id, req.user);
      res.json({
        success: true,
        message: 'Thủ kho đã hoàn tất kiểm tra thành phẩm và xác nhận xuất kho giao khách thành công!',
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteQuotation(req, res, next) {
    try {
      await salesService.deleteQuotation(req.params.id);
      res.json({ success: true, message: 'Đã xóa báo giá thành công' });
    } catch (err) {
      next(err);
    }
  }

  async deleteOrder(req, res, next) {
    try {
      await salesService.deleteOrder(req.params.id);
      res.json({ success: true, message: 'Đã xóa đơn hàng SO thành công' });
    } catch (err) {
      next(err);
    }
  }

  async deleteDeliveryNote(req, res, next) {
    try {
      await salesService.deleteDeliveryNote(req.params.id);
      res.json({ success: true, message: 'Đã xóa phiếu giao hàng thành công' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SalesController();
