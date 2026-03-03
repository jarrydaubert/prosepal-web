(function trackNotFoundPageView() {
  const analytics = window.prosepalAnalytics;
  analytics?.trackEvent?.("page_not_found_view", {
    page_path: window.location.pathname || "/404.html",
    referrer_present: document.referrer.length > 0,
  });
})();
