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

  async createDeliveryNote(data) {
    if (!data.code) {
      data.code = `XK-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }

    const deliveryNote = await salesRepo.createDeliveryNote(data);

    // If linked to SO, update SO delivered quantity
    if (data.so_id) {
      const order = await salesRepo.getOrderById(data.so_id);
      if (order) {
        const newDelivered = Number(order.delivered_qty) + Number(data.delivery_qty);
        const isComplete = newDelivered >= Number(order.order_qty);
        await salesRepo.updateOrderProgress(data.so_id, {
          delivered_qty: newDelivered,
          status: isComplete ? 'completed' : 'partially_delivered',
        });
      }
    }

    return deliveryNote;
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
}

module.exports = new SalesService();
