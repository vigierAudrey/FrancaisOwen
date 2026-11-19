// Affichage d'un mot façon « cahier de lecture » :
// syllabes en couleurs alternées, lettres muettes en gris, son mis en valeur.

import { h } from './dom.js';
import { getState } from '../core/store.js';

/**
 * opts.mask      index du graphème remplacé par une case vide
 * opts.fill      texte à afficher dans la case (réponse choisie)
 * opts.highlight son (id) à surligner          opts.hlIndex  graphème à surligner
 * opts.colors    syllabes en couleur (par défaut : réglage parent)
 */
export function wordView(word, opts = {}) {
  const colors = opts.colors ?? getState().settings.syllables;
  const multi = word.syl.length > 1;
  return h(
    'span',
    { class: 'word' + (colors && multi ? ' colored' : ''), lang: 'fr' },
    word.syl.map((gs, si) =>
      h(
        'span',
        { class: `syl c${si % 2}` },
        gs.map((g) => {
          if (g.i === opts.mask) return h('span', { class: 'gap' + (opts.fill ? ' filled' : '') }, opts.fill || '?');
          const hl = (opts.highlight && g.s === opts.highlight && !g.silent) || g.i === opts.hlIndex;
          return h('span', { class: 'g' + (g.silent ? ' silent' : '') + (hl ? ' hl' : '') }, g.g);
        })
      )
    )
  );
}
