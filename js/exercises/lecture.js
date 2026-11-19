// Exercices de lecture : syllabes, phrases, compréhension, histoires.

import { WORDS, closeWords } from '../lang/word.js';
import { plural } from '../data/grammar.js';
import { pick, shuffle } from '../core/util.js';
import { getState } from '../core/store.js';

export const childName = () => getState()?.settings.childName || 'Owen';
export const withName = (t) => t.replaceAll('{nom}', childName());

// ---- Syllabes ----

// Consonnes et voyelles qui se ressemblent (à l'oreille ou à l'œil).
const C_TRAPS = { p: ['b', 'd', 'qu', 't'], b: ['d', 'p', 'qu'], d: ['b', 'p', 't', 'qu'], qu: ['p', 'b', 'd'], t: ['d', 'p'], m: ['n'], n: ['m', 'l'], f: ['v', 's'], v: ['f'], ch: ['j', 's'], j: ['ch'], s: ['ch', 'f'], l: ['r', 'n'], r: ['l'], c: ['g', 'qu'], g: ['c'] };
const V_TRAPS = { a: ['o', 'an'], i: ['é', 'u'], o: ['ou', 'on', 'a'], u: ['ou', 'i'], é: ['e', 'i'], e: ['é', 'a'], ou: ['on', 'o', 'u'], on: ['an', 'ou'], an: ['on', 'in'], oi: ['o', 'ou'], in: ['an', 'i'] };

const sylText = (c, v) => c + v;

export const sylListen = {
  id: 'sylListen',
  label: 'Lis la syllabe',
  emoji: '🔤',
  desc: 'Écoute et trouve-la',
  build(item, ctx) {
    const { c, v } = item.syl;
    const set = ctx.skill.id === 'bdpq' ? ['p', 'b', 'd', 'qu'] : C_TRAPS[c] || [];
    const traps = new Set();
    for (const cc of shuffle(set)) if (cc !== c && item.okC(cc, v)) traps.add(sylText(cc, v));
    for (const vv of shuffle(V_TRAPS[v] || [])) if (item.okC(c, vv)) traps.add(sylText(c, vv));
    const wrong = shuffle([...traps]).slice(0, 3);
    if (wrong.length < 2) return null;
    const ans = sylText(c, v);
    return {
      item,
      instruction: 'Quelle syllabe entends-tu ?',
      say: item.say,
      input: 'choices',
      choiceStyle: 'grapheme',
      choices: shuffle([ans, ...wrong]).map((t) => ({ value: t, text: t })),
      answer: ans,
      correction: { word: item.word, text: `« ${c} » et « ${v} », ça fait « ${ans} ».`, say: item.say },
    };
  },
};

export const sylBuild = {
  id: 'sylBuild',
  label: 'Fabrique la syllabe',
  emoji: '🧱',
  desc: 'Une consonne + une voyelle',
  build(item) {
    const { c, v } = item.syl;
    const cs = shuffle((C_TRAPS[c] || []).filter((x) => x !== c && x.length <= 2)).slice(0, 2);
    const vs = shuffle((V_TRAPS[v] || []).filter((x) => x !== v)).slice(0, 2);
    if (!cs.length || !vs.length) return null;
    return {
      item,
      instruction: 'Fabrique la syllabe que tu entends !',
      say: item.say,
      input: 'tiles',
      tileStyle: 'syllable',
      tiles: [...shuffle([c, ...cs]), ...shuffle([v, ...vs])],
      answer: [c, v],
      correction: { word: item.word, text: `« ${c} » + « ${v} » = « ${c + v} ».`, say: item.say },
    };
  },
};

/** Mots dont la première syllabe se lit exactement comme la syllabe. */
const startsWith = (w, c, v) => {
  const [a, b] = w.gs;
  const cg = c === 'c' ? 'c' : c;
  return w.syl[0].length === 2 && a?.g === cg && b?.g === v && !a.silent && !b.silent && a.s !== null && w.syl.length > 1;
};

export const sylStart = {
  id: 'sylStart',
  label: 'Le début du mot',
  emoji: '🔎',
  desc: 'Quelle image commence pareil ?',
  build(item) {
    const { c, v } = item.syl;
    const good = WORDS.filter((w) => startsWith(w, c, v));
    if (!good.length) return null;
    const word = pick(good);
    const others = shuffle(WORDS.filter((w) => w.syl.length > 1 && w.syl[0].map((g) => g.g).join('') !== c + v && w.emoji !== word.emoji));
    const near = others.filter((w) => w.w.startsWith(c) || w.syl[0].some((g) => g.g === v));
    const traps = [...new Set([...near.slice(0, 2), ...others])].slice(0, 3);
    return {
      item,
      instruction: `Quelle image commence par « ${c + v} » ?`,
      text: c + v,
      textOpts: { big: true },
      input: 'choices',
      choiceStyle: 'emoji',
      choices: shuffle([word, ...traps]).map((w) => ({ value: w.w, emoji: w.emoji })),
      answer: word.w,
      afterOk: word.w,
      reveal: { word },
      correction: { emoji: word.emoji, word, hlIndex: 0, text: `« ${word.w} » commence par « ${c + v} ».`, say: word.w },
    };
  },
};

// ---- Phrases à lire ----

const NUMBERS = [['deux', 2], ['trois', 3], ['quatre', 4]];

export const phrasePick = {
  id: 'phrasePick',
  label: 'Lis la phrase',
  emoji: '🖼️',
  desc: 'Trouve la bonne image',
  build(item) {
    const word = item.word;
    if (!word.emoji) return null;
    const art = (w) => (w.genre === 'f' ? 'une' : 'un');
    let text;
    let good;
    let wrong;
    if (Math.random() < 0.5) {
      const other = pick(WORDS.filter((w) => w.emoji !== word.emoji && w.theme !== word.theme));
      text = `${art(word)} ${word.w} et ${art(other)} ${other.w}`;
      const [cw] = closeWords(word, WORDS, 1);
      const [co] = closeWords(other, WORDS.filter((w) => w.emoji !== word.emoji), 1);
      good = word.emoji + other.emoji;
      wrong = [cw.emoji + other.emoji, word.emoji + co.emoji, word.emoji + word.emoji];
    } else {
      const [nTxt, n] = pick(NUMBERS);
      text = `${nTxt} ${plural(word.w)}`;
      const [cw] = closeWords(word, WORDS, 1);
      const m = n === 2 ? 3 : n - 1;
      good = word.emoji.repeat(n);
      wrong = [word.emoji.repeat(m), cw.emoji.repeat(n), word.emoji];
    }
    if (new Set([good, ...wrong]).size < 4) return null;
    return {
      item,
      instruction: 'Lis et trouve la bonne image !',
      text,
      textOpts: { big: true },
      helpSay: text,
      input: 'choices',
      choiceStyle: 'emojis',
      choices: shuffle([good, ...wrong]).map((e) => ({ value: e, emoji: e })),
      answer: good,
      afterOk: text,
      correction: { emoji: good, text: `« ${text} » : ${good}`, say: text },
    };
  },
};

const splitWords = (s) => s.split(' ');

export const sentenceOrder = {
  id: 'sentenceOrder',
  label: 'La phrase en ordre',
  emoji: '🚂',
  desc: 'Remets les mots dans l’ordre',
  build(item) {
    const s = withName(item.sentence);
    const words = splitWords(s);
    if (words.length > 7) return null;
    return {
      item,
      instruction: 'Remets les mots dans l’ordre !',
      helpSay: s,
      input: 'tiles',
      tileStyle: 'wordtile',
      tiles: shuffle(words),
      answer: words,
      tip: 'La phrase commence par une majuscule et finit par un point.',
      correction: { text: `« ${s} »`, say: s },
    };
  },
};

export const factCheck = {
  id: 'factCheck',
  label: 'Vrai ou faux ?',
  emoji: '🤔',
  desc: 'Lis et réfléchis',
  build(item) {
    const [s, truth] = item.fact;
    return {
      item,
      instruction: 'Lis la phrase. C’est vrai ou c’est faux ?',
      text: s,
      helpSay: s,
      input: 'truefalse',
      tfLabels: ['👍 Vrai', '👎 Faux'],
      answer: truth,
      correction: { text: `« ${s} » : c’est ${truth ? 'vrai' : 'faux'} !`, say: s },
    };
  },
};

export const storyQ = {
  id: 'storyQ',
  label: 'Petites histoires',
  emoji: '📚',
  desc: 'Lis et réponds',
  build(item) {
    const st = item.story;
    const [question, ans, ...others] = item.q.map(withName);
    const text = withName(st.text);
    return {
      item,
      instruction: question,
      title: `${st.emoji} ${st.title}`,
      text,
      textOpts: { story: true },
      helpSay: text,
      input: 'choices',
      choiceStyle: 'long',
      choices: shuffle([ans, ...others]).map((t) => ({ value: t, text: t })),
      answer: ans,
      correction: { text: `${question} → ${ans}. Relis bien l’histoire !`, say: `${question} ${ans}.` },
    };
  },
};

