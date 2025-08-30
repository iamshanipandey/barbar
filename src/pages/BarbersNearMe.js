import React, { useState, useEffect, useMemo } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import './BarbersNearMe.css';

const toRad = (v) => (v * Math.PI) / 180;
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  if ([lat1, lon1, lat2, lon2].some((n) => typeof n !== 'number')) return null;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
};

const applySearchFilter = (list, q) => {
  if (!q?.trim()) return list;
  const s = q.toLowerCase();
  return list.filter(
    (b) =>
      b?.city?.toLowerCase().includes(s) ||
      b?.shopName?.toLowerCase().includes(s) ||
      b?.ownerName?.toLowerCase().includes(s)
  );
};

const BarbersNearMe = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(true);
  const [error, setError] = useState('');
  const [locError, setLocError] = useState('');

  const [searchCity, setSearchCity] = useState('');
  const [filteredBarbers, setFilteredBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [queueData, setQueueData] = useState([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [ratings, setRatings] = useState({});

  // NEW: Queue data map for all barbers
  const [queueDataMap, setQueueDataMap] = useState({});
  const [queueMapLoading, setQueueMapLoading] = useState(false);

  const [coords, setCoords] = useState(null); // {lat, lng}
  const [radiusKm, setRadiusKm] = useState(5);
  const [customRadius, setCustomRadius] = useState(5);

  const navigate = useNavigate();

  useEffect(() => {
    detectLocationAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // apply search on the currently loaded (already radius-filtered) barbers
    setFilteredBarbers(applySearchFilter(barbers, searchCity));
  }, [searchCity, barbers]);

  // NEW: Fetch queue data for all filtered barbers
  useEffect(() => {
    if (filteredBarbers.length > 0) {
      fetchAllQueues();
    }
  }, [filteredBarbers]);

  // NEW: Function to fetch all queue data
  const fetchAllQueues = async () => {
    setQueueMapLoading(true);
    const queueMap = {};
    
    // Fetch in parallel for better performance
    const promises = filteredBarbers.map(async (barber) => {
      try {
        const queue = await fetchQueueData(barber.shopId);
        return { shopId: barber.shopId, queue };
      } catch (err) {
        return { shopId: barber.shopId, queue: [] };
      }
    });

    const results = await Promise.all(promises);
    
    results.forEach(({ shopId, queue }) => {
      queueMap[shopId] = queue;
    });

    setQueueDataMap(queueMap);
    setQueueMapLoading(false);
  };

  const detectLocationAndFetch = () => {
    setDetecting(true);
    setLocError('');
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported on this device.');
      setDetecting(false);
      // Fallback: fetch without location (backend may return all)
      fetchBarbersByRadius(null, null, radiusKm);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        fetchBarbersByRadius(lat, lng, radiusKm);
        setDetecting(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocError('Location access denied. You can still search manually.');
        setDetecting(false);
        // Fallback: fetch without location (backend may return all)
        fetchBarbersByRadius(null, null, radiusKm);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const fetchBarbersByRadius = async (lat, lng, radius) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (typeof lat === 'number' && typeof lng === 'number') {
        params.lat = lat;
        params.lng = lng;
        params.radiusKm = radius;
      }
      const response = await axios.get('/customer/barbers-near-me', { params });
      let list = response?.data?.barbers || [];

      // Compute distance if backend didn't supply it
      if (typeof lat === 'number' && typeof lng === 'number') {
        list = list.map((b) => {
          const serverDistance = typeof b.distanceKm === 'number' ? b.distanceKm : null;
          let distanceKm = serverDistance;
          if (distanceKm == null) {
            const [blng, blat] = b?.location?.coordinates || [];
            if (typeof blat === 'number' && typeof blng === 'number') {
              distanceKm = haversineDistance(lat, lng, blat, blng);
            }
          }
          return { ...b, distanceKm };
        });

        // If backend didn't filter, filter on client
        list = list.filter((b) => (b.distanceKm == null ? true : b.distanceKm <= radius));
        // Sort by distance
        list.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
      }

      setBarbers(list);
      setFilteredBarbers(applySearchFilter(list, searchCity));

      // stable random ratings per shopId
      setRatings((prev) => {
        const next = { ...prev };
        list.forEach((b) => {
          if (b?.shopId != null && next[b.shopId] == null) {
            next[b.shopId] = (Math.random() * 2 + 3).toFixed(1);
          }
        });
        return next;
      });
    } catch (err) {
      console.error('Error fetching barbers:', err);
      setError('Failed to fetch barber shops');
    } finally {
      setLoading(false);
    }
  };

  const changeRadius = (r) => {
    const val = Math.max(1, Math.min(Number(r) || 5, 50));
    setRadiusKm(val);
    if (coords?.lat && coords?.lng) {
      fetchBarbersByRadius(coords.lat, coords.lng, val);
    } else {
      detectLocationAndFetch();
    }
  };

  const reDetectLocation = () => {
    detectLocationAndFetch();
  };

  const fetchQueueData = async (shopId) => {
    try {
      const response = await axios.get(`/queue/${shopId}`);
      return response?.data?.queue || [];
    } catch (err) {
      console.error('Error fetching queue:', err);
      return [];
    }
  };

  const calculateWaitingTime = (queue) => {
    const waitingCustomers = (queue || []).filter((c) => normalizeStatus(c?.status) === 'waiting');
    const servingCustomer = (queue || []).find((c) => normalizeStatus(c?.status) === 'serving');

    const avgServiceTime = 30; // minutes
    let totalWaitTime = 0;

    if (servingCustomer) {
      totalWaitTime += 15; // assume half done
    }

    totalWaitTime += waitingCustomers.length * avgServiceTime;
    return totalWaitTime;
  };

  const handleViewDetails = async (barber) => {
    setSelectedBarber(barber);
    setShowModal(true);
    setQueueData([]);
    setQueueLoading(true);
    const queue = await fetchQueueData(barber.shopId);
    setQueueData(queue);
    setQueueLoading(false);
  };

  const handleJoinQueue = (shopId) => {
    navigate(`/join-queue/${shopId}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBarber(null);
    setQueueData([]);
    setQueueLoading(false);
  };

  const onCardKeyDown = (e, barber) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleViewDetails(barber);
    }
  };

  // Helpers for queue preview
  const normalizeStatus = (s) => {
    const val = String(s || '').toLowerCase();
    if (['serving', 'in_service', 'in-progress'].includes(val)) return 'serving';
    if (['waiting', 'queued', 'pending', 'next'].includes(val)) return 'waiting';
    if (['completed', 'done', 'served', 'finished'].includes(val)) return 'completed';
    return val || 'waiting';
  };

  const toTime = (v) => (v ? new Date(v).getTime() : 0);

  const toTokenNum = (t) => {
    const n = parseInt(String(t ?? '').replace(/\D/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
  };

  const getCustomerName = (item) =>
    item?.name ||
    item?.customerName ||
    item?.customer?.name ||
    item?.userName ||
    item?.fullName ||
    'Guest';

  const computeQueuePreview = (queue) => {
    const norm = (queue || []).map((q) => ({
      ...q,
      _status: normalizeStatus(q?.status),
      _tokenNum: toTokenNum(q?.token),
      _createdAt: toTime(q?.createdAt || q?.updatedAt || q?.time),
      _completedAt: toTime(q?.completedAt || q?.updatedAt || q?.time),
    }));

    // Last 3 completed (most recent)
    const completedSorted = norm
      .filter((q) => q._status === 'completed')
      .sort((a, b) => a._completedAt - b._completedAt || a._tokenNum - b._tokenNum);
    const lastThreeCompleted = completedSorted.slice(-3);

    // Currently serving (pick one)
    const serving = norm.find((q) => q._status === 'serving');

    // Next waiting (earliest by time then token)
    const waitingSorted = norm
      .filter((q) => q._status === 'waiting')
      .sort((a, b) => a._createdAt - b._createdAt || a._tokenNum - b._tokenNum);
    const nextWaiting = waitingSorted[0] ? { ...waitingSorted[0], _isNext: true } : null;

    // Build ordered preview: 3 completed -> serving -> next
    const ordered = [...lastThreeCompleted, serving, nextWaiting].filter(Boolean);

    // De-duplicate by id or token
    const seen = new Set();
    const dedup = [];
    for (const it of ordered) {
      const key = String(it.id ?? it._id ?? it.token);
      if (!seen.has(key)) {
        seen.add(key);
        dedup.push(it);
      }
    }

    // Max 5 as required
    return dedup.slice(-5);
  };

  const queuePreview = useMemo(() => computeQueuePreview(queueData), [queueData]);

  // NEW: Helper function to get queue count for a specific barber
  const getQueueCount = (shopId) => {
    const queue = queueDataMap[shopId] || [];
    return queue.filter((c) => normalizeStatus(c?.status) === 'waiting').length;
  };

  // NEW: Function to open Google Maps
  const openGoogleMaps = (barber) => {
    const [lng, lat] = barber?.location?.coordinates || [];
    
    if (typeof lat === 'number' && typeof lng === 'number') {
      // Direct coordinates URL
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(mapsUrl, '_blank');
    } else if (barber?.address && barber?.city) {
      // Address-based URL
      const address = encodeURIComponent(`${barber.address}, ${barber.city}`);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
      window.open(mapsUrl, '_blank');
    } else {
      alert('Location information not available for this shop');
    }
  };

  if ((loading || detecting) && barbers.length === 0) {
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

          {/* Radius Filter */}
          <div className="radius-panel">
            <div className="radius-buttons">
              <button
                className={`radius-btn ${radiusKm === 5 ? 'active' : ''}`}
                onClick={() => changeRadius(5)}
              >
                5 km
              </button>
              <button
                className={`radius-btn ${radiusKm === 10 ? 'active' : ''}`}
                onClick={() => changeRadius(10)}
              >
                10 km
              </button>
              <button
                className={`radius-btn ${radiusKm === 20 ? 'active' : ''}`}
                onClick={() => changeRadius(20)}
              >
                20 km
              </button>

              <div className="custom-radius">
                <input
                  type="number"
                  min="1"
                  max="50"
                                  value={customRadius}
                  onChange={(e) => setCustomRadius(Number(e.target.value))}
                  className="custom-input"
                  placeholder="Custom"
                />
                <button
                  className="apply-radius-btn"
                  onClick={() => changeRadius(customRadius || 5)}
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="radius-meta">
              {coords ? (
                <p>
                  Showing shops within <strong>{radiusKm} km</strong> of your current location.
                </p>
              ) : (
                <p className="loc-warning">
                  {locError || 'Location not available.'}{' '}
                  <button className="link-btn" onClick={reDetectLocation}>
                    Use my location
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info">
          <p>
            {filteredBarbers.length} barber shops found
            {coords ? ` within ${radiusKm} km` : ''}
          </p>
        </div>

        {/* Barber Shops Grid */}
        <div className="barbers-grid">
          {filteredBarbers.length === 0 ? (
            <div className="no-barbers">
              <h3>No barber shops found</h3>
              <p>Try changing the radius or search keywords</p>
            </div>
          ) : (
            filteredBarbers.map((barber) => {
              const services = barber?.services || [];
              const statusClass =
                services.length > 5 ? 'busy' : services.length > 2 ? 'moderate' : 'available';
              const shopRating = ratings[barber.shopId] || '4.3';

              return (
                <div
                  key={barber.shopId}
                  className="barber-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleViewDetails(barber)}
                  onKeyDown={(e) => onCardKeyDown(e, barber)}
                >
                  <div className="card-image-container">
                    <img
                      src={barber?.profilePic}
                      alt={barber?.shopName || 'Barber shop'}
                      className="barber-image"
                      loading="lazy"
                    />
                    <div className={`status-badge ${statusClass}`}>
                      {statusClass === 'busy'
                        ? 'Busy'
                        : statusClass === 'moderate'
                        ? 'Moderate'
                        : 'Available'}
                    </div>
                    <div className="rating-badge">⭐ {shopRating}</div>
                    {typeof barber.distanceKm === 'number' && (
                      <div className="distance-badge">📍 {barber.distanceKm} km</div>
                    )}
                  </div>

                  <div className="card-content">
                    <h3 className="shop-name" title={barber?.shopName}>
                      {barber?.shopName?.length > 25
                        ? barber.shopName.substring(0, 25) + '...'
                        : barber?.shopName}
                    </h3>

                    <p
                      className="shop-address"
                      title={`${barber?.address || ''}${barber?.city ? `, ${barber.city}` : ''}`}
                    >
                      {`${barber?.address || ''}${barber?.city ? `, ${barber.city}` : ''}`.length >
                      40
                        ? `${(barber?.address || '') + (barber?.city ? `, ${barber.city}` : '')}`.substring(
                            0,
                            40
                          ) + '...'
                        : `${barber?.address || ''}${barber?.city ? `, ${barber.city}` : ''}`}
                    </p>

                    <div className="info-row">
                      <span className="info-item">
                        🕒 {barber?.timings?.open || '--'} - {barber?.timings?.close || '--'}
                      </span>
                      {/* FIXED: Using getQueueCount function instead of queueData */}
                      <span className="info-item">
                        👥 {queueMapLoading ? '...' : getQueueCount(barber.shopId)} in queue
                      </span>
                    </div>

                    <div
                      className="services-preview"
                      title={services.map((s) => s?.title).filter(Boolean).join(', ')}
                    >
                      Services:{' '}
                      {services
                        .slice(0, 3)
                        .map((s) => s?.title)
                        .filter(Boolean)
                        .join(', ')}
                      {services.length > 3 ? ` +${services.length - 3} more` : ''}
                    </div>

                    <div className="buttons-container">
                      <button
                        className="view-details-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(barber);
                        }}
                      >
                        View Details
                      </button>
                      <button
                        className="join-queue-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinQueue(barber.shopId);
                        }}
                      >
                        Join Queue
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Shop Details Modal */}
      {showModal && selectedBarber && (
        <div className="modal-overlay" onClick={closeModal} aria-modal="true" role="dialog">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedBarber?.shopName}</h2>
              <button className="close-btn" onClick={closeModal} aria-label="Close modal">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="shop-details-grid">
                {/* Shop Info */}
                <div className="shop-info-section">
                  <img
                    src={selectedBarber?.profilePic}
                    alt={selectedBarber?.shopName || 'Shop'}
                    className="modal-shop-image"
                  />
                  <div className="shop-basic-info">
                    <h3>Shop Information</h3>
                    <p>
                      <strong>Owner:</strong> {selectedBarber?.ownerName || '--'}
                    </p>
                    <p>
                      <strong>Address:</strong> {selectedBarber?.address || '--'},{' '}
                      {selectedBarber?.city || '--'}
                    </p>
                    <p>
                      <strong>Timings:</strong> {selectedBarber?.timings?.open || '--'} -{' '}
                      {selectedBarber?.timings?.close || '--'}
                    </p>
                    <p>
                      <strong>Rating:</strong> ⭐ {ratings[selectedBarber.shopId] || '—'} / 5
                    </p>
                    {typeof selectedBarber.distanceKm === 'number' && (
                      <p>
                        <strong>Distance:</strong> {selectedBarber.distanceKm} km
                      </p>
                    )}
                    
                    {/* NEW: Get Directions Button */}
                    <button
                      className="get-directions-btn"
                      onClick={() => openGoogleMaps(selectedBarber)}
                      style={{
                        marginTop: '15px',
                        padding: '10px 20px',
                        backgroundColor: '#4285f4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.3s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#357ae8'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#4285f4'}
                    >
                      📍 Get Directions
                    </button>
                  </div>
                </div>

                {/* Queue Status */}
                <div className="queue-status-section">
                  <h3>Current Queue Status</h3>

                  {queueLoading ? (
                    <div className="queue-stats">
                      <div className="queue-stat">
                        <span className="stat-number">...</span>
                        <span className="stat-label">People Waiting</span>
                      </div>
                      <div className="queue-stat">
                        <span className="stat-number">...</span>
                        <span className="stat-label">Expected Wait</span>
                      </div>
                      <div className="queue-stat">
                        <span className="stat-number">...</span>
                        <span className="stat-label">Currently Serving</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="queue-stats">
                        <div className="queue-stat">
                          <span className="stat-number">
                            {queueData.filter((c) => normalizeStatus(c?.status) === 'waiting').length}
                          </span>
                          <span className="stat-label">People Waiting</span>
                        </div>
                        <div className="queue-stat">
                          <span className="stat-number">
                            {calculateWaitingTime(queueData)} min
                          </span>
                          <span className="stat-label">Expected Wait</span>
                        </div>
                        <div className="queue-stat">
                          <span className="stat-number">
                            {queueData.some((c) => normalizeStatus(c?.status) === 'serving') ? '1' : '0'}
                          </span>
                          <span className="stat-label">Currently Serving</span>
                        </div>
                      </div>

                      {/* Queue Preview */}
                      {queuePreview.length > 0 && (
                        <div className="queue-preview">
                          <h4>Queue Preview</h4>
                          <div className="queue-list-modal">
                            {queuePreview.map((item, index) => {
                              const label =
                                item._status === 'serving'
                                  ? 'Serving'
                                  : item._status === 'completed'
                                  ? 'Completed'
                                  : item._isNext
                                  ? 'Next'
                                  : 'Waiting';

                              const statusClass =
                                item._status === 'serving'
                                  ? 'serving'
                                  : item._status === 'completed'
                                  ? 'completed'
                                  : item._isNext
                                  ? 'waiting next'
                                  : 'waiting';

                              return (
                                <div key={index} className="queue-item-modal">
                                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span className="token">#{item?.token}</span>
                                    <span className="name" style={{ color: '#f9fafb' }}>
                                      {getCustomerName(item)}
                                    </span>
                                  </div>
                                  <span className={`status ${statusClass}`}>{label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Services */}
              <div className="services-section">
                <h3>Services Offered</h3>
                <div className="services-grid-modal">
                  {(selectedBarber?.services || []).map((service, index) => (
                    <div key={index} className="service-card-modal">
                      <img src={service?.image} alt={service?.title} />
                      <div className="service-details">
                        <h4>{service?.title}</h4>
                        <p>{service?.description}</p>
                        <div className="service-price-duration">
                          <span className="price">
                            {service?.price != null ? `₹${service.price}` : '₹—'}
                          </span>
                          <span className="duration">
                            {service?.duration != null ? `${service.duration} min` : '--'}
                          </span>
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