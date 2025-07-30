import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="home-page">
    <h1>Welcome to Barber Booking App</h1>
    <p><Link to="/signup">Sign Up</Link> or <Link to="/login">Login</Link> to get started.</p>
  </div>
);

export default Home; 