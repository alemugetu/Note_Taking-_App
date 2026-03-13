import { useEffect, useState } from 'react';
import { pushApi } from './api';

export function Settings() {
  const [permission, setPermission] = useState(Notification ? Notification.permission : 'default');
  const [subscription, setSubscription] = useState<any | null>(null);
  const [serverSub, setServerSub] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPermission(Notification ? Notification.permission : 'default');
    async function load() {
      setLoading(true);
      try {
        // get client-side subscription if any
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          setSubscription(sub || null);
        }
      } catch (err) {
        console.error('Failed to read client subscription', err);
      }

      try {
        const res = await pushApi.getSubscription();
        setServerSub(res.data.data || null);
      } catch (err) {
        console.error('Failed to fetch server subscription', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div>
      <h3>Settings</h3>
      <section style={{ marginTop: 12 }}>
        <h5>Push Notifications</h5>
        {loading && <div style={{ marginBottom: 8 }}>Loading push settings...</div>}
        <div style={{ marginBottom: 8 }}>Permission: <strong>{permission}</strong></div>
        <div style={{ marginBottom: 8 }}>Client subscription: {subscription ? <span>Present</span> : <span>None</span>}</div>
        <div style={{ marginBottom: 8 }}>Server saved subscription: {serverSub ? <span>Present (createdAt: {serverSub.createdAt ? new Date(serverSub.createdAt).toLocaleString() : 'unknown'})</span> : <span>None</span>}</div>
        <div style={{ marginTop: 8 }}>
          <small style={{ color: '#666' }}>Use the Push toggle in the header to enable/disable. Service worker is `public/sw.js`.</small>
        </div>
      </section>
    </div>
  )
}
