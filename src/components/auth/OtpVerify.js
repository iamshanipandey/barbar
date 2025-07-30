import React, { useState } from 'react';
import axios from '../../api/axios';

const OtpVerify = ({ email, onVerifySuccess }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/auth/verify-otp', { email, otp });
      onVerifySuccess(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post('/auth/resend-otp', { email });
    } catch (err) {
      setError('Failed to resend OTP');
    }
    setLoading(false);
  };

  return (
    <form className="otp-form" onSubmit={handleSubmit}>
      <h2>Verify OTP</h2>
      <input
        name="otp"
        placeholder="Enter OTP"
        value={otp}
        onChange={e => setOtp(e.target.value)}
        required
        maxLength={6}
      />
      <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</button>
      <button type="button" onClick={handleResend} disabled={loading} style={{ marginLeft: 8 }}>Resend OTP</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default OtpVerify; 