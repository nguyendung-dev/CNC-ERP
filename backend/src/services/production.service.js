const productionRepo = require('../repositories/production.repository');

class ProductionService {
  // Production Orders (LSX)
  async getProductionOrders() {
    return await productionRepo.getAllProductionOrders();
  }

  async getProductionOrderById(id) {
    const item = await productionRepo.getProductionOrderById(id);
    if (!item) {
      const error = new Error('Không tìm thấy Lệnh sản xuất');
      error.status = 404;
      throw error;
    }
    return item;
  }

  async createProductionOrder(data) {
    if (!data.code) {
      data.code = `LSX-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }
    if (!data.routing) {
      data.routing = [
        'Cắt phôi',
        'Phay CNC mặt chuẩn',
        'Tiện CNC chi tiết',
        'Gia công ngoài (Xi mạ/Nhiệt luyện)',
        'Mài/Sửa nguội',
        'Kiểm tra KCS/QC',
        'Đóng gói',
      ];
    }
    return await productionRepo.createProductionOrder(data);
  }

  async updateProductionStep(id, updateData) {
    return await productionRepo.updateProductionStep(id, updateData);
  }

  // WIP Movements
  async getWipMovements() {
    return await productionRepo.getAllWipMovements();
  }

  async createWipMovement(data) {
    if (!data.code) {
      data.code = `WIP-${Date.now().toString().slice(-6)}`;
    }

    const movement = await productionRepo.createWipMovement(data);

    // Update parent production order progress if provided
    if (data.production_order_id) {
      const order = await productionRepo.getProductionOrderById(data.production_order_id);
      if (order) {
        const newCompleted = Math.max(Number(order.completed_qty), Number(data.qty_passed) || 0);
        const newNg = Number(order.ng_qty) + (Number(data.qty_failed) || 0);
        const isDone = newCompleted >= Number(order.target_qty);

        await productionRepo.updateProductionStep(data.production_order_id, {
          current_step: data.to_step,
          completed_qty: newCompleted,
          ng_qty: newNg,
          status: isDone ? 'finished' : 'running',
        });

        // Link with Sales Order (SO): Sync finished machined_qty
        if (order.so_id) {
          const salesRepo = require('../repositories/sales.repository');
          await salesRepo.updateOrderProgress(order.so_id, {
            machined_qty: newCompleted,
            wip_qty: Math.max(0, Number(order.target_qty) - newCompleted),
          });
        }
      }
    }

    return movement;
  }

  async handoverFinishedGoods(id, qty) {
    const order = await this.getProductionOrderById(id);
    const addedQty = Math.max(1, Number(qty) || 0);
    const newCompleted = Math.min(Number(order.target_qty), Number(order.completed_qty) + addedQty);
    const isDone = newCompleted >= Number(order.target_qty);

    await productionRepo.updateProductionStep(id, {
      completed_qty: newCompleted,
      status: isDone ? 'finished' : 'running',
      current_step: isDone ? 'Đã QC nghiệm thu & Nhập kho thành phẩm' : order.current_step,
    });

    if (order.so_id) {
      const salesRepo = require('../repositories/sales.repository');
      const so = await salesRepo.getOrderById(order.so_id);
      if (so) {
        const newSoMachined = Math.min(Number(so.order_qty), Number(so.machined_qty || 0) + addedQty);
        await salesRepo.updateOrderProgress(order.so_id, {
          machined_qty: newSoMachined,
          wip_qty: Math.max(0, Number(so.order_qty) - newSoMachined),
        });
      }
    }

    return await this.getProductionOrderById(id);
  }

  // Subcontracting
  async getSubcontractingOrders() {
    return await productionRepo.getAllSubcontractingOrders();
  }

  async createSubcontractingOrder(data) {
    if (!data.code) {
      data.code = `GCN-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }
    return await productionRepo.createSubcontractingOrder(data);
  }

  async updateSubcontractingStatus(id, updateData) {
    return await productionRepo.updateSubcontractingStatus(id, updateData);
  }

  async deleteProductionOrder(id) {
    return await productionRepo.deleteProductionOrder(id);
  }

  async deleteWipMovement(id) {
    return await productionRepo.deleteWipMovement(id);
  }

  async deleteSubcontractingOrder(id) {
    return await productionRepo.deleteSubcontractingOrder(id);
  }
}

module.exports = new ProductionService();
