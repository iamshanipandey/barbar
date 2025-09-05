const Queue = require('../models/Queue');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { io } = require("../index");
const { sendSMS } = require('../config/twilio');

// Helper function to send notification to next customer
const notifyNextCustomer = async (queue, shopName) => {
  try {
    // Find the next waiting customer
    const nextCustomer = queue.customers.find(c => c.status === 'waiting');
    
    if (nextCustomer && nextCustomer.phone) {
      const message = `Hello ${nextCustomer.name}! Get ready, you're next in line at ${shopName}. Your token number is ${nextCustomer.token}. Please be ready!`;
      
      await sendSMS(nextCustomer.phone, message);
      console.log(`SMS notification sent to ${nextCustomer.name} (${nextCustomer.phone})`);
    }
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    // Don't throw error to prevent disrupting the main flow
  }
};

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
    
    const queue = await Queue.findOne({ shop: shopId }).populate('shop', 'shopName');
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
      
      // Send SMS to the customer being served
      const currentCustomer = queue.customers[nextIndex];
      const currentMessage = `${currentCustomer.name}, it's your turn now at ${queue.shop.shopName}! Please proceed to the counter. Token: ${currentCustomer.token}`;
      await sendSMS(currentCustomer.phone, currentMessage);
      
      // Notify the next waiting customer
      await notifyNextCustomer(queue, queue.shop.shopName);
      
      // Emit socket event
      io.to(shopId).emit('queueUpdated', queue.customers);
      
      return res.status(200).json({ 
        message: 'Next customer called', 
        token: queue.customers[nextIndex].token,
        customer: queue.customers[nextIndex]
      });
    } else {
      // No more customers waiting
      await queue.save();
      
      // Emit socket event
      io.to(shopId).emit('queueUpdated', queue.customers);
      
      return res.status(200).json({ message: 'No more customers in queue' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update markDone function
exports.markDone = async (req, res) => {
  try {
    const { shopId, customerId } = req.body;
    if (!shopId || !customerId) return res.status(400).json({ message: 'shopId and customerId required' });
    
    const queue = await Queue.findOne({ shop: shopId }).populate('shop', 'shopName');
    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    const index = queue.customers.findIndex(c => c._id.toString() === customerId);
    if (index === -1) return res.status(404).json({ message: 'Customer not found in queue' });

    queue.customers[index].status = 'done';

    // Auto-promote next waiting to serving
    const nextIdx = queue.customers.findIndex(c => c.status === 'waiting');
    if (nextIdx !== -1) {
      queue.customers[nextIdx].status = 'serving';
      
      // Send SMS to the customer being served
      const currentCustomer = queue.customers[nextIdx];
      const currentMessage = `${currentCustomer.name}, it's your turn now at ${queue.shop.shopName}! Please proceed to the counter. Token: ${currentCustomer.token}`;
      await sendSMS(currentCustomer.phone, currentMessage);
    }

    await queue.save();
    
    // Notify the next waiting customer (after the one who just got promoted)
    await notifyNextCustomer(queue, queue.shop.shopName);
    
    io.to(shopId).emit('queueUpdated', queue.customers);

    res.status(200).json({ message: 'Customer marked as done' });
  } catch (err) {
    console.error('markDone error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update skipCustomer to include notifications
exports.skipCustomer = async (req, res) => {
  try {
    const { shopId, customerId } = req.body;
    if (!shopId || !customerId) {
      return res.status(400).json({ message: 'shopId and customerId required' });
    }

    const queue = await Queue.findOne({ shop: shopId }).populate('shop', 'shopName');
    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    const index = queue.customers.findIndex(c => c._id.toString() === customerId);
    if (index === -1) return res.status(404).json({ message: 'Customer not found in queue' });

    const wasServing = queue.customers[index].status === 'serving';

    // Remove customer from queue
    queue.customers.splice(index, 1);

    // If removed customer was serving, promote next waiting to serving
    if (wasServing) {
      const nextIdx = queue.customers.findIndex(c => c.status === 'waiting');
      if (nextIdx !== -1) {
        queue.customers[nextIdx].status = 'serving';
        
        // Send SMS to the new serving customer
        const currentCustomer = queue.customers[nextIdx];
        const currentMessage = `${currentCustomer.name}, it's your turn now at ${queue.shop.shopName}! Please proceed to the counter. Token: ${currentCustomer.token}`;
        await sendSMS(currentCustomer.phone, currentMessage);
      }
    }

    await queue.save();
    
    // Notify the next waiting customer
    await notifyNextCustomer(queue, queue.shop.shopName);
    
    io.to(shopId).emit('queueUpdated', queue.customers);

    return res.status(200).json({ message: 'Customer removed from queue' });
  } catch (err) {
    console.error('skipCustomer error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update moveToLast to include notifications
exports.moveToLast = async (req, res) => {
  try {
    const { shopId, customerId } = req.body;
    if (!shopId || !customerId) {
      return res.status(400).json({ message: 'shopId and customerId required' });
    }

    const queue = await Queue.findOne({ shop: shopId }).populate('shop', 'shopName');
    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    const index = queue.customers.findIndex(c => c._id.toString() === customerId);
    if (index === -1) return res.status(404).json({ message: 'Customer not found in queue' });

    const wasServing = queue.customers[index].status === 'serving';
    const moved = queue.customers.splice(index, 1)[0];

    // Make it waiting and push to end
    moved.status = 'waiting';

    // Update token so it becomes last for any token-based ordering
    const maxToken = queue.customers.reduce((acc, c) => Math.max(acc, c.token || 0), 0);
    moved.token = (maxToken || 0) + 1;

    queue.customers.push(moved);

    // Send SMS to the moved customer
    const movedMessage = `${moved.name}, you've been moved to the end of the queue at ${queue.shop.shopName}. Your new token is ${moved.token}. We'll notify you when it's your turn.`;
    await sendSMS(moved.phone, movedMessage);

    // If we moved the serving one, promote the next waiting (not the moved one)
    if (wasServing) {
      const nextIdx = queue.customers.findIndex(
        c => c.status === 'waiting' && c._id.toString() !== moved._id.toString()
      );
      if (nextIdx !== -1) {
        queue.customers[nextIdx].status = 'serving';
        
        // Send SMS to the new serving customer
        const currentCustomer = queue.customers[nextIdx];
        const currentMessage = `${currentCustomer.name}, it's your turn now at ${queue.shop.shopName}! Please proceed to the counter. Token: ${currentCustomer.token}`;
        await sendSMS(currentCustomer.phone, currentMessage);
      }
    }

    await queue.save();
    
    // Notify the next waiting customer
    await notifyNextCustomer(queue, queue.shop.shopName);
    
    io.to(shopId).emit('queueUpdated', queue.customers);

    return res.status(200).json({ message: 'Customer moved to last' });
  } catch (err) {
    console.error('moveToLast error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Keep other functions as they are...
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
    }).populate('shop', 'shopName address').sort({ updatedAt: -1 });

    const history = [];
    
    queues.forEach(queue => {
      const customerEntries = queue.customers.filter(c => c.phone === phone);
      customerEntries.forEach(customer => {
        history.push({
          shopName: queue.shop.shopName,
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