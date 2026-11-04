/* Welcome screen only: overall message; project entry remains deferred. */
(() => {
  const button = document.getElementById('fullscreen');
  let target = document;
  try { if (window.frameElement) target = window.parent.document; } catch {}
  button.addEventListener('click', async () => {
    try {
      if (target.fullscreenElement) await target.exitFullscreen();
      else await target.documentElement.requestFullscreen();
    } catch {
      document.getElementById('status').textContent = 'Use F11 in your browser to enter full screen.';
    }
  });
  target.addEventListener('fullscreenchange', () => {
    const active = Boolean(target.fullscreenElement);
    button.setAttribute('aria-label', active ? 'Exit full screen' : 'Enter full screen');
    button.querySelector('span').textContent = active ? 'Exit full screen' : 'Full screen';
  });
})();
