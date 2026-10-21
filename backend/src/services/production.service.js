const inventoryRepo = require('../repositories/inventory.repository');
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
    // Check and deduct material stock if requested
    if (data.material_id && Number(data.material_qty_needed) > 0) {
      const mat = await inventoryRepo.getById(data.material_id);
      if (mat) {
        data.material_name = mat.name;
        if (data.auto_issue_material) {
          data.material_status = 'issued';
          await inventoryRepo.updateStock(data.material_id, -Number(data.material_qty_needed));
        } else {
          data.material_status = 'pending';
        }
      }
    }
    return await productionRepo.createProductionOrder(data);
  }

  async issueMaterial(orderId) {
    const order = await productionRepo.getProductionOrderById(orderId);
    if (!order) {
      const error = new Error('Không tìm thấy Lệnh sản xuất');
      error.status = 404;
      throw error;
    }
    if (order.material_status === 'issued') {
      return order;
    }
    if (order.material_id && Number(order.material_qty_needed) > 0) {
      await inventoryRepo.updateStock(order.material_id, -Number(order.material_qty_needed));
    }
    return await productionRepo.updateProductionOrder(orderId, { material_status: 'issued' });
  }

  async updateProductionOrder(id, data) {
    return await productionRepo.updateProductionOrder(id, data);
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
        // Accumulate completed quantity recorded by worker
        const newCompleted = Number(order.completed_qty || 0) + (Number(data.qty_passed) || 0);
        const newNg = Number(order.ng_qty || 0) + (Number(data.qty_failed) || 0);
        const isDone = newCompleted >= Number(order.target_qty);

        // Check if should pause production order due to critical NG defect
        const shouldPause = (data.action_on_error === 'stop') || (Number(data.qty_failed) > 0 && Number(data.qty_passed) === 0);

        let newStatus = isDone ? 'completed' : (order.status === 'paused' ? 'paused' : 'running');
        if (shouldPause) {
          newStatus = 'paused';
        }

        await productionRepo.updateProductionStep(data.production_order_id, {
          current_step: shouldPause ? `Tạm dừng: ${data.from_step} (Sự cố NG)` : (isDone ? 'Hoàn thành & Bàn giao kho' : (data.to_step || order.current_step)),
          completed_qty: newCompleted,
          ng_qty: newNg,
          status: newStatus,
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

    // Auto create Finished Goods Receipt voucher in Inventory
    try {
      const inventoryRepo = require('../repositories/inventory.repository');
      const voucherCode = `NK-TP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      await inventoryRepo.createVoucher({
        code: voucherCode,
        type: 'in',
        material_name: (order.part_name || '').trim(),
        material_code: order.drawing_code || 'TP-CNC',
        quantity: addedQty,
        unit: 'Chi tiết',
        unit_price: 0,
        total_amount: 0,
        partner_name: `Xưởng sản xuất CNC (${order.workshop_name || 'Xưởng A'})`,
        lsx_code: order.code,
        created_by: 'Kỹ sư KCS & Thủ kho',
        note: `Nghiệm thu QC đạt chuẩn 100% & Bàn giao nhập kho thành phẩm từ lệnh sản xuất ${order.code} (Bản vẽ: ${order.drawing_code || '---'})`,
      });
    } catch (vErr) {
      console.error('[Production] Failed to auto create finished goods receipt voucher:', vErr.message);
    }

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

  // Production Steps
  async getSteps(workshopId) {
    return await productionRepo.getAllSteps(workshopId);
  }

  async createStep(data) {
    return await productionRepo.createStep(data);
  }

  async updateStep(id, data) {
    return await productionRepo.updateStep(id, data);
  }

  async deleteStep(id) {
    return await productionRepo.deleteStep(id);
  }

  // Operators (Thợ máy CNC)
  async getOperators(workshopId) {
    return await productionRepo.getOperators(workshopId);
  }

  async createOperator(data) {
    return await productionRepo.createOperator(data);
  }

  async updateOperator(id, data) {
    return await productionRepo.updateOperator(id, data);
  }

  async deleteOperator(id) {
    return await productionRepo.deleteOperator(id);
  }

  async assignOperatorsToWorkshop(workshopId, operatorIds) {
    return await productionRepo.assignOperatorsToWorkshop(workshopId, operatorIds);
  }
}

module.exports = new ProductionService();
