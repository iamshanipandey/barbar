const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const auth = require('../middlewares/auth');

router.post('/join', auth, queueController.joinQueue);
router.post('/next', auth, queueController.nextCustomer);
router.get('/:shopId', queueController.getQueue);

module.exports = router; 