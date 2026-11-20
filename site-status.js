(() => {
  const pendingHosts = new Set(['api', 'video', 'mail', 'class'].map(name => `${name}.pdxstudio.top`));
  const pendingPaths = /^\/(score|check|kugou|api)(\/|$)/;
  function unavailable(link) {
    try {
      const url = new URL(link.getAttribute('href'), location.href);
      return pendingHosts.has(url.hostname) ||
        (['pdxstudio.top', 'www.pdxstudio.top', location.hostname].includes(url.hostname) && pendingPaths.test(url.pathname));
    } catch { return false; }
  }
  function markLinks(root) {
    root.querySelectorAll('a[href]').forEach(link => {
      if (!unavailable(link)) return;
      if (link.dataset.comingSoon) return;
      link.dataset.comingSoon = 'true';
      link.title = '敬请期待';
      if (!link.querySelector('h1, h2, h3, h4, img, svg')) link.textContent = '敬请期待';
      else {
        const label = document.createElement('span');
        label.textContent = '敬请期待';
        const tags = link.querySelector('.work-tags');
        if (tags) tags.replaceChildren(label);
        else link.append(label);
      }
      link.setAttribute('aria-label', '敬请期待');
    });
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || !unavailable(link)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    alert('敬请期待');
  }, true);
  markLinks(document);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
    if (node.nodeType !== 1) return;
    if (node.matches('a[href]')) markLinks(node.parentElement);
    else markLinks(node);
  }))).observe(document.body, { childList: true, subtree: true });
})();
