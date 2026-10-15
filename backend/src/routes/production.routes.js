const express = require('express');
const productionController = require('../controllers/production.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

// Production Orders (LSX)
router.get('/orders', productionController.getProductionOrders);
router.get('/orders/:id', productionController.getProductionOrderById);
router.post('/orders', validateBody(['part_name', 'target_qty']), productionController.createProductionOrder);
router.patch('/orders/:id/step', productionController.updateProductionStep);
router.delete('/orders/:id', productionController.deleteProductionOrder);

// WIP Movements
router.get('/wip-movements', productionController.getWipMovements);
router.post('/wip-movements', validateBody(['from_step', 'to_step', 'qty_passed']), productionController.createWipMovement);
router.delete('/wip-movements/:id', productionController.deleteWipMovement);

// Subcontracting
router.get('/subcontracting', productionController.getSubcontractingOrders);
router.post('/subcontracting', validateBody(['vendor_name', 'process_type', 'part_name', 'send_qty']), productionController.createSubcontractingOrder);
router.patch('/subcontracting/:id', productionController.updateSubcontractingStatus);
router.delete('/subcontracting/:id', productionController.deleteSubcontractingOrder);

module.exports = router;
