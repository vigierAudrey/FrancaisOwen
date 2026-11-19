// Progression sur la carte de l'aventure.
// Une étape se lance avec le paramètre `quest` (id de l'étape). En fin de partie, chaque jeu
// appelle questOutcome() : l'étape est validée (1 à 3 étoiles) et la suivante se débloque.

import { h } from '../ui/dom.js';
import { getState, save } from './store.js';
import { go, back } from './router.js';
import { ISLANDS, STEPS, STEP_BY, CHEST_STARS } from '../data/adventure.js';
import { mascot } from '../ui/components.js';
import { confetti } from '../ui/confetti.js';
import { sound } from '../ui/sound.js';

const adv = (st) => (st.adventure ||= { done: {} });

/** Étoiles obtenues sur une étape (0 = pas encore réussie). */
export const stepStars = (st, id) => adv(st).done[id] || 0;

/** Index de l'étape en cours (la première non réussie) ; STEPS.length si tout est fini. */
export function currentIndex(st) {
  const i = STEPS.findIndex((s) => !stepStars(st, s.id));
  return i < 0 ? STEPS.length : i;
}

export const isUnlocked = (st, id) => STEPS.findIndex((s) => s.id === id) <= currentIndex(st);

/** Ce qu'il faut faire pour réussir l'étape. */
export function goalText(step) {
  const n = getState().settings.questionsPerSession;
  if (step.mode) return `Au moins ${Math.ceil(n * 0.7)} bonnes réponses sur ${n}`;
  return {
    wordsearch: 'Trouve tous les mots cachés',
    crossword: 'Remplis toute la grille',
    rain: `Attrape au moins ${step.goal} bons mots`,
    bingo: 'Fais un BINGO : 3 jetons alignés',
    memory: 'Retrouve toutes les paires',
    mystery: 'Trouve le mot mystère',
    hunt: 'Attrape au moins 7 bons mots sur 10',
    chrono: `Trouve au moins ${step.goal} mots en 60 secondes`,
  }[step.screen];
}

export function launchStep(step) {
  const params = { unitId: step.unitId, skillIds: step.skillIds, quest: step.id };
  if (step.mode) go('session', { ...params, mode: step.mode });
  else go(step.screen, { ...params, auto: true, opts: step.opts });
}

/** Bandeau affiché en haut d'un jeu lancé depuis la carte. */
export function questBanner(questId) {
  const step = STEP_BY[questId];
  if (!step) return null;
  return h('div', { class: 'quest-banner' }, h('span', { class: 'quest-emoji' }, step.emoji), h('span', {}, h('b', {}, step.label), h('small', {}, `🎯 ${goalText(step)}`)));
}

/**
 * Fin d'une partie lancée depuis la carte. Renvoie le bloc à afficher (ou null hors aventure).
 * ok : objectif atteint ; stars : 1 à 3 ; retry : relancer l'étape.
 */
export function questOutcome(questId, { ok, stars = 1, retry }) {
  const step = STEP_BY[questId];
  if (!step) return null;
  const st = getState();
  const before = stepStars(st, step.id);
  let chestLine = null;
  if (ok) {
    adv(st).done[step.id] = Math.max(before, Math.min(3, Math.max(1, stars)));
    if (!before && step.chest) {
      st.stars += CHEST_STARS;
      const isl = ISLANDS.findIndex((i) => i.id === step.island);
      const next = ISLANDS[isl + 1];
      chestLine = next ? `Coffre ouvert : +${CHEST_STARS} ⭐ ! Nouvelle île : ${next.emoji} ${next.name} !` : `Tu as trouvé le trésor de Plume ! +${CHEST_STARS} ⭐ Tu es un vrai champion !`;
      setTimeout(() => {
        sound.win();
        confetti();
      }, 600);
    }
    save();
  }
  const starsRow = ok ? h('div', { class: 'quest-stars' }, [1, 2, 3].map((i) => h('span', { class: i <= adv(st).done[step.id] ? 'on' : '' }, '⭐'))) : null;
  return h(
    'div',
    { class: 'panel quest-result' + (ok ? ' ok' : '') },
    h('h2', {}, ok ? `🗺️ Étape réussie !` : '🗺️ Pas encore…'),
    starsRow,
    mascot(chestLine || (ok ? (before ? 'Bravo, encore mieux joué !' : 'Bravo ! L’étape suivante est débloquée !') : `Pour réussir l’étape : ${goalText(step).toLowerCase()}. Tu peux le faire !`), { mood: ok ? 'wow' : 'think' }),
    h(
      'div',
      { class: 'row wrap' },
      !ok && retry ? h('button', { class: 'btn', onclick: retry }, '🔁 Réessayer') : null,
      h('button', { class: 'btn' + (ok ? '' : ' ghost'), onclick: () => back() }, '🗺️ Retour à la carte')
    )
  );
}

/** Étoiles de 1 à 3 d'après un taux de réussite. */
/** Objectif chiffré d'une étape (pluie de mots, chrono). */
export const questGoal = (id) => STEP_BY[id]?.goal;

export const starsFromRatio = (r) => (r >= 0.9 ? 3 : r >= 0.8 ? 2 : 1);
