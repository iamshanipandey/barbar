import React, { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const QueueJoin = ({ shopId }) => {
  const { token } = useContext(AuthContext);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shopId) return;
    fetchQueue();
    // eslint-disable-next-line
  }, [shopId]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/queue/${shopId}`);
      setQueue(res.data.queue || []);
      setJoined(res.data.queue?.some(c => c.user._id === JSON.parse(localStorage.getItem('user'))?._id && c.status === 'waiting'));
    } catch {}
    setLoading(false);
  };

  const handleJoin = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post('/queue/join', { shopId }, { headers: { Authorization: `Bearer ${token}` } });
      fetchQueue();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join queue');
    }
    setLoading(false);
  };

  return (
    <div className="queue-join">
      <h4>Live Queue</h4>
      <div className="queue-list">
        {queue.length === 0 && <p>No customers in queue.</p>}
        {queue.map((c, idx) => (
          <div
            key={c.user._id}
            className={`queue-avatar${idx === 0 && c.status === 'waiting' ? ' current' : ''}`}
            style={{ display: 'inline-block', marginRight: 12 }}
          >
            <div className="avatar-circle">
              {c.user.name[0].toUpperCase()}
            </div>
            <div style={{ fontSize: 12 }}>{c.user.name}</div>
          </div>
        ))}
      </div>
      {!joined && <button onClick={handleJoin} disabled={loading}>Join Queue</button>}
      {joined && <div style={{ color: 'green' }}>You are in the queue!</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default QueueJoin; 