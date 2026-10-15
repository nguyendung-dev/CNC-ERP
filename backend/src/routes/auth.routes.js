const express = require('express');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');

const router = express.Router();

// Public routes
router.post('/register', validateBody(['username', 'email', 'password', 'full_name']), authController.register);
router.post('/login', validateBody(['password']), authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);
router.get('/users', authController.getAllUsers);
router.put('/users/:id', authMiddleware, authController.updateUser);
router.delete('/users/:id', authMiddleware, authController.deleteUser);

module.exports = router;
