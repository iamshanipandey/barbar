import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ShopRegistration.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Reverse geocode helper
const reverseGeocode = async (lat, lon) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=en-IN,hi-IN`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const data = await res.json();
  const addr = data.address || {};
  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.suburb ||
    addr.city_district ||
    addr.state_district ||
    addr.county ||
    '';

  let fullAddress = data.display_name || '';
  if (!fullAddress) {
    const parts = [
      addr.house_number,
      addr.road,
      addr.neighbourhood,
      addr.suburb,
      city,
      addr.state,
      addr.postcode,
      addr.country,
    ].filter(Boolean);
    fullAddress = parts.join(', ');
  }

  return { address: fullAddress, city };
};

// Image compression
const compressImage = (file, maxWidth = 800, quality = 0.7) =>
  new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    img.src = URL.createObjectURL(file);
  });

// Marker that updates on click/drag
const LocationMarker = ({ position, setPosition, onChange }) => {
  useMapEvents({
    click(e) {
      const pos = [e.latlng.lat, e.latlng.lng];
      setPosition(pos);
      onChange?.(pos);
    },
  });

  return position ? (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const latlng = e.target.getLatLng();
          const pos = [latlng.lat, latlng.lng];
          setPosition(pos);
          onChange?.(pos);
        },
      }}
    />
  ) : null;
};

const ShopRegistration = () => {
  const [form, setForm] = useState({
    shopName: '',
    ownerName: '',
    address: '',
    city: '',
    open: '',
    close: '',
    profilePic: ''
  });

  const [coordinates, setCoordinates] = useState(null); // [lat, lon]
  const [showMap, setShowMap] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [existingShop, setExistingShop] = useState(null);

  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const navigate = useNavigate();

  // Check if shop already exists for this barber
  useEffect(() => {
    const checkExisting = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const res = await axios.get('/barber/shop-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res?.data?.shop) {
          setExistingShop(res.data.shop);
          setAlreadyRegistered(true);
        }
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        // else ignore: no shop found or server issue
      } finally {
        setChecking(false);
      }
    };
    checkExisting();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageLoading(true);
    setError('');
    try {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        setImageLoading(false);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        setImageLoading(false);
        return;
      }
      let processedFile = file;
      if (file.size > 1024 * 1024) {
        processedFile = await compressImage(file);
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, profilePic: reader.result });
        setImagePreview(reader.result);
        setImageLoading(false);
      };
      reader.readAsDataURL(processedFile);
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Error processing image. Please try again.');
      setImageLoading(false);
    }
  };

  // Called when user clicks Fetch Location OR selects a point on map
  const setAddressFromCoords = async (lat, lon) => {
    try {
      const { address, city } = await reverseGeocode(lat, lon);
      setForm((prev) => ({
        ...prev,
        address: address || prev.address,
        city: city || prev.city,
      }));
    } catch (e) {
      console.error('Reverse geocoding failed:', e);
    }
  };

  const handleMapLocationChange = async (pos) => {
    const [lat, lon] = pos;
    await setAddressFromCoords(lat, lon);
  };

  const fetchCurrentLocation = () => {
    setLocationLoading(true);
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const pos = [latitude, longitude];
        setCoordinates(pos);
        setShowMap(true);
        await setAddressFromCoords(latitude, longitude);
        setLocationLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Unable to retrieve your location. Please enable location services.');
        setLocationLoading(false);
        setShowMap(true);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.shopName || !form.ownerName || !form.address || !form.city || !form.open || !form.close) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }
    if (!form.profilePic) {
      setError('Please select a shop profile picture');
      setLoading(false);
      return;
    }
    if (!coordinates) {
      setError('Please set your shop location on the map');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      const shopData = {
        ...form,
        location: {
          type: 'Point',
          coordinates: [coordinates[1], coordinates[0]] // [lng, lat]
        }
      };

      const response = await axios.post('/barber/register-shop', shopData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Shop registration response:', response.data);
      alert('Shop registered successfully!');
      navigate('/barber/dashboard');

    } catch (err) {
      console.error('Shop registration error:', err);
      if (err.response?.status === 409) {
        // Server says already registered -> show already registered view
        setAlreadyRegistered(true);
        // Try to load existing shop to show summary
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get('/barber/shop-profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res?.data?.shop) setExistingShop(res.data.shop);
        } catch {}
      } else if (err.response?.status === 413) {
        setError('Image file is too large. Please select a smaller image.');
      } else if (err.response?.status === 401) {
        setError('Please login again');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Shop registration failed. Please try again.');
      }
    }
    setLoading(false);
  };

  const removeImage = () => {
    setForm({ ...form, profilePic: '' });
    setImagePreview('');
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  // Loading while checking
  if (checking) {
    return (
      <div className="shop-registration-bg">
        <div className="shop-registration-container">
          <div className="checking-shop">
            <div className="loading-spinner"></div>
            <p>Checking your shop...</p>
          </div>
        </div>
      </div>
    );
  }

  // If already registered, show message instead of form
  if (alreadyRegistered) {
    return (
      <div className="shop-registration-bg">
        <div className="shop-registration-container">
          <div className="already-registered">
            <h2>Shop already registered ✅</h2>
            <p>You have already registered your shop. You can manage it from your dashboard.</p>

            {existingShop && (
              <div className="shop-summary-card">
                <div className="shop-summary-left">
                  <img
                    src={existingShop.profilePic}
                    alt={existingShop.shopName}
                    className="shop-summary-image"
                  />
                </div>
                <div className="shop-summary-right">
                  <h3>{existingShop.shopName}</h3>
                  <p><strong>Owner:</strong> {existingShop.ownerName}</p>
                  <p><strong>Address:</strong> {existingShop.address}, {existingShop.city}</p>
                  <p><strong>Timings:</strong> {existingShop?.timings?.open} - {existingShop?.timings?.close}</p>
                </div>
              </div>
            )}

            <div className="already-actions">
              <button className="primary-btn" onClick={() => navigate('/barber/dashboard')}>
                Go to Dashboard
              </button>
              <button className="secondary-btn" onClick={() => navigate('/barber/services')}>
                Manage Services
              </button>
            </div>

            <p className="hint-text">Need to update shop details? Go to Dashboard → Shop Profile.</p>
          </div>
        </div>
      </div>
    );
  }

  // Registration form (only if not registered)
  return (
    <div className="shop-registration-bg">
      <div className="shop-registration-container">
        <form className="shop-registration-form" onSubmit={handleSubmit}>
          <h2 className="shop-registration-title">Register Your Shop</h2>
          <p className="form-subtitle">Create your professional barber shop profile</p>

          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">🏪</span>
              Basic Information
            </h3>

            <div className="form-row">
              <div className="input-group">
                <label>Shop Name <span className="required-asterisk">*</span></label>
                <input
                  type="text"
                  name="shopName"
                  placeholder="Enter your shop name"
                  value={form.shopName}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label>Owner Name <span className="required-asterisk">*</span></label>
                <input
                  type="text"
                  name="ownerName"
                  placeholder="Enter owner name"
                  value={form.ownerName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📍</span>
              Shop Location
            </h3>

            <div className="location-buttons">
              <button
                type="button"
                onClick={fetchCurrentLocation}
                disabled={locationLoading}
                className="fetch-location-btn"
              >
                {locationLoading ? (
                  <>
                    <span className="loading-spinner-small"></span>
                    Fetching Location...
                  </>
                ) : (
                  <>
                    <span>📍</span>
                    Fetch Current Location
                  </>
                )}
              </button>

              {!showMap && (
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="manual-location-btn"
                >
                  <span>📌</span>
                  Select on Map
                </button>
              )}
            </div>

            {showMap && (
              <div className="map-section">
                <p className="map-instruction">
                  {coordinates ? 'Click on map or drag pin to adjust location' : 'Click on map to set your shop location'}
                </p>
                <div className="map-wrapper">
                  <MapContainer
                    center={coordinates || [28.6139, 77.2090]}
                    zoom={coordinates ? 16 : 12}
                    style={{ height: '350px', width: '100%' }}
                    className="location-map"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    <LocationMarker
                      position={coordinates}
                      setPosition={setCoordinates}
                      onChange={handleMapLocationChange}
                    />
                  </MapContainer>
                </div>
                {coordinates && (
                  <div className="coordinates-display">
                    <span className="coord-icon">📍</span>
                    Location: {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
                  </div>
                )}
              </div>
            )}

            <div className="input-group form-group-wide">
              <label>Complete Address <span className="required-asterisk">*</span></label>
              <textarea
                name="address"
                placeholder="Enter your shop's complete address with landmarks"
                value={form.address}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>City <span className="required-asterisk">*</span></label>
                <input
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">⏰</span>
              Business Hours
            </h3>

            <div className="timing-section">
              <div className="form-row">
                <div className="input-group">
                  <label>Opening Time <span className="required-asterisk">*</span></label>
                  <input
                    type="time"
                    name="open"
                    value={form.open}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Closing Time <span className="required-asterisk">*</span></label>
                  <input
                    type="time"
                    name="close"
                    value={form.close}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📸</span>
              Shop Profile Picture
            </h3>

            <div className="image-upload-section">
              <div className="image-upload-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-input"
                  id="profilePic"
                  disabled={imageLoading}
                />

                <label htmlFor="profilePic" className="image-upload-btn">
                  <span>📷</span>
                  {imageLoading ? 'Processing...' : 'Choose Shop Photo'}
                </label>

                {imageLoading && (
                  <div className="image-loading">
                    <div className="loading-spinner"></div>
                    <p>Processing image...</p>
                  </div>
                )}

                {imagePreview && !imageLoading && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Shop Preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={removeImage}
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="image-upload-hint">
                  <p><strong>Recommended:</strong> Square image, max 5MB</p>
                  <p>Supported formats: JPG, PNG, WEBP</p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="shop-registration-btn"
            disabled={loading || imageLoading}
          >
            {loading ? 'Registering Shop...' : 'Register My Shop'}
          </button>

          {error && (
            <div className="shop-registration-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <div className="registration-footer">
            <p>Already have a shop registered?</p>
            <button
              type="button"
              className="back-to-dashboard-btn"
              onClick={() => navigate('/barber/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopRegistration;