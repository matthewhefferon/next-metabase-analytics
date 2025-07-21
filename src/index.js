// Main entry point for next-metabase-analytics NPM package
export {
  initAnalytics,
  trackEvent,
  trackPageView,
  trackClick,
  trackScroll,
  trackSignup,
  trackPurchase,
  EVENT_TYPES,
} from "./track.js";

// Export API route handler
export { default as analyticsEventHandler } from "./api-route.js";
