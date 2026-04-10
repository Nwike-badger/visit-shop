import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axiosConfig';



const POLL_INTERVAL_MS  = 30_000;   // 30 s — adjust freely
const BACKOFF_CAP_MS    = 5 * 60_000; // back off up to 5 min on repeated errors
const STORAGE_KEY       = 'admin_last_seen_order_ts';


export function useOrderNotifications({ onNewOrders } = {}) {
  const [permissionState, setPermissionState] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [unreadCount, setUnreadCount] = useState(0);

  // ISO timestamp of the most-recently-seen order across sessions
  const lastSeenRef    = useRef(
    localStorage.getItem(STORAGE_KEY) || new Date(0).toISOString()
  );
  const timerRef       = useRef(null);
  const errorCountRef  = useRef(0);       // consecutive error counter for backoff
  const isPollingRef   = useRef(false);   // prevent overlapping polls

  /* ── Request permission (idempotent — browser shows dialog only once) ── */
  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'unsupported';
    if (Notification.permission !== 'default') {
      setPermissionState(Notification.permission);
      return Notification.permission;
    }
    const result = await Notification.requestPermission();
    setPermissionState(result);
    return result;
  }, []);

  /* ── Fire a single native notification ── */
  const fireNotification = useCallback((order) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    const items = order.items || [];
    const body  = items.length
      ? items.slice(0, 2).map(i => `${i.productName} ×${i.quantity}`).join(', ') +
        (items.length > 2 ? ` +${items.length - 2} more` : '')
      : 'New order received';

    const n = new Notification(`🛒 New Order — ${order.orderNumber}`, {
      body:     `₦${Number(order.grandTotal || 0).toLocaleString('en-NG')}  ·  ${body}`,
      icon:     '/favicon.ico',
      badge:    '/favicon.ico',
      tag:      order.id,     // deduplicates: same order won't fire twice
      renotify: false,
    });
    n.onclick = () => { window.focus(); n.close(); };
  }, []);

  /* ── Core poll ── */
  const poll = useCallback(async () => {
    // Skip if already running (e.g. slow network + timer fired again)
    if (isPollingRef.current) return;
    // Skip if the tab is hidden — saves the request entirely
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

    isPollingRef.current = true;
    try {
      const res    = await api.get('/admin/orders', {
        params: { page: 0, size: 20, sort: 'createdAt,desc' },
      });
      const orders = res.data?.content ?? res.data ?? [];

      // Reset error backoff on success
      errorCountRef.current = 0;

      if (!orders.length) return;

      const newOrders = orders.filter(
        o => o.createdAt && o.createdAt > lastSeenRef.current
      );

      if (newOrders.length > 0) {
        // Advance the high-water mark
        const newest = newOrders.reduce(
          (max, o) => (o.createdAt > max ? o.createdAt : max),
          newOrders[0].createdAt
        );
        lastSeenRef.current = newest;
        localStorage.setItem(STORAGE_KEY, newest);

        // Cap native notifications at 5 to avoid spam
        newOrders.slice(0, 5).forEach(fireNotification);

        setUnreadCount(n => n + newOrders.length);
        onNewOrders?.(newOrders);
      }
    } catch {
      // Exponential backoff: 30s → 60s → 120s … capped at 5 min
      errorCountRef.current += 1;
      const delay = Math.min(
        POLL_INTERVAL_MS * 2 ** errorCountRef.current,
        BACKOFF_CAP_MS
      );
      clearInterval(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = setInterval(poll, POLL_INTERVAL_MS);
        poll();
      }, delay);
    } finally {
      isPollingRef.current = false;
    }
  }, [fireNotification, onNewOrders]);

  /* ── Start / stop polling on mount / unmount ── */
  useEffect(() => {
    requestPermission();

    // Immediate first poll
    poll();
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS);

    /* Pause when tab goes to background, resume when it comes back.
       This is the single most impactful cost-saving measure — no
       requests fire while the browser is minimised or another tab
       is in front. */
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Tab is back — poll immediately then resume schedule
        poll();
        if (!timerRef.current) {
          timerRef.current = setInterval(poll, POLL_INTERVAL_MS);
        }
      } else {
        // Tab hidden — pause
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [poll, requestPermission]);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  return { unreadCount, clearUnread, permissionState, requestPermission };
}