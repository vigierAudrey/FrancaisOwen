// Mini routeur basé sur l'historique du navigateur
// (le bouton "retour" d'Android fonctionne naturellement).

const screens = {};
let current = null;

export function register(name, fn) {
  screens[name] = fn;
}

export function go(name, params = {}, { replace = false } = {}) {
  const st = { name, params };
  if (replace) history.replaceState(st, '');
  else history.pushState(st, '');
  render(st);
}

export function back() {
  if (history.length > 1 && history.state?.name !== 'home') history.back();
  else go('home', {}, { replace: true });
}

function render(st) {
  current?.destroy?.();
  const fn = screens[st?.name] || screens.home;
  const root = document.getElementById('app');
  root.replaceChildren();
  const r = fn(st?.params || {});
  current = r instanceof Node ? { el: r } : r;
  root.append(current.el);
  window.scrollTo(0, 0);
}

export function start() {
  window.addEventListener('popstate', (e) => render(e.state || { name: 'home' }));
  // Au rechargement, on ne rouvre ni une séance en cours ni l'espace parents (protégé).
  const NO_RESTORE = ['session', 'results', 'parent'];
  const st = history.state?.name && !NO_RESTORE.includes(history.state.name) ? history.state : { name: 'home', params: {} };
  history.replaceState(st, '');
  render(st);
}
