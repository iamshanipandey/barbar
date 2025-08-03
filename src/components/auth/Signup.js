import React, { useState } from 'react';
import axios from '../../api/axios';
import "./Signup.css"

const Signup = ({ onSignupSuccess }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    userType: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/auth/signup', form);
      onSignupSuccess(form.email);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }

    setLoading(false);
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      <input
      className="signup-input"
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
      className="signup-input"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
      className="signup-input"
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        required
      />
      <input
      className="signup-input"
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      />
      <select name="userType" value={form.userType} onChange={handleChange}>
        <option value="customer">Customer</option>
        <option value="barber">Barber</option>
      </select>
      <button type="submit" disabled={loading}>
        {loading ? 'Sending OTP...' : 'Sign Up'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default Signup;
