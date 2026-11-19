// Univers « Les sons » : une notion par son, plus les paires de sons cousins.
// Les mots de chaque son sont trouvés automatiquement dans la banque.

import { SOUNDS, FAMILIES, PAIRS } from '../data/sounds.js';
import { WORDS } from '../lang/word.js';

const soundSkills = Object.entries(SOUNDS).map(([id, s]) => ({
  id,
  label: `Le son « ${s.label} »`,
  short: s.label,
  family: s.family,
  sound: id,
  parentInfo: `${s.graphemes.join(', ')} — comme dans ${s.ref}`,
  items: WORDS.filter((w) => w.sounds.has(id)).map((w) => ({ id: `son:${id}:${w.w}`, unitId: 'sons', skillId: id, word: w, sound: id })),
}));

const pairSkills = PAIRS.map(([a, b]) => {
  const id = `${a}-${b}`;
  return {
    id,
    label: `« ${SOUNDS[a].label} » ou « ${SOUNDS[b].label} » ?`,
    short: `${SOUNDS[a].label} / ${SOUNDS[b].label}`,
    family: 'cousins',
    pair: [a, b],
    parentInfo: `Ne pas confondre ${SOUNDS[a].label} (${SOUNDS[a].ref}) et ${SOUNDS[b].label} (${SOUNDS[b].ref}).`,
    items: WORDS.filter((w) => w.sounds.has(a) !== w.sounds.has(b)).map((w) => {
      const s = w.sounds.has(a) ? a : b;
      return { id: `son:${id}:${w.w}`, unitId: 'sons', skillId: id, word: w, sound: s };
    }),
  };
});

export default {
  id: 'sons',
  name: 'Les sons',
  emoji: '👂',
  mascotLine: 'J’écoute et je reconnais les sons',
  learnKind: 'sounds',
  families: FAMILIES,
  skills: [...soundSkills, ...pairSkills],
  defaultSkills: ['ou', 'on', 'an', 'in', 'oi', 'ch', 'é', 'è', 'eu', 'p-b', 'f-v', 'an-on'],
  modes: ['learn', 'hear', 'pickSound', 'spell', 'where', 'variant', 'hunt'],
  reviewModes: ['hear', 'pickSound', 'spell', 'where', 'variant'],
};
