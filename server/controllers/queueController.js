const Queue = require('../models/Queue');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { io } = require("../index");

exports.joinQueue = async (req, res) => {
  try {
    const { shopId, name, phone, serviceId } = req.body;
    if (!shopId || !name || !phone) return res.status(400).json({ message: 'shopId, name, phone required' });

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    let queue = await Queue.findOne({ shop: shopId });
    if (!queue) queue = await Queue.create({ shop: shopId, customers: [] });

    // Check if already in queue (by phone)
    if (queue.customers.some(c => c.phone === phone && c.status === 'waiting')) {
      return res.status(400).json({ message: 'Already in queue with this phone number' });
    }

    let lastToken = 0;
    if (queue.customers.length > 0) {
      lastToken = Math.max(...queue.customers.map(c => c.token || 0));
    }
    const newToken = lastToken + 1;

    queue.customers.push({
      name,
      phone,
      service: serviceId,
      token: newToken,
      status: 'waiting'
      // user: req.user ? req.user.id : undefined // optional, if login
    });

    await queue.save();
    io.to(shopId).emit('queueUpdated', queue.customers);
    res.status(200).json({ message: 'Joined queue', token: newToken });
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

    // Find currently serving customer
    const servingIndex = queue.customers.findIndex(c => c.status === 'serving');
    if (servingIndex !== -1) {
      queue.customers[servingIndex].status = 'done';
    }

    // Find next waiting customer
    const nextIndex = queue.customers.findIndex(c => c.status === 'waiting');
    if (nextIndex !== -1) {
      queue.customers[nextIndex].status = 'serving';
      await queue.save();
      return res.status(200).json({ message: 'Next customer called', token: queue.customers[nextIndex].token });
    } else {
      await queue.save();
      return res.status(200).json({ message: 'No more customers in queue' });
    }
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

// POST /api/queue/skip
exports.skipCustomer = async (req, res) => {
  try {
    const { shopId, customerId } = req.body;
    if (!shopId || !customerId) return res.status(400).json({ message: 'shopId and customerId required' });
    const queue = await Queue.findOne({ shop: shopId });
    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    const index = queue.customers.findIndex(c => c.user.toString() === customerId && c.status === 'waiting');
    if (index === -1) return res.status(404).json({ message: 'Customer not found in queue' });

    // Mark as skipped
    queue.customers[index].status = 'skipped';
    await queue.save();
    res.status(200).json({ message: 'Customer skipped' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/queue/move-to-last
exports.moveToLast = async (req, res) => {
  try {
    const { shopId, customerId } = req.body;
    if (!shopId || !customerId) return res.status(400).json({ message: 'shopId and customerId required' });
    const queue = await Queue.findOne({ shop: shopId });
    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    const index = queue.customers.findIndex(c => c.user.toString() === customerId && c.status === 'waiting');
    if (index === -1) return res.status(404).json({ message: 'Customer not found in queue' });

    // Remove and push to end
    const customer = queue.customers.splice(index, 1)[0];
    queue.customers.push(customer);
    await queue.save();
    res.status(200).json({ message: 'Customer moved to last' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Cancel queue for customer (remove self from queue)
exports.cancelQueue = async (req, res) => {
  try {
    const { shopId } = req.body;
    if (!shopId) return res.status(400).json({ message: 'shopId required' });

    const queue = await Queue.findOne({ shop: shopId });
    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    // Find customer in queue
    const index = queue.customers.findIndex(
      c => c.user.toString() === req.user.id && c.status === 'waiting'
    );
    if (index === -1) return res.status(404).json({ message: 'You are not in the queue' });

    // Mark as out
    queue.customers[index].status = 'out';
    await queue.save();

    res.status(200).json({ message: 'You have been removed from the queue' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add this function to your queue controller
exports.checkQueueStatus = async (req, res) => {
  try {
    const { phone } = req.params;
    
    if (!phone || phone.length !== 10) {
      return res.status(400).json({ message: 'Valid 10-digit phone number required' });
    }

    // Find all queues where this phone number exists with waiting or serving status
    const queues = await Queue.find({
      'customers': {
        $elemMatch: {
          phone: phone,
          status: { $in: ['waiting', 'serving'] }
        }
      }
    }).populate('shop', 'shopName ownerName address city');

    if (!queues || queues.length === 0) {
      return res.status(404).json({ message: 'No active queue found for this number' });
    }

    // Get the most recent queue entry
    const queue = queues[0];
    const customer = queue.customers.find(c => c.phone === phone && ['waiting', 'serving'].includes(c.status));
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found in queue' });
    }

    // Find currently serving customer
    const currentlyServing = queue.customers.find(c => c.status === 'serving');
    const currentServingToken = currentlyServing ? currentlyServing.token : null;

    // Calculate position in queue
    let position = 1;
    let peopleAhead = 0;
    
    if (customer.status === 'waiting') {
      // Count how many people are ahead (waiting customers with earlier join time or lower token)
      peopleAhead = queue.customers.filter(c => 
        c.status === 'waiting' && 
        c.token < customer.token
      ).length;
      
      // Also count if someone is currently being served
      const servingCount = queue.customers.filter(c => c.status === 'serving').length;
      peopleAhead += servingCount;
      position = peopleAhead + 1;
    } else if (customer.status === 'serving') {
      position = 0; // Currently being served
      peopleAhead = 0;
    }

    // Estimate wait time (15 minutes per person average)
    const estimatedWaitTime = peopleAhead * 15;

    res.status(200).json({
      shopName: queue.shop.shopName,
      shopAddress: queue.shop.address,
      shopCity: queue.shop.city,
      ownerName: queue.shop.ownerName,
      shopId: queue.shop._id, // Added shopId for future use
      token: customer.token,
      position: position,
      peopleAhead: peopleAhead,
      estimatedWaitTime: estimatedWaitTime,
      status: customer.status,
      customerName: customer.name,
      service: customer.serviceName || null,
      joinedAt: customer.joinedAt,
      currentServingToken: currentServingToken // Added currently serving token
    });

  } catch (err) {
    console.error('Error in checkQueueStatus:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Optional: Get queue history for a phone number
exports.getQueueHistory = async (req, res) => {
  try {
    const { phone } = req.params;
    
    if (!phone || phone.length !== 10) {
      return res.status(400).json({ message: 'Valid 10-digit phone number required' });
    }

    const queues = await Queue.find({
      'customers.phone': phone
    }).populate('shop', 'name address').sort({ updatedAt: -1 });

    const history = [];
    
    queues.forEach(queue => {
      const customerEntries = queue.customers.filter(c => c.phone === phone);
      customerEntries.forEach(customer => {
        history.push({
          shopName: queue.shop.name,
          shopAddress: queue.shop.address,
          token: customer.token,
          status: customer.status,
          joinedAt: customer.joinedAt,
          serviceName: customer.service // You might want to populate this
        });
      });
    });

    res.status(200).json({ history });

  } catch (err) {
    console.error('Error in getQueueHistory:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/queue/mark-done
exports.markDone = async (req, res) => {
  try {
    const { shopId, customerId } = req.body;
    if (!shopId || !customerId) return res.status(400).json({ message: 'shopId and customerId required' });
    
    const queue = await Queue.findOne({ shop: shopId });
    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    const index = queue.customers.findIndex(c => c.user.toString() === customerId);
    if (index === -1) return res.status(404).json({ message: 'Customer not found in queue' });

    // Mark as done
    queue.customers[index].status = 'done';
    await queue.save();
    
    res.status(200).json({ message: 'Customer marked as done' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
