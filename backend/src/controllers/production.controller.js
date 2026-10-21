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

  async updateProductionOrder(req, res, next) {
    try {
      const data = await productionService.updateProductionOrder(req.params.id, req.body);
      res.json({ success: true, message: 'Cập nhật lệnh sản xuất LSX thành công', data });
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

  async handoverFinishedGoods(req, res, next) {
    try {
      const { qty } = req.body;
      const data = await productionService.handoverFinishedGoods(req.params.id, qty);
      res.json({
        success: true,
        message: `Đã nghiệm thu QC và bàn giao ${qty || data.target_qty} chi tiết thành phẩm vào kho!`,
        data,
      });
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

  // Production Steps
  async getSteps(req, res, next) {
    try {
      const { workshop_id } = req.query;
      const data = await productionService.getSteps(workshop_id);
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async createStep(req, res, next) {
    try {
      const data = await productionService.createStep(req.body);
      res.status(201).json({ success: true, message: 'Thêm công đoạn sản xuất mới thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async updateStep(req, res, next) {
    try {
      const data = await productionService.updateStep(req.params.id, req.body);
      res.json({ success: true, message: 'Cập nhật công đoạn thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async deleteStep(req, res, next) {
    try {
      await productionService.deleteStep(req.params.id);
      res.json({ success: true, message: 'Đã xóa / cắt bỏ công đoạn thành công' });
    } catch (err) {
      next(err);
    }
  }

  // Operators (Thợ máy CNC)
  async getOperators(req, res, next) {
    try {
      const { workshop_id } = req.query;
      const data = await productionService.getOperators(workshop_id);
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async createOperator(req, res, next) {
    try {
      const data = await productionService.createOperator(req.body);
      res.status(201).json({ success: true, message: 'Thêm thợ máy CNC mới thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async updateOperator(req, res, next) {
    try {
      const data = await productionService.updateOperator(req.params.id, req.body);
      res.json({ success: true, message: 'Cập nhật thông tin thợ máy thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async deleteOperator(req, res, next) {
    try {
      await productionService.deleteOperator(req.params.id);
      res.json({ success: true, message: 'Đã xóa thợ máy khỏi hệ thống' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductionController();
