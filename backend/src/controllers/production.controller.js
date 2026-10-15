const productionService = require('../services/production.service');

class ProductionController {
  // Production Orders (LSX)
  async getProductionOrders(req, res, next) {
    try {
      const data = await productionService.getProductionOrders();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async getProductionOrderById(req, res, next) {
    try {
      const data = await productionService.getProductionOrderById(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createProductionOrder(req, res, next) {
    try {
      const data = await productionService.createProductionOrder(req.body);
      res.status(201).json({ success: true, message: 'Tạo lệnh sản xuất LSX thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async updateProductionStep(req, res, next) {
    try {
      const data = await productionService.updateProductionStep(req.params.id, req.body);
      res.json({ success: true, message: 'Cập nhật công đoạn thành công', data });
    } catch (err) {
      next(err);
    }
  }

  // WIP Movements
  async getWipMovements(req, res, next) {
    try {
      const data = await productionService.getWipMovements();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async createWipMovement(req, res, next) {
    try {
      const data = await productionService.createWipMovement(req.body);
      res.status(201).json({ success: true, message: 'Tạo phiếu chuyển công đoạn WIP thành công', data });
    } catch (err) {
      next(err);
    }
  }

  // Subcontracting
  async getSubcontractingOrders(req, res, next) {
    try {
      const data = await productionService.getSubcontractingOrders();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async createSubcontractingOrder(req, res, next) {
    try {
      const data = await productionService.createSubcontractingOrder(req.body);
      res.status(201).json({ success: true, message: 'Tạo phiếu gia công ngoài thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async updateSubcontractingStatus(req, res, next) {
    try {
      const data = await productionService.updateSubcontractingStatus(req.params.id, req.body);
      res.json({ success: true, message: 'Cập nhật trạng thái gia công ngoài thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async deleteProductionOrder(req, res, next) {
    try {
      await productionService.deleteProductionOrder(req.params.id);
      res.json({ success: true, message: 'Đã xóa lệnh sản xuất LSX' });
    } catch (err) {
      next(err);
    }
  }

  async deleteWipMovement(req, res, next) {
    try {
      await productionService.deleteWipMovement(req.params.id);
      res.json({ success: true, message: 'Đã xóa phiếu luân chuyển BTP' });
    } catch (err) {
      next(err);
    }
  }

  async deleteSubcontractingOrder(req, res, next) {
    try {
      await productionService.deleteSubcontractingOrder(req.params.id);
      res.json({ success: true, message: 'Đã xóa phiếu gia công ngoài' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductionController();
