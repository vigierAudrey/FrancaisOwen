// Exercices sur les mots : vocabulaire, lecture de mots, orthographe.

import { SOUNDS } from '../data/sounds.js';
import { WORDS, WORD_BY, SIGHT, closeWords, sayOf, withArticle } from '../lang/word.js';
import { pick, shuffle } from '../core/util.js';
import { fits, NEVER } from './sons.js';

const illustrated = (ctx, word) => {
  const fromPool = ctx.pool.map((i) => i.word).filter((w) => w.emoji && w.emoji !== word.emoji);
  return [...new Set([...shuffle(fromPool), ...shuffle(WORDS)])].filter((w) => w.emoji !== word.emoji);
};

const correctionOf = (word, extra) => ({
  emoji: word.emoji,
  word,
  text: extra || (word.sight ? `C’est le mot « ${word.w} ». ${word.ex}` : `C’est ${withArticle(word)}.`),
  say: sayOf(word),
});

export const listen = {
  id: 'listen',
  label: 'Écoute et trouve',
  emoji: '🎧',
  desc: 'Trouve ce que tu entends',
  build(item, ctx) {
    const word = item.word;
    let choices;
    let style;
    if (word.sight) {
      choices = [word, ...closeWords(word, SIGHT, 3)].map((w) => ({ value: w.w, text: w.w }));
      style = 'text';
    } else {
      choices = [word, ...illustrated(ctx, word).slice(0, 3)].map((w) => ({ value: w.w, emoji: w.emoji }));
      style = 'emoji';
    }
    return {
      item,
      instruction: word.sight ? 'Écoute et trouve le mot !' : 'Écoute et trouve l’image !',
      say: sayOf(word),
      input: 'choices',
      choiceStyle: style,
      choices: shuffle(choices),
      answer: word.w,
      reveal: { word },
      correction: correctionOf(word),
    };
  },
};

export const read = {
  id: 'read',
  label: 'Lis et trouve',
  emoji: '👀',
  desc: 'Lis le mot tout seul',
  build(item) {
    const word = item.word;
    if (!word.emoji) return null;
    // Des mots qui s'écrivent presque pareil : il faut lire jusqu'au bout !
    const traps = closeWords(word, WORDS, 3);
    return {
      item,
      instruction: 'Lis le mot et trouve l’image !',
      word,
      input: 'choices',
      choiceStyle: 'emoji',
      choices: shuffle([word, ...traps].map((w) => ({ value: w.w, emoji: w.emoji }))),
      answer: word.w,
      afterOk: sayOf(word),
      correction: correctionOf(word, `« ${word.w} », c’est ${word.emoji}. Lis bien chaque syllabe !`),
    };
  },
};

// ---- Le mot bien écrit : fausses orthographes plausibles ----

function misspellings(word) {
  const gs = word.gs;
  const swap = new Set();
  gs.forEach((g, i) => {
    if (g.silent || !SOUNDS[g.s]) return;
    for (const alt of SOUNDS[g.s].graphemes) {
      if (alt !== g.g && !NEVER.has(alt) && fits(alt, g.s, word, g)) {
        swap.add(gs.map((x, j) => (j === i ? alt : x.g)).join(''));
      }
    }
  });
  const silent = new Set(gs.filter((g) => g.silent).map((g) => gs.filter((x) => x !== g).map((x) => x.g).join('')));
  const doubles = new Set();
  const w = word.w;
  w.replace(/([bcdfglmnprst])\1/g, (m, c, i) => doubles.add(w.slice(0, i) + c + w.slice(i + 2)));
  for (let i = 1; i < w.length - 1; i++) {
    if (/[bcdfglmnprst]/.test(w[i]) && /[aeiouéèêo]/.test(w[i - 1]) && /[aeiouéèêo]/.test(w[i + 1]) && w[i - 1] !== w[i]) {
      doubles.add(w.slice(0, i + 1) + w[i] + w.slice(i + 1));
    }
  }
  const ok = (x) => x !== w && !WORD_BY[x];
  const out = [];
  for (const set of [shuffle([...swap]), shuffle([...silent]), shuffle([...doubles])]) {
    for (const x of set) if (ok(x) && !out.includes(x) && out.length < 3) out.push(x);
  }
  return shuffle(out);
}

export const spellcheck = {
  id: 'spellcheck',
  label: 'Le mot bien écrit',
  emoji: '✅',
  desc: 'Un seul est juste',
  build(item) {
    const word = item.word;
    if (word.sight) return null;
    const wrong = misspellings(word);
    if (wrong.length < 2) return null;
    return {
      item,
      instruction: 'Quel mot est bien écrit ?',
      say: word.w,
      emoji: word.emoji,
      input: 'choices',
      choiceStyle: 'text',
      choices: shuffle([word.w, ...wrong]).map((t) => ({ value: t, text: t })),
      answer: word.w,
      correction: correctionOf(word, `On écrit « ${word.w} ». Prends une photo dans ta tête ! 📸`),
    };
  },
};

export const syllables = {
  id: 'syllables',
  label: 'Les syllabes',
  emoji: '🧩',
  desc: 'Remets-les dans l’ordre',
  build(item) {
    const word = item.word;
    if (word.sight || word.syl.length < 2) return null;
    const parts = word.syl.map((s) => s.map((g) => g.g).join(''));
    const other = pick(WORDS.filter((w) => w.syl.length > 1 && w.w !== word.w));
    const decoy = pick(other.syl).map((g) => g.g).join('');
    return {
      item,
      instruction: 'Remets les syllabes dans l’ordre !',
      say: word.w,
      emoji: word.emoji,
      input: 'tiles',
      tileStyle: 'syllable',
      tiles: shuffle(parts.includes(decoy) ? parts : [...parts, decoy]),
      answer: parts,
      correction: correctionOf(word, `On écrit « ${word.w} » : ${parts.join(' – ')}.`),
    };
  },
};

export const write = {
  id: 'write',
  label: 'J’écris le mot',
  emoji: '⌨️',
  desc: 'Lettre par lettre',
  build(item) {
    const word = item.word;
    const letters = Array.from(word.w.normalize('NFC'));
    if (letters.length > 8 || letters.length < 2) return null;
    const pool = 'aeioursltnmpcdé';
    const decoys = shuffle(Array.from(pool)).slice(0, letters.length > 5 ? 2 : 3);
    return {
      item,
      instruction: 'Écris le mot !',
      say: sayOf(word),
      emoji: word.emoji,
      input: 'tiles',
      tileStyle: 'letter',
      tiles: shuffle([...letters, ...decoys]),
      answer: letters,
      correction: correctionOf(word, `On écrit « ${word.w} ».`),
    };
  },
};
