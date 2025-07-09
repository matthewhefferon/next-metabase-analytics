// Event types for better categorization
export const EVENT_TYPES = {
  // Web events
  PAGE_VIEW: "page_view",
  PAGE_LOAD: "page_load",
  CLICK: "click",
  SCROLL: "scroll",

  // User events
  SIGNUP: "signup",
  LOGIN: "login",
  LOGOUT: "logout",

  // Business events
  PURCHASE: "purchase",
  SUBSCRIPTION: "subscription",
  FEATURE_USE: "feature_use",

  // Custom events
  CUSTOM: "custom",
};

// Get user's IP and location data
async function getLocationData() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    return {
      ip: data.ip,
      country: data.country_name,
      region: data.region,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
    };
  } catch (error) {
    console.warn("Could not fetch location data:", error);
    return null;
  }
}

export function trackEvent(eventType, payload = {}) {
  const event = {
    type: eventType,
    path: window.location.pathname,
    referrer: document.referrer,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    sessionId: getSessionId(),
    ...payload,
  };

  // Add location data if available
  getLocationData()
    .then((locationData) => {
      if (locationData) {
        event.location = locationData;
      }
      navigator.sendBeacon("/api/compass-event", JSON.stringify(event));
    })
    .catch(() => {
      // Fallback if location fetch fails
      navigator.sendBeacon("/api/compass-event", JSON.stringify(event));
    });
}

// Track specific web events
export function trackPageView() {
  trackEvent(EVENT_TYPES.PAGE_VIEW);
}

export function trackClick(element, action = "click") {
  trackEvent(EVENT_TYPES.CLICK, {
    element,
    action,
    text: element?.textContent?.slice(0, 100),
  });
}

export function trackScroll(depth) {
  trackEvent(EVENT_TYPES.SCROLL, { depth });
}

// Track business events
export function trackSignup(method = "email") {
  trackEvent(EVENT_TYPES.SIGNUP, { method });
}

export function trackPurchase(amount, currency = "USD") {
  trackEvent(EVENT_TYPES.PURCHASE, { amount, currency });
}

// Session management
function getSessionId() {
  let sessionId = sessionStorage.getItem("compass_session_id");
  if (!sessionId) {
    sessionId =
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("compass_session_id", sessionId);
  }
  return sessionId;
}

export function initCompass() {
  trackPageView();

  // Auto-track scroll depth
  let maxScroll = 0;
  window.addEventListener("scroll", () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
      maxScroll = scrollPercent;
      trackScroll(scrollPercent);
    }
  });
}
