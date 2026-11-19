// La carte de l'aventure : un chemin d'île en île. Chaque étape réussie débloque la suivante ;
// Plume 🦜 attend sur l'étape en cours. Un coffre au bout de chaque île.

import { h, svgBlock } from '../ui/dom.js';
import { getState } from '../core/store.js';
import { ISLANDS, STEPS } from '../data/adventure.js';
import { stepStars, currentIndex, goalText, launchStep } from '../core/adventure.js';
import { header, mascot, MASCOT } from '../ui/components.js';
import { sound } from '../ui/sound.js';
import { speak } from '../ui/speech.js';

const XS = [24, 68, 36, 76, 30, 64]; // positions horizontales (%) des étapes, en zigzag
const GAP = 112; // espace vertical entre deux étapes (px)
const TOP = 80;

export default function adventure() {
  const st = getState();
  const cur = currentIndex(st);
  const total = STEPS.reduce((n, s) => n + stepStars(st, s.id), 0);
  const el = h('div', { class: 'screen adventure' }, header('Mon aventure'));
  let curNode = null;

  const sheet = h('div', { class: 'sheet hidden', onclick: (e) => e.target === sheet && sheet.classList.add('hidden') });
  function openStep(step, idx) {
    const stars = stepStars(st, step.id);
    if (idx > cur) {
      sound.ko();
      return;
    }
    sound.tap();
    sheet.replaceChildren(
      h(
        'div',
        { class: 'sheet-inner center' },
        h('div', { class: 'step-sheet-emoji' }, step.emoji),
        h('h2', {}, step.label),
        h('p', { class: 'step-goal' }, `🎯 ${goalText(step)}`),
        stars ? h('div', { class: 'quest-stars' }, [1, 2, 3].map((i) => h('span', { class: i <= stars ? 'on' : '' }, '⭐'))) : null,
        h(
          'div',
          { class: 'row' },
          h('button', { class: 'btn ghost', onclick: () => sheet.classList.add('hidden') }, 'Plus tard'),
          h('button', { class: 'btn big-ish', onclick: () => launchStep(step) }, stars ? '🔁 Rejouer' : 'C’est parti ! ▶')
        )
      )
    );
    sheet.classList.remove('hidden');
    speak(`${step.label}. ${goalText(step)}.`);
  }

  let offset = 0;
  const islands = ISLANDS.map((isl, ii) => {
    const first = offset;
    offset += isl.steps.length;
    const reached = cur >= first;
    const doneCount = isl.steps.filter((s) => stepStars(st, s.id)).length;
    const height = TOP + (isl.steps.length - 1) * GAP + 70;
    const pts = isl.steps.map((_, i) => `${XS[i % XS.length]},${TOP + i * GAP}`).join(' ');
    const path = svgBlock(
      `<svg viewBox="0 0 100 ${height}" preserveAspectRatio="none" width="100%" height="${height}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 14" vector-effect="non-scaling-stroke"/></svg>`,
      'isl-path'
    );
    const nodes = isl.steps.map((step, i) => {
      const idx = first + i;
      const stars = stepStars(st, step.id);
      const state = stars ? 'done' : idx === cur ? 'current' : 'locked';
      const node = h(
        'button',
        {
          class: `step-node ${state}${step.chest ? ' chest' : ''}`,
          style: { left: `${XS[i % XS.length]}%`, top: `${TOP + i * GAP}px` },
          'aria-label': `${step.label}${state === 'locked' ? ' (fermé)' : ''}`,
          onclick: () => openStep(step, idx),
        },
        state === 'current' ? h('span', { class: 'step-plume' }, MASCOT) : null,
        h('span', { class: 'step-circle' }, state === 'locked' ? (step.chest ? '💰' : '🔒') : step.chest && stars ? '🎁' : step.emoji),
        h('span', { class: 'step-label' }, step.label),
        stars ? h('span', { class: 'step-stars' }, '⭐'.repeat(stars)) : null
      );
      if (state === 'current') curNode = node;
      return node;
    });
    return h(
      'section',
      { class: `island isl-${isl.id}${reached ? '' : ' far'}` },
      h(
        'div',
        { class: 'isl-head' },
        h('span', { class: 'isl-emoji' }, isl.emoji),
        h('span', { class: 'isl-title' }, h('b', {}, `${ii + 1}. ${isl.name}`), h('small', {}, reached ? isl.intro : '🔒 Termine l’île d’avant pour venir ici !')),
        h('span', { class: 'isl-count' }, `${doneCount}/${isl.steps.length}`)
      ),
      h('div', { class: 'isl-map', style: { height: `${height}px` } }, path, nodes)
    );
  });

  const finished = cur >= STEPS.length;
  el.append(
    mascot(finished ? 'Tu as trouvé le trésor ! Tu peux rejouer chaque étape pour avoir 3 étoiles partout.' : cur === 0 ? 'Viens, on part à l’aventure ! Touche l’étape où je t’attends.' : 'On continue l’aventure ? Je t’attends sur la prochaine étape !', { mood: 'happy' }),
    h(
      'div',
      { class: 'adv-progress' },
      h('span', {}, `🗺️ Étape ${Math.min(cur + 1, STEPS.length)} / ${STEPS.length}`),
      h('span', { class: 'bar small' }, h('span', { class: 'bar-fill', style: { width: `${Math.round((cur / STEPS.length) * 100)}%` } })),
      h('span', {}, `⭐ ${total} / ${STEPS.length * 3}`)
    ),
    ...islands,
    sheet
  );
  // On amène l'étape en cours à l'écran.
  if (curNode) requestAnimationFrame(() => setTimeout(() => curNode.scrollIntoView({ block: 'center', behavior: 'smooth' }), 150));
  return el;
}
