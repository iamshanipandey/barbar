import React, { useState } from 'react';
import axios from '../api/axios';
import './CheckQueueStatus.css';

const CheckQueueStatus = () => {
  const [phone, setPhone] = useState('');
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setQueueData(null);
    
    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`/queue/status/${phone}`);
      setQueueData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch queue status');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPhone('');
    setQueueData(null);
    setError('');
  };

  // Get currently serving customer's token from queue
  const getCurrentServingToken = () => {
    if (!queueData) return null;
    
    // If someone is actually being served
    if (queueData.currentServingToken) {
      return queueData.currentServingToken;
    }
    
    // If no one is being served but there's a queue, show the first person
    // (This matches BarberDashboard behavior)
    if (queueData.token && queueData.position > 0) {
      // Calculate first person's token (current token - position + 1)
      const firstToken = queueData.token - queueData.position + 1;
      return firstToken > 0 ? firstToken : null;
    }
    
    return null;
  };

  // Visual queue representation
  const renderVisualQueue = () => {
    if (!queueData) return null;

    const { position, peopleAhead } = queueData;
    const currentServingToken = getCurrentServingToken();
    const visualQueue = [];

    // Currently being served (only if someone is being served)
    if (currentServingToken) {
      visualQueue.push(
        <div key="serving" className="queue-person serving">
          <div className="person-avatar">
            <i className="fas fa-user-check">#{currentServingToken}</i>
          </div>
          <div className="person-info">
            <span className="token">#{currentServingToken}</span>
            <span className="status-text">Being Served</span>
          </div>
        </div>
      );
    }

 

    // Current user
    if (queueData.status !== 'serving') {
      visualQueue.push(
        <div key="user" className="queue-person current-user">
          <div className="person-avatar pulse">
            <i className="fas fa-user">#{queueData.token}</i>
          </div>
          <div className="person-info">
        <span className="you-badge">{queueData.customerName}</span>
          </div>
        </div>
      );
    }

    return visualQueue;
  };

  return (
    <div className="queue-status-bg">
      <div className="queue-status-container">
        <div className="queue-header">
          <i className="fas fa-users"></i>
          Check Your Queue Status
        </div>

        <form className="queue-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Mobile Number</label>
            <input
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength="10"
              required
            />
          </div>

          <button type="submit" className="check-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Checking...
              </>
            ) : (
              <>
                <i className="fas fa-search"></i> Check Status
              </>
            )}
          </button>

          {error && <div className="queue-error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>}
        </form>

        {queueData && (
          <div className="queue-result">
            <div className="shop-info-header">
              <h4>{queueData.shopName}</h4>
              <p>{queueData.shopAddress}</p>
            </div>

            {/* Main Status Display */}
            <div className="main-status">
              <div className="customer-greeting">
                <h3>Hello, {queueData.customerName}!</h3>
              </div>

              <div className="current-serving">
                <div className="serving-info">
                  <i className="fas fa-bell"></i>
                  <span>Currently Serving</span>
                  <div className="serving-token">
                    {getCurrentServingToken() ? 
                      `Token #${getCurrentServingToken()}` : 
                      'No one being served'
                    }
                  </div>
                </div>
              </div>

              {queueData.status === 'serving' ? (
                <div className="your-turn-alert">
                  <i className="fas fa-hand-point-right"></i>
                  <h2>It's Your Turn!</h2>
                  <p>Please proceed to the counter</p>
                </div>
              ) : (
                <>
                  <div className="position-display">
                    <div className="position-card">
                      <div className="position-number">{queueData.position}</div>
                      <div className="position-label">Your Position</div>
                    </div>
                    <div className="arrow-right">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                    <div className="wait-card">
                      <div className="wait-time">{queueData.estimatedWaitTime}</div>
                      <div className="wait-label">Minutes Wait</div>
                    </div>
                  </div>

                  <div className="people-ahead">
                    <i className="fas fa-users"></i>
                    <span>{queueData.peopleAhead} people ahead of you</span>
                  </div>
                </>
              )}
            </div>

            {/* Visual Queue */}
            <div className="visual-queue-container">
              <h4>Queue Visualization</h4>
              <div className="visual-queue">
                {renderVisualQueue()}
              </div>
            </div>

            {/* Additional Details */}
            <div className="additional-details">
              <div className="detail-row">
                <i className="fas fa-ticket-alt"></i>
                <span>Your Token: #{queueData.token}</span>
              </div>
              {queueData.service && (
                <div className="detail-row">
                  <i className="fas fa-cut"></i>
                  <span>Service: {queueData.service}</span>
                </div>
              )}
            </div>

            <button className="reset-btn" onClick={handleReset}>
              <i className="fas fa-redo"></i> Check Another Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckQueueStatus;