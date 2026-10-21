const express = require('express');
const salesController = require('../controllers/sales.controller');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

// Quotations: Only sales & admin can create, convert or delete quotations
router.get('/quotations', salesController.getQuotations);
router.get('/quotations/:id', salesController.getQuotationById);
router.post(
  '/quotations',
  authorizeRoles('sales'),
  validateBody(['customer_name', 'part_name', 'quantity']),
  salesController.createQuotation
);
router.post('/quotations/:id/convert-to-so', authorizeRoles('sales'), salesController.convertToOrder);
router.put('/quotations/:id', authorizeRoles('sales'), salesController.updateQuotation);
router.delete('/quotations/:id', authorizeRoles('sales'), salesController.deleteQuotation);

// Sales Orders (SO)
router.get('/orders', salesController.getOrders);
router.post(
  '/orders',
  authorizeRoles('sales'),
  validateBody(['customer_name', 'part_name', 'order_qty', 'total_price']),
  salesController.createOrder
);
router.put('/orders/:id', authorizeRoles('sales'), salesController.updateOrder);
router.patch('/orders/:id/progress', authorizeRoles('sales', 'production'), salesController.updateOrderProgress);
router.delete('/orders/:id', authorizeRoles('sales'), salesController.deleteOrder);

// Delivery Notes (Xuất kho giao hàng)
router.get('/delivery-notes', salesController.getDeliveryNotes);
router.post(
  '/delivery-notes',
  authorizeRoles('sales', 'warehouse'),
  validateBody(['customer_name', 'delivery_qty']),
  salesController.createDeliveryNote
);
router.put('/delivery-notes/:id', authorizeRoles('sales', 'warehouse'), salesController.updateDeliveryNote);
router.post(
  '/delivery-notes/:id/confirm-export',
  authorizeRoles('warehouse'),
  salesController.confirmDeliveryExport
);
router.delete('/delivery-notes/:id', authorizeRoles('sales', 'warehouse'), salesController.deleteDeliveryNote);

module.exports = router;
