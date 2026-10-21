const customerRepo = require('../repositories/customer.repository');

class CustomerService {
  async getAllCustomers(search) {
    return await customerRepo.getAll(search);
  }

  async getCustomerById(id) {
    const item = await customerRepo.getById(id);
    if (!item) {
      const err = new Error('Không tìm thấy thông tin khách hàng');
      err.status = 404;
      throw err;
    }
    return item;
  }

  async createCustomer(data) {
    if (!data.name || !data.name.trim()) {
      const err = new Error('Tên khách hàng / doanh nghiệp là bắt buộc');
      err.status = 400;
      throw err;
    }
    if (!data.code || !data.code.trim()) {
      data.code = `KH-${Date.now().toString().slice(-4)}`;
    } else {
      const existing = await customerRepo.getByCode(data.code.trim());
      if (existing) {
        const err = new Error(`Mã khách hàng "${data.code}" đã tồn tại`);
        err.status = 400;
        throw err;
      }
    }
    return await customerRepo.create(data);
  }

  async updateCustomer(id, data) {
    await this.getCustomerById(id);
    return await customerRepo.update(id, data);
  }

  async deleteCustomer(id) {
    await this.getCustomerById(id);
    return await customerRepo.delete(id);
  }
}

module.exports = new CustomerService();
