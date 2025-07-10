// Main entry point for metabase-compass NPM package
export {
  initCompass,
  trackEvent,
  trackPageView,
  trackClick,
  trackScroll,
  trackSignup,
  trackPurchase,
  EVENT_TYPES,
} from "./track.js";

// Export API route handler
export { default as compassEventHandler } from "./api-route.js";
