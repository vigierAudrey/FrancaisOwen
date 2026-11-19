// Exercices de grammaire (CE1) : déterminants, nombre, accord, nature des mots,
// la phrase, homophones, conjugaison au présent.

import { WORDS } from '../lang/word.js';
import { H_ASPIRE, plural, PRONOUNS, conjugate, allForms, subject } from '../data/grammar.js';
import { HOMOPHONES } from '../data/sentences.js';
import { pick, shuffle } from '../core/util.js';
import { withName } from './lecture.js';

const vowelStart = (w) => /^[aeiouyéèêâîôœ]/i.test(w) || (/^h/.test(w) && !H_ASPIRE.has(w));
const defArt = (word) => (vowelStart(word.w) && word.w !== 'yoyo' ? 'l’' : word.genre === 'f' ? 'la' : 'le');
const indefArt = (word) => (word.genre === 'f' ? 'une' : 'un');
const join = (art, w) => (art.endsWith('’') ? art + w : `${art} ${w}`);

export const article = {
  id: 'article',
  label: 'un ou une ?',
  emoji: '🏷️',
  desc: 'Choisis le petit mot',
  build(item) {
    const word = item.word;
    const ans = indefArt(word);
    return {
      item,
      instruction: 'Un ou une ?',
      emoji: word.emoji,
      text: `_ ${word.w}`,
      say: word.w,
      input: 'choices',
      choiceStyle: 'text',
      choices: [{ value: 'un', text: 'un' }, { value: 'une', text: 'une' }],
      answer: ans,
      afterOk: `${ans} ${word.w}`,
      correction: { emoji: word.emoji, text: `On dit « ${ans} ${word.w} ». ${ans === 'une' ? 'C’est un mot féminin.' : 'C’est un mot masculin.'}`, say: `${ans} ${word.w}` },
    };
  },
};

export const defArticle = {
  id: 'defArticle',
  label: 'le, la ou l’ ?',
  emoji: '🔖',
  desc: 'Choisis le petit mot',
  build(item) {
    const word = item.word;
    const ans = defArt(word);
    const tip = ans === 'l’' ? 'Devant une voyelle, « le » et « la » deviennent « l’ ».' : H_ASPIRE.has(word.w) ? 'Attention : on dit « le hibou », le h ne se lie pas !' : ans === 'la' ? 'C’est un mot féminin : on dit « une » et « la ».' : 'C’est un mot masculin : on dit « un » et « le ».';
    return {
      item,
      instruction: 'Le, la ou l’ ?',
      emoji: word.emoji,
      text: `_ ${word.w}`,
      say: word.w,
      input: 'choices',
      choiceStyle: 'text',
      choices: ['le', 'la', 'l’'].map((t) => ({ value: t, text: t })),
      answer: ans,
      afterOk: join(ans, word.w),
      correction: { emoji: word.emoji, text: `On écrit « ${join(ans, word.w)} ». ${tip}`, say: join(ans, word.w) },
    };
  },
};

export const pluralPick = {
  id: 'pluralPick',
  label: 'Un ou plusieurs ?',
  emoji: '🔢',
  desc: 'le chat / les chats',
  build(item) {
    const word = item.word;
    const pl = plural(word.w);
    if (pl === word.w) return null; // « la souris / les souris » : on ne voit pas la différence à l'écrit
    const many = Math.random() < 0.5;
    const text = many ? `les ${pl}` : join(defArt(word), word.w);
    const one = word.emoji;
    const lots = word.emoji.repeat(3);
    return {
      item,
      instruction: 'Lis : un seul ou plusieurs ?',
      text,
      textOpts: { big: true },
      input: 'choices',
      choiceStyle: 'emojis',
      choices: [{ value: 'one', emoji: one }, { value: 'many', emoji: lots }],
      answer: many ? 'many' : 'one',
      afterOk: text,
      correction: { emoji: many ? lots : one, text: many ? `« les ${pl} » : il y en a plusieurs, on met « les » et un « ${pl.endsWith('x') ? 'x' : 's'} » à la fin.` : `« ${text} » : il n’y en a qu’un.`, say: text },
    };
  },
};

export const pluralForm = {
  id: 'pluralForm',
  label: 'Écris au pluriel',
  emoji: '✳️',
  desc: 'un cheval, des chevaux',
  build(item) {
    const word = item.word;
    const pl = plural(word.w);
    if (pl === word.w) return null;
    const wrong = [...new Set([word.w, word.w + 's', word.w + 'x', word.w.replace(/al$/, 'aux')])].filter((x) => x !== pl);
    return {
      item,
      instruction: 'Complète au pluriel !',
      emoji: word.emoji.repeat(2),
      text: `${indefArt(word)} ${word.w}, des _`,
      input: 'choices',
      choiceStyle: 'text',
      choices: shuffle([pl, ...shuffle(wrong).slice(0, 2)]).map((t) => ({ value: t, text: t })),
      answer: pl,
      afterOk: `des ${pl}`,
      correction: {
        emoji: word.emoji.repeat(2),
        text: `Des « ${pl} ». ${pl.endsWith('aux') ? 'Les mots en -al font -aux au pluriel.' : pl.endsWith('x') ? 'Ce mot prend un x au pluriel.' : 'Au pluriel, on ajoute un s qu’on n’entend pas.'}`,
        say: `des ${pl}`,
      },
    };
  },
};

export const agree = {
  id: 'agree',
  label: 'Masculin ou féminin',
  emoji: '⚖️',
  desc: 'petit ou petite ?',
  build(item) {
    const adj = item.adj;
    const living = ['animaux', 'gens'];
    const nouns = WORDS.filter((w) => (!adj.living || living.includes(w.theme)) && !(adj.m === 'beau' && vowelStart(w.w)) && w.genre);
    const word = pick(nouns);
    const art = indefArt(word);
    const form = word.genre === 'f' ? adj.f : adj.m;
    const text = adj.place === 'avant' ? `${art} _ ${word.w}` : `${art} ${word.w} _`;
    const full = text.replace('_', form);
    return {
      item,
      instruction: 'Choisis le mot qui va bien !',
      emoji: word.emoji,
      text,
      input: 'choices',
      choiceStyle: 'text',
      choices: shuffle([adj.m, adj.f]).map((t) => ({ value: t, text: t })),
      answer: form,
      afterOk: full,
      correction: {
        emoji: word.emoji,
        text: `« ${full} ». ${word.genre === 'f' ? `« ${word.w} » est féminin (une) : on écrit « ${adj.f} ».` : `« ${word.w} » est masculin (un) : on écrit « ${adj.m} ».`}`,
        say: full,
      },
    };
  },
};

const NATURES = [
  { value: 'nom', text: '🏷️ Nom' },
  { value: 'verbe', text: '🏃 Verbe' },
  { value: 'adjectif', text: '🎨 Adjectif' },
];
const NATURE_TIP = {
  nom: 'C’est un nom : on peut mettre « un », « une » ou « le » devant.',
  verbe: 'C’est un verbe : c’est une action, on peut dire « je … », « il … ».',
  adjectif: 'C’est un adjectif : il dit comment est quelque chose (un chat … ).',
};

export const natureOf = {
  id: 'natureOf',
  label: 'Nom, verbe ou adjectif ?',
  emoji: '🗂️',
  desc: 'Range le mot',
  build(item) {
    return {
      item,
      instruction: 'Ce mot est un…',
      text: item.word.w,
      textOpts: { big: true },
      say: item.word.w,
      input: 'choices',
      choiceStyle: 'long',
      choices: NATURES,
      answer: item.nature,
      correction: { text: `« ${item.word.w} » : ${NATURE_TIP[item.nature]}`, say: item.word.w },
    };
  },
};

export const phraseOk = {
  id: 'phraseOk',
  label: 'La phrase bien écrite',
  emoji: '✒️',
  desc: 'Majuscule et point',
  build(item) {
    const s = withName(item.sentence);
    const lower = s[0].toLowerCase() + s.slice(1);
    const noPoint = s.replace(/\.$/, '');
    const both = lower.replace(/\.$/, '');
    const choices = [s, lower, noPoint, both].filter((x, i, a) => a.indexOf(x) === i);
    if (choices.length < 3) return null;
    return {
      item,
      instruction: 'Quelle phrase est bien écrite ?',
      input: 'choices',
      choiceStyle: 'long',
      choices: shuffle([s, ...shuffle(choices.slice(1)).slice(0, 2)]).map((t) => ({ value: t, text: t })),
      answer: s,
      correction: { text: `« ${s} » : une phrase commence par une majuscule et se termine par un point.`, say: s },
    };
  },
};

export const homophone = {
  id: 'homophone',
  label: 'Le bon petit mot',
  emoji: '🧐',
  desc: 'et / est, a / à',
  build(item) {
    const h = HOMOPHONES[item.group];
    const full = item.sentence.replace('_', item.answer);
    return {
      item,
      instruction: `${h.choices[0]} ou ${h.choices[1]} ?`,
      text: item.sentence,
      textOpts: { big: true },
      input: 'choices',
      choiceStyle: 'grapheme',
      choices: h.choices.map((t) => ({ value: t, text: t })),
      answer: item.answer,
      afterOk: full,
      correction: { text: `« ${full} » ${h.tips[item.answer]}`, say: full },
    };
  },
};

export const conj = {
  id: 'conj',
  label: 'Conjugue',
  emoji: '🔁',
  desc: 'je suis, tu es…',
  build(item) {
    const { verb, pronoun } = item;
    const ans = conjugate(verb, pronoun);
    const wrong = shuffle([...new Set(allForms(verb))].filter((f) => f !== ans)).slice(0, 2);
    const subj = subject(pronoun, ans);
    const sep = subj.endsWith('’') ? '' : ' ';
    return {
      item,
      instruction: `Conjugue « ${verb} » :`,
      text: `${subj}${sep}_`,
      textOpts: { big: true },
      input: 'choices',
      choiceStyle: 'text',
      choices: shuffle([ans, ...wrong]).map((t) => ({ value: t, text: t })),
      answer: ans,
      afterOk: `${subj}${sep}${ans}`,
      correction: {
        text: `${subj}${sep}${ans}. Avec « ${verb} » : ${PRONOUNS.filter((p) => p !== 'elle' && p !== 'elles').map((p) => `${subject(p, conjugate(verb, p)).toLowerCase()}${subject(p, conjugate(verb, p)).endsWith('’') ? '' : ' '}${conjugate(verb, p)}`).join(', ')}.`,
        say: `${subj} ${ans}`,
      },
    };
  },
};

