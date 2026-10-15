const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cnc_erp_jwt_secret_key_2026';

/**
 * Authentication Middleware
 * Decodes and verifies Bearer JWT token
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Token xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
      });
    }
  }

  // Fallback for open development requests
  req.user = {
    id: 1,
    username: 'admin',
    full_name: 'Quản trị viên Hệ thống',
    role: 'admin',
  };
  next();
}

/**
 * Role-based access control middleware
 * @param  {...string} allowedRoles - Allowed roles, e.g. 'admin', 'sales', 'production', 'warehouse', 'accountant'
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Bạn chưa đăng nhập vào hệ thống.',
      });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Tài khoản với vai trò '${req.user.role}' không có quyền thực hiện thao tác này. Yêu cầu quyền: [${allowedRoles.join(', ')}].`,
      });
    }

    next();
  };
}

module.exports = {
  authMiddleware,
  authorizeRoles,
};
