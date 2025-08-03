const Review = require('../models/Review');

exports.addReview = async (req, res) => {
  try {
    const { shopId, rating, comment } = req.body;
    if (!shopId || !rating) return res.status(400).json({ message: 'shopId and rating required' });
    const review = await Review.create({
      shop: shopId,
      user: req.user.id,
      rating,
      comment,
    });
    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { shopId } = req.params;
    const reviews = await Review.find({ shop: shopId }).populate('user', 'name');
    res.status(200).json({ reviews });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};