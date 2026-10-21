const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

// All logged in users can view materials & low-stock alerts
router.get('/materials', inventoryController.getMaterials);
router.get('/materials/alerts/low-stock', inventoryController.getLowStockAlerts);
router.get('/materials/:id', inventoryController.getMaterialById);

// Only warehouse & admin can create, update, delete materials or adjust inventory
router.post(
  '/materials',
  authorizeRoles('warehouse'),
  validateBody(['name', 'category', 'unit']),
  inventoryController.createMaterial
);
router.put('/materials/:id', authorizeRoles('warehouse'), inventoryController.updateMaterial);
router.delete('/materials/:id', authorizeRoles('warehouse'), inventoryController.deleteMaterial);
router.post(
  '/materials/:id/adjust-stock',
  authorizeRoles('warehouse'),
  validateBody(['changeAmount']),
  inventoryController.adjustStock
);

module.exports = router;
