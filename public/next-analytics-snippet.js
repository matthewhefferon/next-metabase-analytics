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
  function getEventData(type = "page_view", additionalData = {}) {
    const { browser, os } = parseUserAgent();
    const urlParams = getUrlParams();
    const performance = getPerformanceMetrics();

    return {
      type: type,
      path: window.location.pathname,
      url: window.location.href,
      title: document.title,
      referrer: document.referrer || "direct",
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      sessionId: getSessionId(),
      anonymous_id: getAnonymousId(),
      device_type: getDeviceType(),
      browser: browser,
      os: os,
      screen_resolution: `${screen.width}x${screen.height}`,
      ...urlParams,
      ...performance,
      ...additionalData,
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
            ip: data.ip,
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
      var event = getEventData("page_view");
      event.location = location;
      sendEvent(event);
    });
  }

  // Track click events
  function trackClick(element, data = {}) {
    fetchLocation(function (location) {
      var event = getEventData("click", {
        element: element,
        element_text: data.text || null,
        element_id: data.id || null,
        element_class: data.class || null,
        ...data,
      });
      event.location = location;
      sendEvent(event);
    });
  }

  // Track form submissions
  function trackFormSubmit(form, data = {}) {
    fetchLocation(function (location) {
      var event = getEventData("form_submit", {
        form_id: data.id || null,
        form_action: data.action || null,
        form_method: data.method || null,
        ...data,
      });
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

    // Track click events
    document.addEventListener("click", function (e) {
      const target = e.target;
      const tagName = target.tagName.toLowerCase();

      // Track button and link clicks (meaningful user actions)
      if (
        tagName === "button" ||
        tagName === "a" ||
        target.closest("button") ||
        target.closest("a")
      ) {
        const element =
          target.closest("button") || target.closest("a") || target;
        const text = element.textContent?.trim().substring(0, 100) || null;
        const id = element.id || null;
        const className = element.className || null;

        trackClick(tagName, {
          text: text,
          id: id,
          class: className,
          href: element.href || null,
        });
      }
    });

    // Track form submissions
    document.addEventListener("submit", function (e) {
      const form = e.target;
      const formId = form.id || null;
      const formAction = form.action || null;
      const formMethod = form.method || null;

      trackFormSubmit(form, {
        id: formId,
        action: formAction,
        method: formMethod,
      });
    });
  }
})();
