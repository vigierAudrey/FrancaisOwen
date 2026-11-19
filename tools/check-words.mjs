// Vérifie la banque de mots : node tools/check-words.mjs
import { WORDS, SIGHT, oralSyllables } from '../js/lang/word.js';
import { SOUNDS } from '../js/data/sounds.js';
import { DEFS } from '../js/data/definitions.js';
const seen = new Set(); const emo = new Map(); let bad = 0;
for (const w of WORDS) {
  if (seen.has(w.w)) { console.log('DOUBLON mot', w.w); bad++; }
  seen.add(w.w);
  if (emo.has(w.emoji)) { console.log('DOUBLON emoji', w.emoji, emo.get(w.emoji), w.w); bad++; }
  emo.set(w.emoji, w.w);
  for (const g of w.gs) if (g.s && !(g.s in SOUNDS) && !['x', 'w', 'oin'].includes(g.s)) { console.log('son inconnu', g.s, w.w); bad++; }
  if (!['m', 'f'].includes(w.genre)) { console.log('genre ?', w.w); bad++; }
  if (!w.def) { console.log('définition manquante', w.w); bad++; }
  else if (new RegExp(`(^|[^\\p{L}])${w.w}([^\\p{L}]|$)`, 'iu').test(w.def)) { console.log('la définition contient le mot', w.w, '→', w.def); bad++; }
}
for (const k of Object.keys(DEFS)) if (!seen.has(k)) { console.log('définition sans mot', k); bad++; }
console.log(`${WORDS.length} mots illustrés, ${SIGHT.length} mots-outils`);
const counts = Object.keys(SOUNDS).map((s) => [s, WORDS.filter((w) => w.sounds.has(s)).length]);
console.log(counts.map(([s, n]) => `${s}:${n}`).join('  '));
if (process.argv[2] === '-v') for (const w of WORDS) console.log(w.w.padEnd(14), [...w.sounds].join(' ').padEnd(22), oralSyllables(w).map((s) => s.map((g) => g.g).join('')).join('·'));
process.exit(bad ? 1 : 0);
