// Blog articles: an embedded HTML page (iframe.blog-embed) gets the height of its content, also when it changes,
// so it reads like part of the article without its own scrollbar. Works for pages from the article folder (same origin).
(() => {
  for (const frame of document.querySelectorAll('iframe.blog-embed')) {
    // The body's height is the content; the document itself is at least as tall as the frame.
    const fit = () => {
      const body = frame.contentDocument?.body;
      // A little room for drawings that reach beyond their box (e.g. an SVG with overflow: visible).
      if (body) frame.style.height = Math.ceil(body.getBoundingClientRect().height) + 16 + 'px';
    };
    const watch = () => {
      const body = frame.contentDocument?.body;
      if (!body || frame.contentDocument.URL === 'about:blank') return;
      frame.contentDocument.documentElement.style.overflow = 'hidden';
      fit();
      new ResizeObserver(fit).observe(body);
    };
    frame.addEventListener('load', watch);
    if (frame.contentDocument?.readyState === 'complete') watch();
  }
})();
