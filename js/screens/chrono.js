// Défi chrono : écoute et trouve l'image, le plus vite possible en 60 secondes.

import { h } from '../ui/dom.js';
import { getState, save, markDay } from '../core/store.js';
import { go, back } from '../core/router.js';
import { getUnit, getSkill, itemsFor } from '../units/index.js';
import { recordAnswer } from '../core/srs.js';
import { EXERCISES } from '../exercises/index.js';
import { header, mascot, listenBtn } from '../ui/components.js';
import { pick } from '../core/util.js';
import { speak, stopSpeaking } from '../ui/speech.js';
import { sound } from '../ui/sound.js';
import { confetti } from '../ui/confetti.js';

const SECONDS = 60;

export default function chrono({ unitId = 'mots', skillIds }) {
  const st = getState();
  const unit = getUnit(unitId);
  const items = itemsFor(unit, skillIds).filter((i) => i.word.emoji);
  const el = h('div', { class: 'screen session theme-mots' }, header('Défi chrono'));
  if (items.length < 4) {
    el.append(mascot('Choisis des thèmes avec des images pour jouer !', { mood: 'think' }));
    return el;
  }

  let left = SECONDS;
  let score = 0;
  let timer = null;
  let pending = null;
  let done = false;
  let q = null;
  const top = h('div', { class: 'memory-top' });
  const card = h('div', { class: 'q-card' });
  const zone = h('div', { class: 'answer-zone' });
  const updateTop = () => top.replaceChildren(h('div', { class: 'timer' + (left <= 10 ? ' hurry' : '') }, `⏱️ ${left}`), h('div', { class: 'score-pill' }, `✅ ${score}`));

  function next() {
    if (done) return;
    const item = pick(items);
    q = EXERCISES.listen.build(item, { unit, skill: getSkill(unit, item.skillId), skills: [], pool: items });
    card.className = 'q-card';
    card.replaceChildren(listenBtn(q.say), h('div', { class: 'q-emoji' }, '👂'));
    zone.replaceChildren(h('div', { class: 'choices emoji' }, q.choices.map((c) => h('button', { class: 'btn choice emoji', onclick: (e) => answer(c.value, e.currentTarget) }, h('span', { class: 'choice-emoji' }, c.emoji)))));
    speak(q.say, { force: true });
  }

  function answer(v, btn) {
    if (done || card.classList.contains('ok') || card.classList.contains('ko')) return;
    const ok = v === q.answer;
    recordAnswer(st, q.item.id, ok);
    if (ok) {
      score++;
      sound.ok();
    } else sound.ko();
    btn.classList.add(ok ? 'right' : 'wrong');
    card.classList.add(ok ? 'ok' : 'ko');
    updateTop();
    pending = setTimeout(next, ok ? 350 : 900);
  }

  function finish() {
    done = true;
    clearInterval(timer);
    clearTimeout(pending);
    stopSpeaking();
    const prev = st.records['chrono:mots'] || 0;
    const isNew = score > prev;
    if (isNew) st.records['chrono:mots'] = score;
    const stars = Math.ceil(score / 2) + (isNew ? 5 : 0);
    st.stars += stars;
    markDay();
    save();
    if (isNew) {
      sound.win();
      confetti();
    }
    el.append(
      h(
        'div',
        { class: 'sheet' },
        h(
          'div',
          { class: 'sheet-inner center' },
          mascot(isNew ? `🎉 NOUVEAU RECORD : ${score} mots !` : `${score} mots trouvés ! Ton record : ${prev}.`, { mood: isNew ? 'wow' : 'happy' }),
          h('div', { class: 'earned' }, `+${stars} ⭐`),
          h('div', { class: 'row' }, h('button', { class: 'btn ghost', onclick: () => back() }, '← Retour'), h('button', { class: 'btn', onclick: () => go('chrono', { unitId, skillIds }, { replace: true }) }, '🔁 Rejouer'))
        )
      )
    );
  }

  const cd = h('div', { class: 'countdown' });
  el.append(top, card, zone, cd);
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
      next();
      timer = setInterval(() => {
        left--;
        if (left <= 5 && left > 0) sound.tick();
        updateTop();
        if (left <= 0) finish();
      }, 1000);
    }
  })();

  return { el, destroy: () => { done = true; clearInterval(timer); clearTimeout(pending); stopSpeaking(); } };
}
