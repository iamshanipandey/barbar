const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middlewares/auth');

router.post('/add', auth, reviewController.addReview);
router.get('/:shopId', reviewController.getReviews);

module.exports = router;