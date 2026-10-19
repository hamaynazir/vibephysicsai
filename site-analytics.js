// Basic opt-in: no Google script or requests before permission.
(() => {
  const id = 'G-081CN8GZGQ', key = 'vibephysicsai-analytics-consent';
  const base = new URL('.', document.currentScript.src);
  const live = ['vibephysicsai.com', 'www.vibephysicsai.com'].includes(location.hostname);
  let loaded = false, choice;
  try { choice = localStorage.getItem(key); } catch {}
  window['ga-disable-' + id] = choice !== 'accepted';
  function enable() {
    if (!live || loaded) return;
    loaded = true;
    window['ga-disable-' + id] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
    window.gtag('js', new Date());
    window.gtag('config', id, {allow_google_signals: false, allow_ad_personalization_signals: false});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.append(script);
  }
  if (choice === 'accepted') enable();
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = new URL('site-analytics.css', base).href;
  document.head.append(css);
  const panel = document.createElement('section');
  panel.id = 'analytics-choice';
  panel.setAttribute('aria-label', 'Analytics privacy preferences');
  panel.innerHTML = '<h2>Optional website analytics</h2><p>With your permission, Google Analytics helps us understand visits, popular pages and engagement. It uses cookies and sends usage and device information to Google. Advertising features are disabled. Lessons work equally well if you decline.</p><p>Reading progress and theme preferences are stored in your browser separately. Change your choice anytime using “Privacy settings”. Contact: <a href="mailto:mohammaedghazali@gmail.com">mohammaedghazali@gmail.com</a>. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google privacy policy ↗</a></p><div><button type="button" data-choice="declined">Decline analytics</button><button type="button" data-choice="accepted">Accept analytics</button></div>';
  panel.hidden = ['accepted', 'declined'].includes(choice);
  const settings = document.createElement('button');
  settings.type = 'button'; settings.id = 'analytics-settings';
  settings.textContent = 'Privacy settings'; settings.setAttribute('aria-controls', panel.id);
  settings.onclick = () => { panel.hidden = !panel.hidden; if (!panel.hidden) panel.querySelector('button').focus(); };
  panel.addEventListener('click', event => {
    const next = event.target.dataset.choice;
    if (!next) return;
    try { localStorage.setItem(key, next); } catch {}
    panel.hidden = true;
    if (next === 'accepted') enable();
    else {
      window['ga-disable-' + id] = true;
      for (const cookie of document.cookie.split(';')) {
        const name = cookie.split('=')[0].trim();
        if (name !== '_ga' && !name.startsWith('_ga_')) continue;
        for (const domain of ['', '; domain=' + location.hostname, '; domain=.vibephysicsai.com']) {
          document.cookie = name + '=; Max-Age=0; path=/' + domain;
        }
      }
      // Unload an already-running tag rather than sending denied-state pings.
      if (loaded) location.reload();
    }
    settings.focus();
  });
  window.addEventListener('storage', event => { if (event.key === key) location.reload(); });
  document.body.append(settings, panel);
})();
