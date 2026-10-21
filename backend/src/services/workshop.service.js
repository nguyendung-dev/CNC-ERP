const workshopRepo = require('../repositories/workshop.repository');

class WorkshopService {
  async getAllWorkshops(search) {
    return await workshopRepo.getAll(search);
  }

  async getWorkshopById(id) {
    const item = await workshopRepo.getById(id);
    if (!item) {
      const err = new Error('Không tìm thấy thông tin xưởng sản xuất');
      err.status = 404;
      throw err;
    }
    return item;
  }

  async createWorkshop(data) {
    if (!data.name || !data.name.trim()) {
      const err = new Error('Tên phân xưởng là bắt buộc');
      err.status = 400;
      throw err;
    }
    if (!data.code || !data.code.trim()) {
      data.code = `X-${Date.now().toString().slice(-3)}`;
    } else {
      const existing = await workshopRepo.getByCode(data.code.trim());
      if (existing) {
        const err = new Error(`Mã phân xưởng "${data.code}" đã tồn tại`);
        err.status = 400;
        throw err;
      }
    }
    return await workshopRepo.create(data);
  }

  async updateWorkshop(id, data) {
    await this.getWorkshopById(id);
    return await workshopRepo.update(id, data);
  }

  async deleteWorkshop(id) {
    await this.getWorkshopById(id);
    return await workshopRepo.delete(id);
  }
}

module.exports = new WorkshopService();
