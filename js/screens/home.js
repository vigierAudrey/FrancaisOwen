import { h } from '../ui/dom.js';
import { getState } from '../core/store.js';
import { go } from '../core/router.js';
import { units, comingSoon, enabledSkills, itemsFor, dueItems } from '../units/index.js';
import { masteryOf } from '../core/srs.js';
import { mascot, starPill, streakPill, levelBadge, parentGate } from '../ui/components.js';
import { pick } from '../core/util.js';
import { currentIndex } from '../core/adventure.js';
import { ISLANDS, STEPS } from '../data/adventure.js';

const GREETINGS = ['On joue avec les mots ?', 'Prêt pour une mission lecture ?', 'Tu viens chasser les sons ?', 'Allez, on gagne des étoiles !', 'Coucou ! On lit ensemble ?'];

export default function home() {
  const st = getState();
  const name = st.settings.childName;
  const due = dueItems(st, 15);
  const everPlayed = Object.keys(st.progress).length > 0;

  const unitCard = (u) => {
    const m = masteryOf(st, itemsFor(u, enabledSkills(u, st).map((s) => s.id)));
    return h(
      'button',
      { class: `op-card theme-${u.id}`, onclick: () => go('unit', { unitId: u.id }) },
      h('span', { class: 'op-emoji' }, u.emoji),
      h('span', { class: 'op-name' }, u.name),
      h('span', { class: 'op-line' }, u.mascotLine),
      h('span', { class: 'bar small light' }, h('span', { class: 'bar-fill', style: { width: `${Math.round(m * 100)}%` } }))
    );
  };

  const reviewCard = due.length
    ? h(
        'button',
        { class: 'review-card', onclick: () => go('session', { mode: 'review', itemIds: due.map((i) => i.id) }) },
        h('span', { class: 'review-emoji' }, '🔁'),
        h('span', { class: 'review-txt' }, h('b', {}, 'Mes révisions du jour'), h('small', {}, `${due.length} mot${due.length > 1 ? 's' : ''} à revoir pour ne pas les oublier`)),
        h('span', { class: 'review-go' }, '▶')
      )
    : everPlayed
      ? h('div', { class: 'review-card done' }, h('span', { class: 'review-emoji' }, '✅'), h('span', { class: 'review-txt' }, h('b', {}, 'Révisions faites !'), h('small', {}, 'Reviens demain pour la suite.')))
      : null;

  // Carte de l'aventure : où en est-on ?
  const cur = currentIndex(st);
  let acc = 0;
  const island = ISLANDS.find((i) => (acc += i.steps.length) > cur) || ISLANDS[ISLANDS.length - 1];
  const adventureCard = h(
    'button',
    { class: 'adventure-card', onclick: () => go('adventure') },
    h('span', { class: 'adv-emoji' }, '🗺️'),
    h(
      'span',
      { class: 'review-txt' },
      h('b', {}, 'Mon aventure'),
      h('small', {}, cur >= STEPS.length ? 'Trésor trouvé ! Vise les 3 étoiles partout.' : cur ? `${island.emoji} ${island.name} · étape ${cur + 1} / ${STEPS.length}` : 'Pars à la recherche du trésor de Plume !'),
      h('span', { class: 'bar small light' }, h('span', { class: 'bar-fill', style: { width: `${Math.round((cur / STEPS.length) * 100)}%` } }))
    ),
    h('span', { class: 'review-go' }, '▶')
  );

  return h(
    'div',
    { class: 'screen home' },
    h(
      'div',
      { class: 'topbar' },
      h('div', { class: 'row left' }, starPill(), streakPill()),
      h('button', { class: 'parent-link', onclick: () => parentGate(() => go('parent')) }, '👤 Parents')
    ),
    mascot(h('span', {}, h('b', {}, `Salut ${name} !`), h('br'), pick(GREETINGS)), { size: 'big' }),
    levelBadge(),
    adventureCard,
    reviewCard,
    h(
      'div',
      { class: 'op-cards' },
      units.map(unitCard),
      comingSoon.map((c) =>
        h('div', { class: 'op-card soon', 'aria-disabled': 'true' }, h('span', { class: 'op-emoji' }, c.emoji), h('span', { class: 'op-name' }, c.name), h('span', { class: 'op-line' }, c.line), h('span', { class: 'soon-tag' }, '🔒 Bientôt !'))
      )
    ),
    h(
      'div',
      { class: 'home-actions' },
      h('button', { class: 'btn big games-btn', onclick: () => go('games') }, '🎮 Les jeux'),
      h('button', { class: 'btn big trophies', onclick: () => go('rewards') }, '🏆 Mes trophées')
    )
  );
}
