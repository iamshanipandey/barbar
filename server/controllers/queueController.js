const Queue = require('../models/Queue');
const Shop = require('../models/Shop');
const User = require('../models/User');

exports.joinQueue = async (req, res) => {
  try {
    const { shopId } = req.body;
    if (!shopId) return res.status(400).json({ message: 'shopId required' });
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    let queue = await Queue.findOne({ shop: shopId });
    if (!queue) queue = await Queue.create({ shop: shopId, customers: [] });
    if (queue.customers.some(c => c.user.toString() === req.user.id && c.status === 'waiting')) {
      return res.status(400).json({ message: 'Already in queue' });
    }
    queue.customers.push({ user: req.user.id });
    await queue.save();
    res.status(200).json({ message: 'Joined queue' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.nextCustomer = async (req, res) => {
  try {
    const { shopId } = req.body;
    if (!shopId) return res.status(400).json({ message: 'shopId required' });
    const queue = await Queue.findOne({ shop: shopId });
    if (!queue) return res.status(404).json({ message: 'Queue not found' });
    const current = queue.customers.find(c => c.status === 'waiting');
    if (current) current.status = 'done';
    await queue.save();
    res.status(200).json({ message: 'Next customer called' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getQueue = async (req, res) => {
  try {
    const { shopId } = req.params;
    const queue = await Queue.findOne({ shop: shopId }).populate('customers.user', 'name email');
    if (!queue) return res.status(404).json({ message: 'Queue not found' });
    res.status(200).json({ queue: queue.customers });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 