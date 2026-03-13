import { useEffect, useState } from 'react';
import { notificationsApi } from './api';

export function NotificationCenter() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await notificationsApi.getAll();
        if (!mounted) return;
        setItems(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    })
  }

  async function markSelectedRead() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    try {
      await notificationsApi.markReadBulk(ids);
      setItems(prev => prev.map(it => ids.includes(it._id) ? { ...it, read: true } : it));
      setSelected(new Set());
    } catch (err) { console.error(err) }
  }

  async function deleteSelected() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    try {
      await notificationsApi.deleteBulk(ids);
      setItems(prev => prev.filter(it => !ids.includes(it._id)));
      setSelected(new Set());
    } catch (err) { console.error(err) }
  }

  if (loading) return <div>Loading notifications...</div>

  return (
    <div>
      <h3>Notifications</h3>
      <div style={{ marginBottom: 8 }}>
        <button className="btn btn-primary btn-sm" onClick={markSelectedRead} disabled={selected.size===0}>Mark selected read</button>
        <button className="btn btn-danger btn-sm" style={{ marginLeft: 8 }} onClick={deleteSelected} disabled={selected.size===0}>Delete selected</button>
      </div>

      <div>
        {items.length === 0 && <div>No notifications</div>}
        {items.map(it => (
          <div key={it._id} style={{ padding: 8, borderBottom: '1px solid #eee', background: it.read ? '#fff' : '#f8fbff' }}>
            <input type="checkbox" checked={selected.has(it._id)} onChange={() => toggle(it._id)} />
            <strong style={{ marginLeft: 8 }}>{it.noteTitle || 'Reminder'}</strong>
            <div style={{ fontSize: 13 }}>{it.message}</div>
            <div style={{ fontSize: 11, color: '#666' }}>{it.date ? new Date(it.date).toLocaleString() : ''}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
