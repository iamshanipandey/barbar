import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
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
  const [actionLoading, setActionLoading] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('BarberDashboard mounted');
    console.log('User:', user);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      console.log('Fetching dashboard data...');
      
      // Fetch shop data
      const shopRes = await axios.get('/barber/shop-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Shop response:', shopRes.data);
      
      // Fetch services
      const servicesRes = await axios.get('/barber/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Services response:', servicesRes.data);
      
      // Fetch queue if shop exists
      let queueData = [];
      if (shopRes.data.shop) {
        try {
          const queueRes = await axios.get(`/queue/${shopRes.data.shop._id}`);
          queueData = queueRes.data.queue || [];
          console.log('Queue data:', queueData);
          
          // Log the structure of the first customer to understand the data
          if (queueData.length > 0) {
            console.log('First customer structure:', queueData[0]);
            console.log('Customer keys:', Object.keys(queueData[0]));
          }
        } catch (queueErr) {
          console.log('No queue data found or error:', queueErr.message);
        }
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
        avgRating: 4.5
      });
      
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      if (err.response?.status === 401) {
        setError('Please login again');
        navigate('/login');
      } else {
        setError('Failed to load dashboard data');
      }
    }
    setLoading(false);
  };

  const getCustomerId = (customer) => {
    // Try different possible ID fields
    const possibleIds = [
      customer._id,
      customer.id,
      customer.user?._id,
      customer.user?.id,
      customer.userId,
      customer.customerId
    ];
    
    // Find the first non-null ID
    const customerId = possibleIds.find(id => id != null);
    
    console.log('Customer object:', customer);
    console.log('Possible IDs:', possibleIds);
    console.log('Selected ID:', customerId);
    
    return customerId;
  };

  const handleNextCustomer = async () => {
    if (actionLoading) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('/queue/next', 
        { shopId: shopData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchDashboardData();
      alert('Next customer called!');
    } catch (err) {
      console.error('Next customer error:', err);
      alert('Failed to call next customer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDone = async (customer) => {
    if (actionLoading) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const customerId = getCustomerId(customer);
      
      if (!customerId) {
        alert('Unable to identify customer. Please refresh and try again.');
        return;
      }
      
      console.log('Marking done - Customer ID:', customerId);
      
      await axios.post('/queue/markdone', 
        { 
          shopId: shopData._id, 
          customerId: customerId.toString() // Ensure it's a string
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchDashboardData();
      alert('Customer marked as done!');
    } catch (err) {
      console.error('Mark done error:', err);
      alert(err.response?.data?.message || 'Failed to mark customer as done');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveToLast = async (customer) => {
    if (actionLoading) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const customerId = getCustomerId(customer);
      
      if (!customerId) {
        alert('Unable to identify customer. Please refresh and try again.');
        return;
      }
      
      console.log('Moving to last - Customer ID:', customerId);
      
      await axios.post('/queue/move-to-last', 
        { 
          shopId: shopData._id, 
          customerId: customerId.toString() // Ensure it's a string
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchDashboardData();
      alert('Customer moved to last position!');
    } catch (err) {
      console.error('Move to last error:', err);
      alert(err.response?.data?.message || 'Failed to move customer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveCustomer = async (customer) => {
    if (actionLoading) return;
    
    if (window.confirm('Are you sure you want to remove this customer from queue?')) {
      try {
        setActionLoading(true);
        const token = localStorage.getItem('token');
        const customerId = getCustomerId(customer);
        
        if (!customerId) {
          alert('Unable to identify customer. Please refresh and try again.');
          return;
        }
        
        console.log('Removing customer - Customer ID:', customerId);
        
        await axios.post('/queue/skip', 
          { 
            shopId: shopData._id, 
            customerId: customerId.toString() // Ensure it's a string
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        await fetchDashboardData();
        alert('Customer removed from queue!');
      } catch (err) {
        console.error('Remove customer error:', err);
        alert(err.response?.data?.message || 'Failed to remove customer');
      } finally {
        setActionLoading(false);
      }
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
              onClick={() => navigate('/barber/register-shop')}
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
    {queue.filter(c => c.status === 'waiting').length > 0 && 
     !queue.some(c => c.status === 'serving') && (
      <button 
        className="next-customer-btn" 
        onClick={handleNextCustomer}
        disabled={actionLoading}
      >
        {actionLoading ? 'Processing...' : 'Call Next Customer'}
      </button>
    )}
  </div>
  
  <div className="queue-container">
    {queue.filter(c => c.status === 'waiting' || c.status === 'serving').length === 0 ? (
      <div className="empty-queue">
        <p>No customers in queue</p>
      </div>
    ) : (
      <div className="queue-list">
        {/* Show currently serving customer first */}
        {queue
          .filter(customer => customer.status === 'serving')
          .map((customer, index) => (
            <div 
              key={customer._id || customer.id || index} 
              className={`queue-item serving`}
            >
              <div className="customer-info">
                <div className="token-number">#{customer.token || index + 1}</div>
                <div className="customer-details">
                  <h4>{customer.name || 'Unknown'}</h4>
                  <p>{customer.phone || 'No phone'}</p>
                  <span className="status-badge serving">Currently Serving</span>
                </div>
              </div>
              <div className="customer-actions">
                <button 
                  className="action-btn-small done-btn"
                  onClick={() => handleMarkDone(customer)}
                  disabled={actionLoading}
                  title="Mark as Done"
                >
                  ✅ Done
                </button>
                {/* <button 
                  className="action-btn-small move-btn"
                  onClick={() => handleMoveToLast(customer)}
                  disabled={actionLoading}
                  title="Move to Last"
                >
                  ↓ Move
                </button> */}
                <button 
                  className="action-btn-small remove-btn"
                  onClick={() => handleRemoveCustomer(customer)}
                  disabled={actionLoading}
                  title="Remove from Queue"
                >
                  ❌ Remove
                </button>
              </div>
            </div>
          ))
        }
        
        {/* Show waiting customers */}
        {queue
          .filter(customer => customer.status === 'waiting')
          .map((customer, index) => (
            <div 
              key={customer._id || customer.id || index} 
              className={`queue-item waiting`}
            >
              <div className="customer-info">
                <div className="token-number">#{customer.token || index + 1}</div>
                <div className="customer-details">
                  <h4>{customer.name || 'Unknown'}</h4>
                  <p>{customer.phone || 'No phone'}</p>
                  <span className="status-badge waiting">Waiting</span>
                </div>
              </div>
              {/* No action buttons for waiting customers */}
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