import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import './BarbersNearMe.css';

const BarbersNearMe = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [filteredBarbers, setFilteredBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [queueData, setQueueData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    if (searchCity.trim() === '') {
      setFilteredBarbers(barbers);
    } else {
      const filtered = barbers.filter(barber => 
        barber.city.toLowerCase().includes(searchCity.toLowerCase()) ||
        barber.shopName.toLowerCase().includes(searchCity.toLowerCase()) ||
        barber.ownerName.toLowerCase().includes(searchCity.toLowerCase())
      );
      setFilteredBarbers(filtered);
    }
  }, [searchCity, barbers]);

  const fetchBarbers = async () => {
    try {
      const response = await axios.get('/customer/barbers-near-me');
      setBarbers(response.data.barbers);
      setFilteredBarbers(response.data.barbers);
    } catch (err) {
      setError('Failed to fetch barber shops');
      console.error('Error fetching barbers:', err);
    }
    setLoading(false);
  };

  const fetchQueueData = async (shopId) => {
    try {
      const response = await axios.get(`/queue/${shopId}`);
      return response.data.queue || [];
    } catch (err) {
      console.error('Error fetching queue:', err);
      return [];
    }
  };

  const calculateWaitingTime = (queue) => {
    const waitingCustomers = queue.filter(customer => customer.status === 'waiting');
    const servingCustomer = queue.find(customer => customer.status === 'serving');
    
    const avgServiceTime = 30;
    let totalWaitTime = 0;
    
    if (servingCustomer) {
      totalWaitTime += 15;
    }
    
    totalWaitTime += waitingCustomers.length * avgServiceTime;
    
    return totalWaitTime;
  };

  const getAverageRating = (shopId) => {
    return (Math.random() * 2 + 3).toFixed(1);
  };

  const handleViewDetails = async (barber) => {
    setLoading(true);
    try {
      const queue = await fetchQueueData(barber.shopId);
      setQueueData(queue);
      setSelectedBarber(barber);
      setShowModal(true);
    } catch (err) {
      setError('Failed to fetch shop details');
    }
    setLoading(false);
  };

  const handleJoinQueue = (shopId) => {
    navigate(`/join-queue/${shopId}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBarber(null);
    setQueueData([]);
  };

  if (loading && barbers.length === 0) {
    return (
      <div className="barbers-loading">
        <div className="loading-spinner"></div>
        <p>Finding barber shops near you...</p>
      </div>
    );
  }

  return (
    <div className="barbers-near-me-bg">
      <div className="barbers-container">
        {/* Header Section */}
        <div className="barbers-header">
          <h1 className="barbers-title">Barber Shops Near You</h1>
          <p className="barbers-subtitle">Find the best barber shops in your area</p>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by city, shop name, or owner..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info">
          <p>{filteredBarbers.length} barber shops found</p>
        </div>

        {/* Barber Shops Grid */}
        <div className="barbers-grid">
          {filteredBarbers.length === 0 ? (
            <div className="no-barbers">
              <h3>No barber shops found</h3>
              <p>Try searching with different keywords</p>
            </div>
          ) : (
            filteredBarbers.map((barber) => (
              <div key={barber.shopId} className="barber-card">
                <div className="card-image-container">
                  <img src={barber.profilePic} alt={barber.shopName} className="barber-image" />
                  <div className={`status-badge ${
                    barber.services.length > 5 ? 'busy' : 
                    barber.services.length > 2 ? 'moderate' : 'available'
                  }`}>
                    {barber.services.length > 5 ? 'Busy' : 
                     barber.services.length > 2 ? 'Moderate' : 'Available'}
                  </div>
                  <div className="rating-badge">
                    ⭐ {getAverageRating(barber.shopId)}
                  </div>
                </div>

                <div className="card-content">
                  <h3 className="shop-name" title={barber.shopName}>
                    {barber.shopName.length > 25 ? barber.shopName.substring(0, 25) + '...' : barber.shopName}
                  </h3>
                  <p className="shop-address" title={`${barber.address}, ${barber.city}`}>
                    {`${barber.address}, ${barber.city}`.length > 40 ? 
                     `${barber.address}, ${barber.city}`.substring(0, 40) + '...' : 
                     `${barber.address}, ${barber.city}`}
                  </p>

                  <div className="info-row">
                    <span className="info-item">🕒 {barber.timings.open} - {barber.timings.close}</span>
                    <span className="info-item">👥 {barber.queueCount || 0} in queue</span>
                  </div>

                  <div className="services-preview" title={barber.services.map(s => s.title).join(', ')}>
                    Services: {barber.services.slice(0, 3).map(s => s.title).join(', ')}
                    {barber.services.length > 3 ? ` +${barber.services.length - 3} more` : ''}
                  </div>

                  <div className="buttons-container">
                    <button className="view-details-btn" onClick={() => handleViewDetails(barber)}>
                      View Details
                    </button>
                    <button className="join-queue-btn" onClick={() => handleJoinQueue(barber.shopId)}>
                      Join Queue
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Shop Details Modal */}
      {showModal && selectedBarber && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedBarber.shopName}</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="shop-details-grid">
                {/* Shop Info */}
                <div className="shop-info-section">
                  <img src={selectedBarber.profilePic} alt={selectedBarber.shopName} className="modal-shop-image" />
                  <div className="shop-basic-info">
                    <h3>Shop Information</h3>
                    <p><strong>Owner:</strong> {selectedBarber.ownerName}</p>
                    <p><strong>Address:</strong> {selectedBarber.address}, {selectedBarber.city}</p>
                    <p><strong>Timings:</strong> {selectedBarber.timings.open} - {selectedBarber.timings.close}</p>
                    <p><strong>Rating:</strong> ⭐ {getAverageRating(selectedBarber.shopId)} (4.5/5)</p>
                  </div>
                </div>

                {/* Queue Status */}
                <div className="queue-status-section">
                  <h3>Current Queue Status</h3>
                  <div className="queue-stats">
                    <div className="queue-stat">
                      <span className="stat-number">{queueData.filter(c => c.status === 'waiting').length}</span>
                      <span className="stat-label">People Waiting</span>
                    </div>
                    <div className="queue-stat">
                      <span className="stat-number">{calculateWaitingTime(queueData)} min</span>
                      <span className="stat-label">Expected Wait</span>
                    </div>
                    <div className="queue-stat">
                      <span className="stat-number">
                        {queueData.find(c => c.status === 'serving') ? '1' : '0'}
                      </span>
                      <span className="stat-label">Currently Serving</span>
                    </div>
                  </div>
                  
                  {queueData.length > 0 && (
                    <div className="queue-preview">
                      <h4>Queue Preview</h4>
                      <div className="queue-list-modal">
                        {queueData.slice(0, 5).map((customer, index) => (
                          <div key={index} className="queue-item-modal">
                            <span className="token">#{customer.token}</span>
                            <span className="status">{customer.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Services */}
              <div className="services-section">
                <h3>Services Offered</h3>
                <div className="services-grid-modal">
                  {selectedBarber.services.map((service, index) => (
                    <div key={index} className="service-card-modal">
                      <img src={service.image} alt={service.title} />
                      <div className="service-details">
                        <h4>{service.title}</h4>
                        <p>{service.description}</p>
                        <div className="service-price-duration">
                          <span className="price">₹{service.price}</span>
                          <span className="duration">{service.duration} min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="join-queue-modal-btn"
                onClick={() => {
                  closeModal();
                  handleJoinQueue(selectedBarber.shopId);
                }}
              >
                Join Queue Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarbersNearMe;