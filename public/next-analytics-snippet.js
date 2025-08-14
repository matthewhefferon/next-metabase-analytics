(function () {
  // Generate or get existing session ID
  function getSessionId() {
    let sessionId = sessionStorage.getItem("next_analytics_session_id");
    if (!sessionId) {
      sessionId =
        "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem("next_analytics_session_id", sessionId);
    }
    return sessionId;
  }

  // Generate or get existing anonymous ID
  function getAnonymousId() {
    let anonymousId = localStorage.getItem("next_analytics_anonymous_id");
    if (!anonymousId) {
      anonymousId =
        "anon_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("next_analytics_anonymous_id", anonymousId);
    }
    return anonymousId;
  }

  // Detect device type
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    }
    if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
      return "mobile";
    }
    return "desktop";
  }

  // Parse user agent for browser and OS
  function parseUserAgent() {
    const ua = navigator.userAgent;
    let browser = "unknown";
    let os = "unknown";

    // Browser detection
    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edge")) browser = "Edge";
    else if (ua.includes("Opera")) browser = "Opera";

    // OS detection
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iOS")) os = "iOS";

    return { browser, os };
  }

  // Extract UTM and other parameters from URL
  function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get("utm_source") || null,
      utm_medium: urlParams.get("utm_medium") || null,
      utm_campaign: urlParams.get("utm_campaign") || null,
      utm_term: urlParams.get("utm_term") || null,
      utm_content: urlParams.get("utm_content") || null,
      gclid: urlParams.get("gclid") || null,
      fbclid: urlParams.get("fbclid") || null,
      ref: urlParams.get("ref") || null,
    };
  }

  // Get page performance metrics
  function getPerformanceMetrics() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      return { page_load_time: loadTime > 0 ? loadTime : null };
    }
    return { page_load_time: null };
  }

  // Collect basic event data
  function getEventData() {
    const { browser, os } = parseUserAgent();
    const urlParams = getUrlParams();
    const performance = getPerformanceMetrics();

    return {
      type: "page_view",
      path: window.location.pathname,
      url: window.location.href,
      title: document.title,
      referrer: document.referrer || "direct",
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      anonymous_id: getAnonymousId(),
      device_type: getDeviceType(),
      browser: browser,
      os: os,
      ...urlParams,
      ...performance,
    };
  }

  // Fetch location data from ipapi.co
  function fetchLocation(cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://ipapi.co/json/", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        try {
          var data = JSON.parse(xhr.responseText);
          cb({
            country: data.country_name,
            region: data.region,
            state: data.region, // For US, region and state are the same
            city: data.city,
            latitude: data.latitude,
            longitude: data.longitude,
            timezone: data.timezone,
          });
        } catch (e) {
          cb({});
        }
      }
    };
    xhr.send();
  }

  // Send event to API
  function sendEvent(event) {
    navigator.sendBeacon("/api/next-analytics-event", JSON.stringify(event));
  }

  // Track page view with location
  function trackPageView() {
    fetchLocation(function (location) {
      var event = getEventData();
      event.location = location;
      sendEvent(event);
    });
  }

  // Track initial page load
  trackPageView();

  // Track client-side navigation
  if (typeof window !== "undefined") {
    // Listen for Next.js route changes
    let currentPath = window.location.pathname;

    // Method 1: Listen for popstate events (back/forward buttons)
    window.addEventListener("popstate", function () {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        trackPageView();
      }
    });

    // Method 2: Use Next.js router events if available
    if (window.next && window.next.router) {
      window.next.router.events.on("routeChangeComplete", function (url) {
        if (url !== currentPath) {
          currentPath = url;
          trackPageView();
        }
      });
    }

    // Method 3: Poll for path changes (fallback)
    setInterval(function () {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        trackPageView();
      }
    }, 100);
  }
})();
