import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import './BarberDashboard.css';

const BarberDashboard = () => {
  const [shopData, setShopData] = useState(null);
  const [services, setServices] = useState([]);
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({
    totalServices: 0,
    currentQueue: 0,
    todayServed: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch shop data
      const shopRes = await axios.get('/barber/shop-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch services
      const servicesRes = await axios.get('/barber/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch queue if shop exists
      let queueData = [];
      if (shopRes.data.shop) {
        const queueRes = await axios.get(`/queue/${shopRes.data.shop._id}`);
        queueData = queueRes.data.queue || [];
      }
      
      setShopData(shopRes.data.shop);
      setServices(servicesRes.data.services);
      setQueue(queueData);
      
      // Calculate stats
      const currentQueue = queueData.filter(customer => customer.status === 'waiting').length;
      const todayServed = queueData.filter(customer => 
        customer.status === 'done' && 
        new Date(customer.joinedAt).toDateString() === new Date().toDateString()
      ).length;
      
      setStats({
        totalServices: servicesRes.data.services.length,
        currentQueue,
        todayServed,
        avgRating: 4.5 // You can calculate this from reviews
      });
      
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    }
    setLoading(false);
  };

  const handleNextCustomer = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/queue/next', 
        { shopId: shopData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData(); // Refresh data
      alert('Next customer called!');
    } catch (err) {
      alert('Failed to call next customer');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (!shopData) {
    return (
      <div className="no-shop-container">
        <div className="no-shop-content">
          <h2>Welcome to Your Barber Dashboard!</h2>
          <p>You haven't registered your shop yet. Let's get started!</p>
          <button 
            className="register-shop-btn"
            onClick={() => navigate('/barber/register-shop')}
          >
            Register Your Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="barber-dashboard-bg">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Welcome back, {user?.name}!</h1>
            <p>{shopData.shopName}</p>
          </div>
          <div className="header-right">
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon services-icon">📋</div>
            <div className="stat-content">
              <h3>{stats.totalServices}</h3>
              <p>Total Services</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon queue-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.currentQueue}</h3>
              <p>Current Queue</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon served-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.todayServed}</h3>
              <p>Served Today</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon rating-icon">⭐</div>
            <div className="stat-content">
              <h3>{stats.avgRating}</h3>
              <p>Avg Rating</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button 
              className="action-btn"
              onClick={() => navigate('/barber/services')}
            >
              <span className="action-icon">🛠️</span>
              Manage Services
            </button>
            
            <button 
              className="action-btn"
              onClick={() => navigate('/barber/queue')}
            >
              <span className="action-icon">📋</span>
              View Queue
            </button>
            
            <button 
              className="action-btn"
              onClick={() => navigate('/barber/shop-profile')}
            >
              <span className="action-icon">🏪</span>
              Shop Profile
            </button>
            
            <button 
              className="action-btn"
              onClick={() => navigate('/barber/reviews')}
            >
              <span className="action-icon">💬</span>
              Reviews
            </button>
          </div>
        </div>

        {/* Current Queue Section */}
        <div className="current-queue-section">
          <div className="queue-header">
            <h2>Current Queue</h2>
            {queue.filter(c => c.status === 'waiting').length > 0 && (
              <button className="next-customer-btn" onClick={handleNextCustomer}>
                Call Next Customer
              </button>
            )}
          </div>
          
          <div className="queue-container">
            {queue.length === 0 ? (
              <div className="empty-queue">
                <p>No customers in queue</p>
              </div>
            ) : (
              <div className="queue-list">
                {queue
                  .filter(customer => customer.status !== 'done')
                  .map((customer, index) => (
                    <div 
                      key={customer._id || index} 
                      className={`queue-item ${customer.status}`}
                    >
                      <div className="customer-info">
                        <div className="token-number">#{customer.token}</div>
                        <div className="customer-details">
                          <h4>{customer.name}</h4>
                          <p>{customer.phone}</p>
                        </div>
                      </div>
                      <div className="customer-status">
                        <span className={`status-badge ${customer.status}`}>
                          {customer.status === 'waiting' ? 'Waiting' : 
                           customer.status === 'serving' ? 'Serving' : 'Done'}
                        </span>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        {/* Recent Services */}
        <div className="recent-services">
          <h2>Your Services</h2>
          <div className="services-grid">
            {services.slice(0, 4).map(service => (
              <div key={service._id} className="service-card-mini">
                <img src={service.image} alt={service.title} />
                <div className="service-info">
                  <h4>{service.title}</h4>
                  <p>₹{service.price} • {service.duration} min</p>
                </div>
              </div>
            ))}
          </div>
          {services.length > 4 && (
            <button 
              className="view-all-btn"
              onClick={() => navigate('/barber/services')}
            >
              View All Services
            </button>
          )}
        </div>

        {error && <div className="dashboard-error">{error}</div>}
      </div>
    </div>
  );
};

export default BarberDashboard;