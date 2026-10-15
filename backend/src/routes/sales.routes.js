const express = require('express');
const salesController = require('../controllers/sales.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

// Quotations
router.get('/quotations', salesController.getQuotations);
router.get('/quotations/:id', salesController.getQuotationById);
router.post('/quotations', validateBody(['customer_name', 'part_name', 'quantity']), salesController.createQuotation);
router.post('/quotations/:id/convert-to-so', salesController.convertToOrder);
router.delete('/quotations/:id', salesController.deleteQuotation);

// Sales Orders (SO)
router.get('/orders', salesController.getOrders);
router.post('/orders', validateBody(['customer_name', 'part_name', 'order_qty', 'total_price']), salesController.createOrder);
router.patch('/orders/:id/progress', salesController.updateOrderProgress);
router.delete('/orders/:id', salesController.deleteOrder);

// Delivery Notes (Xuất kho giao hàng)
router.get('/delivery-notes', salesController.getDeliveryNotes);
router.post('/delivery-notes', validateBody(['customer_name', 'delivery_qty']), salesController.createDeliveryNote);
router.delete('/delivery-notes/:id', salesController.deleteDeliveryNote);

module.exports = router;
