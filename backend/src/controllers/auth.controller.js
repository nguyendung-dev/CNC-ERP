const authService = require('../services/auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const loginIdentifier = email || username;
      const result = await authService.login(loginIdentifier, password);
      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      res.json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await authService.getAllUsers();
      res.json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req, res, next) {
    try {
      const updated = await authService.updateUser(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Cập nhật tài khoản thành công',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const currentUserId = req.user?.id;
      await authService.deleteUser(req.params.id, currentUserId);
      res.json({
        success: true,
        message: 'Xóa tài khoản thành công',
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
