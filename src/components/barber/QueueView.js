import React from 'react';

const QueueView = ({ queue, onNext, loading }) => (
  <div className="queue-view">
    <h3>Live Queue</h3>
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
    <button onClick={onNext} disabled={loading || queue.length === 0} style={{ marginTop: 16 }}>
      {loading ? 'Processing...' : 'Next'}
    </button>
  </div>
);

export default QueueView; 