const Shop = require('../models/Shop');
const Service = require('../models/Service');
const cloudinary = require('../config/cloudinary');

exports.registerShop = async (req, res) => {
  try {
    console.log(req.user)
    const { shopName, ownerName, address, city, location, open, close, profilePic } = req.body;
    if (!shopName || !ownerName || !address || !city || !open || !close || !profilePic) {
      return res.status(400).json({ message: 'All fields required' });
    }
    let upload = null;
    try
    {
      upload = await cloudinary.uploader.upload(profilePic, { folder: 'barber/shops' });
    }
    catch(error)
    {
      console.log(error)
    }

    const shop = await Shop.create({
      barber: req.user.id,
      shopName,
      ownerName,
      address,
      city,
      location,
      timings: { open, close },
      profilePic: upload.secure_url,
    });
    res.status(201).json({ shop });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const { title, description, price, duration, image } = req.body;
    if (!title || !price || !duration || !image) {
      return res.status(400).json({ message: 'All fields required' });
    }
    const shop = await Shop.findOne({ barber: req.user.id });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    const upload = await cloudinary.uploader.upload(image, { folder: 'barber/services' });
    const service = await Service.create({
      shop: shop._id,
      title,
      description,
      price,
      duration,
      image: upload.secure_url,
    });
    res.status(201).json({ service });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const shop = await Shop.findOne({ barber: req.user.id });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    const services = await Service.find({ shop: shop._id });
    res.status(200).json({ services });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, duration, image } = req.body;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (image) {
      const upload = await cloudinary.uploader.upload(image, { folder: 'barber/services' });
      service.image = upload.secure_url;
    }
    if (title) service.title = title;
    if (description) service.description = description;
    if (price) service.price = price;
    if (duration) service.duration = duration;
    await service.save();
    res.status(200).json({ service });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    await service.remove();
    res.status(200).json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

exports.updateShop = async (req, res) => {
  try {
    const { shopName, ownerName, address, city, location, open, close, profilePic } = req.body;
    const shop = await Shop.findOne({ barber: req.user.id });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    if (shopName) shop.shopName = shopName;
    if (ownerName) shop.ownerName = ownerName;
    if (address) shop.address = address;
    if (city) shop.city = city;
    if (location) shop.location = location;
    if (open) shop.timings.open = open;
    if (close) shop.timings.close = close;

    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic, { folder: 'barber/shops' });
      shop.profilePic = upload.secure_url;
    }

    await shop.save();
    res.status(200).json({ message: 'Shop profile updated', shop });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getShopProfile = async (req, res) => {
  try {
    const shop = await Shop.findOne({ barber: req.user.id });
    res.status(200).json({ shop });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

