(function () {
  // Collect basic event data
  function getEventData() {
    return {
      type: "page_view",
      path: window.location.pathname,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
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
            state: data.region, // for US state mapping
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
    navigator.sendBeacon("/api/compass-event", JSON.stringify(event));
  }

  // Track page view with location
  fetchLocation(function (location) {
    var event = getEventData();
    for (var k in location) event[k] = location[k];
    sendEvent(event);
  });
})();
