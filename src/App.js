import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Signup from './pages/Signup';
import Login from './pages/Login';
import BarberDashboard from './pages/BarberDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Home from './pages/Home';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import BarbersNearMe from './pages/BarbersNearMe';
import JoinQueue from './pages/JoinQueue';

// Barber Components
import ShopRegistration from './components/barber/ShopRegistration';
import ServiceManagement from './components/barber/ServiceManagement';

const App = () => (
  <AuthProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/barbers-near-me" element={<BarbersNearMe />} />
        <Route path="/nearby-barbers" element={<BarbersNearMe />} />
        <Route path="/join-queue/:shopId" element={<JoinQueue />} />

        {/* Barber Routes */}
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
        
        {/* Customer Routes */}
        <Route 
          path="/customer/dashboard" 
          element={
            <ProtectedRoute userType="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;