import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      {!user && <><Link to="/signup">Signup</Link> <Link to="/login">Login</Link></>}
      {user && user.userType === 'barber' && <Link to="/barber/dashboard">Barber Dashboard</Link>}
      {user && user.userType === 'customer' && <Link to="/customer/dashboard">Customer Dashboard</Link>}
      {user && <button onClick={handleLogout}>Logout</button>}
    </nav>
  );
};

export default Navbar; 