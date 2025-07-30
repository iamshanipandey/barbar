const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/barbers-near-me', customerController.getBarbersNearMe);
router.get('/barber/:shopId', customerController.getBarberProfile);

module.exports = router; 