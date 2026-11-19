// Memory : associer chaque image à son mot écrit.

import { h } from '../ui/dom.js';
import { getState, save, markDay } from '../core/store.js';
import { go, back } from '../core/router.js';
import { getUnit, itemsFor } from '../units/index.js';
import { header, mascot, MASCOT } from '../ui/components.js';
import { shuffle } from '../core/util.js';
import { wordView } from '../ui/wordView.js';
import { speak } from '../ui/speech.js';
import { sound } from '../ui/sound.js';
import { confetti } from '../ui/confetti.js';
import { questOutcome } from '../core/adventure.js';

const PAIRS = 6;

export default function memory({ unitId = 'mots', skillIds, quest }) {
  const st = getState();
  const unit = getUnit(unitId);
  const el = h('div', { class: `screen memory theme-${unitId}` }, header('Memory'));

  const chosen = [];
  for (const it of shuffle(itemsFor(unit, skillIds))) {
    if (it.word.emoji && !chosen.some((c) => c.word.emoji === it.word.emoji)) chosen.push(it);
    if (chosen.length === PAIRS) break;
  }
  if (chosen.length < 3) {
    el.append(mascot('Choisis des thèmes avec des images pour jouer au Memory !', { mood: 'think' }));
    return el;
  }

  const cards = shuffle(chosen.flatMap((it) => [{ it, kind: 'img' }, { it, kind: 'txt' }]));
  let first = null;
  let busy = false;
  let moves = 0;
  let found = 0;
  let pending = null;
  const movesEl = h('div', { class: 'score-pill' }, '👣 0 coup');

  const board = h(
    'div',
    { class: 'memory-board' },
    cards.map((c) => {
      const btn = h(
        'button',
        { class: `mem-card ${c.kind}`, 'aria-label': 'Carte cachée', onclick: () => flip(c, btn) },
        h('span', { class: 'mem-back' }, MASCOT),
        h('span', { class: 'mem-front' }, c.kind === 'img' ? h('span', { class: 'mem-emoji' }, c.it.word.emoji) : wordView(c.it.word))
      );
      return btn;
    })
  );

  function flip(c, btn) {
    if (busy || btn.classList.contains('flipped')) return;
    sound.flip();
    btn.classList.add('flipped');
    if (!first) {
      first = { c, btn };
      return;
    }
    moves++;
    movesEl.textContent = `👣 ${moves} coup${moves > 1 ? 's' : ''}`;
    if (first.c.it.id === c.it.id) {
      sound.ok();
      speak(c.it.word.w);
      first.btn.classList.add('matched');
      btn.classList.add('matched');
      first = null;
      found++;
      if (found === chosen.length) pending = setTimeout(win, 700);
    } else {
      busy = true;
      const prev = first;
      first = null;
      pending = setTimeout(() => {
        prev.btn.classList.remove('flipped');
        btn.classList.remove('flipped');
        busy = false;
      }, 1100);
    }
  }

  function win() {
    const key = `memory:${unitId}:${chosen.length}`;
    const prev = st.records[key];
    const isRecord = prev === undefined || moves < prev;
    if (isRecord) st.records[key] = moves;
    const bonus = moves <= chosen.length + 3 ? 5 : 3;
    st.stars += bonus;
    markDay();
    save();
    sound.win();
    confetti();
    el.append(
      h(
        'div',
        { class: 'sheet' },
        h(
          'div',
          { class: 'sheet-inner center' },
          mascot(isRecord && prev !== undefined ? `Nouveau record : ${moves} coups ! 🎉` : `Bravo ! Toutes les paires en ${moves} coups !`, { mood: 'wow' }),
          h('div', { class: 'earned' }, `+${bonus} ⭐`),
          quest ? questOutcome(quest, { ok: true, stars: moves <= chosen.length + 3 ? 3 : moves <= chosen.length + 7 ? 2 : 1 }) : null,
          h('div', { class: 'row' }, h('button', { class: 'btn ghost', onclick: () => back() }, '← Retour'), h('button', { class: 'btn', onclick: () => go('memory', { unitId, skillIds, quest }, { replace: true }) }, '🔁 Rejouer'))
        )
      )
    );
  }

  el.append(h('div', { class: 'memory-top' }, h('div', {}, 'Trouve l’image et son mot !'), movesEl), board);
  return { el, destroy: () => clearTimeout(pending) };
}
