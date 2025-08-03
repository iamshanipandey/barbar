import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import './ServiceManagement.css';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/barber/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(res.data.services);
    } catch (err) {
      setError('Failed to fetch services');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result });
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (editingService) {
        // Update service
        await axios.put(`/barber/service/${editingService._id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Service updated successfully!');
      } else {
        // Create new service
        await axios.post('/barber/service', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Service created successfully!');
      }
      
      resetForm();
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
    setLoading(false);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setForm({
      title: service.title,
      description: service.description,
      price: service.price,
      duration: service.duration,
      image: ''
    });
    setImagePreview(service.image);
    setShowForm(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/barber/service/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Service deleted successfully!');
        fetchServices();
      } catch (err) {
        setError('Failed to delete service');
      }
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      price: '',
      duration: '',
      image: ''
    });
    setImagePreview('');
    setShowForm(false);
    setEditingService(null);
    setError('');
  };

  return (
    <div className="service-management-bg">
      <div className="service-management-container">
        <div className="service-header">
          <h2 className="service-title">Service Management</h2>
          <button 
            className="add-service-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add Service'}
          </button>
        </div>

        {showForm && (
          <div className="service-form-container">
            <form className="service-form" onSubmit={handleSubmit}>
              <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              
              <div className="form-row">
                <div className="input-group">
                  <label>Service Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g., Hair Cut"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="input-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="e.g., 150"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Describe your service..."
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="input-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  placeholder="e.g., 30"
                  value={form.duration}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Service Image</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-input"
                    required={!editingService}
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Service Preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Saving...' : (editingService ? 'Update Service' : 'Add Service')}
                </button>
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
              </div>

              {error && <div className="service-error">{error}</div>}
            </form>
          </div>
        )}

        <div className="services-grid">
          {services.length === 0 ? (
            <div className="no-services">
              <p>No services added yet. Add your first service!</p>
            </div>
          ) : (
            services.map(service => (
              <div key={service._id} className="service-card">
                <div className="service-image">
                  <img src={service.image} alt={service.title} />
                </div>
                <div className="service-content">
                  <h4>{service.title}</h4>
                  <p className="service-description">{service.description}</p>
                  <div className="service-details">
                    <span className="price">₹{service.price}</span>
                    <span className="duration">{service.duration} min</span>
                  </div>
                  <div className="service-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(service)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(service._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceManagement;