import React from 'react';

const ServiceList = ({ services, onEdit, onDelete }) => (
  <div className="service-list">
    <h3>Your Services</h3>
    {services.length === 0 && <p>No services added yet.</p>}
    {services.map(service => (
      <div className="service-card" key={service._id}>
        <img src={service.image} alt={service.title} style={{ width: 80, height: 80, borderRadius: 8 }} />
        <div>
          <h4>{service.title}</h4>
          <p>₹{service.price} | {service.duration} min</p>
          <p>{service.description}</p>
        </div>
        <button onClick={() => onEdit(service)}>Edit</button>
        <button onClick={() => onDelete(service._id)} style={{ background: '#d32f2f' }}>Delete</button>
      </div>
    ))}
  </div>
);

export default ServiceList; 