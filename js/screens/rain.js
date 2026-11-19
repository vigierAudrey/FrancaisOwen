// La pluie de mots : des images tombent du ciel. Attrape celles où l'on entend le son demandé,
// avant qu'elles touchent le sol ! Le son change toutes les 20 secondes, la pluie accélère.
// 5 cœurs : on en perd un quand on attrape un mauvais mot ou qu'un bon mot tombe par terre.

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

const SECONDS = 60;
const WAVE = 20; // secondes par son
const LIVES = 5;

export default function rain({ unitId = 'sons', skillIds = [] }) {
  const st = getState();
  const unit = getUnit(unitId);
  // Un son simple par notion (les paires « p / b » apportent leurs deux sons).
  const sounds = [...new Set(skillIds.map((id) => getSkill(unit, id)).filter(Boolean).flatMap((s) => s.pair || [s.sound]))].filter(
    (s) => WORDS.filter((w) => w.sounds.has(s)).length >= 6
  );
  const el = h('div', { class: 'screen rain theme-sons' }, header('La pluie de mots'));
  if (!sounds.length) {
    el.append(mascot('Choisis d’abord des sons dans l’univers des sons !', { mood: 'think' }));
    return el;
  }
  const waves = shuffle(sounds);
  while (waves.length < SECONDS / WAVE) waves.push(...shuffle(sounds));

  let snd = null;
  let wave = -1;
  let left = SECONDS;
  let lives = LIVES;
  let score = 0;
  let done = false;
  let raf = 0;
  let timer = null;
  let pending = null;
  let last = 0;
  let spawnIn = 0;
  let elapsed = 0;
  const drops = [];
  const caught = new Map(); // mot -> son
  const missed = new Map();
  let recent = [];

  const top = h('div', { class: 'rain-top' });
  const field = h('div', { class: 'rain-field' });
  const banner = h('div', { class: 'rain-banner' });
  const updateTop = () =>
    top.replaceChildren(
      h('div', { class: 'timer' + (left <= 10 ? ' hurry' : '') }, `⏱️ ${left}`),
      snd ? soundChip(snd) : null,
      h('div', { class: 'rain-lives', 'aria-label': `${lives} cœurs` }, Array.from({ length: LIVES }, (_, i) => (i < lives ? '❤️' : '🤍')).join('')),
      h('div', { class: 'score-pill' }, `🧺 ${score}`)
    );

  function nextWave() {
    wave++;
    snd = waves[wave];
    updateTop();
    banner.replaceChildren(h('span', {}, 'Attrape le son'), soundChip(snd, { big: true }));
    banner.classList.remove('show');
    void banner.offsetWidth;
    banner.classList.add('show');
    speak(`Attrape le son ${soundLine(snd)}`, { force: true });
  }

  function spawn() {
    const yes = Math.random() < 0.5;
    const onField = new Set(drops.map((d) => d.word.w));
    const ok = (w) => w.emoji && !onField.has(w.w) && !recent.includes(w.w);
    let word;
    if (yes) word = pick(WORDS.filter((w) => ok(w) && w.sounds.has(snd)));
    else {
      const no = WORDS.filter((w) => ok(w) && !w.sounds.has(snd));
      const tricky = no.filter((w) => SOUNDS[snd].confuse.some((c) => w.sounds.has(c)));
      word = pick(tricky.length && Math.random() < 0.6 ? tricky : no);
    }
    if (!word) return;
    recent = [...recent.slice(-8), word.w];
    const w = field.clientWidth;
    const size = Math.min(96, Math.max(76, w / 4.4));
    const d = {
      word,
      snd,
      yes: word.sounds.has(snd),
      x: Math.random() * Math.max(0, w - size),
      y: -size,
      // La pluie accélère doucement au fil de la partie.
      speed: (field.clientHeight / 6.5) * (1 + elapsed / 70) * (0.85 + Math.random() * 0.3),
      el: null,
    };
    d.el = h(
      'button',
      { class: 'drop', style: { width: `${size}px`, height: `${size}px` }, 'aria-label': word.w, onpointerdown: (e) => { e.preventDefault(); grab(d); } },
      h('span', { class: 'drop-emoji' }, word.emoji),
      h('span', { class: 'drop-word word-font' }, word.w)
    );
    d.el.style.transform = `translate(${d.x}px, ${d.y}px)`;
    field.append(d.el);
    drops.push(d);
  }

  function remove(d, cls) {
    const i = drops.indexOf(d);
    if (i >= 0) drops.splice(i, 1);
    d.gone = true;
    d.el.classList.add(cls);
    setTimeout(() => d.el.remove(), 450);
  }

  function loseLife() {
    lives--;
    field.classList.remove('hurt');
    void field.offsetWidth;
    field.classList.add('hurt');
    updateTop();
    if (lives <= 0) finish();
  }

  function grab(d) {
    if (done || d.gone) return;
    if (d.yes) {
      score++;
      caught.set(d.word.w, { word: d.word, snd: d.snd });
      recordAnswer(st, `son:${d.snd}:${d.word.w}`, true);
      sound.ok();
      speak(d.word.w, { force: true });
      remove(d, 'caught');
    } else {
      sound.ko();
      d.el.querySelector('.drop-word').replaceChildren(h('span', {}, '🙈 '), d.word.w);
      remove(d, 'wrong');
      loseLife();
    }
    updateTop();
  }

  function frame(t) {
    if (done) return;
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    elapsed += dt;
    spawnIn -= dt;
    if (spawnIn <= 0) {
      spawn();
      spawnIn = Math.max(0.75, 1.6 - elapsed / 60);
    }
    const floor = field.clientHeight;
    for (const d of [...drops]) {
      d.y += d.speed * dt;
      d.el.style.transform = `translate(${d.x}px, ${d.y}px)`;
      if (d.y > floor - d.el.offsetHeight + 4) {
        if (d.yes) {
          missed.set(d.word.w, { word: d.word, snd: d.snd });
          sound.flip();
          remove(d, 'splash');
          loseLife();
          if (done) return;
        } else remove(d, 'melt');
      }
    }
    raf = requestAnimationFrame(frame);
  }

  function finish() {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    clearInterval(timer);
    clearTimeout(pending);
    stopSpeaking();
    const prev = st.records['rain:best'] || 0;
    const isNew = score > prev;
    if (isNew) st.records['rain:best'] = score;
    const stars = Math.ceil(score / 2) + (isNew ? 5 : 0);
    st.stars += stars;
    markDay();
    save();
    if (isNew || lives > 0) {
      sound.win();
      confetti();
    }
    const list = (title, map) =>
      map.size
        ? h(
            'div',
            { class: 'col tight' },
            h('b', {}, title),
            h('div', { class: 'rain-recap' }, [...map.values()].map(({ word, snd: s }) => h('button', { class: 'rain-recap-w', onclick: () => speak(word.w, { force: true }) }, h('span', {}, word.emoji), wordView(word, { highlight: s }))))
          )
        : null;
    for (const w of caught.keys()) missed.delete(w);
    el.append(
      h(
        'div',
        { class: 'sheet' },
        h(
          'div',
          { class: 'sheet-inner center' },
          mascot(
            lives <= 0 ? `Oh ! Plus de cœurs… Tu as attrapé ${score} mot${score > 1 ? 's' : ''} !` : isNew ? `🎉 NOUVEAU RECORD : ${score} mots !` : `${score} mots attrapés ! Ton record : ${prev}.`,
            { mood: isNew ? 'wow' : 'happy' }
          ),
          h('div', { class: 'earned' }, `+${stars} ⭐`),
          list('🧺 Tes mots attrapés', caught),
          list('💧 Ils sont tombés par terre :', missed),
          h('div', { class: 'row' }, h('button', { class: 'btn ghost', onclick: () => back() }, '← Retour'), h('button', { class: 'btn', onclick: () => go('rain', { unitId, skillIds }, { replace: true }) }, '🔁 Rejouer'))
        )
      )
    );
  }

  const cd = h('div', { class: 'countdown' });
  el.append(top, h('div', { class: 'rain-wrap' }, field, banner), cd);
  updateTop();
  let n = 3;
  (function step() {
    if (done) return;
    if (n > 0) {
      cd.replaceChildren(h('span', { class: 'cd-num' }, String(n)));
      sound.tick();
      n--;
      pending = setTimeout(step, 800);
    } else {
      cd.remove();
      sound.go();
      nextWave();
      spawnIn = 1.2;
      raf = requestAnimationFrame(frame);
      timer = setInterval(() => {
        left--;
        if (left > 0 && left % WAVE === 0) nextWave();
        if (left <= 5 && left > 0) sound.tick();
        updateTop();
        if (left <= 0) finish();
      }, 1000);
    }
  })();

  return { el, destroy: () => { done = true; cancelAnimationFrame(raf); clearInterval(timer); clearTimeout(pending); stopSpeaking(); } };
}
