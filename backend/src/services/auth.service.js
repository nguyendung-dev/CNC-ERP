const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepo = require('../repositories/auth.repository');

const JWT_SECRET = process.env.JWT_SECRET || 'cnc_erp_jwt_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

class AuthService {
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  async register(data) {
    const { username, email, password, full_name, role } = data;

    // Check existing
    const existingEmail = await authRepo.findByEmail(email);
    if (existingEmail) {
      const err = new Error('Email đã được đăng ký trong hệ thống');
      err.status = 400;
      throw err;
    }

    const existingUsername = await authRepo.findByUsername(username);
    if (existingUsername) {
      const err = new Error('Tên đăng nhập đã tồn tại');
      err.status = 400;
      throw err;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await authRepo.create({
      username,
      email,
      password: hashedPassword,
      full_name,
      role: role || 'sales',
    });

    const token = this.generateToken(newUser);

    return {
      user: newUser,
      token,
    };
  }

  async login(loginIdentifier, password) {
    // loginIdentifier can be email or username
    let user = await authRepo.findByEmail(loginIdentifier);
    if (!user) {
      user = await authRepo.findByUsername(loginIdentifier);
    }

    if (!user) {
      const err = new Error('Tài khoản hoặc mật khẩu không chính xác');
      err.status = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Tài khoản hoặc mật khẩu không chính xác');
      err.status = 401;
      throw err;
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_at,
      },
      token,
    };
  }

  async getProfile(userId) {
    const user = await authRepo.findById(userId);
    if (!user) {
      const err = new Error('Không tìm thấy thông tin tài khoản');
      err.status = 404;
      throw err;
    }
    return user;
  }

  async getAllUsers() {
    return await authRepo.getAllUsers();
  }

  async updateUser(id, data) {
    const user = await authRepo.findById(id);
    if (!user) {
      const err = new Error('Người dùng không tồn tại');
      err.status = 404;
      throw err;
    }
    const updatePayload = { ...data };
    if (updatePayload.password && String(updatePayload.password).trim() !== '') {
      updatePayload.password = await bcrypt.hash(String(updatePayload.password).trim(), 10);
    } else {
      delete updatePayload.password;
    }
    return await authRepo.update(id, updatePayload);
  }

  async deleteUser(id, currentUserId) {
    if (Number(id) === 1) {
      const err = new Error('Không thể xóa tài khoản Quản trị viên hệ thống mặc định');
      err.status = 400;
      throw err;
    }
    if (Number(id) === Number(currentUserId)) {
      const err = new Error('Bạn không thể tự xóa tài khoản của chính mình khi đang đăng nhập');
      err.status = 400;
      throw err;
    }
    const user = await authRepo.findById(id);
    if (!user) {
      const err = new Error('Người dùng không tồn tại');
      err.status = 404;
      throw err;
    }
    return await authRepo.delete(id);
  }
}

module.exports = new AuthService();
