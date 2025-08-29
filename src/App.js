import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import GuestRoute from './components/common/GuestRoute'; // ensure correct path

// Pages
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import BarberDashboard from './pages/BarberDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import BarbersNearMe from './pages/BarbersNearMe';
import JoinQueue from './pages/JoinQueue';
import CheckQueueStatus from './pages/CheckQueueStatus';

// Barber Components
import ShopRegistration from './components/barber/ShopRegistration';
import ServiceManagement from './components/barber/ServiceManagement';

const App = () => (
  <AuthProvider>
    <Router>
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />

        {/* Guest-only routes (redirect to dashboard if already logged in) */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          }
        />

        {/* Public pages */}
        <Route path="/barbers-near-me" element={<BarbersNearMe />} />
        <Route path="/nearby-barbers" element={<BarbersNearMe />} />
        <Route path="/join-queue/:shopId" element={<JoinQueue />} />
        <Route path="/check-status" element={<CheckQueueStatus />} />

        {/* Barber routes (protected) */}
        <Route
          path="/barber/dashboard"
          element={
            <ProtectedRoute userType="barber">
              <BarberDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/barber/register-shop"
          element={
            <ProtectedRoute userType="barber">
              <ShopRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/barber/services"
          element={
            <ProtectedRoute userType="barber">
              <ServiceManagement />
            </ProtectedRoute>
          }
        />

        {/* Customer routes (protected) */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute userType="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Convenience redirects */}
        <Route path="/barber" element={<Navigate to="/barber/dashboard" replace />} />
        <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;