import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, token, logout } = useContext(AuthContext);
  const [isLoggedIn, setLogged] = useState(false);
  const [userType, setUserType] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const navbarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Sync with AuthContext
    if (token && user) {
      setLogged(true);
      setUserType(user.userType);
    } else {
      setLogged(false);
      setUserType("");
    }

    // Scroll hide/show effect
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const isScrollingDown = prevScrollPos < currentScrollPos;
      const isScrollingUp = prevScrollPos > currentScrollPos;
      const isScrolledPastThreshold = currentScrollPos > 100;

      if (isScrollingUp || currentScrollPos < 50) {
        setVisible(true);
      } else if (isScrollingDown && isScrolledPastThreshold) {
        setVisible(false);
        setIsMenuOpen(false);
      }

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos, token, user]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Handle logout
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Desktop menu
  const renderDesktopMenu = () => (
    <div className="nav-buttons desktop-menu">
      {isLoggedIn ? (
        userType === "barber" ? (
          <>
            <button 
              onClick={() => handleNavigation('/barber/dashboard')} 
              className="nav-btn near-me-btn"
            >
              <span className="btn-icon">📊</span>
              Dashboard
            </button>
            <div className="dropdown">
              <button className="nav-btn login-btn dropdown-toggle">
                <span className="btn-icon">💈</span>
                My Shop
              </button>
              <div className="dropdown-menu">
                <button onClick={() => handleNavigation('/barber/services')}>Services</button>
                <button onClick={() => handleNavigation('/barber/register-shop')}>Shop Profile</button>
                <button onClick={() => handleNavigation('/barber/reviews')}>Reviews</button>
                <button onClick={handleLogout} className="logout-option">Logout</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <button 
              onClick={() => handleNavigation('/barbers-near-me')} 
              className="nav-btn near-me-btn"
            >
              <span className="btn-icon">📍</span>
              Near Me
            </button>

            {/* Track Queue visible for non-barber */}
            <button 
              onClick={() => handleNavigation('/check-status')}
              className="nav-btn track-queue-btn"
            >
              <span className="btn-icon">⏱️</span>
              Track Queue
            </button>

            <div className="dropdown">
              <button className="nav-btn login-btn dropdown-toggle">
                <span className="btn-icon">👤</span>
                My Account
              </button>
              <div className="dropdown-menu">
                <button onClick={() => handleNavigation('/customer/dashboard')}>Dashboard</button>
                {/* Fixed route to /check-status */}
                <button onClick={() => handleNavigation('/check-status')}>My Queue</button>
                <button onClick={() => handleNavigation('/customer/my-reviews')}>Reviews</button>
                <button onClick={handleLogout} className="logout-option">Logout</button>
              </div>
            </div>
          </>
        )
      ) : (
        <>
          <button 
            onClick={() => handleNavigation('/barbers-near-me')} 
            className="nav-btn near-me-btn"
          >
            <span className="btn-icon">📍</span>
            Near Me
          </button>

          {/* Track Queue for guests */}
          <button 
            onClick={() => handleNavigation('/check-status')} 
            className="nav-btn track-queue-btn"
          >
            <span className="btn-icon">⏱️</span>
            Track Queue
          </button>

          <button 
            onClick={() => handleNavigation('/login')} 
            className="nav-btn login-btn"
          >
            <span className="btn-icon">🔑</span>
            Login
          </button>
          <button 
            onClick={() => handleNavigation('/signup')} 
            className="nav-btn signup-btn"
          >
            <span className="btn-icon">✨</span>
            Sign Up
          </button>
        </>
      )}
    </div>
  );

  // Mobile menu
  const renderMobileMenu = () => (
    <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
      {isLoggedIn ? (
        userType === "barber" ? (
          <>
            <button 
              onClick={() => handleNavigation('/barber/dashboard')} 
              className="mobile-link"
            >
              <span className="mobile-icon">📊</span>
              Dashboard
            </button>
            <button 
              onClick={() => handleNavigation('/barber/services')} 
              className="mobile-link"
            >
              <span className="mobile-icon">💈</span>
              My Services
            </button>
            <button 
              onClick={() => handleNavigation('/barber/register-shop')} 
              className="mobile-link"
            >
              <span className="mobile-icon">🏪</span>
              My Shop
            </button>
            <button 
              onClick={() => handleNavigation('/barber/reviews')} 
              className="mobile-link"
            >
              <span className="mobile-icon">⭐</span>
              Reviews
            </button>
            <button onClick={handleLogout} className="mobile-link logout">
              <span className="mobile-icon">🚪</span>
              Logout
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => handleNavigation('/barbers-near-me')} 
              className="mobile-link"
            >
              <span className="mobile-icon">📍</span>
              Near Me
            </button>

            {/* Track Queue for non-barber */}
            <button 
              onClick={() => handleNavigation('/check-status')} 
              className="mobile-link"
            >
              <span className="mobile-icon">⏱️</span>
              Track Queue
            </button>

            <button 
              onClick={() => handleNavigation('/customer/dashboard')} 
              className="mobile-link"
            >
              <span className="mobile-icon">📊</span>
              Dashboard
            </button>
            {/* Fixed My Queue route */}
            <button 
              onClick={() => handleNavigation('/check-status')} 
              className="mobile-link"
            >
              <span className="mobile-icon">⏱️</span>
              My Queue
            </button>
            <button 
              onClick={() => handleNavigation('/customer/my-reviews')} 
              className="mobile-link"
            >
              <span className="mobile-icon">⭐</span>
              My Reviews
            </button>
            <button onClick={handleLogout} className="mobile-link logout">
              <span className="mobile-icon">🚪</span>
              Logout
            </button>
          </>
        )
      ) : (
        <>
          <button 
            onClick={() => handleNavigation('/barbers-near-me')} 
            className="mobile-link"
          >
            <span className="mobile-icon">📍</span>
            Near Me
          </button>
          {/* Track Queue for guests */}
          <button 
            onClick={() => handleNavigation('/check-status')} 
            className="mobile-link"
          >
            <span className="mobile-icon">⏱️</span>
            Track Queue
          </button>
          <button 
            onClick={() => handleNavigation('/login')} 
            className="mobile-link"
          >
            <span className="mobile-icon">🔑</span>
            Login
          </button>
          <button 
            onClick={() => handleNavigation('/signup')} 
            className="mobile-link highlight"
          >
            <span className="mobile-icon">✨</span>
            Sign Up
          </button>
        </>
      )}
    </div>
  );

  return (
    <nav 
      className={`navbar ${!visible ? 'navbar-hidden' : ''} ${isMenuOpen ? 'menu-open' : ''}`}
      ref={navbarRef}
    >
      {/* Logo */}
      <div className="navbar-logo">
        <button onClick={() => handleNavigation('/')} className="logo-link">
          <div className="logo-container">
            <span className="logo-text">QueueCuts</span>
          </div>
        </button>
      </div>

      {/* Desktop Menu */}
      <div className="nav-buttons desktop-only">
        {renderDesktopMenu()}
      </div>

      {/* Mobile Menu Button */}
      <div className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Mobile Menu */}
      <div className="mobile-only">
        {isMenuOpen && renderMobileMenu()}
      </div>
    </nav>
  );
}

export default Navbar;