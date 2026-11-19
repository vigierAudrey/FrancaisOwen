// Le bingo des sons : un carton de 9 images. Plume annonce un son ; pose un jeton sur une image
// où l'on entend ce son. 3 jetons alignés : BINGO ! On peut continuer jusqu'au carton plein.

import { h } from '../ui/dom.js';
import { getState, save, markDay } from '../core/store.js';
import { go, back } from '../core/router.js';
import { getUnit, getSkill } from '../units/index.js';
import { SOUNDS, soundLine } from '../data/sounds.js';
import { WORDS } from '../lang/word.js';
import { recordAnswer } from '../core/srs.js';
import { header, mascot, soundChip } from '../ui/components.js';
import { wordView } from '../ui/wordView.js';
import { shuffle, pick } from '../core/util.js';
import { speak, stopSpeaking } from '../ui/speech.js';
import { sound } from '../ui/sound.js';
import { confetti } from '../ui/confetti.js';

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const TOKENS = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'];

export default function bingo({ unitId = 'sons', skillIds = [] }) {
  const st = getState();
  const unit = getUnit(unitId);
  const sounds = [...new Set(skillIds.map((id) => getSkill(unit, id)).filter(Boolean).flatMap((s) => s.pair || [s.sound]))].filter(
    (s) => WORDS.filter((w) => w.sounds.has(s)).length >= 6
  );
  const el = h('div', { class: 'screen bingo theme-sons' }, header('Le bingo des sons'));
  if (sounds.length < 2) {
    el.append(mascot('Choisis au moins deux sons dans l’univers des sons pour jouer au bingo !', { mood: 'think' }));
    return el;
  }

  // Le carton : 9 mots illustrés, chacun avec au moins un des sons choisis.
  const usable = shuffle(WORDS.filter((w) => w.emoji && sounds.some((s) => w.sounds.has(s))));
  const card = [];
  for (const w of usable) {
    if (card.length === 9) break;
    // Variété : pas plus de 3 mots qui ne contiendraient qu'un seul et même son choisi.
    const mine = sounds.filter((s) => w.sounds.has(s));
    if (mine.length === 1 && card.filter((c) => c.mine.length === 1 && c.mine[0] === mine[0]).length >= 3) continue;
    card.push({ word: w, mine, marked: false });
  }
  if (card.length < 9) {
    el.append(mascot('Il n’y a pas assez d’images pour ces sons. Choisis d’autres sons !', { mood: 'think' }));
    return el;
  }
  const token = pick(TOKENS);

  let call = null;
  let calls = 0;
  let mistakes = 0;
  let bingoDone = false;
  let over = false;
  let pending = null;
  let lastCalls = [];

  const callEl = h('div', { class: 'bingo-call' });
  const msg = h('div', { class: 'bingo-msg' });
  const info = h('div', { class: 'memory-top' });
  const cells = card.map((c, i) =>
    h('button', { class: 'bingo-cell', 'aria-label': c.word.w, onclick: () => tap(i) }, h('span', { class: 'bingo-emoji' }, c.word.emoji), h('span', { class: 'bingo-word' }), h('span', { class: 'bingo-token' }, token))
  );
  const grid = h('div', { class: 'bingo-grid' }, cells);

  const updateInfo = () => info.replaceChildren(h('span', {}, `📣 Appel n° ${calls}`), h('span', { class: 'score-pill' }, `${token} ${card.filter((c) => c.marked).length} / 9`));

  function nextCall() {
    if (over) return;
    const open = card.filter((c) => !c.marked);
    // On annonce un son présent dans au moins une case libre ; de préférence pas le même que les derniers.
    const candidates = sounds.filter((s) => open.some((c) => c.word.sounds.has(s)));
    const fresh = candidates.filter((s) => !lastCalls.includes(s));
    call = pick(fresh.length ? fresh : candidates);
    lastCalls = [...lastCalls.slice(-1), call];
    calls++;
    updateInfo();
    callEl.replaceChildren(h('span', {}, 'Je cherche le son'), soundChip(call, { big: true }));
    callEl.classList.remove('pop');
    void callEl.offsetWidth;
    callEl.classList.add('pop');
    msg.replaceChildren();
    speak(`Je cherche le son ${soundLine(call)}`, { force: true });
  }

  function tap(i) {
    const c = card[i];
    if (over || !call) return;
    if (c.marked) return speak(c.word.w, { force: true });
    if (c.word.sounds.has(call)) {
      c.marked = true;
      recordAnswer(st, `son:${call}:${c.word.w}`, true);
      cells[i].classList.add('marked');
      cells[i].querySelector('.bingo-word').replaceChildren(wordView(c.word, { highlight: call }));
      sound.ok();
      speak(c.word.w, { force: true });
      const line = LINES.find((l) => l.includes(i) && l.every((j) => card[j].marked));
      updateInfo();
      if (card.every((x) => x.marked)) return win(true);
      if (line && !bingoDone) {
        bingoDone = true;
        line.forEach((j) => cells[j].classList.add('line'));
        return win(false);
      }
      call = null;
      pending = setTimeout(nextCall, 1100);
    } else {
      mistakes++;
      sound.ko();
      cells[i].classList.remove('nope');
      void cells[i].offsetWidth;
      cells[i].classList.add('nope');
      msg.replaceChildren(h('span', {}, 'Presque ! Dans '), wordView(c.word), h('span', {}, ` on n’entend pas « ${SOUNDS[call].label} ». Écoute bien !`));
      speak(`${c.word.w}… Presque ! Écoute bien : ${SOUNDS[call].say}.`, { force: true });
    }
  }

  function win(full) {
    call = null;
    const stars = full ? 4 : Math.max(2, 5 - Math.floor(mistakes / 2));
    st.stars += stars;
    markDay();
    save();
    sound.win();
    confetti();
    callEl.replaceChildren(h('span', { class: 'bingo-big' }, full ? 'CARTON PLEIN ! 🏆' : 'BINGO ! 🎉'));
    speak(full ? 'Carton plein ! Bravo !' : 'Bingo ! Bravo !', { force: true });
    msg.replaceChildren(
      mascot(full ? `Tu as rempli tout le carton ! +${stars} ⭐` : `Trois jetons alignés ! +${stars} ⭐ Tu continues jusqu’au carton plein ?`, { mood: 'wow' }),
      h(
        'div',
        { class: 'row wrap' },
        h('button', { class: 'btn ghost', onclick: () => back() }, '← Retour'),
        full ? null : h('button', { class: 'btn secondary', onclick: () => { msg.replaceChildren(); nextCall(); } }, '➜ Carton plein'),
        h('button', { class: 'btn', onclick: () => go('bingo', { unitId, skillIds }, { replace: true }) }, '🔁 Nouveau carton')
      )
    );
    if (full) over = true;
  }

  el.append(mascot('Écoute le son. Pose un jeton sur une image où tu l’entends !', { mood: 'happy' }), callEl, info, grid, msg);
  updateInfo();
  pending = setTimeout(nextCall, 600);
  return { el, destroy: () => { over = true; clearTimeout(pending); stopSpeaking(); } };
}
