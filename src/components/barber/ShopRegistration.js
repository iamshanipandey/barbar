import React, { useState } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import './ShopRegistration.css';

// Image compression function
const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageLoading(true);
      setError('');
      
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Please select a valid image file');
          setImageLoading(false);
          return;
        }
        
        // Check file size (limit to 5MB before compression)
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size should be less than 5MB');
          setImageLoading(false);
          return;
        }
        
        let processedFile = file;
        
        // Compress image if it's larger than 1MB
        if (file.size > 1024 * 1024) {
          console.log('Compressing image...');
          processedFile = await compressImage(file);
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm({ ...form, profilePic: reader.result });
          setImagePreview(reader.result);
          setImageLoading(false);
        };
        reader.readAsDataURL(processedFile);
        
      } catch (error) {
        console.error('Error processing image:', error);
        setError('Error processing image. Please try again.');
        setImageLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
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

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      console.log('Submitting shop registration...');
      
      const response = await axios.post('/barber/register-shop', form, {
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
      
      if (err.response?.status === 413) {
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
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };


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