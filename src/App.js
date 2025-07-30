import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Signup from './pages/Signup';
import Login from './pages/Login';
import BarberDashboard from './pages/BarberDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Home from './pages/Home';
import Navbar from './components/common/Navbar';

const App = () => (
  <AuthProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/barber/dashboard" element={<BarberDashboard />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
