const reportsService = require('../services/reports.service');

class ReportsController {
  async getDashboardSummary(req, res, next) {
    try {
      const data = await reportsService.getDashboardSummary();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportsController();
