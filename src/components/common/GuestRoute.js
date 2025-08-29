import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const GuestRoute = ({ children }) => {
  const { user, token, loading } = useContext(AuthContext) || {};
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (loading) {
    return (
      <div className="route-loading" style={{ padding: 24, textAlign: 'center' }}>
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // If already authenticated, kick out from guest page to dashboard
  if (user || token || storedToken) {
    const redirectTo = user?.userType === 'barber' ? '/barber/dashboard' : '/';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default GuestRoute;