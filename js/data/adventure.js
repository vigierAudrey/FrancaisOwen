// La carte de l'aventure : 6 îles, chacune avec ses étapes, dans l'ordre d'une progression CE1.
// La dernière étape de chaque île est un coffre (bonus d'étoiles et île suivante).
//
// Une étape : { id, emoji, label, unitId, skillIds, screen | mode, opts?, goal? }
//   screen  écran de jeu (wordsearch, crossword, rain, bingo, memory, mystery, hunt, chrono)
//   mode    exercice ou mode de séance (hear, listen, play…) → écran « session »
//   opts    réglages imposés au jeu (niveau, thème…)   goal  objectif chiffré (pluie, chrono)
// ⚠️ L'id d'une étape est la clé de progression : ne pas le changer.

const THEMES_ALL = ['animaux', 'manger', 'maison', 'ecole', 'vetements', 'corps', 'nature', 'transports', 'gens', 'jeux'];

export const ISLANDS = [
  {
    id: 'sons',
    name: 'L’île des sons',
    emoji: '🏝️',
    unitId: 'sons',
    intro: 'Ouvre grand tes oreilles !',
    steps: [
      { id: 'i1-1', emoji: '👂', label: 'Le son « ou »', unitId: 'sons', skillIds: ['ou'], mode: 'hear' },
      { id: 'i1-2', emoji: '🎯', label: '« ou » ou « on » ?', unitId: 'sons', skillIds: ['ou', 'on'], mode: 'pickSound' },
      { id: 'i1-3', emoji: '🧺', label: 'La chasse aux sons', unitId: 'sons', skillIds: ['on', 'an'], screen: 'hunt' },
      { id: 'i1-4', emoji: '🙈', label: 'L’intrus des sons', unitId: 'sons', skillIds: ['ou', 'on', 'an'], mode: 'oddSound' },
      { id: 'i1-5', emoji: '🌧️', label: 'La pluie de mots', unitId: 'sons', skillIds: ['ou', 'on', 'an'], screen: 'rain', goal: 6 },
      { id: 'i1-6', emoji: '💰', label: 'Le bingo du coffre', unitId: 'sons', skillIds: ['ou', 'on', 'an', 'in'], screen: 'bingo', chest: true },
    ],
  },
  {
    id: 'jungle',
    name: 'La jungle des mots',
    emoji: '🌴',
    unitId: 'mots',
    intro: 'Plein d’animaux et de mots à découvrir !',
    steps: [
      { id: 'i2-1', emoji: '🎧', label: 'Écoute les animaux', unitId: 'mots', skillIds: ['animaux'], mode: 'listen' },
      { id: 'i2-2', emoji: '🃏', label: 'Le memory de la jungle', unitId: 'mots', skillIds: ['animaux'], screen: 'memory' },
      { id: 'i2-3', emoji: '🤔', label: 'Les devinettes', unitId: 'mots', skillIds: ['animaux'], mode: 'riddle' },
      { id: 'i2-4', emoji: '🔎', label: 'Les mots mêlés', unitId: 'mots', skillIds: THEMES_ALL, screen: 'wordsearch', opts: { level: 'easy', kind: 'list', theme: 'animaux' } },
      { id: 'i2-5', emoji: '🙈', label: 'L’intrus des familles', unitId: 'mots', skillIds: ['animaux', 'manger', 'vetements'], mode: 'oddWord' },
      { id: 'i2-6', emoji: '💰', label: 'Les mots croisés du coffre', unitId: 'mots', skillIds: THEMES_ALL, screen: 'crossword', opts: { level: 'easy', kind: 'image', theme: 'manger' }, chest: true },
    ],
  },
  {
    id: 'volcan',
    name: 'Le volcan des sons cousins',
    emoji: '🌋',
    unitId: 'sons',
    intro: 'Attention aux sons qui se ressemblent !',
    steps: [
      { id: 'i3-1', emoji: '👂', label: '« p » ou « b » ?', unitId: 'sons', skillIds: ['p-b'], mode: 'hear' },
      { id: 'i3-2', emoji: '🎯', label: '« f » ou « v » ?', unitId: 'sons', skillIds: ['f-v'], mode: 'pickSound' },
      { id: 'i3-3', emoji: '🌧️', label: 'La pluie « ch » et « j »', unitId: 'sons', skillIds: ['ch-j'], screen: 'rain', goal: 6 },
      { id: 'i3-4', emoji: '🙈', label: 'L’intrus « an », « on », « in »', unitId: 'sons', skillIds: ['an', 'on', 'in'], mode: 'oddSound' },
      { id: 'i3-5', emoji: '🕵️', label: 'Le mot mystère', unitId: 'mots', skillIds: ['nature'], screen: 'mystery' },
      { id: 'i3-6', emoji: '💰', label: 'Le bingo du volcan', unitId: 'sons', skillIds: ['p-b', 't-d', 'f-v'], screen: 'bingo', chest: true },
    ],
  },
  {
    id: 'foret',
    name: 'La forêt de la lecture',
    emoji: '🌳',
    unitId: 'lecture',
    intro: 'Lis tout seul, comme un grand !',
    steps: [
      { id: 'i4-1', emoji: '🔤', label: 'Les syllabes', unitId: 'lecture', skillIds: ['syllabes'], mode: 'play' },
      { id: 'i4-2', emoji: '🪞', label: 'b, d, p, q', unitId: 'lecture', skillIds: ['bdpq'], mode: 'play' },
      { id: 'i4-3', emoji: '🖼️', label: 'Lis la phrase', unitId: 'lecture', skillIds: ['images'], mode: 'play' },
      { id: 'i4-4', emoji: '🚂', label: 'La phrase en ordre', unitId: 'lecture', skillIds: ['ordre'], mode: 'play' },
      { id: 'i4-5', emoji: '🤔', label: 'Vrai ou faux ?', unitId: 'lecture', skillIds: ['vraifaux'], mode: 'play' },
      { id: 'i4-6', emoji: '💰', label: 'Les petites histoires', unitId: 'lecture', skillIds: ['histoires'], mode: 'play', chest: true },
    ],
  },
  {
    id: 'chateau',
    name: 'Le château de la grammaire',
    emoji: '🏰',
    unitId: 'grammaire',
    intro: 'Les règles des mots n’auront plus de secret !',
    steps: [
      { id: 'i5-1', emoji: '🏷️', label: 'un ou une ?', unitId: 'grammaire', skillIds: ['unune'], mode: 'play' },
      { id: 'i5-2', emoji: '🏷️', label: 'le, la ou l’ ?', unitId: 'grammaire', skillIds: ['lela'], mode: 'play' },
      { id: 'i5-3', emoji: '👯', label: 'Un ou des ?', unitId: 'grammaire', skillIds: ['nombre'], mode: 'play' },
      { id: 'i5-4', emoji: '🙂', label: 'Le verbe être', unitId: 'grammaire', skillIds: ['etre'], mode: 'play' },
      { id: 'i5-5', emoji: '🎒', label: 'Le verbe avoir', unitId: 'grammaire', skillIds: ['avoir'], mode: 'play' },
      { id: 'i5-6', emoji: '💰', label: 'Les verbes en -er', unitId: 'grammaire', skillIds: ['er'], mode: 'play', chest: true },
    ],
  },
  {
    id: 'arcenciel',
    name: 'L’arc-en-ciel des nombres',
    emoji: '🌈',
    unitId: 'nombres',
    intro: 'Compte, colorie et écris les nombres !',
    steps: [
      { id: 'i7-1', emoji: '🎧', label: 'Les nombres de 0 à 10', unitId: 'nombres', skillIds: ['n0-10'], mode: 'numListen' },
      { id: 'i7-2', emoji: '🍎', label: 'Compte et écris', unitId: 'nombres', skillIds: ['n0-10'], mode: 'numLook' },
      { id: 'i7-3', emoji: '🎨', label: 'Les couleurs', unitId: 'nombres', skillIds: ['couleurs'], mode: 'numLook' },
      { id: 'i7-4', emoji: '⌨️', label: 'J’écris les couleurs', unitId: 'nombres', skillIds: ['couleurs'], mode: 'numWrite' },
      { id: 'i7-5', emoji: '🔟', label: 'De 11 à 20', unitId: 'nombres', skillIds: ['n11-20'], mode: 'numLook' },
      { id: 'i7-6', emoji: '💰', label: 'Les mots mêlés des nombres', unitId: 'nombres', skillIds: ['n0-10', 'n11-20', 'couleurs'], screen: 'wordsearch', opts: { level: 'easy', kind: 'riddle', theme: 'all' }, chest: true },
    ],
  },
  {
    id: 'tresor',
    name: 'L’île au trésor',
    emoji: '💎',
    unitId: 'mots',
    intro: 'Le grand trésor de Plume t’attend !',
    steps: [
      { id: 'i6-1', emoji: '🔎', label: 'Les mots mêlés devinettes', unitId: 'mots', skillIds: THEMES_ALL, screen: 'wordsearch', opts: { level: 'medium', kind: 'riddle', theme: 'jeux' } },
      { id: 'i6-2', emoji: '⏱️', label: 'Le défi chrono', unitId: 'mots', skillIds: ['transports', 'gens'], screen: 'chrono', goal: 10 },
      { id: 'i6-3', emoji: '✏️', label: 'Les mots croisés devinettes', unitId: 'mots', skillIds: THEMES_ALL, screen: 'crossword', opts: { level: 'medium', kind: 'riddle', theme: 'all' } },
      { id: 'i6-4', emoji: '🎱', label: 'Le grand bingo', unitId: 'sons', skillIds: ['oi', 'eu', 'gn', 'ill', 'ch'], screen: 'bingo' },
      { id: 'i6-5', emoji: '🔎', label: 'Les mots mêlés expert', unitId: 'mots', skillIds: THEMES_ALL, screen: 'wordsearch', opts: { level: 'hard', kind: 'list', theme: 'all' } },
      { id: 'i6-6', emoji: '👑', label: 'Le trésor de Plume', unitId: 'mots', skillIds: THEMES_ALL, screen: 'crossword', opts: { level: 'hard', kind: 'image', theme: 'all' }, chest: true },
    ],
  },
];

export const STEPS = ISLANDS.flatMap((isl) => isl.steps.map((s) => ({ ...s, island: isl.id })));
export const STEP_BY = Object.fromEntries(STEPS.map((s) => [s.id, s]));
export const CHEST_STARS = 10;
