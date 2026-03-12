import { useCallback } from "react";

type AnalyticsPayload = Record<string, string | number | boolean>;

/**
 * Dispatches a single analytics event.
 * In production, swap the console.log for:
 *   api.post('/analytics/event', { event, ...payload, timestamp: Date.now() })
 */
function dispatch(event: string, payload: AnalyticsPayload): void {
  if (__DEV__) {
    console.log("[Analytics]", event, payload);
  }
  // TODO: await api.post('/analytics/event', { event, ...payload })
}

/**
 * `useAnalytics` returns stable tracking callbacks suitable for passing to
 * feed items as `onPress` / `onVisible` handlers.
 *
 * All methods are `useCallback`-memoized — safe to include in child
 * component prop lists without triggering unnecessary re-renders.
 */
export function useAnalytics() {
  const trackImpression = useCallback(
    (listingId: string, position: number) => {
      dispatch("listing_impression", { listingId, position });
    },
    []
  );

  const trackClick = useCallback(
    (listingId: string, position: number) => {
      dispatch("listing_click", { listingId, position });
    },
    []
  );

  const trackAdImpression = useCallback((adId: string) => {
    dispatch("ad_impression", { adId });
  }, []);

  const trackAdClick = useCallback((adId: string) => {
    dispatch("ad_click", { adId });
  }, []);

  const trackVendorClick = useCallback((vendorId: string) => {
    dispatch("vendor_click", { vendorId });
  }, []);

  return {
    trackImpression,
    trackClick,
    trackAdImpression,
    trackAdClick,
    trackVendorClick,
  };
}
