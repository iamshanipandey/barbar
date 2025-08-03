import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children, userType }) => {
  const { user, token } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (userType && user?.userType !== userType) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;