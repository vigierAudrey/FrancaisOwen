// Univers « Les mots » : vocabulaire illustré par thème + mots-outils.

import { THEMES } from '../data/words.js';
import { WORDS, SIGHT } from '../lang/word.js';

const themeSkills = THEMES.map((t) => ({
  id: t.id,
  label: t.label,
  short: t.label.replace(/^(Les |La |Le |L’)/, ''),
  emoji: t.emoji,
  family: 'themes',
  items: WORDS.filter((w) => w.theme === t.id).map((w) => ({ id: `mot:${w.w}`, unitId: 'mots', skillId: t.id, word: w })),
}));

const sightSkill = {
  id: 'outils',
  label: 'Les mots-outils',
  short: 'Mots-outils',
  emoji: '🔧',
  family: 'outils',
  parentInfo: 'le, et, est, dans, avec… à reconnaître d’un coup d’œil.',
  items: SIGHT.map((w) => ({ id: `outil:${w.w}`, unitId: 'mots', skillId: 'outils', word: w })),
};

export default {
  id: 'mots',
  name: 'Les mots',
  emoji: '📚',
  mascotLine: 'Je lis et j’écris plein de mots',
  learnKind: 'words',
  families: [
    { id: 'themes', label: 'Les mots par thème', emoji: '🗂️' },
    { id: 'outils', label: 'Les mots-outils', emoji: '🔧' },
  ],
  skills: [...themeSkills, sightSkill],
  defaultSkills: [...THEMES.map((t) => t.id), 'outils'],
  modes: ['learn', 'listen', 'read', 'spellcheck', 'syllables', 'write', 'memory', 'mystery', 'chrono'],
  reviewModes: ['listen', 'read', 'spellcheck', 'syllables', 'write'],
};
