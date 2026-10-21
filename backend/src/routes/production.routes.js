const express = require('express');
const productionController = require('../controllers/production.controller');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

// Production Orders (LSX)
router.get('/orders', productionController.getProductionOrders);
router.get('/orders/:id', productionController.getProductionOrderById);
router.post(
  '/orders',
  authorizeRoles('production'),
  validateBody(['part_name', 'target_qty']),
  productionController.createProductionOrder
);
router.patch('/orders/:id/step', authorizeRoles('production'), productionController.updateProductionStep);
router.put('/orders/:id', authorizeRoles('production'), productionController.updateProductionOrder);
router.post('/orders/:id/issue-material', authorizeRoles('production', 'warehouse'), productionController.issueMaterial);
router.post('/orders/:id/handover-finished', authorizeRoles('production'), productionController.handoverFinishedGoods);
router.delete('/orders/:id', authorizeRoles('production'), productionController.deleteProductionOrder);

// WIP Movements
router.get('/wip-movements', productionController.getWipMovements);
router.post(
  '/wip-movements',
  authorizeRoles('production'),
  validateBody(['from_step', 'to_step', 'qty_passed']),
  productionController.createWipMovement
);
router.delete('/wip-movements/:id', authorizeRoles('production'), productionController.deleteWipMovement);

// Subcontracting (Gia công ngoài)
router.get('/subcontracting', productionController.getSubcontractingOrders);
router.post(
  '/subcontracting',
  authorizeRoles('production'),
  validateBody(['vendor_name', 'process_type', 'part_name', 'send_qty']),
  productionController.createSubcontractingOrder
);
router.patch('/subcontracting/:id', authorizeRoles('production'), productionController.updateSubcontractingStatus);
router.delete('/subcontracting/:id', authorizeRoles('production'), productionController.deleteSubcontractingOrder);


// Production Steps (Quy trình & Công đoạn - Thêm, xóa, sửa, cắt bỏ)
router.get('/steps', productionController.getSteps);
router.post('/steps', authorizeRoles('production', 'admin'), validateBody(['name']), productionController.createStep);
router.put('/steps/:id', authorizeRoles('production', 'admin'), productionController.updateStep);
router.delete('/steps/:id', authorizeRoles('production', 'admin'), productionController.deleteStep);


// Operators (Quản lý Thợ Máy CNC)
router.get('/operators', productionController.getOperators);
router.post(
  '/operators/assign-workshop',
  authorizeRoles('production', 'admin'),
  validateBody(['operator_ids']),
  productionController.assignOperatorsToWorkshop
);
router.post('/operators', authorizeRoles('production', 'admin'), validateBody(['name']), productionController.createOperator);
router.put('/operators/:id', authorizeRoles('production', 'admin'), productionController.updateOperator);
router.delete('/operators/:id', authorizeRoles('production', 'admin'), productionController.deleteOperator);

module.exports = router;
