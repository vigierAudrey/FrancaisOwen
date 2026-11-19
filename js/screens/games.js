// Salle de jeux : accès direct aux jeux, avec ce que le parent a choisi.

import { h } from '../ui/dom.js';
import { getState } from '../core/store.js';
import { go } from '../core/router.js';
import { getUnit, enabledSkills } from '../units/index.js';
import { header, mascot } from '../ui/components.js';

const GAMES = [
  { screen: 'hunt', unitId: 'sons', emoji: '🧺', label: 'Chasse aux sons', desc: 'Attrape les images qui ont le bon son' },
  { screen: 'memory', unitId: 'mots', emoji: '🃏', label: 'Memory des mots', desc: 'Retrouve l’image et son mot' },
  { screen: 'mystery', unitId: 'mots', emoji: '🕵️', label: 'Le mot mystère', desc: 'Devine le mot lettre par lettre' },
  { screen: 'chrono', unitId: 'mots', emoji: '⏱️', label: 'Défi chrono', desc: 'Le plus de mots en 60 secondes' },
  { mode: 'mix', unitId: 'sons', emoji: '🎲', label: 'Méli-mélo des sons', desc: 'Tous les jeux de sons mélangés' },
  { mode: 'mix', unitId: 'mots', emoji: '🎲', label: 'Méli-mélo des mots', desc: 'Tous les jeux de mots mélangés' },
  { mode: 'play', unitId: 'lecture', emoji: '📚', label: 'Lecture surprise', desc: 'Syllabes, phrases et histoires' },
  { mode: 'play', unitId: 'grammaire', emoji: '✏️', label: 'Grammaire surprise', desc: 'Un peu de toutes les règles' },
];

const SOON = [
  { emoji: '🌧️', label: 'La pluie de mots' },
  { emoji: '🗺️', label: 'La carte de l’aventure' },
];

export default function games() {
  const st = getState();
  const launch = (g) => {
    const skillIds = enabledSkills(getUnit(g.unitId), st).map((s) => s.id);
    if (g.screen) go(g.screen, { unitId: g.unitId, skillIds });
    else go('session', { unitId: g.unitId, skillIds, mode: g.mode });
  };
  return h(
    'div',
    { class: 'screen games' },
    header('Les jeux'),
    mascot('À quoi on joue ?', { mood: 'happy' }),
    h(
      'div',
      { class: 'game-list' },
      GAMES.map((g) =>
        h('button', { class: `game-card theme-${g.unitId}`, onclick: () => launch(g) }, h('span', { class: 'game-emoji' }, g.emoji), h('span', { class: 'game-txt' }, h('b', {}, g.label), h('small', {}, g.desc)))
      ),
      SOON.map((g) => h('div', { class: 'game-card soon' }, h('span', { class: 'game-emoji' }, g.emoji), h('span', { class: 'game-txt' }, h('b', {}, g.label), h('small', {}, '🔒 Bientôt !'))))
    )
  );
}
