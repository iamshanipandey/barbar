const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barberController');
const auth = require('../middlewares/auth');

router.post('/register-shop', auth, barberController.registerShop);
router.get('/shop-profile', auth, barberController.getShopProfile); 
router.post('/service', auth, barberController.createService);
router.get('/services', auth, barberController.getServices);
router.put('/service/:id', auth, barberController.updateService);
router.delete('/service/:id', auth, barberController.deleteService);
router.put('/update-shop', auth, barberController.updateShop);

module.exports = router;