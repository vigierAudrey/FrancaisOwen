// Création d'éléments DOM : h('div', { class: 'x', onclick }, enfants...)
// Le texte est toujours inséré comme texte (jamais interprété comme du HTML).

export function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value') el.value = v;
    else if (k === 'checked') el.checked = !!v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

/**
 * Insère un visuel SVG généré par ui/visuals.js (contenu interne à l'app,
 * construit uniquement à partir de nombres — jamais de texte saisi).
 */
export function svgBlock(markup, cls = 'vis-wrap') {
  const wrap = document.createElement('div');
  wrap.className = cls;
  wrap.append(document.createRange().createContextualFragment(markup));
  return wrap;
}
