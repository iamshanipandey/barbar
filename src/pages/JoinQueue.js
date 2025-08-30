import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import './JoinQueue.css';

const JoinQueue = () => {
  const { shopId } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [shopData, setShopData] = useState(null);
  const [services, setServices] = useState([]);
  const [queueData, setQueueData] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenNumber, setTokenNumber] = useState(null);

  useEffect(() => {
    if (!token) {
      setCustomerInfo({ name: '', phone: '' });
    }
    fetchShopData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId, token, user]);

  const fetchShopData = async () => {
    try {
        const shopRes = await axios.get(`/customer/barber/${shopId}`);
        setShopData(shopRes.data.shop);
        setServices(shopRes.data.shop.services || []);

        try {
          const queueRes = await axios.get(`/queue/${shopId}`);
          setQueueData(queueRes.data.queue || []);
        } catch (queueErr) {
          console.warn('Queue not found, setting empty queue');
          setQueueData([]);
        }
  } catch (err) {
          setError('Failed to load shop details');
        }
      setLoading(false);

  };

  const calculateWaitingTime = () => {
    const waitingCustomers = queueData.filter(customer => customer.status === 'waiting');
    const servingCustomer = queueData.find(customer => customer.status === 'serving');
    const avgServiceTime = 30; // minutes
    let totalWaitTime = 0;
    if (servingCustomer) totalWaitTime += 15;
    totalWaitTime += waitingCustomers.length * avgServiceTime;
    return totalWaitTime;
  };

  const handleInputChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleJoinQueue = async (e) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.phone) {
      setError('Please fill in your name and phone number');
      return;
    }
    if (!selectedService) {
      setError('Please select a service');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await axios.post('/queue/join', {
        shopId,
        name: customerInfo.name,
        phone: customerInfo.phone,
        serviceId: selectedService
      });
      setTokenNumber(response.data.token);
      setSuccess(true);
      fetchShopData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join queue');
    }
    setSubmitting(false);
  };

  const handleServiceKeyDown = (e, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedService(id);
    }
  };

  if (loading) {
    return (
      <div className="join-queue-loading">
        <div className="loading-spinner"></div>
        <p>Loading shop details...</p>
      </div>
    );
  }

  if (!shopData) {
    return (
      <div className="join-queue-error">
        <h2>Shop not found</h2>
        <button onClick={() => navigate('/barbers-near-me')} className="back-btn">
          Back to Search
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="join-queue-bg">
        <div className="success-container">
          <div className="success-card">
            <div className="success-icon">🎉</div>
            <h2>Successfully Joined Queue!</h2>
            <div className="token-display">
              <span className="token-label">Your Token Number</span>
              <span className="token-number">#{tokenNumber}</span>
            </div>
            
            <div className="queue-info">
              <div className="info-item">
                <span className="info-icon">👥</span>
                <span className="info-text">{queueData.filter(c => c.status === 'waiting').length} people ahead</span>
              </div>
              <div className="info-item">
                <span className="info-icon">⏱️</span>
                <span className="info-text">~{calculateWaitingTime()} min wait</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🏪</span>
                <span className="info-text">{shopData.shopName}</span>
              </div>
            </div>

            <div className="success-actions">
              <Link to={`/check-status`}>
                <button className="track-queue-btn"
                
              >
                Track Queue Status
              </button>
              </Link>
              
              <button 
                className="back-home-btn"
                onClick={() => navigate('/barbers-near-me')}
              >
                Find More Shops
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="join-queue-bg">
      <div className="join-queue-container">
        {/* Shop Header */}
        <div className="shop-header-section">
          <div className="shop-image-container">
            <img src={shopData.profilePic} alt={shopData.shopName} className="shop-image" />
          </div>
          
          <div className="shop-info">
            <h1 className="shop-name">{shopData.shopName}</h1>
            <p className="shop-owner">by {shopData.ownerName}</p>
            <p className="shop-address">{shopData.address}, {shopData.city}</p>
            <div className="shop-timing">
              <span className="timing-icon">🕒</span>
              <span>{shopData.timings.open} - {shopData.timings.close}</span>
            </div>
          </div>
        </div>

        {/* Current Queue Status */}
        <div className="current-queue-section">
          <h2 className="section-title">
            <span className="title-icon">👥</span>
            Current Queue Status
          </h2>
          
          <div className="queue-stats-grid">
            <div className="queue-stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-number">{queueData.filter(c => c.status === 'waiting').length}</div>
              <div className="stat-label">People Waiting</div>
            </div>
            
            <div className="queue-stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-number">~{calculateWaitingTime()}</div>
              <div className="stat-label">Minutes Wait</div>
            </div>
            
            <div className="queue-stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-number">{queueData.find(c => c.status === 'serving') ? '1' : '0'}</div>
              <div className="stat-label">Currently Serving</div>
            </div>
          </div>
        </div>

        {/* Join Queue Form */}
        <div className="join-form-section">
          <h2 className="section-title">
            <span className="title-icon">📝</span>
            Join the Queue
          </h2>
          
          <form className="join-queue-form" onSubmit={handleJoinQueue}>
            {/* Customer Information */}
            <div className="form-group">
              <h3 className="group-title">Your Information</h3>
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Service Selection (TEXT ONLY: Name + Duration) */}
            <div className="form-group">
              <h3 className="group-title">Select Service</h3>
              <div className="services-grid services-grid--list">
                {services.map((service) => (
                  <div
                    key={service._id}
                    className={`service-card simple ${selectedService === service._id ? 'selected' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedService(service._id)}
                    onKeyDown={(e) => handleServiceKeyDown(e, service._id)}
                    aria-pressed={selectedService === service._id}
                  >
                    <div className="service-text">
                      <h4 className="service-title">{service.title}</h4>
                    </div>
                    <div className="service-right">
                      <span className="service-duration-chip">
                        {service.duration} min
                      </span>
                      <div className="radio-button">
                        {selectedService === service._id && <div className="radio-dot"></div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="join-queue-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="btn-spinner"></div>
                    Joining Queue...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🎯</span>
                    Join Queue Now
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Back Button */}
        <div className="back-section">
          <button 
            className="back-to-search-btn"
            onClick={() => navigate('/barbers-near-me')}
          >
            <span className="back-icon">←</span>
            Back to Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinQueue;