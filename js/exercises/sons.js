// Exercices sur les sons (phonologie et correspondance son / écriture).
// Chaque exercice : build(item, ctx) → question (format décrit dans exercises/index.js) ou null
// si l'élément ne s'y prête pas (la séance en choisit alors un autre).

import { SOUNDS } from '../data/sounds.js';
import { WORDS, graphemeOf, oralSyllables } from '../lang/word.js';
import { pick, shuffle } from '../core/util.js';

const lab = (s) => `« ${SOUNDS[s].label} »`;

/** Sons proposés comme pièges : le cousin de la paire, ou les sons proches + ceux travaillés. */
function trapSounds(item, ctx) {
  if (ctx.skill.pair) return ctx.skill.pair.filter((s) => s !== item.sound);
  const sel = ctx.skills.map((s) => s.sound).filter(Boolean);
  return [...new Set([...SOUNDS[item.sound].confuse, ...shuffle(sel)])].filter((s) => s !== item.sound && SOUNDS[s]);
}

export const hear = {
  id: 'hear',
  label: 'J’entends ?',
  emoji: '👂',
  desc: 'Oui ou non ?',
  build(item) {
    const snd = item.sound;
    const yes = Math.random() < 0.55;
    let word = item.word;
    if (!yes) {
      const without = WORDS.filter((w) => !w.sounds.has(snd));
      const tricky = without.filter((w) => SOUNDS[snd].confuse.some((c) => w.sounds.has(c)));
      word = pick(tricky.length && Math.random() < 0.7 ? tricky : without);
    }
    return {
      item,
      instruction: 'Entends-tu ce son ?',
      sound: snd,
      say: word.w,
      emoji: word.emoji,
      input: 'truefalse',
      tfLabels: ['👂 Oui', '🙉 Non'],
      answer: yes,
      reveal: { word, highlight: yes ? snd : null },
      correction: {
        emoji: word.emoji,
        word,
        highlight: yes ? snd : null,
        text: yes ? `Dans « ${word.w} », on entend ${lab(snd)}.` : `Dans « ${word.w} », on n’entend pas ${lab(snd)}.`,
        say: word.w,
      },
    };
  },
};

export const pickSound = {
  id: 'pickSound',
  label: 'Quel son ?',
  emoji: '🎵',
  desc: 'Choisis le son entendu',
  build(item, ctx) {
    const word = item.word;
    const traps = trapSounds(item, ctx).filter((s) => !word.sounds.has(s));
    if (!traps.length) return null;
    const choices = shuffle([item.sound, ...shuffle(traps).slice(0, ctx.skill.pair ? 1 : 2)]);
    return {
      item,
      instruction: 'Quel son entends-tu ?',
      say: word.w,
      emoji: word.emoji,
      input: 'choices',
      choiceStyle: 'sound',
      choices: choices.map((s) => ({ value: s, text: SOUNDS[s].label })),
      answer: item.sound,
      reveal: { word, highlight: item.sound },
      correction: { emoji: word.emoji, word, highlight: item.sound, text: `Dans « ${word.w} », on entend ${lab(item.sound)}.`, say: word.w },
    };
  },
};

export const spell = {
  id: 'spell',
  label: 'Complète le mot',
  emoji: '✍️',
  desc: 'Il manque des lettres',
  build(item, ctx) {
    const word = item.word;
    const g = graphemeOf(word, item.sound);
    if (!g) return null;
    const same = new Set(SOUNDS[item.sound].graphemes);
    const traps = [...new Set(trapSounds(item, ctx).map((s) => SOUNDS[s].graphemes[0]))].filter((t) => t !== g.g && !same.has(t));
    if (!traps.length) return null;
    const choices = shuffle([g.g, ...shuffle(traps).slice(0, ctx.skill.pair ? 1 : 2)]);
    return {
      item,
      instruction: 'Quelles lettres manquent ?',
      say: word.w,
      emoji: word.emoji,
      word,
      wordOpts: { mask: g.i },
      input: 'choices',
      choiceStyle: 'grapheme',
      choices: choices.map((t) => ({ value: t, text: t })),
      answer: g.g,
      correction: {
        emoji: word.emoji,
        word,
        hlIndex: g.i,
        text: `On entend ${lab(item.sound)} : on écrit « ${g.g} ».`,
        say: word.w,
      },
    };
  },
};

// ---- La bonne écriture d'un son (o / au / eau, an / en…) ----

// Écritures jamais proposées comme piège (trop rares ou trompeuses pour un CE1).
export const NEVER = new Set(['y', 'î', 'ï', 'à', 'â', 'û', 'où', 'oî', 'œ', 'œu', 'ô', 'ff', 'q', 'un', 'e', 'll', 'il', 'ill', 'th', 'rr', 'mm', 'nn', 'pp', 'bb', 'tt', 'dd']);

export function fits(alt, sound, word, g) {
  const after = word.gs.slice(g.i + 1);
  const next = after[0]?.g || '';
  const prev = word.gs[g.i - 1];
  const end = !after.some((x) => !x.silent);
  const ei = /^[eiyéèê]/.test(next);
  const vowel = (x) => x && !x.silent && /^[aeiouyéèêàâîôûœ]/.test(x.g);
  if ((alt === 'c' && sound === 's') || (alt === 'g' && sound === 'j')) return ei;
  if (alt === 'ç') return g.i > 0 && /^[aouâô]/.test(next);
  if (alt === 'ss' || (alt === 's' && sound === 'z')) return vowel(prev) && vowel(after[0]);
  if (alt === 'qu' || alt === 'gu') return /^[eiéèêa]/.test(next);
  if ((alt === 'g' && sound === 'g') || (alt === 'c' && sound === 'k')) return !ei;
  if (alt === 'er' || alt === 'ez') return end;
  if (['om', 'am', 'em', 'im'].includes(alt)) return /^[pb]/.test(next);
  if (['on', 'an', 'en', 'in', 'ain', 'ein'].includes(alt)) return !/^[pb]/.test(next);
  return true;
}

export const variant = {
  id: 'variant',
  label: 'La bonne écriture',
  emoji: '🔍',
  desc: 'au, eau ou o ?',
  build(item) {
    const word = item.word;
    const S = SOUNDS[item.sound];
    const g = graphemeOf(word, item.sound);
    if (!g || S.graphemes.length < 2 || NEVER.has(g.g)) return null;
    const alts = S.graphemes.filter((a) => a !== g.g && !NEVER.has(a) && fits(a, item.sound, word, g));
    if (!alts.length) return null;
    const choices = shuffle([g.g, ...shuffle(alts).slice(0, 2)]);
    return {
      item,
      instruction: `Comment s’écrit ${lab(item.sound)} ici ?`,
      say: word.w,
      emoji: word.emoji,
      word,
      wordOpts: { mask: g.i },
      input: 'choices',
      choiceStyle: 'grapheme',
      choices: choices.map((t) => ({ value: t, text: t })),
      answer: g.g,
      correction: {
        emoji: word.emoji,
        word,
        hlIndex: g.i,
        text: `Dans « ${word.w} », ${lab(item.sound)} s’écrit « ${g.g} ». Regarde bien le mot pour t’en souvenir !`,
        say: word.w,
      },
    };
  },
};

export const where = {
  id: 'where',
  label: 'Où est le son ?',
  emoji: '📍',
  desc: 'Dans quelle syllabe ?',
  build(item) {
    const word = item.word;
    const oral = oralSyllables(word);
    if (oral.length < 2) return null;
    const hits = oral.map((gs, i) => (gs.some((g) => g.s === item.sound) ? i : -1)).filter((i) => i >= 0);
    if (hits.length !== 1) return null;
    const sylText = oral.map((gs) => gs.map((g) => g.g).join(''));
    return {
      item,
      instruction: 'Dans quelle syllabe entends-tu ce son ?',
      sound: item.sound,
      say: word.w,
      tip: 'Dis le mot en tapant dans tes mains : une syllabe = une case.',
      emoji: word.emoji,
      input: 'boxes',
      boxes: sylText,
      answer: hits[0],
      reveal: { word, highlight: item.sound },
      correction: {
        emoji: word.emoji,
        word,
        highlight: item.sound,
        text: `« ${word.w} » : ${sylText.join(' – ')}. On entend ${lab(item.sound)} dans « ${sylText[hits[0]]} ».`,
        say: word.w,
      },
    };
  },
};
