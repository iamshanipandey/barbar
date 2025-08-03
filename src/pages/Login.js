import React, { useState, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '', userType: 'customer' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/auth/login', form);
      const { token, user } = res.data;
      login(token, user);

      // Redirect based on userType
      if (user.userType === 'barber') navigate('/barber/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-page-bg">
      <form className="login-form-modern" onSubmit={handleSubmit}>
        <h2 className="login-title">Sign In</h2>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label>User Type</label>
          <select name="userType" value={form.userType} onChange={handleChange}>
            <option value="customer">Customer</option>
            <option value="barber">Barber</option>
          </select>
        </div>
        <button type="submit" className="login-btn-modern" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <div className="login-error">{error}</div>}
        <div className="login-footer">
          <span>Don't have an account?</span>
          <a href="/signup" className="login-link">Sign Up</a>
        </div>
      </form>
    </div>
  );
};

export default Login;