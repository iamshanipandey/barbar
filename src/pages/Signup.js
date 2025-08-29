import React, { useState, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    userType: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 = signup form, 2 = OTP verification
  const [email, setEmail] = useState('');
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
    console.log('API URL:', axios.defaults.baseURL); // yeh check kar
    console.log('Full URL:', `${axios.defaults.baseURL}/auth/signup`);
    const res = await axios.post('/auth/signup', form);
      console.log('Signup response:', res.data);
      
      // OTP sent successfully
      setEmail(form.email);
      setStep(2);
      alert('OTP sent to your email! Check your inbox.');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Signup failed');
    }
    setLoading(false);
  };

  
  const handleOTPVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const otp = e.target.otp.value;
    
    try {
      console.log('Verifying OTP:', { email, otp });
      const res = await axios.post('/auth/verify-otp', { email, otp });
      console.log('OTP verification response:', res.data);
      
      // Login user after successful verification
      login(res.data.token, res.data.user);
      
      // Redirect based on userType
      if (res.data.user.userType === 'barber') {
        navigate('/barber/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || 'OTP verification failed');
    }
    setLoading(false);
  };

  const resendOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      await axios.post('/auth/resend-otp', { email });
      alert('OTP resent to your email!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
    setLoading(false);
  };

  return (
    <div className="signup-page-bg">
      {step === 1 ? (
        // Step 1: Signup Form
        <form className="signup-form-modern" onSubmit={handleSubmit}>
          <h2 className="signup-title">Create Account</h2>
          
          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
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
          
          <button type="submit" className="signup-btn-modern" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Sign Up'}
          </button>
          
          {error && <div className="signup-error">{error}</div>}
          
          <div className="signup-footer">
            <span>Already have an account?</span>
            <a href="/login" className="signup-link">Sign In</a>
          </div>
        </form>
      ) : (
        // Step 2: OTP Verification
        <form className="signup-form-modern" onSubmit={handleOTPVerify}>
          <h2 className="signup-title">Verify Your Email</h2>
          
          <div className="otp-info">
            <p>We've sent a 6-digit OTP to:</p>
            <strong>{email}</strong>
          </div>
          
          <div className="input-group">
            <label>Enter OTP</label>
            <input
              type="text"
              name="otp"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              required
              autoFocus
            />
          </div>
          
          <button type="submit" className="signup-btn-modern" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          
          <div className="otp-actions">
            <button 
              type="button" 
              className="resend-btn" 
              onClick={resendOTP}
              disabled={loading}
            >
              Resend OTP
            </button>
            <button 
              type="button" 
              className="back-btn" 
              onClick={() => setStep(1)}
            >
              Back to Signup
            </button>
          </div>
          
          {error && <div className="signup-error">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default Signup;