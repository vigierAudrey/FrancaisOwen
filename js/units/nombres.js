// Univers « Nombres et couleurs » : lire et écrire les nombres en lettres, et les couleurs.

import { NUMBER_GROUPS, COLORS } from '../data/nombres.js';
import { parseWord } from '../lang/word.js';

/** « d-i-x=s+s-e=è-(p)-t » → mot « dix-sept » (le tiret est une lettre muette, en gris). */
export function parseCompound(notation) {
  const parts = notation.split('+').map(parseWord);
  const gs = [];
  const syl = [];
  parts.forEach((p, pi) => {
    p.syl.forEach((graphs) => {
      syl.push(graphs.map((g) => {
        const o = { ...g, syl: syl.length, i: gs.length };
        gs.push(o);
        return o;
      }));
    });
    if (pi < parts.length - 1) {
      const dash = { g: '-', s: null, silent: true, syl: syl.length - 1, i: gs.length };
      gs.push(dash);
      syl[syl.length - 1].push(dash);
    }
  });
  return { w: gs.map((g) => g.g).join(''), syl, gs, sounds: new Set(parts.flatMap((p) => [...p.sounds])) };
}

export const NUMBERS = NUMBER_GROUPS.flatMap((grp) =>
  grp.rows.map(([notation, n, def, wrong]) => ({ ...parseCompound(notation), n, emoji: String(n), def, wrong, genre: 'm', theme: grp.id, notation, kind: 'nombre' }))
);
export const COLOR_WORDS = COLORS.map(([notation, emoji, def, wrong, things]) => ({ ...parseCompound(notation), emoji, def, wrong, things, genre: 'm', theme: 'couleurs', notation, kind: 'couleur' }));

const skillOf = (id, label, short, emoji, words, exercises) => ({
  id,
  label,
  short,
  emoji,
  family: id === 'couleurs' ? 'couleurs' : 'nombres',
  wordTheme: true, // utilisable dans les mots mêlés, mots croisés…
  exercises,
  items: words.map((w) => ({ id: `${w.kind}:${w.w}`, unitId: 'nombres', skillId: id, word: w })),
});

const NUM_EX = ['numListen', 'numRead', 'numLook', 'numWrite', 'numSpell'];

export default {
  id: 'nombres',
  name: 'Nombres et couleurs',
  emoji: '🎨',
  mascotLine: 'J’écris les nombres et les couleurs',
  learnKind: 'words',
  families: [
    { id: 'nombres', label: 'Les nombres en lettres', emoji: '🔢' },
    { id: 'couleurs', label: 'Les couleurs', emoji: '🎨' },
  ],
  skills: [
    ...NUMBER_GROUPS.map((g) => skillOf(g.id, g.label, g.short, g.emoji, NUMBERS.filter((w) => w.theme === g.id), NUM_EX)),
    skillOf('couleurs', 'Les couleurs', 'Couleurs', '🎨', COLOR_WORDS, NUM_EX),
  ],
  defaultSkills: ['n0-10', 'n11-20', 'dizaines', 'couleurs'],
  modes: ['learn', 'numListen', 'numRead', 'numLook', 'numWrite', 'numSpell', 'memory', 'wordsearch', 'crossword', 'mystery'],
  reviewModes: NUM_EX,
};
