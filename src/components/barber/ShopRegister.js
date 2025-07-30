import React, { useState, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const ShopRegister = ({ onRegister }) => {
  const { token } = useContext(AuthContext);
  const [form, setForm] = useState({
    shopName: '', ownerName: '', address: '', city: '', location: '', open: '', close: '', profilePic: ''
  });
  const [imgFile, setImgFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = e => {
    const file = e.target.files[0];
    setImgFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, profilePic: reader.result }));
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await axios.post('/barber/register-shop', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      if (onRegister) onRegister();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <form className="shop-register-form" onSubmit={handleSubmit}>
      <h3>Register Your Shop</h3>
      <input name="shopName" placeholder="Shop Name" value={form.shopName} onChange={handleChange} required />
      <input name="ownerName" placeholder="Owner Name" value={form.ownerName} onChange={handleChange} required />
      <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
      <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
      <input name="location" placeholder="Location (optional)" value={form.location} onChange={handleChange} />
      <input name="open" placeholder="Opening Time (e.g. 09:00)" value={form.open} onChange={handleChange} required />
      <input name="close" placeholder="Closing Time (e.g. 20:00)" value={form.close} onChange={handleChange} required />
      <input type="file" accept="image/*" onChange={handleImage} required />
      <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register Shop'}</button>
      {error && <div className="error">{error}</div>}
      {success && <div style={{ color: 'green' }}>Shop registered successfully!</div>}
    </form>
  );
};

export default ShopRegister; 