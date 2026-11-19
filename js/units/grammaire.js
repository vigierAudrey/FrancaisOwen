// Univers « La grammaire » (CE1). Chaque notion a sa petite leçon (écran « J'apprends »).

import { WORDS } from '../lang/word.js';
import { VERBS, ADJECTIVES, PRONOUNS, ER_VERBS, plural } from '../data/grammar.js';
import { SENTENCES, HOMOPHONES } from '../data/sentences.js';

const nounItems = (skillId, filter = () => true) =>
  WORDS.filter(filter).map((w) => ({ id: `gram:${skillId}:${w.w}`, unitId: 'grammaire', skillId, word: w }));

const conjItems = (skillId, verbs) =>
  verbs.flatMap((verb) => PRONOUNS.map((p) => ({ id: `gram:conj:${verb}:${p}`, unitId: 'grammaire', skillId, verb, pronoun: p, word: { w: `${p} (${verb})` } })));

const slug = (s) => s.toLowerCase().replace(/[^a-zàâçéèêëîïôûùüÿœ]+/g, '-');

const NATURE_NOUNS = ['chat', 'pomme', 'maison', 'vélo', 'livre', 'fleur', 'soleil', 'robe', 'gâteau', 'arbre', 'école', 'lune', 'bateau', 'dragon', 'cheval', 'fusée', 'main', 'jardin', 'clé', 'fée'];

export default {
  id: 'grammaire',
  name: 'La grammaire',
  emoji: '✏️',
  mascotLine: 'Je découvre comment marchent les mots',
  learnKind: 'rules',
  families: [
    { id: 'groupe', label: 'Le nom et ses amis', emoji: '🏷️' },
    { id: 'phrase', label: 'La phrase', emoji: '📝' },
    { id: 'verbe', label: 'Le verbe', emoji: '🏃' },
  ],
  skills: [
    {
      id: 'unune', label: 'un ou une ?', short: 'un / une', family: 'groupe', exercises: ['article'], items: nounItems('unune'),
      lesson: ['Les noms sont masculins ou féminins.', 'Masculin : un chat, un vélo.', 'Féminin : une pomme, une fusée.'],
    },
    {
      id: 'lela', label: 'le, la ou l’ ?', short: 'le / la / l’', family: 'groupe', exercises: ['defArticle'], items: nounItems('lela'),
      lesson: ['un → le : le chat. une → la : la pomme.', 'Devant une voyelle (a, e, i, o, u…), on écrit l’ : l’arbre, l’école.', 'Mais : le hibou, le hérisson (le h ne se lie pas).'],
    },
    {
      id: 'nombre', label: 'Singulier ou pluriel ?', short: 'un / des', family: 'groupe', exercises: ['pluralPick', 'pluralForm'], items: nounItems('nombre', (w) => plural(w.w) !== w.w),
      lesson: ['Un seul : c’est le singulier → le chat.', 'Plusieurs : c’est le pluriel → les chats. On ajoute souvent un s qu’on n’entend pas.', 'Les mots en -eau prennent un x : des bateaux. Les mots en -al font -aux : des chevaux.'],
    },
    {
      id: 'accord', label: 'Masculin ou féminin ?', short: 'petit / petite', family: 'groupe', exercises: ['agree'],
      items: ADJECTIVES.map((a) => ({ id: `gram:accord:${a.m}`, unitId: 'grammaire', skillId: 'accord', adj: a, word: { w: `${a.m} / ${a.f}` } })),
      lesson: ['L’adjectif dit comment est quelque chose : petit, vert, gentil…', 'Avec un nom féminin, il prend souvent un e : un petit chat, une petite souris.', 'Parfois il change plus : blanc → blanche, gentil → gentille.'],
    },
    {
      id: 'nature', label: 'Nom, verbe ou adjectif ?', short: 'Nom / verbe', family: 'groupe', exercises: ['natureOf'],
      items: [
        ...VERBS.map((v) => ({ id: `gram:nature:${v.w}`, unitId: 'grammaire', skillId: 'nature', nature: 'verbe', word: v })),
        ...ADJECTIVES.map((a) => ({ id: `gram:nature:${a.m}`, unitId: 'grammaire', skillId: 'nature', nature: 'adjectif', word: { w: a.m } })),
        ...WORDS.filter((w) => NATURE_NOUNS.includes(w.w)).map((w) => ({ id: `gram:nature:${w.w}`, unitId: 'grammaire', skillId: 'nature', nature: 'nom', word: w })),
      ],
      lesson: ['Le nom : une personne, un animal, une chose. On peut mettre « un » ou « le » devant → un chat.', 'Le verbe : une action. On peut dire « je » ou « il » devant → il court.', 'L’adjectif : il dit comment c’est → un chat noir.'],
    },
    {
      id: 'phrase', label: 'La phrase', short: 'Majuscule et point', family: 'phrase', exercises: ['phraseOk'],
      items: SENTENCES.map((s) => ({ id: `gram:phrase:${slug(s)}`, unitId: 'grammaire', skillId: 'phrase', sentence: s, word: { w: s } })),
      lesson: ['Une phrase commence par une majuscule.', 'Elle se termine par un point (. ! ?).', 'Exemple : Le chat dort.'],
    },
    ...Object.entries(HOMOPHONES).map(([group, h]) => ({
      id: group, label: `${h.choices[0]} ou ${h.choices[1]} ?`, short: `${h.choices[0]} / ${h.choices[1]}`, family: 'phrase', exercises: ['homophone'],
      items: h.choices.flatMap((ans) => h[ans].map((s) => ({ id: `gram:${group}:${slug(s)}`, unitId: 'grammaire', skillId: group, group, answer: ans, sentence: s, word: { w: s.replace('_', ans) } }))),
      lesson: h.choices.map((c) => `« ${c} » : ${h.tips[c]}`),
    })),
    {
      id: 'etre', label: 'Le verbe être', short: 'être', family: 'verbe', exercises: ['conj'], items: conjItems('etre', ['être']),
      lesson: ['je suis, tu es, il / elle est,', 'nous sommes, vous êtes, ils / elles sont.'],
    },
    {
      id: 'avoir', label: 'Le verbe avoir', short: 'avoir', family: 'verbe', exercises: ['conj'], items: conjItems('avoir', ['avoir']),
      lesson: ['j’ai, tu as, il / elle a,', 'nous avons, vous avez, ils / elles ont.'],
    },
    {
      id: 'aller', label: 'Le verbe aller', short: 'aller', family: 'verbe', exercises: ['conj'], items: conjItems('aller', ['aller']),
      lesson: ['je vais, tu vas, il / elle va,', 'nous allons, vous allez, ils / elles vont.'],
    },
    {
      id: 'er', label: 'Les verbes en -er', short: 'chanter…', family: 'verbe', exercises: ['conj'], items: conjItems('er', ER_VERBS),
      lesson: ['je chante, tu chantes, il / elle chante,', 'nous chantons, vous chantez, ils / elles chantent.', 'Les terminaisons : e, es, e, ons, ez, ent.'],
    },
  ],
  defaultSkills: ['unune', 'lela', 'nombre', 'nature', 'phrase', 'et-est', 'etre', 'avoir'],
  modes: ['learn', 'play', 'mix'],
};
