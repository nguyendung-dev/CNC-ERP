const express = require('express');
const financeController = require('../controllers/finance.controller');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

// Finance is restricted to accountant and admin
router.use(authorizeRoles('accountant'));

// Advances (Tạm ứng)
router.get('/advances', financeController.getAdvances);
router.post('/advances', validateBody(['requester', 'purpose', 'amount']), financeController.createAdvance);
router.patch('/advances/:id/approve', authorizeRoles('admin'), financeController.approveAdvance);
router.delete('/advances/:id', authorizeRoles('admin'), financeController.deleteAdvance);

// Payments (Thanh toán)
router.get('/payments', financeController.getPayments);
router.post('/payments', validateBody(['recipient', 'category', 'gross_amount']), financeController.createPayment);
router.delete('/payments/:id', authorizeRoles('admin'), financeController.deletePayment);

// Debts (Công nợ)
router.get('/debts', financeController.getDebts);
router.post('/debts', validateBody(['partner_name', 'type', 'total_amount']), financeController.createDebt);
router.post('/debts/:id/pay', validateBody(['amount']), financeController.payDebt);
router.delete('/debts/:id', authorizeRoles('admin'), financeController.deleteDebt);

module.exports = router;
