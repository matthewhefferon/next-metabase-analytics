// Main entry point for metabase-compass NPM package
export {
  initCompass,
  trackEvent,
  trackPageView,
  trackClick,
  trackScroll,
  trackSignup,
  trackLogin,
  trackPurchase,
  trackCustom,
  EVENT_TYPES,
} from "./track.js";

// Export API route handler
export { default as compassEventHandler } from "./api-route.js";
