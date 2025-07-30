import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';

const BarberProfile = ({ shopId, onJoinQueue }) => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    axios.get(`/customer/barber/${shopId}`)
      .then(res => setShop(res.data))
      .finally(() => setLoading(false));
  }, [shopId]);

  if (!shopId) return null;
  if (loading) return <p>Loading...</p>;
  if (!shop) return <p>Barber not found.</p>;

  return (
    <div className="barber-profile">
      <img src={shop.profilePic} alt={shop.shopName} style={{ width: 80, height: 80, borderRadius: 8 }} />
      <h3>{shop.shopName}</h3>
      <p>Owner: {shop.ownerName}</p>
      <p>Address: {shop.address}</p>
      <p>City: {shop.city}</p>
      <p>Open: {shop.timings.open} - {shop.timings.close}</p>
      <h4>Services</h4>
      <ul>
        {shop.services.map(s => (
          <li key={s._id}>{s.title} - ₹{s.price} ({s.duration} min)</li>
        ))}
      </ul>
      <button onClick={() => onJoinQueue(shop.shopId)}>Join Queue</button>
    </div>
  );
};

export default BarberProfile; 