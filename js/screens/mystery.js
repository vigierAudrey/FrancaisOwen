// Le mot mystère : deviner un mot lettre par lettre (6 pétales = 6 essais ratés).

import { h } from '../ui/dom.js';
import { getState, save, markDay } from '../core/store.js';
import { go, back } from '../core/router.js';
import { getUnit, itemsFor } from '../units/index.js';
import { recordAnswer } from '../core/srs.js';
import { header, mascot } from '../ui/components.js';
import { wordView } from '../ui/wordView.js';
import { shuffle, pick } from '../core/util.js';
import { speak } from '../ui/speech.js';
import { sound } from '../ui/sound.js';
import { confetti } from '../ui/confetti.js';

const LIVES = 6;
const EXTRA = 'aeioursltnmpcdbvfgjhz';

export default function mystery({ unitId = 'mots', skillIds }) {
  const st = getState();
  const pool = itemsFor(getUnit(unitId), skillIds).filter((i) => i.word.emoji && i.word.w.length >= 3 && i.word.w.length <= 8);
  const el = h('div', { class: 'screen mystery theme-mots' }, header('Le mot mystère'));
  if (!pool.length) {
    el.append(mascot('Choisis des thèmes de mots pour jouer !', { mood: 'think' }));
    return el;
  }

  const item = pick(pool);
  const word = item.word;
  const letters = Array.from(word.w.normalize('NFC'));
  const keys = shuffle([...new Set([...letters, ...shuffle(Array.from(EXTRA)).slice(0, Math.max(4, 14 - new Set(letters).size))])]);
  const found = new Set();
  let lives = LIVES;
  let hint = false;
  let over = false;

  const slots = h('div', { class: 'mystery-word word-font' });
  const petals = h('div', { class: 'petals', 'aria-label': 'Essais' });
  const hintZone = h('div', { class: 'mystery-hint' });
  const kb = h('div', { class: 'mystery-kb' });
  const msg = h('div', {});

  const render = () => {
    slots.replaceChildren(...letters.map((l) => h('span', { class: 'm-slot' + (found.has(l) ? ' shown' : '') }, found.has(l) ? l : '')));
    petals.replaceChildren(...Array.from({ length: LIVES }, (_, i) => h('span', { class: 'petal' + (i < lives ? '' : ' lost') }, i < lives ? '🌸' : '🥀')));
  };

  const hintBtn = h('button', { class: 'btn small ghost', onclick: () => { hint = true; hintBtn.remove(); hintZone.replaceChildren(h('span', { class: 'm-emoji' }, word.emoji)); speak(word.w, { force: true }); } }, '💡 Un indice');

  function press(l, btn) {
    if (over || btn.disabled) return;
    btn.disabled = true;
    if (letters.includes(l)) {
      found.add(l);
      btn.classList.add('right');
      sound.ok();
    } else {
      lives--;
      btn.classList.add('wrong');
      sound.ko();
    }
    render();
    if (letters.every((x) => found.has(x))) end(true);
    else if (!lives) end(false);
  }

  function end(win) {
    over = true;
    recordAnswer(st, item.id, win && lives >= 3);
    const stars = win ? (hint ? 3 : 5) : 1;
    st.stars += stars;
    markDay();
    save();
    if (win) {
      sound.win();
      confetti();
    }
    speak(word.w, { force: true });
    hintZone.replaceChildren(h('span', { class: 'm-emoji' }, word.emoji));
    hintBtn.remove();
    kb.replaceChildren();
    msg.replaceChildren(
      mascot(win ? `Bravo ! Tu as trouvé le mot ! +${stars} ⭐` : `Le mot était… +${stars} ⭐ pour l’effort !`, { mood: win ? 'wow' : 'think' }),
      h('div', { class: 'fix-word center' }, wordView(word)),
      h('div', { class: 'row' }, h('button', { class: 'btn ghost', onclick: () => back() }, '← Retour'), h('button', { class: 'btn', onclick: () => go('mystery', { unitId, skillIds }, { replace: true }) }, '🔁 Un autre mot'))
    );
  }

  kb.append(...keys.map((l) => {
    const b = h('button', { class: 'key-l word-font', onclick: () => press(l, b) }, l);
    return b;
  }));

  function onKey(e) {
    const b = [...kb.querySelectorAll('.key-l')].find((x) => x.textContent === e.key.toLowerCase());
    if (b) b.click();
  }
  document.addEventListener('keydown', onKey);

  render();
  el.append(
    mascot(`Un mot de ${letters.length} lettres se cache ici. Trouve ses lettres !`, { mood: 'think' }),
    h('div', { class: 'row' }, petals),
    hintZone,
    slots,
    h('div', { class: 'row' }, hintBtn),
    kb,
    msg
  );
  return { el, destroy: () => document.removeEventListener('keydown', onKey) };
}
