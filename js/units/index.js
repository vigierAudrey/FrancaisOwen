// Registre des univers. Pour en ajouter un : créer un fichier sur le modèle de sons.js
// et l'ajouter au tableau `units` (voir CLAUDE.md).

import sons from './sons.js';
import mots from './mots.js';
import lecture from './lecture.js';
import grammaire from './grammaire.js';
import { uniqBy } from '../core/util.js';
import { factStat, isDue } from '../core/srs.js';

export const units = [sons, mots, lecture, grammaire];

export const comingSoon = [];

export const getUnit = (id) => units.find((u) => u.id === id);
export const getSkill = (unit, id) => unit.skills.find((s) => s.id === id);

export const itemsFor = (unit, skillIds) =>
  uniqBy(unit.skills.filter((s) => skillIds.includes(s.id)).flatMap((s) => s.items), (i) => i.id);

export function enabledSkills(unit, state) {
  const ids = state.settings.units[unit.id]?.skills || [];
  return unit.skills.filter((s) => ids.includes(s.id) && s.items.length);
}

const allItemsById = new Map(units.flatMap((u) => u.skills.flatMap((s) => s.items)).map((i) => [i.id, i]));
export const itemById = (id) => allItemsById.get(id);

/** Éléments à réviser aujourd'hui (déjà vus, intervalle écoulé), les plus fragiles d'abord. */
export function dueItems(state, max = Infinity) {
  const enabled = units.flatMap((u) => itemsFor(u, enabledSkills(u, state).map((s) => s.id)));
  return enabled
    .map((i) => ({ i, s: factStat(state, i.id) }))
    .filter((x) => isDue(x.s))
    .sort((a, b) => a.s.box - b.s.box || a.s.last - b.s.last)
    .slice(0, max)
    .map((x) => x.i);
}

/** Exercices possibles pour un élément : ceux de sa notion, sinon ceux de l'univers. */
export function exercisesFor(unit, skill, modeId) {
  if (modeId === 'review' || modeId === 'mix' || modeId === 'play') return skill.exercises || unit.reviewModes;
  return [modeId];
}
