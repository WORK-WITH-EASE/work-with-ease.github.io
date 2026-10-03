// Only served and injected by the local Python preview server.
(() => {
  const script = document.currentScript;
  let previous = JSON.parse(script.dataset.snapshot);
  async function poll() {
    try {
      const response = await fetch('/__preview/state', { cache: 'no-store' });
      if (!response.ok) return;
      const next = await response.json();
      const names = new Set([...Object.keys(previous), ...Object.keys(next)]);
      const changed = [...names].filter(name => previous[name] !== next[name]);
      if (!changed.length) return;
      if (changed.every(name => name.endsWith('.css') && next[name])) {
        for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
          const url = new URL(link.href);
          if (url.origin !== location.origin || !changed.includes(url.pathname.slice(1))) continue;
          // Keep old styles until the replacement has loaded, preserving page state.
          await new Promise((resolve, reject) => {
            const replacement = link.cloneNode();
            url.searchParams.set('_preview', next[url.pathname.slice(1)]);
            replacement.href = url.href;
            replacement.onload = () => { link.remove(); resolve(); };
            replacement.onerror = () => { replacement.remove(); reject(new Error('CSS reload failed')); };
            link.after(replacement);
          });
        }
        previous = next;
      } else {
        location.reload();
      }
    } catch (_) {
      // Retry after a build or server restart without disrupting the preview.
    } finally {
      setTimeout(poll, 1000);
    }
  }
  setTimeout(poll, 1000);
})();
