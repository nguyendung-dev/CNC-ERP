const inventoryService = require('../services/inventory.service');

class InventoryController {
  async getMaterials(req, res, next) {
    try {
      const { category, search } = req.query;
      const data = await inventoryService.getMaterials({ category, search });
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async getMaterialById(req, res, next) {
    try {
      const data = await inventoryService.getMaterialById(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getLowStockAlerts(req, res, next) {
    try {
      const data = await inventoryService.getLowStockAlerts();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async createMaterial(req, res, next) {
    try {
      const data = await inventoryService.createMaterial(req.body);
      res.status(201).json({ success: true, message: 'Thêm vật tư thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async updateMaterial(req, res, next) {
    try {
      const data = await inventoryService.updateMaterial(req.params.id, req.body);
      res.json({ success: true, message: 'Cập nhật vật tư thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async deleteMaterial(req, res, next) {
    try {
      await inventoryService.deleteMaterial(req.params.id);
      res.json({ success: true, message: 'Đã xóa vật tư' });
    } catch (err) {
      next(err);
    }
  }


  async getVouchers(req, res, next) {
    try {
      const { type, search } = req.query;
      const data = await inventoryService.getVouchers({ type, search });
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async createVoucher(req, res, next) {
    try {
      const data = await inventoryService.createVoucher(req.body, req.user);
      const actionName = data.type === 'out' ? 'Phiếu xuất kho' : 'Phiếu nhập kho';
      res.status(201).json({
        success: true,
        message: `Đã lập ${actionName} ${data.code} thành công và cập nhật tồn kho!`,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteVoucher(req, res, next) {
    try {
      await inventoryService.deleteVoucher(req.params.id);
      res.json({ success: true, message: 'Đã xóa phiếu kho và hoàn tác số lượng tồn!' });
    } catch (err) {
      next(err);
    }
  }

  async adjustStock(req, res, next) {
    try {
      const { changeAmount, reason } = req.body;
      const data = await inventoryService.adjustStock(req.params.id, changeAmount, reason);
      res.json({ success: true, message: 'Điều chỉnh tồn kho thành công', data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InventoryController();
