// Registre des façons de jouer (modes).
//
// Un exercice « question par question » est un objet { id, label, emoji, desc, build(item, ctx) }.
// build renvoie une question, ou null si l'élément ne s'y prête pas. Format d'une question :
//   item          l'élément travaillé (sa progression est enregistrée)
//   instruction   consigne courte          sound   son à afficher en pastille (on peut l'écouter)
//   say           texte lu automatiquement (+ bouton 🔊)
//   emoji         grande image             word / wordOpts   mot affiché (voir ui/wordView.js)
//   tip           petite aide affichée sous la carte
//   text / textOpts  texte à lire (« _ » = case à remplir) ; textOpts.big, textOpts.story
//   title         titre au-dessus du texte  helpSay  texte lisible sur demande (pas de lecture auto)
//   input         'choices' | 'truefalse' | 'tiles' | 'boxes'
//   choices       [{ value, emoji?, text?, caption? }] (caption : petit mot sous l'image) + choiceStyle 'emoji' | 'emojis' | 'text' | 'long' | 'grapheme' | 'sound'
//   tfLabels      libellés Oui / Non        tiles, tileStyle  étiquettes à remettre dans l'ordre
//   boxes         syllabes (cases à toucher) answer   la bonne réponse
//   reveal        { word, highlight } montré après la réponse
//   afterOk       texte lu après une bonne réponse
//   correction    { emoji, word, highlight?, hlIndex?, text, say } affiché en cas d'erreur
//
// Un mode avec `screen` a son propre écran (apprendre, jeux).

import * as sons from './sons.js';
import * as mots from './mots.js';
import * as lecture from './lecture.js';
import * as grammaire from './grammaire.js';
import * as nombres from './nombres.js';

export const EXERCISES = Object.fromEntries(
  [sons, mots, lecture, grammaire, nombres].flatMap((m) => Object.values(m)).filter((x) => x && x.build).map((x) => [x.id, x])
);

const SCREENS = {
  learn: { id: 'learn', label: 'J’apprends', emoji: '📖', desc: 'Regarde et écoute', screen: 'learn' },
  hunt: { id: 'hunt', label: 'Chasse aux sons', emoji: '🧺', desc: 'Attrape les bons mots', screen: 'hunt', game: true },
  rain: { id: 'rain', label: 'La pluie de mots', emoji: '🌧️', desc: 'Attrape les mots qui tombent', screen: 'rain', game: true },
  bingo: { id: 'bingo', label: 'Le bingo des sons', emoji: '🎱', desc: '3 jetons alignés : bingo !', screen: 'bingo', game: true },
  mystery: { id: 'mystery', label: 'Le mot mystère', emoji: '🕵️', desc: 'Devine le mot lettre par lettre', screen: 'mystery', game: true },
  chrono: { id: 'chrono', label: 'Défi chrono', emoji: '⏱️', desc: 'Le plus de mots en 60 secondes', screen: 'chrono', game: true },
  wordsearch: { id: 'wordsearch', label: 'Mots mêlés', emoji: '🔎', desc: 'Retrouve les mots cachés dans la grille', screen: 'wordsearch', game: true },
  crossword: { id: 'crossword', label: 'Mots croisés', emoji: '✏️', desc: 'Écris les mots dans la grille', screen: 'crossword', game: true },
  memory: { id: 'memory', label: 'Memory', emoji: '🃏', desc: 'Retrouve les paires', screen: 'memory', game: true },
};

export const MODES = { ...SCREENS, ...EXERCISES, review: { id: 'review', label: 'Révisions', emoji: '🔁', desc: 'Pour ne pas oublier' },
  mix: { id: 'mix', label: 'Un peu de tout', emoji: '🎲', desc: 'Tous les jeux mélangés' },
  play: { id: 'play', label: 'Je m’entraîne', emoji: '🎯', desc: 'Les exercices des notions choisies' },
};
