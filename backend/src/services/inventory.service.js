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

  async adjustStock(id, changeAmount, reason) {
    await this.getMaterialById(id);
    return await inventoryRepo.updateStock(id, changeAmount);
  }
}

module.exports = new InventoryService();
