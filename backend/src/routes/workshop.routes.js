const express = require('express');
const workshopController = require('../controllers/workshop.controller');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', workshopController.getWorkshops);
router.get('/:id', workshopController.getWorkshopById);
router.post('/', authorizeRoles('admin', 'production'), workshopController.createWorkshop);
router.put('/:id', authorizeRoles('admin', 'production'), workshopController.updateWorkshop);
router.delete('/:id', authorizeRoles('admin', 'production'), workshopController.deleteWorkshop);

module.exports = router;
