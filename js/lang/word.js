// Analyse de la notation des mots (voir data/words.js) et petits outils de langue.

import { RAW_WORDS, SIGHT_WORDS } from '../data/words.js';
import { VOWELS } from '../data/sounds.js';

// Son produit par défaut par chaque graphème.
const GMAP = {
  a: 'a', à: 'a', â: 'a', e: 'e', é: 'é', è: 'è', ê: 'è', ë: 'è',
  i: 'i', î: 'i', ï: 'i', y: 'i', o: 'o', ô: 'o', u: 'u', û: 'u',
  ou: 'ou', où: 'ou', oû: 'ou', au: 'o', eau: 'o', ai: 'è', aî: 'è', ei: 'è',
  er: 'é', ez: 'é', eu: 'eu', œu: 'eu', on: 'on', om: 'on',
  an: 'an', am: 'an', en: 'an', em: 'an',
  in: 'in', im: 'in', ain: 'in', aim: 'in', ein: 'in', un: 'in', um: 'in',
  oi: 'oi', oî: 'oi', oin: 'oin',
  ch: 'ch', gn: 'gn', ill: 'ill', il: 'ill', ll: 'l',
  c: 'k', cc: 'k', k: 'k', q: 'k', qu: 'k', ç: 's', s: 's', ss: 's', z: 'z',
  g: 'g', gu: 'g', ge: 'j', j: 'j', f: 'f', ff: 'f', ph: 'f', v: 'v', w: 'w', x: 'x',
  p: 'p', pp: 'p', b: 'b', bb: 'b', t: 't', tt: 't', th: 't', d: 'd', dd: 'd',
  l: 'l', m: 'm', mm: 'm', n: 'n', nn: 'n', r: 'r', rr: 'r', rh: 'r', h: null,
};

/**
 * « ch-e|v-a-l » → { w: 'cheval', syl: [[g, g], [g, g, g]], gs: [{ g, s, silent, syl }], sounds: Set }
 */
export function parseWord(notation) {
  const gs = [];
  const syl = notation.split('|').map((part, si) =>
    part.split('-').map((tok) => {
      let g;
      let s;
      let silent = false;
      const m = tok.match(/^\((.+)\)$/);
      if (m) {
        g = m[1];
        s = null;
        silent = true;
      } else {
        [g, s] = tok.split('=');
        if (s === undefined) {
          if (!(g in GMAP)) throw new Error(`Graphème inconnu « ${g} » dans ${notation}`);
          s = GMAP[g];
        }
        if (s === null) silent = true;
      }
      const o = { g, s, silent, syl: si, i: gs.length };
      gs.push(o);
      return o;
    })
  );
  const w = gs.map((x) => x.g).join('');
  const sounds = new Set(gs.filter((x) => x.s).map((x) => x.s));
  return { w, syl, gs, sounds };
}

/** Syllabes orales : une syllabe écrite sans voyelle prononcée (« me » de pomme) rejoint la précédente. */
export function oralSyllables(word) {
  const out = [];
  word.syl.forEach((graphs) => {
    const hasVowel = graphs.some((g) => VOWELS.has(g.s));
    if (!hasVowel && out.length) out[out.length - 1].push(...graphs);
    else out.push([...graphs]);
  });
  return out;
}

// ---- Construction de la banque ----

export const WORDS = [];
for (const [theme, block] of Object.entries(RAW_WORDS)) {
  for (const line of block.split('\n').map((l) => l.trim()).filter(Boolean)) {
    const [notation, emoji, genre] = line.split(/\s+/);
    WORDS.push({ ...parseWord(notation), emoji, genre, theme, notation });
  }
}
export const WORD_BY = Object.fromEntries(WORDS.map((w) => [w.w, w]));

/** Mots-outils : pas d'analyse en sons, un seul bloc. */
export const SIGHT = SIGHT_WORDS.map((s) => ({
  w: s.w,
  ex: s.ex,
  homo: s.homo,
  sight: true,
  syl: [[{ g: s.w, s: null, silent: false, syl: 0, i: 0 }]],
  gs: [{ g: s.w, s: null, silent: false, syl: 0, i: 0 }],
  sounds: new Set(),
}));

/** Ce que la voix doit lire pour un mot. */
export const sayOf = (word) => (word.sight ? `${word.w}… ${word.ex}` : word.w);

/** Article indéfini (« un chat », « une pomme »). */
export const withArticle = (word) => `${word.genre === 'f' ? 'une' : 'un'} ${word.w}`;

// ---- Distance entre mots (pour choisir des pièges ressemblants) ----

export function levenshtein(a, b) {
  const dp = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

/** Les mots qui s'écrivent le plus comme `word` (un peu de hasard entre ex æquo). */
export function closeWords(word, candidates, n = 3) {
  return candidates
    .filter((c) => c.w !== word.w && (!word.emoji || c.emoji !== word.emoji) && (!word.homo || c.homo !== word.homo))
    .map((c) => ({ c, d: levenshtein(word.w, c.w) + (c.w[0] === word.w[0] ? -0.5 : 0) + Math.random() * 0.9 }))
    .sort((x, y) => x.d - y.d)
    .slice(0, n)
    .map((x) => x.c);
}

/** Premier graphème (prononcé) qui produit le son `s`. */
export const graphemeOf = (word, s) => word.gs.find((g) => g.s === s && !g.silent);
