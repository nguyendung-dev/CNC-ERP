const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/materials', inventoryController.getMaterials);
router.get('/materials/alerts/low-stock', inventoryController.getLowStockAlerts);
router.get('/materials/:id', inventoryController.getMaterialById);
router.post('/materials', validateBody(['name', 'category', 'unit']), inventoryController.createMaterial);
router.put('/materials/:id', inventoryController.updateMaterial);
router.delete('/materials/:id', inventoryController.deleteMaterial);
router.post('/materials/:id/adjust-stock', validateBody(['changeAmount']), inventoryController.adjustStock);

module.exports = router;
