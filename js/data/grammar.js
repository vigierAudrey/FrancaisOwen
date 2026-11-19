// Données de grammaire : verbes, adjectifs, conjugaison, pluriels, élision.

// Verbes d'action (infinitif + image).
export const VERBS = [
  ['courir', '🏃'], ['manger', '😋'], ['dormir', '😴'], ['chanter', '🎤'], ['danser', '💃'],
  ['sauter', '🦘'], ['nager', '🏊'], ['lire', '📖'], ['écrire', '✍️'], ['jouer', '🎲'],
  ['boire', '🥤'], ['marcher', '🚶'], ['parler', '🗣️'], ['rire', '😂'], ['pleurer', '😢'],
  ['dessiner', '🖍️'], ['cuisiner', '🍳'], ['voler', '🕊️'], ['tomber', '🤕'], ['regarder', '👀'],
  ['écouter', '👂'], ['peindre', '🎨'], ['construire', '🏗️'], ['laver', '🧼'], ['ouvrir', '🚪'],
  ['grimper', '🧗'], ['lancer', '🤾'], ['crier', '📣'], ['penser', '🤔'], ['pousser', '🛒'],
].map(([w, emoji]) => ({ w, emoji }));

// Adjectifs : masculin, féminin, place (avant / après le nom), vivant = seulement pour les êtres vivants.
export const ADJECTIVES = [
  ['petit', 'petite', 'avant'], ['grand', 'grande', 'avant'], ['gros', 'grosse', 'avant'],
  ['joli', 'jolie', 'avant'], ['beau', 'belle', 'avant'],
  ['noir', 'noire', 'après'], ['vert', 'verte', 'après'], ['gris', 'grise', 'après'],
  ['blanc', 'blanche', 'après'], ['bleu', 'bleue', 'après'], ['rond', 'ronde', 'après'],
  ['lourd', 'lourde', 'après'], ['chaud', 'chaude', 'après'], ['froid', 'froide', 'après'],
  ['content', 'contente', 'après', true], ['méchant', 'méchante', 'après', true],
  ['gentil', 'gentille', 'après', true], ['mignon', 'mignonne', 'après', true],
  ['fatigué', 'fatiguée', 'après', true], ['curieux', 'curieuse', 'après', true],
].map(([m, f, place, living]) => ({ m, f, place, living: !!living }));

// Mots commençant par un h « aspiré » : on dit « le hibou », pas « l'hibou ».
export const H_ASPIRE = new Set(['hibou', 'hérisson', 'homard', 'haricot']);

// Pluriels irréguliers (le reste : + s, + x pour -eau / -eu, invariable si -s / -x / -z).
export const PLURAL_EXCEPTIONS = {
  cheval: 'chevaux', journal: 'journaux', œil: 'yeux', chou: 'choux', hibou: 'hiboux',
  pneu: 'pneus', bœuf: 'bœufs', ail: 'ails', bisou: 'bisous',
};

export function plural(w) {
  if (PLURAL_EXCEPTIONS[w]) return PLURAL_EXCEPTIONS[w];
  if (/[sxz]$/.test(w)) return w;
  if (/(eau|eu)$/.test(w)) return w + 'x';
  if (/al$/.test(w)) return w.slice(0, -2) + 'aux';
  return w + 's';
}

// Conjugaison au présent.
export const PRONOUNS = ['je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles'];
const P = [0, 1, 2, 2, 3, 4, 5, 5]; // pronom → personne
export const CONJ = {
  être: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
  avoir: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
  aller: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'],
};
export const ER_VERBS = ['chanter', 'jouer', 'danser', 'sauter', 'parler', 'regarder', 'marcher', 'dessiner', 'écouter', 'aimer'];
const ER_END = ['e', 'es', 'e', 'ons', 'ez', 'ent'];

export function conjugate(verb, pronoun) {
  const p = P[PRONOUNS.indexOf(pronoun)];
  return CONJ[verb] ? CONJ[verb][p] : verb.slice(0, -2) + ER_END[p];
}
export const allForms = (verb) => (CONJ[verb] ? CONJ[verb] : ER_END.map((e) => verb.slice(0, -2) + e));

/** « je » devient « j’ » devant une voyelle. */
export const subject = (pronoun, form) => (pronoun === 'je' && /^[aeiouéèêh]/.test(form) ? 'J’' : pronoun[0].toUpperCase() + pronoun.slice(1));
