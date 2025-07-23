// Tracking event types
export const EVENT_TYPES = {
  PAGE_VIEW: "page_view",
  CLICK: "click",
  SCROLL: "scroll",
  SIGNUP: "signup",
  PURCHASE: "purchase",
  CUSTOM: "custom",
};

// Initialize analytics
export function initAnalytics() {
  // Analytics initialization logic
  console.log("Next Metabase Analytics initialized");
}

// Track a custom event
export function trackEvent(type, data = {}) {
  const event = {
    type,
    path: window.location.pathname,
    timestamp: new Date().toISOString(),
    ...data,
  };

  // Send to API
  navigator.sendBeacon("/api/next-analytics-event", JSON.stringify(event));
}

// Track page view
export function trackPageView() {
  trackEvent(EVENT_TYPES.PAGE_VIEW);
}

// Track click event
export function trackClick(element, data = {}) {
  trackEvent(EVENT_TYPES.CLICK, {
    element: element,
    ...data,
  });
}

// Track scroll event
export function trackScroll(depth, data = {}) {
  trackEvent(EVENT_TYPES.SCROLL, {
    depth,
    ...data,
  });
}

// Track signup event
export function trackSignup(data = {}) {
  trackEvent(EVENT_TYPES.SIGNUP, data);
}

// Track purchase event
export function trackPurchase(amount, currency = "USD", data = {}) {
  trackEvent(EVENT_TYPES.PURCHASE, {
    amount,
    currency,
    ...data,
  });
}
