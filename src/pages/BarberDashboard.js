import React, { useState, useEffect, useContext } from 'react';
import ShopRegister from '../components/barber/ShopRegister';
import ServiceForm from '../components/barber/ServiceForm';
import ServiceList from '../components/barber/ServiceList';
import QueueView from '../components/barber/QueueView';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const BarberDashboard = () => {
  const { token } = useContext(AuthContext);
  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [queue, setQueue] = useState([]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editService, setEditService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [queueLoading, setQueueLoading] = useState(false);

  // Fetch shop info
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await axios.get('/barber/services', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setServices(res.data.services);
        // Get shopId from first service if exists
        if (res.data.services.length > 0) {
          setShop(res.data.services[0].shop);
        } else {
          // Try to fetch shop info separately if no services
          const me = await axios.get('/customer/barbers-near-me', { headers: { Authorization: `Bearer ${token}` } });
          const myShop = me.data.barbers.find(b => b.barber?._id === JSON.parse(localStorage.getItem('user'))?._id);
          if (myShop) setShop(myShop.shopId);
        }
      } catch {}
    };
    fetchShop();
  }, [token]);

  // Fetch queue
  useEffect(() => {
    if (!shop) return;
    const fetchQueue = async () => {
      try {
        const res = await axios.get(`/queue/${shop}`);
        setQueue(res.data.queue || []);
      } catch {}
    };
    fetchQueue();
  }, [shop]);

  const handleShopRegister = () => {
    window.location.reload();
  };

  const handleAddService = async (data) => {
    setLoading(true);
    try {
      await axios.post('/barber/service', data, { headers: { Authorization: `Bearer ${token}` } });
      window.location.reload();
    } catch { setLoading(false); }
  };

  const handleEditService = (service) => {
    setEditService(service);
    setShowServiceForm(true);
  };

  const handleUpdateService = async (data) => {
    setLoading(true);
    try {
      await axios.put(`/barber/service/${editService._id}`, data, { headers: { Authorization: `Bearer ${token}` } });
      window.location.reload();
    } catch { setLoading(false); }
  };

  const handleDeleteService = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`/barber/service/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      window.location.reload();
    } catch { setLoading(false); }
  };

  const handleNextQueue = async () => {
    setQueueLoading(true);
    try {
      await axios.post('/queue/next', { shopId: shop }, { headers: { Authorization: `Bearer ${token}` } });
      const res = await axios.get(`/queue/${shop}`);
      setQueue(res.data.queue || []);
    } catch {}
    setQueueLoading(false);
  };

  if (!shop) {
    return <ShopRegister onRegister={handleShopRegister} />;
  }

  return (
    <div className="barber-dashboard">
      <h2>Barber Dashboard</h2>
      <button onClick={() => { setShowServiceForm(true); setEditService(null); }} style={{ marginBottom: 16 }}>Add Service</button>
      {showServiceForm && (
        <ServiceForm
          initial={editService}
          onSubmit={editService ? handleUpdateService : handleAddService}
          loading={loading}
          submitText={editService ? 'Update' : 'Add'}
        />
      )}
      <ServiceList services={services} onEdit={handleEditService} onDelete={handleDeleteService} />
      <QueueView queue={queue} onNext={handleNextQueue} loading={queueLoading} />
    </div>
  );
};

export default BarberDashboard; 