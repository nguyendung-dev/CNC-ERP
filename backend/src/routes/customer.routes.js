const express = require('express');
const customerController = require('../controllers/customer.controller');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', authorizeRoles('sales'), customerController.createCustomer);
router.put('/:id', authorizeRoles('sales'), customerController.updateCustomer);
router.delete('/:id', authorizeRoles('sales'), customerController.deleteCustomer);

module.exports = router;
