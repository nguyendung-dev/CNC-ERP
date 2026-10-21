const workshopService = require('../services/workshop.service');

class WorkshopController {
  async getWorkshops(req, res, next) {
    try {
      const { search } = req.query;
      const data = await workshopService.getAllWorkshops(search);
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async getWorkshopById(req, res, next) {
    try {
      const data = await workshopService.getWorkshopById(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createWorkshop(req, res, next) {
    try {
      const data = await workshopService.createWorkshop(req.body);
      res.status(201).json({ success: true, message: 'Thêm xưởng sản xuất thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async updateWorkshop(req, res, next) {
    try {
      const data = await workshopService.updateWorkshop(req.params.id, req.body);
      res.json({ success: true, message: 'Cập nhật thông tin xưởng thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async deleteWorkshop(req, res, next) {
    try {
      await workshopService.deleteWorkshop(req.params.id);
      res.json({ success: true, message: 'Xóa xưởng sản xuất thành công' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WorkshopController();
