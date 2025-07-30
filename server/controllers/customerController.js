const Shop = require('../models/Shop');
const Service = require('../models/Service');
const User = require('../models/User');

exports.getBarbersNearMe = async (req, res) => {
  try {
    const { city } = req.query;
    const filter = city ? { city } : {};
    const shops = await Shop.find(filter).populate('barber', 'name email');
    const result = await Promise.all(shops.map(async shop => {
      const services = await Service.find({ shop: shop._id });
      return {
        shopId: shop._id,
        shopName: shop.shopName,
        ownerName: shop.ownerName,
        address: shop.address,
        city: shop.city,
        location: shop.location,
        timings: shop.timings,
        profilePic: shop.profilePic,
        barber: shop.barber,
        services,
      };
    }));
    res.status(200).json({ barbers: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getBarberProfile = async (req, res) => {
  try {
    const { shopId } = req.params;
    const shop = await Shop.findById(shopId).populate('barber', 'name email');
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    const services = await Service.find({ shop: shop._id });
    res.status(200).json({
      shopId: shop._id,
      shopName: shop.shopName,
      ownerName: shop.ownerName,
      address: shop.address,
      city: shop.city,
      location: shop.location,
      timings: shop.timings,
      profilePic: shop.profilePic,
      barber: shop.barber,
      services,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 