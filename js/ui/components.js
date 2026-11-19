// Composants partagés entre les écrans.

import { h } from './dom.js';
import { back } from '../core/router.js';
import { getState, dayStreak } from '../core/store.js';
import { levelOf } from '../core/rewards.js';
import { randInt } from '../core/util.js';
import { SOUNDS, soundLine } from '../data/sounds.js';
import { speak } from './speech.js';
import { sound } from './sound.js';
import { playRecording } from './recordings.js';

/** Fait entendre un son : l'enregistrement du parent s'il existe, sinon la voix de synthèse. */
export function playSound(id) {
  if (!playRecording(`son:${id}`)) speak(soundLine(id), { force: true });
}

export const MASCOT = '🦜';

export const starPill = () => h('div', { class: 'stars-pill' }, '⭐ ', String(getState().stars));

export function streakPill() {
  const n = dayStreak();
  return n ? h('div', { class: 'stars-pill streak-pill', title: 'Jours d’affilée' }, '🔥 ', String(n)) : null;
}

export function header(title, { onBack = back, right } = {}) {
  return h(
    'header',
    { class: 'header' },
    h('button', { class: 'icon-btn', onclick: onBack, 'aria-label': 'Retour' }, '←'),
    h('h1', {}, title),
    right === undefined ? starPill() : right
  );
}

/** Plume le perroquet, la mascotte. mood : 'happy' | 'wow' | 'oops' | 'think' */
export function mascot(text, { mood = 'happy', size = '' } = {}) {
  return h(
    'div',
    { class: `mascot-row ${size}` },
    h('div', { class: `mascot mood-${mood}`, 'aria-hidden': 'true' }, MASCOT),
    text ? h('div', { class: 'bubble' }, text) : null
  );
}

/** Pastille d'un son : on la touche pour l'entendre. */
export function soundChip(id, { big = false } = {}) {
  return h(
    'button',
    {
      class: 'sound-chip' + (big ? ' big' : ''),
      type: 'button',
      'aria-label': `Écouter le son ${SOUNDS[id].label}`,
      onclick: (e) => {
        e.stopPropagation();
        sound.tap();
        playSound(id);
      },
    },
    SOUNDS[id].label,
    h('span', { class: 'chip-ear' }, '🔊')
  );
}

/** Gros bouton « réécouter ». */
export const listenBtn = (text, label = '🔊') =>
  h('button', { class: 'listen-btn', type: 'button', 'aria-label': 'Écouter', onclick: () => speak(text, { force: true }) }, label);

export function levelBadge() {
  const lvl = levelOf(getState().stars);
  return h(
    'div',
    { class: 'level' },
    h('span', { class: 'level-emoji' }, lvl.emoji),
    h(
      'div',
      { class: 'level-info' },
      h('div', { class: 'level-name' }, `Niveau ${lvl.index} · ${lvl.name}`),
      h('div', { class: 'bar small' }, h('div', { class: 'bar-fill star', style: { width: `${Math.round(lvl.progress * 100)}%` } })),
      lvl.next ? h('div', { class: 'level-next' }, `Encore ${lvl.next.stars - getState().stars} ⭐ pour devenir ${lvl.next.name}`) : null
    )
  );
}

/** Petite question pour que seuls les adultes entrent dans l'espace parents. */
export function parentGate(onSuccess) {
  const a = randInt(12, 19);
  const b = randInt(3, 9);
  const input = h('input', { type: 'number', inputmode: 'numeric', class: 'gate-input', 'aria-label': 'Réponse' });
  const err = h('div', { class: 'gate-err' });
  const close = () => overlay.remove();
  const overlay = h(
    'div',
    { class: 'modal-bg', onclick: (e) => e.target === overlay && close() },
    h(
      'form',
      {
        class: 'modal',
        onsubmit: (e) => {
          e.preventDefault();
          if (Number(input.value) === a * b) {
            close();
            onSuccess();
          } else {
            err.textContent = 'Ce n’est pas ça…';
            input.value = '';
          }
        },
      },
      h('h2', {}, '👤 Espace parents'),
      h('p', {}, 'Pour entrer, calculez :'),
      h('div', { class: 'gate-q' }, `${a} × ${b} = ?`),
      input,
      err,
      h(
        'div',
        { class: 'row' },
        h('button', { type: 'button', class: 'btn ghost', onclick: close }, 'Annuler'),
        h('button', { type: 'submit', class: 'btn' }, 'Entrer')
      )
    )
  );
  document.body.append(overlay);
  setTimeout(() => input.focus(), 50);
}
