import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type NotificationItem = {
  _id: string;
  note: string;
  noteTitle?: string;
  message?: string;
  date?: string;
  read?: boolean;
};

export function Notifications({ notifications, onMarkRead }: { notifications: NotificationItem[]; onMarkRead?: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const unread = notifications.filter(n => !n.read).length;

  function openNotification(n: NotificationItem) {
    if (onMarkRead) onMarkRead(n._id);
    if (n.note) navigate(`/${n.note}`);
    setOpen(false);
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button className="btn btn-light" onClick={() => setOpen(!open)} aria-label="Notifications">
        🔔
        {unread > 0 && <span style={{ marginLeft: 6, background: '#d9534f', color: '#fff', borderRadius: 12, padding: '2px 6px', fontSize: 12 }}>{unread}</span>}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: '36px', width: 320, maxHeight: 360, overflowY: 'auto', boxShadow: '0 6px 18px rgba(0,0,0,0.12)', background: '#fff', borderRadius: 6, zIndex: 9999 }}>
          <div style={{ padding: 8, borderBottom: '1px solid #eee', fontWeight: 600 }}>Notifications</div>
          {notifications.length === 0 && <div style={{ padding: 12 }}>No notifications</div>}
          {notifications.map(n => (
            <div key={n._id} onClick={() => openNotification(n)} style={{ padding: 10, cursor: 'pointer', borderBottom: '1px solid #f5f5f5', background: n.read ? '#fff' : '#f8fbff' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{n.noteTitle || 'Reminder'}</div>
              <div style={{ fontSize: 13, color: '#333' }}>{n.message}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>{n.date ? new Date(n.date).toLocaleString() : ''}</div>
            </div>
          ))}
          <div style={{ padding: 8, textAlign: 'center', borderTop: '1px solid #eee' }}>
            <button className="btn btn-link" onClick={() => { setOpen(false); navigate('/notifications'); }}>View all</button>
          </div>
        </div>
      )}
    </div>
  );
}
