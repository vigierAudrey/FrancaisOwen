// Exercices « Nombres et couleurs » : écouter, lire, compter, écrire les nombres en lettres
// et les noms des couleurs.

import { pick, shuffle } from '../core/util.js';
import { NUMBERS, COLOR_WORDS } from '../units/nombres.js';

const isColor = (w) => w.kind === 'couleur';
const familyOf = (w) => (isColor(w) ? COLOR_WORDS : NUMBERS);

/** Pièges : pour un nombre, ses voisins et ceux qui se ressemblent ; pour une couleur, d'autres couleurs. */
function traps(word, n = 3) {
  if (isColor(word)) return shuffle(COLOR_WORDS.filter((w) => w !== word)).slice(0, n);
  const near = NUMBERS.filter((w) => w !== word)
    .map((w) => {
      let d = Math.abs(w.n - word.n);
      if (w.theme === word.theme) d = Math.min(d, 3);
      if (w.w.includes(word.w) || word.w.includes(w.w)) d = 0.5; // six / seize / dix-sept…
      return { w, d: d + Math.random() * 2 };
    })
    .sort((a, b) => a.d - b.d);
  return near.slice(0, n).map((x) => x.w);
}

const visualTxt = (w) => (isColor(w) ? `la couleur ${w.emoji}` : `le nombre ${w.n}`);
const correctionOf = (word, text) => ({ emoji: word.emoji, word, text: text || `${word.def}`, say: word.w });

/** Ce qu'on montre pour faire deviner : des objets à compter, des dizaines, ou un objet coloré. */
function lookOf(word) {
  if (isColor(word)) return { emoji: pick(word.things), instruction: 'De quelle couleur est-ce ?' };
  const n = word.n;
  if (n >= 1 && n <= 10) return { emoji: pick(['🍎', '⭐', '🐟', '🎈', '🍪', '🌼', '🐞', '⚽']).repeat(n), instruction: 'Combien y en a-t-il ?' };
  if (n === 0) return { emoji: '🧺', instruction: 'Combien de pommes dans le panier vide ?' };
  if (n > 10 && n < 20) return { text: `10 + ${n - 10}`, instruction: 'Combien ça fait ?' };
  if (n <= 100) return { emoji: '🔟'.repeat(n / 10), instruction: 'Combien ça fait ? Chaque 🔟 vaut dix.' };
  return { emoji: '💯'.repeat(10), instruction: 'Combien ça fait ? Chaque 💯 vaut cent.' };
}

export const numListen = {
  id: 'numListen',
  label: 'Écoute et trouve',
  emoji: '🎧',
  desc: 'Trouve le nombre ou la couleur',
  build(item) {
    const word = item.word;
    return {
      item,
      instruction: isColor(word) ? 'Écoute et trouve la couleur !' : 'Écoute et trouve le nombre !',
      say: word.w,
      emoji: '👂',
      input: 'choices',
      choiceStyle: isColor(word) ? 'emoji' : 'text',
      choices: shuffle([word, ...traps(word)]).map((w) => (isColor(w) ? { value: w.w, emoji: w.emoji } : { value: w.w, text: String(w.n) })),
      answer: word.w,
      reveal: { word },
      correction: correctionOf(word, `« ${word.w} », c’est ${visualTxt(word)}.`),
    };
  },
};

export const numRead = {
  id: 'numRead',
  label: 'Lis et trouve',
  emoji: '👀',
  desc: 'Lis le mot tout seul',
  build(item) {
    const word = item.word;
    return {
      item,
      instruction: isColor(word) ? 'Lis le mot et trouve la couleur !' : 'Lis le mot et trouve le nombre !',
      word,
      input: 'choices',
      choiceStyle: isColor(word) ? 'emoji' : 'text',
      choices: shuffle([word, ...traps(word)]).map((w) => (isColor(w) ? { value: w.w, emoji: w.emoji } : { value: w.w, text: String(w.n) })),
      answer: word.w,
      afterOk: word.w,
      correction: correctionOf(word, `« ${word.w} », c’est ${visualTxt(word)}. Lis bien jusqu’au bout !`),
    };
  },
};

export const numLook = {
  id: 'numLook',
  label: 'Compte et colorie',
  emoji: '🍎',
  desc: 'Combien ? Quelle couleur ?',
  build(item) {
    const word = item.word;
    const look = lookOf(word);
    return {
      item,
      instruction: look.instruction,
      emoji: look.emoji,
      text: look.text,
      textOpts: { big: true },
      input: 'choices',
      choiceStyle: 'text',
      choices: shuffle([word, ...traps(word)]).map((w) => ({ value: w.w, text: w.w })),
      answer: word.w,
      afterOk: word.w,
      correction: correctionOf(word, isColor(word) ? `C’est ${word.w} ! ${word.def}` : `Ça fait ${word.n} : on écrit « ${word.w} ».`),
    };
  },
};

export const numWrite = {
  id: 'numWrite',
  label: 'J’écris le mot',
  emoji: '⌨️',
  desc: 'Lettre par lettre',
  build(item) {
    const word = item.word;
    const letters = Array.from(word.w);
    // Mots longs (quatre-vingt-dix) : on écrit syllabe par syllabe.
    const long = letters.length > 9;
    const answer = long ? word.syl.map((s) => s.map((g) => g.g).join('')) : letters;
    const decoys = long
      ? shuffle(familyOf(word).filter((w) => w !== word).flatMap((w) => w.syl.map((s) => s.map((g) => g.g).join('')))).filter((s) => !answer.includes(s)).slice(0, 2)
      : shuffle(Array.from('aeiourstnlcdqxz')).filter((l) => !letters.includes(l)).slice(0, letters.length > 5 ? 2 : 3);
    return {
      item,
      instruction: isColor(word) ? 'Écris le nom de la couleur !' : 'Écris le nombre en lettres !',
      say: word.w,
      emoji: isColor(word) ? word.emoji : undefined,
      text: isColor(word) ? undefined : String(word.n),
      textOpts: { big: true },
      input: 'tiles',
      tileStyle: long ? 'syllable' : 'letter',
      tiles: shuffle([...answer, ...decoys]),
      answer,
      correction: correctionOf(word, `On écrit « ${word.w} ».${word.w.includes('-') ? ' N’oublie pas le petit tiret !' : ''}`),
    };
  },
};

export const numSpell = {
  id: 'numSpell',
  label: 'Le mot bien écrit',
  emoji: '✅',
  desc: 'Un seul est juste',
  build(item) {
    const word = item.word;
    const wrong = word.wrong.filter((x) => x !== word.w);
    if (wrong.length < 2) return null;
    return {
      item,
      instruction: 'Quel mot est bien écrit ?',
      say: word.w,
      emoji: isColor(word) ? word.emoji : undefined,
      text: isColor(word) ? undefined : String(word.n),
      textOpts: { big: true },
      input: 'choices',
      choiceStyle: 'text',
      choices: shuffle([word.w, ...wrong.slice(0, 3)]).map((t) => ({ value: t, text: t })),
      answer: word.w,
      correction: correctionOf(word, `On écrit « ${word.w} ». Prends une photo dans ta tête ! 📸`),
    };
  },
};
