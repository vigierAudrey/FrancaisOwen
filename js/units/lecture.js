// Univers « La lecture » : syllabes, phrases, compréhension, petites histoires.

import { WORDS, parseWord } from '../lang/word.js';
import { SENTENCES, FACTS, STORIES } from '../data/sentences.js';

const CONS = ['l', 'r', 'm', 'n', 's', 'f', 'v', 'ch', 'j', 'p', 'b', 't', 'd', 'c', 'g', 'qu'];
export const VOWS = ['a', 'i', 'o', 'u', 'é', 'e', 'ou', 'on', 'an', 'oi', 'in'];

/** La syllabe se lit-elle comme on l'attend ? (ca, co, cu mais pas ci ; qua, qui mais pas quu…) */
export function okC(c, v) {
  if (c === 'c' || c === 'g') return ['a', 'o', 'u', 'ou', 'on', 'an', 'oi'].includes(v);
  if (c === 'qu') return ['a', 'i', 'o', 'é', 'e', 'an', 'on'].includes(v);
  return true;
}

const syllableItems = (skillId, consonants) =>
  consonants.flatMap((c) =>
    VOWS.filter((v) => okC(c, v)).map((v) => ({
      id: `lec:syl:${c}${v}`,
      unitId: 'lecture',
      skillId,
      syl: { c, v },
      okC,
      say: c + v,
      word: parseWord(`${c}-${v}`),
    }))
  );

const slug = (s) => s.toLowerCase().replace(/[^a-zàâçéèêëîïôûùüÿœ]+/g, '-');

export default {
  id: 'lecture',
  name: 'La lecture',
  emoji: '📖',
  mascotLine: 'Je lis des syllabes, des phrases et des histoires',
  learnKind: 'syllables',
  families: [
    { id: 'syllabes', label: 'Les syllabes', emoji: '🔤' },
    { id: 'phrases', label: 'Les phrases', emoji: '📝' },
    { id: 'textes', label: 'Les histoires', emoji: '📚' },
  ],
  skills: [
    { id: 'syllabes', label: 'Les syllabes', short: 'Syllabes', emoji: '🔤', family: 'syllabes', exercises: ['sylListen', 'sylBuild', 'sylStart'], parentInfo: 'pa, li, chou, mon… : lire et fabriquer des syllabes.', items: syllableItems('syllabes', CONS) },
    { id: 'bdpq', label: 'b, d, p, q', short: 'b d p q', emoji: '🪞', family: 'syllabes', exercises: ['sylListen'], parentInfo: 'Les lettres miroir, souvent confondues.', items: syllableItems('bdpq', ['b', 'd', 'p', 'qu']) },
    { id: 'images', label: 'Lis la phrase', short: 'Phrases et images', emoji: '🖼️', family: 'phrases', exercises: ['phrasePick'], parentInfo: '« un chat et un chien », « trois pommes »…', items: WORDS.map((w) => ({ id: `lec:img:${w.w}`, unitId: 'lecture', skillId: 'images', word: w })) },
    { id: 'ordre', label: 'La phrase en ordre', short: 'Phrases en ordre', emoji: '🚂', family: 'phrases', exercises: ['sentenceOrder'], items: SENTENCES.map((s) => ({ id: `lec:ord:${slug(s)}`, unitId: 'lecture', skillId: 'ordre', sentence: s, word: { w: s } })) },
    { id: 'vraifaux', label: 'Vrai ou faux ?', short: 'Vrai ou faux', emoji: '🤔', family: 'phrases', exercises: ['factCheck'], items: FACTS.map((f) => ({ id: `lec:vf:${slug(f[0])}`, unitId: 'lecture', skillId: 'vraifaux', fact: f, word: { w: f[0] } })) },
    {
      id: 'histoires', label: 'Petites histoires', short: 'Histoires', emoji: '📚', family: 'textes', exercises: ['storyQ'], parentInfo: `${STORIES.length} histoires courtes avec questions.`,
      items: STORIES.flatMap((st) => st.q.map((q, i) => ({ id: `lec:hist:${st.id}:${i}`, unitId: 'lecture', skillId: 'histoires', story: st, q, word: { w: `${st.title} (${i + 1})`, emoji: st.emoji } }))),
    },
  ],
  defaultSkills: ['syllabes', 'bdpq', 'images', 'ordre', 'vraifaux', 'histoires'],
  modes: ['learn', 'play', 'mix'],
};
