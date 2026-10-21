const customerService = require('../services/customer.service');

class CustomerController {
  async getCustomers(req, res, next) {
    try {
      const { search } = req.query;
      const data = await customerService.getAllCustomers(search);
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async getCustomerById(req, res, next) {
    try {
      const data = await customerService.getCustomerById(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createCustomer(req, res, next) {
    try {
      const data = await customerService.createCustomer(req.body);
      res.status(201).json({ success: true, message: 'Thêm khách hàng thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async updateCustomer(req, res, next) {
    try {
      const data = await customerService.updateCustomer(req.params.id, req.body);
      res.json({ success: true, message: 'Cập nhật thông tin khách hàng thành công', data });
    } catch (err) {
      next(err);
    }
  }

  async deleteCustomer(req, res, next) {
    try {
      await customerService.deleteCustomer(req.params.id);
      res.json({ success: true, message: 'Xóa khách hàng thành công' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CustomerController();
