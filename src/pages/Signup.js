import React, { useState, useContext } from 'react';
import SignupForm from '../components/auth/Signup';
import OtpVerify from '../components/auth/OtpVerify';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignupSuccess = (email) => {
    setEmail(email);
    setStep(2);
  };

  const handleVerifySuccess = (token, user) => {
    login(token, user);
    if (user.userType === 'barber') navigate('/barber/dashboard');
    else navigate('/customer/dashboard');
  };

  return (
    <div className="signup-page">
      {step === 1 ? (
        <SignupForm onSignupSuccess={handleSignupSuccess} />
      ) : (
        <OtpVerify email={email} onVerifySuccess={handleVerifySuccess} />
      )}
    </div>
  );
};

export default Signup; 