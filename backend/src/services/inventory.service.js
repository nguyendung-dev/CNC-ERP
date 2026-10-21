const inventoryRepo = require('../repositories/inventory.repository');

class InventoryService {
  async getMaterials(filters) {
    return await inventoryRepo.getAll(filters);
  }

  async getMaterialById(id) {
    const item = await inventoryRepo.getById(id);
    if (!item) {
      const error = new Error('Không tìm thấy vật tư');
      error.status = 404;
      throw error;
    }
    return item;
  }

  async getLowStockAlerts() {
    return await inventoryRepo.getLowStock();
  }

  async createMaterial(data) {
    if (!data.code) {
      data.code = `VT-${Date.now().toString().slice(-6)}`;
    }
    return await inventoryRepo.create(data);
  }

  async updateMaterial(id, data) {
    await this.getMaterialById(id);
    return await inventoryRepo.update(id, data);
  }

  async deleteMaterial(id) {
    await this.getMaterialById(id);
    return await inventoryRepo.delete(id);
  }


  async getVouchers(filters) {
    return await inventoryRepo.getAllVouchers(filters);
  }

  async createVoucher(data, user) {
    const prefix = data.type === 'out' ? 'PXK' : 'PNK';
    if (!data.code) {
      data.code = `${prefix}-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }
    if (!data.created_by && user) {
      data.created_by = user.full_name || user.username;
    }
    return await inventoryRepo.createVoucher(data);
  }

  async deleteVoucher(id) {
    return await inventoryRepo.deleteVoucher(id);
  }

  async adjustStock(id, changeAmount, reason) {
    await this.getMaterialById(id);
    return await inventoryRepo.updateStock(id, changeAmount);
  }
}

module.exports = new InventoryService();
