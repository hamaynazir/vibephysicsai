/* One appearance preference for every lecture, laboratory and library page. */
(() => {
  const key = 'vibephysicsai-theme';
  let current = 'light';
  try { current = localStorage.getItem(key) === 'dark' ? 'dark' : 'light'; } catch {}
  function buttons() {
    document.querySelectorAll('#theme,[data-theme-toggle]').forEach(button => {
      const label = `Switch to ${current === 'dark' ? 'light' : 'dark'} mode`;
      if (button.getAttribute('aria-label') !== label) {
        button.textContent = current === 'dark' ? '☀' : '☾';
        button.setAttribute('aria-label', label);
        button.setAttribute('title', label);
      }
    });
  }
  function set(value, persist = true) {
    current = value === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = current;
    document.documentElement.style.colorScheme = current;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = current === 'dark' ? '#151c25' : '#ffffff';
    if (persist) try { localStorage.setItem(key, current); } catch {}
    buttons();
    window.dispatchEvent(new CustomEvent('vibe-theme-change', {detail: current}));
  }
  window.VibeTheme = {set, get: () => current};
  set(current, false);
  document.addEventListener('click', event => {
    if (event.target.closest('#theme,[data-theme-toggle]')) set(current === 'dark' ? 'light' : 'dark');
  });
  new MutationObserver(buttons).observe(document.documentElement, {childList: true, subtree: true});
  window.addEventListener('storage', event => { if (event.key === key) set(event.newValue, false); });
})();
