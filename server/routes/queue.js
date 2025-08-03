const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const auth = require('../middlewares/auth');

router.post('/join', queueController.joinQueue);
router.post('/next', auth, queueController.nextCustomer);
router.get('/:shopId', queueController.getQueue);


router.post('/skip', auth, queueController.skipCustomer);
router.post('/move-to-last', auth, queueController.moveToLast);

router.post('/cancel', auth, queueController.cancelQueue);

module.exports = router;