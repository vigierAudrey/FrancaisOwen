// Table des sons (phonèmes) travaillés, dans l'esprit des méthodes de lecture CP / CE1.
//   label     : ce qu'on affiche (« ou »)
//   say       : ce que la synthèse vocale lit pour faire entendre le son
//   ref       : mot de référence (« ou comme dans loup »)
//   graphemes : les façons de l'écrire (la première est la principale)
//   confuse   : sons proches, utilisés comme pièges dans les exercices
// Les mots de la banque sont rattachés automatiquement à ces sons (voir lang/word.js).

export const FAMILIES = [
  { id: 'voyelles', label: 'Les voyelles', emoji: '🅰️', info: 'a, i, o, u, e, é, è' },
  { id: 'complexes', label: 'Les sons de plusieurs lettres', emoji: '🧩', info: 'ou, on, an, in, oi, eu, ch, gn, ill' },
  { id: 'consonnes', label: 'Les consonnes', emoji: '🔠', info: 'l, r, m, n, p, b…' },
  { id: 'cousins', label: 'Les sons cousins', emoji: '👯', info: 'Les sons qui se ressemblent et qu’on confond souvent.' },
];

export const SOUNDS = {
  a: { label: 'a', say: 'a', ref: 'chat', family: 'voyelles', graphemes: ['a', 'à', 'â'], confuse: ['o', 'an', 'è'] },
  i: { label: 'i', say: 'i', ref: 'lit', family: 'voyelles', graphemes: ['i', 'y', 'î', 'ï'], confuse: ['é', 'u'] },
  o: { label: 'o', say: 'o', ref: 'vélo', family: 'voyelles', graphemes: ['o', 'au', 'eau', 'ô'], confuse: ['ou', 'on', 'a'] },
  u: { label: 'u', say: 'u', ref: 'lune', family: 'voyelles', graphemes: ['u', 'û'], confuse: ['ou', 'i', 'eu'] },
  e: { label: 'e', say: 'e', ref: 'cheval', family: 'voyelles', graphemes: ['e'], confuse: ['é', 'eu', 'a'] },
  é: { label: 'é', say: 'é', ref: 'bébé', family: 'voyelles', graphemes: ['é', 'er', 'ez'], confuse: ['è', 'i', 'e'] },
  è: { label: 'è', say: 'è', ref: 'zèbre', family: 'voyelles', graphemes: ['è', 'ê', 'ai', 'ei', 'e'], confuse: ['é', 'a', 'e'] },

  ou: { label: 'ou', say: 'ou', ref: 'loup', family: 'complexes', graphemes: ['ou', 'où'], confuse: ['o', 'on', 'u'] },
  on: { label: 'on', say: 'on', ref: 'mouton', family: 'complexes', graphemes: ['on', 'om'], confuse: ['an', 'ou', 'o'] },
  an: { label: 'an', say: 'an', ref: 'maman', family: 'complexes', graphemes: ['an', 'en', 'am', 'em'], confuse: ['on', 'in', 'a'] },
  in: { label: 'in', say: 'in', ref: 'lapin', family: 'complexes', graphemes: ['in', 'ain', 'ein', 'im', 'un'], confuse: ['an', 'on', 'i'] },
  oi: { label: 'oi', say: 'oi', ref: 'roi', family: 'complexes', graphemes: ['oi', 'oî'], confuse: ['o', 'ou', 'a'] },
  eu: { label: 'eu', say: 'eu', ref: 'feu', family: 'complexes', graphemes: ['eu', 'œu', 'œ'], confuse: ['ou', 'e', 'u'] },
  ch: { label: 'ch', say: 'che', ref: 'chat', family: 'complexes', graphemes: ['ch'], confuse: ['j', 's'] },
  gn: { label: 'gn', say: 'gne', ref: 'montagne', family: 'complexes', graphemes: ['gn'], confuse: ['n', 'ill'] },
  ill: { label: 'ill', say: 'ye', ref: 'fille', family: 'complexes', graphemes: ['ill', 'il', 'll', 'y'], confuse: ['l', 'gn'] },

  l: { label: 'l', say: 'le', ref: 'lune', family: 'consonnes', graphemes: ['l', 'll'], confuse: ['r', 'n'] },
  r: { label: 'r', say: 're', ref: 'robe', family: 'consonnes', graphemes: ['r', 'rr'], confuse: ['l'] },
  m: { label: 'm', say: 'me', ref: 'moto', family: 'consonnes', graphemes: ['m', 'mm'], confuse: ['n'] },
  n: { label: 'n', say: 'ne', ref: 'nez', family: 'consonnes', graphemes: ['n', 'nn'], confuse: ['m', 'gn'] },
  p: { label: 'p', say: 'pe', ref: 'papa', family: 'consonnes', graphemes: ['p', 'pp'], confuse: ['b', 't'] },
  b: { label: 'b', say: 'be', ref: 'bébé', family: 'consonnes', graphemes: ['b', 'bb'], confuse: ['p', 'd'] },
  t: { label: 't', say: 'te', ref: 'tomate', family: 'consonnes', graphemes: ['t', 'tt', 'th'], confuse: ['d', 'p'] },
  d: { label: 'd', say: 'de', ref: 'dent', family: 'consonnes', graphemes: ['d', 'dd'], confuse: ['t', 'b'] },
  k: { label: 'k', say: 'que', ref: 'canard', family: 'consonnes', graphemes: ['c', 'qu', 'k', 'q'], confuse: ['g', 't'] },
  g: { label: 'g', say: 'gue', ref: 'gâteau', family: 'consonnes', graphemes: ['g', 'gu'], confuse: ['k', 'j'] },
  f: { label: 'f', say: 'fe', ref: 'fée', family: 'consonnes', graphemes: ['f', 'ph', 'ff'], confuse: ['v', 's'] },
  v: { label: 'v', say: 've', ref: 'vélo', family: 'consonnes', graphemes: ['v'], confuse: ['f', 'b'] },
  s: { label: 's', say: 'se', ref: 'sac', family: 'consonnes', graphemes: ['s', 'ss', 'c', 'ç'], confuse: ['z', 'ch'] },
  z: { label: 'z', say: 'ze', ref: 'zèbre', family: 'consonnes', graphemes: ['z', 's'], confuse: ['s', 'j'] },
  j: { label: 'j', say: 'je', ref: 'jus', family: 'consonnes', graphemes: ['j', 'g'], confuse: ['ch', 'z'] },
};

/** Paires de sons cousins (compétence « p ou b ? »). */
export const PAIRS = [
  ['p', 'b'],
  ['t', 'd'],
  ['f', 'v'],
  ['ch', 'j'],
  ['s', 'z'],
  ['k', 'g'],
  ['m', 'n'],
  ['an', 'on'],
  ['on', 'ou'],
  ['an', 'in'],
  ['é', 'è'],
  ['u', 'ou'],
];

export const VOWELS = new Set(['a', 'i', 'o', 'u', 'e', 'é', 'è', 'ou', 'on', 'an', 'in', 'oi', 'eu', 'oin']);

/** Phrase lue pour faire entendre un son : « ou, comme dans loup ». */
export const soundLine = (id) => {
  const s = SOUNDS[id];
  return s ? `${s.say}… comme dans ${s.ref}` : id;
};
