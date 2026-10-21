const salesRepo = require('../repositories/sales.repository');

class SalesService {
  // Quotations
  async getQuotations() {
    return await salesRepo.getAllQuotations();
  }

  async getQuotationById(id) {
    const item = await salesRepo.getQuotationById(id);
    if (!item) {
      const error = new Error('Không tìm thấy báo giá');
      error.status = 404;
      throw error;
    }
    return item;
  }

  async createQuotation(data) {
    const rawCost = Number(data.raw_material_cost) || 0;
    const hours = Number(data.machine_hours) || 0;
    const rate = Number(data.machine_hourly_rate) || 0;
    const subCost = Number(data.subcontract_cost) || 0;
    const transCost = Number(data.transport_cost) || 0;

    // Automatic price calculation: Raw material + Machine hours*Rate + Subcontract + Transport
    const calculatedTotal = rawCost + (hours * rate) + subCost + transCost;
    data.total_amount = data.total_amount || calculatedTotal;

    if (!data.code) {
      data.code = `BG-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }

    return await salesRepo.createQuotation(data);
  }

  async convertQuotationToOrder(quotationId) {
    const quotation = await this.getQuotationById(quotationId);

    // Update quotation status
    await salesRepo.updateQuotationStatus(quotationId, 'converted_to_so');

    // Create Sales Order (SO)
    const orderData = {
      code: `SO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      quotation_id: quotation.id,
      customer_name: quotation.customer_name,
      part_name: quotation.part_name,
      drawing_code: quotation.drawing_code,
      order_qty: quotation.quantity,
      total_price: quotation.total_amount,
      delivery_deadline: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'in_production',
    };

    return await salesRepo.createOrder(orderData);
  }

  // Sales Orders
  async getOrders() {
    return await salesRepo.getAllOrders();
  }

  async createOrder(data) {
    if (!data.code) {
      data.code = `SO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }
    return await salesRepo.createOrder(data);
  }

  async updateOrderProgress(id, progressData) {
    return await salesRepo.updateOrderProgress(id, progressData);
  }

  // Delivery Notes
  async getDeliveryNotes() {
    return await salesRepo.getAllDeliveryNotes();
  }

  async createDeliveryNote(data, user) {
    if (!data.code) {
      data.code = `XK-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }

    const deliveryQty = Math.max(1, Number(data.delivery_qty) || 0);

    // GATE 1: If linked to an SO, perform strict inventory and production readiness checks!
    let order = null;
    if (data.so_id) {
      order = await salesRepo.getOrderById(data.so_id);
      if (!order) {
        const error = new Error('Không tìm thấy Đơn hàng SO liên kết');
        error.status = 404;
        throw error;
      }

      const machinedQty = Number(order.machined_qty || 0);
      const deliveredQty = Number(order.delivered_qty || 0);
      const availableToDeliver = Math.max(0, machinedQty - deliveredQty);

      // BLOCK 1: Zero finished goods machined/inspected
      if (machinedQty === 0) {
        const error = new Error(
          `Không thể xuất kho: Đơn hàng "${order.code}" hiện chưa có thành phẩm nào được xưởng sản xuất hoàn thành & kiểm định QC (Hiện tại: 0/${order.order_qty} cái). Vui lòng đợi bộ phận Sản xuất gia công & hoàn tất công đoạn!`
        );
        error.status = 400;
        throw error;
      }

      // BLOCK 2: Requested quantity exceeds finished goods physically ready in warehouse
      if (deliveryQty > availableToDeliver) {
        const error = new Error(
          `Số lượng xuất kho (${deliveryQty} cái) vượt quá số lượng thành phẩm thực tế sẵn sàng trong kho (${availableToDeliver} cái). Hiện chỉ có ${availableToDeliver}/${order.order_qty} chi tiết đã hoàn thiện sẵn sàng giao!`
        );
        error.status = 400;
        throw error;
      }
    }

    // GATE 2: Role-based status & execution
    // If user is sales: created as "pending_warehouse" (Chờ Thủ kho kiểm tra & xuất kho thực tế)
    // If user is warehouse or admin: directly "exported"
    const userRole = user?.role || 'sales';
    const isDirectExport = userRole === 'warehouse' || userRole === 'admin';

    const status = isDirectExport ? 'exported' : 'pending_warehouse';
    const createdBy = user?.full_name || (userRole === 'sales' ? 'Bộ phận Kinh doanh' : 'Thủ kho');
    const checkedBy = isDirectExport ? (user?.full_name || 'Thủ kho xác nhận') : '';

    const deliveryNote = await salesRepo.createDeliveryNote({
      ...data,
      delivery_qty: deliveryQty,
      status,
      created_by: createdBy,
      checked_by: checkedBy,
    });

    // If direct export by Warehouse/Admin, update SO progress immediately & auto create debt
    if (isDirectExport) {
      if (order) {
        const newDelivered = Number(order.delivered_qty || 0) + deliveryQty;
        const isComplete = newDelivered >= Number(order.order_qty);
        await salesRepo.updateOrderProgress(data.so_id, {
          delivered_qty: newDelivered,
          status: isComplete ? 'completed' : 'partially_delivered',
        });
      }
      await this.recordReceivableDebtForDelivery(deliveryNote, order);
    }

    return deliveryNote;
  }

  async recordReceivableDebtForDelivery(deliveryNote, order) {
    try {
      const financeRepo = require('../repositories/finance.repository');
      const deliveryQty = Number(deliveryNote.delivery_qty) || 1;

      let amount = 0;
      if (order && Number(order.total_price) > 0 && Number(order.order_qty) > 0) {
        const unitPrice = Number(order.total_price) / Number(order.order_qty);
        amount = Math.round(unitPrice * deliveryQty);
      } else {
        amount = deliveryQty * 500000;
      }

      const partnerName = (deliveryNote.customer_name || order?.customer_name || 'Khách hàng').trim();
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await financeRepo.createDebt({
        partner_name: partnerName,
        type: 'receivable',
        total_amount: amount,
        paid_amount: 0,
        due_date: dueDate,
      });

      console.log(`[Sales] Automatically created receivable debt of ${amount} for partner "${partnerName}" on delivery note ${deliveryNote.code}`);
    } catch (err) {
      console.error('[Sales] Failed to auto create receivable debt:', err.message);
    }
  }

  async confirmDeliveryExport(id, user) {
    const note = await salesRepo.getDeliveryNoteById(id);
    if (!note) {
      const error = new Error('Không tìm thấy phiếu xuất kho');
      error.status = 404;
      throw error;
    }

    if (note.status === 'exported') {
      const error = new Error('Phiếu xuất kho này đã được xác nhận xuất kho trước đó rồi.');
      error.status = 400;
      throw error;
    }

    // Re-verify against SO
    let order = null;
    if (note.so_id) {
      order = await salesRepo.getOrderById(note.so_id);
      if (order) {
        const machinedQty = Number(order.machined_qty || 0);
        const deliveredQty = Number(order.delivered_qty || 0);
        const availableToDeliver = Math.max(0, machinedQty - deliveredQty);

        if (Number(note.delivery_qty) > availableToDeliver) {
          const error = new Error(
            `Không thể xuất kho: Số lượng cần xuất (${note.delivery_qty}) vượt quá thành phẩm tồn kho hiện tại (${availableToDeliver} cái).`
          );
          error.status = 400;
          throw error;
        }

        const newDelivered = deliveredQty + Number(note.delivery_qty);
        const isComplete = newDelivered >= Number(order.order_qty);
        await salesRepo.updateOrderProgress(note.so_id, {
          delivered_qty: newDelivered,
          status: isComplete ? 'completed' : 'partially_delivered',
        });
      }
    }

    const checkedBy = user?.full_name || 'Thủ kho xác nhận';
    const updatedNote = await salesRepo.updateDeliveryNoteStatus(id, 'exported', checkedBy);
    await this.recordReceivableDebtForDelivery(updatedNote, order);
    return updatedNote;
  }

  async updateQuotation(id, data) {
    const rawCost = data.raw_material_cost !== undefined ? Number(data.raw_material_cost) : undefined;
    const hours = data.machine_hours !== undefined ? Number(data.machine_hours) : undefined;
    const rate = data.machine_hourly_rate !== undefined ? Number(data.machine_hourly_rate) : undefined;
    const subCost = data.subcontract_cost !== undefined ? Number(data.subcontract_cost) : undefined;
    const transCost = data.transport_cost !== undefined ? Number(data.transport_cost) : undefined;

    if (rawCost !== undefined && hours !== undefined && rate !== undefined) {
      data.total_amount = rawCost + (hours * rate) + (subCost || 0) + (transCost || 0);
    }
    return await salesRepo.updateQuotation(id, data);
  }

  async updateOrder(id, data) {
    return await salesRepo.updateOrder(id, data);
  }

  async updateDeliveryNote(id, data) {
    return await salesRepo.updateDeliveryNote(id, data);
  }

  async deleteQuotation(id) {
    return await salesRepo.deleteQuotation(id);
  }

  async deleteOrder(id) {
    return await salesRepo.deleteOrder(id);
  }

  async deleteDeliveryNote(id) {
    return await salesRepo.deleteDeliveryNote(id);
  }

  // Parts Catalog
  async getParts() {
    return await salesRepo.getAllParts();
  }

  async createPart(data) {
    return await salesRepo.createPart(data);
  }

  async updatePart(id, data) {
    return await salesRepo.updatePart(id, data);
  }

  async deletePart(id) {
    return await salesRepo.deletePart(id);
  }
}

module.exports = new SalesService();
