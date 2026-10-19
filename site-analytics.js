// Shared Google tag for the published website; local previews are excluded.
(() => {
  if (!['vibephysicsai.com', 'www.vibephysicsai.com'].includes(location.hostname)) return;
  const id = 'G-081CN8GZGQ';
  if (window.vibeAnalyticsLoaded) return;
  window.vibeAnalyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', id, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
  document.head.append(script);
})();
