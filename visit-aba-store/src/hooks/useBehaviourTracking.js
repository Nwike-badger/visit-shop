// ─── useBehaviorTracking.js ──────────────────────────────────────────────────

import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { getSessionId } from '../utils/session';

export const useBehaviorTracking = () => {
  const { user } = useAuth();
  const sessionId = getSessionId();

  const headers = { 'X-Session-Id': sessionId };

  const trackView = useCallback((productId) => {
    if (!productId) return;
    api.post('/v1/track/view', { productId }, { headers }).catch(() => {});
  }, [sessionId]);

  const trackCartAdd = useCallback((productId, variantId) => {
    if (!productId) return;
    api.post('/v1/track/cart', { productId, variantId }, { headers }).catch(() => {});
  }, [sessionId]);

  const trackWishlist = useCallback((productId) => {
    if (!productId) return;
    api.post('/v1/track/wishlist', { productId }, { headers }).catch(() => {});
  }, [sessionId]);

  return { trackView, trackCartAdd, trackWishlist };
};