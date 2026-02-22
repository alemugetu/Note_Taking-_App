import React, { useEffect, useState } from 'react';
import { pushApi } from './api';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushSettings() {
  const [permission, setPermission] = useState(Notification.permission);
  const [registered, setRegistered] = useState(false);
  const [supported, setSupported] = useState(!!('serviceWorker' in navigator && 'PushManager' in window));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPermission(Notification.permission);
    async function checkSub() {
      if (!supported) return;
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return setRegistered(false);
        const sub = await reg.pushManager.getSubscription();
        setRegistered(!!sub);
      } catch (err) {
        console.error('checkSub error', err);
      }
    }
    checkSub();
  }, [supported]);

  async function enablePush() {
    if (!supported) return alert('Push not supported in this browser');
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return;

      // register service worker
      const reg = await navigator.serviceWorker.register('/sw.js');

      // get vapid key
      const res = await pushApi.getVapidKey();
      const pub = res.data && res.data.data && res.data.data.publicKey;
      if (!pub) {
        throw new Error('Push is not configured on the server (missing VAPID public key).');
      }
      const applicationServerKey = urlBase64ToUint8Array(pub);

      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
      await pushApi.saveSubscription(sub);
      setRegistered(true);
    } catch (err) {
      console.error('enablePush error', err);
      alert('Failed to enable push: ' + (err && err.message ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  async function disablePush() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
      }
      await pushApi.deleteSubscription();
      setRegistered(false);
    } catch (err) {
      console.error('disablePush error', err);
      alert('Failed to disable push');
    } finally {
      setLoading(false);
    }
  }

  if (!supported) return <div>Push notifications not supported in this browser.</div>

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div>Push: <strong>{permission}</strong></div>
      {registered ? (
        <button className="btn btn-sm btn-outline-danger" onClick={disablePush} disabled={loading}>Disable</button>
      ) : (
        <button className="btn btn-sm btn-outline-primary" onClick={enablePush} disabled={loading || permission === 'denied'}>Enable</button>
      )}
    </div>
  )
}
