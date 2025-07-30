import React, { useState } from 'react';
import BarbersNearMe from '../components/customer/BarbersNearMe';
import BarberProfile from '../components/customer/BarberProfile';
import QueueJoin from '../components/customer/QueueJoin';

const CustomerDashboard = () => {
  const [selectedShop, setSelectedShop] = useState(null);
  const [showQueue, setShowQueue] = useState(false);

  const handleSelectBarber = (shopId) => {
    setSelectedShop(shopId);
    setShowQueue(false);
  };

  const handleJoinQueue = () => {
    setShowQueue(true);
  };

  return (
    <div className="customer-dashboard">
      <h2>Customer Dashboard</h2>
      {!selectedShop && <BarbersNearMe onSelectBarber={handleSelectBarber} />}
      {selectedShop && !showQueue && <BarberProfile shopId={selectedShop} onJoinQueue={handleJoinQueue} />}
      {selectedShop && showQueue && <QueueJoin shopId={selectedShop} />}
      {selectedShop && <button onClick={() => { setSelectedShop(null); setShowQueue(false); }} style={{ marginTop: 16 }}>Back to Barbers</button>}
    </div>
  );
};

export default CustomerDashboard; 