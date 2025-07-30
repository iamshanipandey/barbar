const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barberController');
const auth = require('../middlewares/auth');

router.post('/register-shop', auth, barberController.registerShop);
router.post('/service', auth, barberController.createService);
router.get('/services', auth, barberController.getServices);
router.put('/service/:id', auth, barberController.updateService);
router.delete('/service/:id', auth, barberController.deleteService);

module.exports = router; 