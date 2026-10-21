const express = require('express');
const authController = require('../controllers/auth.controller');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');

const router = express.Router();

// Public routes: ONLY login is public
router.post('/login', validateBody(['password']), authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);
router.get('/users', authMiddleware, authController.getAllUsers);

// Admin-only user registration & management (chỉ Admin mới có quyền tạo/xóa tài khoản)
router.post(
  '/register',
  authMiddleware,
  authorizeRoles('admin'),
  validateBody(['username', 'email', 'password', 'full_name']),
  authController.register
);
router.put('/users/:id', authMiddleware, authorizeRoles('admin'), authController.updateUser);
router.delete('/users/:id', authMiddleware, authorizeRoles('admin'), authController.deleteUser);

module.exports = router;
