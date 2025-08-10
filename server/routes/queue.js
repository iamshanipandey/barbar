const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const auth = require('../middlewares/auth');

// Public routes (no auth required)
router.post('/join', queueController.joinQueue);
router.get('/status/:phone', queueController.checkQueueStatus);
router.get('/history/:phone', queueController.getQueueHistory); // optional

// Shop specific route
router.get('/:shopId', queueController.getQueue);

// Protected routes (auth required)
router.post('/next', auth, queueController.nextCustomer);
router.post('/skip', auth, queueController.skipCustomer);
router.post('/move-to-last', auth, queueController.moveToLast);
router.post('/markdone', auth, queueController.markDone);
router.post('/cancel', auth, queueController.cancelQueue);

module.exports = router;