const express = require('express');
const financeController = require('../controllers/finance.controller');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

// Advances (Tạm ứng):
// All staff can read advances and submit advance requests
router.get('/advances', financeController.getAdvances);
router.post('/advances', validateBody(['requester', 'purpose', 'amount']), financeController.createAdvance);
router.put('/advances/:id', financeController.updateAdvance);
// Only Admin can approve or delete advances
router.patch('/advances/:id/approve', authorizeRoles('admin'), financeController.approveAdvance);
router.patch('/advances/:id/reject', authorizeRoles('admin'), financeController.rejectAdvance);
router.delete('/advances/:id', authorizeRoles('admin'), financeController.deleteAdvance);

// Payments (Thanh toán): Restricted to accountant & admin
router.get('/payments', authorizeRoles('accountant'), financeController.getPayments);
router.post('/payments', authorizeRoles('accountant'), validateBody(['recipient', 'category', 'gross_amount']), financeController.createPayment);
router.put('/payments/:id', authorizeRoles('accountant'), financeController.updatePayment);
router.patch('/payments/:id/approve', authorizeRoles('admin'), financeController.approvePayment);
router.patch('/payments/:id/reject', authorizeRoles('admin'), financeController.rejectPayment);
router.delete('/payments/:id', authorizeRoles('admin'), financeController.deletePayment);

// Debts (Công nợ): Restricted to accountant & admin
router.get('/debts', authorizeRoles('accountant'), financeController.getDebts);
router.post('/debts', authorizeRoles('accountant'), validateBody(['partner_name', 'type', 'total_amount']), financeController.createDebt);
router.put('/debts/:id', authorizeRoles('accountant'), financeController.updateDebt);
router.post('/debts/:id/pay', authorizeRoles('accountant'), validateBody(['amount']), financeController.payDebt);
router.delete('/debts/:id', authorizeRoles('admin'), financeController.deleteDebt);

module.exports = router;
