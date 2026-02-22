import React, { useEffect } from 'react';

export function Toasts({ toasts = [], onDismiss }: { toasts: any[]; onDismiss?: (id: string) => void }) {
  useEffect(() => {
    const timers: any[] = [];
    toasts.forEach(t => {
      if (!t._timeout) {
        t._timeout = setTimeout(() => {
          if (onDismiss) onDismiss(t._id);
        }, 7000);
        timers.push(t._timeout);
      }
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, [toasts]);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', right: 12, top: 12, zIndex: 1200, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t._id} style={{ minWidth: 240, background: '#fff', border: '1px solid #ddd', padding: 10, borderRadius: 6, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
          <div style={{ fontWeight: 700 }}>{t.noteTitle || 'Notification'}</div>
          <div style={{ fontSize: 13 }}>{t.message}</div>
        </div>
      ))}
    </div>
  )
}
