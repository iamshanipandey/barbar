import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';

const BarbersNearMe = ({ onSelectBarber }) => {
  const [city, setCity] = useState('');
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBarbers();
    // eslint-disable-next-line
  }, []);

  const fetchBarbers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/customer/barbers-near-me', { params: city ? { city } : {} });
      setBarbers(res.data.barbers);
    } catch {}
    setLoading(false);
  };

  const handleCityChange = e => setCity(e.target.value);
  const handleSearch = e => {
    e.preventDefault();
    fetchBarbers();
  };

  return (
    <div className="barbers-near-me">
      <h3>Barbers Near Me</h3>
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input placeholder="Filter by city" value={city} onChange={handleCityChange} />
        <button type="submit">Search</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <div className="barber-list">
          {barbers.length === 0 && <p>No barbers found.</p>}
          {barbers.map(b => (
            <div className="barber-card" key={b.shopId} onClick={() => onSelectBarber(b.shopId)}>
              <img src={b.profilePic} alt={b.shopName} style={{ width: 60, height: 60, borderRadius: 8 }} />
              <div>
                <h4>{b.shopName}</h4>
                <p>Owner: {b.ownerName}</p>
                <p>City: {b.city}</p>
                <p>Services: {b.services.map(s => s.title).join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BarbersNearMe; 