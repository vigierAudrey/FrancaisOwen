// Séance de questions : fonctionne pour tous les exercices « question par question »
// (format des questions décrit dans exercises/index.js) et pour les révisions mélangées.

import { h } from '../ui/dom.js';
import { getState, save, markDay } from '../core/store.js';
import { go, back } from '../core/router.js';
import { getUnit, getSkill, itemsFor, itemById, exercisesFor } from '../units/index.js';
import { EXERCISES, MODES } from '../exercises/index.js';
import { createSession } from '../core/session.js';
import { sound } from '../ui/sound.js';
import { speak, stopSpeaking } from '../ui/speech.js';
import { wordView } from '../ui/wordView.js';
import { mascot, soundChip, listenBtn, MASCOT } from '../ui/components.js';
import { pick, shuffle } from '../core/util.js';
import { unlockedCount } from '../core/rewards.js';

const PRAISE = ['Bravo !', 'Super !', 'Génial !', 'Trop fort !', 'Excellent !', 'Parfait !', 'Waouh !', 'Bien vu !', 'Yes !', 'Bien joué !'];
const OOPS = ['Presque !', 'Pas grave, on apprend !', 'Oups ! Regarde bien :', 'On le retient ensemble :'];

export default function sessionScreen(params) {
  const { unitId, skillIds = [], mode: modeId, itemIds } = params;
  const st = getState();
  const review = modeId === 'review';
  const unit = unitId ? getUnit(unitId) : null;
  const selected = unit ? skillIds.map((id) => getSkill(unit, id)).filter(Boolean) : [];

  function buildFor(item) {
    const u = getUnit(item.unitId);
    const skill = getSkill(u, item.skillId);
    if (!skill) return null;
    const ctx = { unit: u, skill, skills: review ? [skill] : selected, pool: review ? skill.items : items };
    for (const id of shuffle(exercisesFor(u, skill, modeId))) {
      const q = EXERCISES[id]?.build(item, ctx);
      if (q) return { ...q, mode: id };
    }
    return null;
  }

  let items = itemIds ? itemIds.map(itemById).filter(Boolean) : itemsFor(unit, skillIds);
  items = items.filter((i) => buildFor(i)); // on garde ce qui se prête à l'exercice
  const total = review ? Math.max(5, Math.min(items.length + 2, 15)) : itemIds ? Math.min(st.settings.questionsPerSession, Math.max(4, items.length * 3)) : st.settings.questionsPerSession;
  const session = createSession({ facts: items, state: st, count: total });
  const stickersBefore = unlockedCount(st.stars);
  const theme = unit ? `theme-${unit.id}` : 'theme-review';

  let q = null;
  let locked = true;
  let finished = false;
  let answered = false;
  let chosen = []; // étiquettes choisies (exercices à étiquettes)
  let fill = null; // réponse affichée dans la case du mot
  let correct = 0;
  let asked = 0;
  let streak = 0;
  let bestStreak = 0;
  let earned = 0;
  let pending = null;
  const mistakes = new Map();

  const progressEl = h('div', { class: 'progress' });
  const streakEl = h('div', { class: 'streak' });
  const instr = h('div', { class: 'instr' });
  const card = h('div', { class: 'q-card' });
  const praiseEl = h('div', { class: 'praise', 'aria-live': 'polite' });
  const bird = h('div', { class: 'mini-owl', 'aria-hidden': 'true' }, MASCOT);
  const answerZone = h('div', { class: 'answer-zone' });
  const sheet = h('div', { class: 'sheet hidden' });

  const el = h(
    'div',
    { class: `screen session ${theme}` },
    h('div', { class: 'session-top' }, h('button', { class: 'icon-btn', onclick: () => back(), 'aria-label': 'Quitter' }, '✕'), progressEl, streakEl),
    h('div', { class: 'q-area' }, h('div', { class: 'q-head' }, bird, instr), card, praiseEl),
    answerZone,
    sheet
  );

  if (!items.length) {
    el.replaceChildren(
      h('div', { class: 'session-top' }, h('button', { class: 'icon-btn', onclick: () => back(), 'aria-label': 'Retour' }, '←')),
      mascot(review ? 'Rien à réviser pour l’instant. Reviens demain ! 🌙' : 'Ce jeu ne marche pas avec ce que tu as choisi. Essaie un autre jeu ou d’autres sons !', { mood: 'think' })
    );
    return el;
  }

  const birdMood = (m) => {
    bird.className = `mini-owl mood-${m}`;
    void bird.offsetWidth;
    bird.classList.add('react');
  };

  function updateTop() {
    const pct = Math.min(100, (asked / total) * 100);
    progressEl.replaceChildren(
      h('div', { class: 'bar' }, h('div', { class: 'bar-fill', style: { width: `${pct}%` } })),
      h('span', { class: 'count' }, `${Math.min(asked + 1, total)}/${total}`)
    );
    streakEl.textContent = streak >= 2 ? `🔥 ${streak}` : '';
    streakEl.classList.toggle('hot', streak >= 5);
  }

  function renderCard(stateCls = '') {
    card.className = 'q-card' + (stateCls ? ` ${stateCls}` : '');
    const kids = [];
    if (q.say || q.helpSay) kids.push(listenBtn(q.say || q.helpSay));
    if (q.title) kids.push(h('div', { class: 'q-title' }, q.title));
    if (q.text) kids.push(textView(q.text, q.textOpts, answered ? String(Array.isArray(q.answer) ? '' : q.answer) : null));
    if (q.emoji) kids.push(h('div', { class: 'q-emoji', 'aria-hidden': 'true' }, q.emoji));
    if (q.word) {
      const opts = { ...q.wordOpts, fill };
      if (answered && q.correction) Object.assign(opts, { hlIndex: q.correction.hlIndex, highlight: q.correction.highlight });
      kids.push(h('div', { class: 'q-word' + (q.emoji ? '' : ' solo') }, wordView(q.word, opts)));
    } else if (answered && q.reveal) {
      kids.push(h('div', { class: 'q-word reveal' }, wordView(q.reveal.word, { highlight: q.reveal.highlight })));
    }
    if (q.input === 'tiles') {
      kids.push(
        h(
          'div',
          { class: `tile-slots ${q.tileStyle}` },
          q.answer.map((_, i) => h('span', { class: 'tile-slot' + (chosen[i] ? ' filled' : '') }, chosen[i] ? q.tiles[chosen[i].idx] : ''))
        )
      );
    }
    card.replaceChildren(...kids);
  }

  function renderInstr() {
    instr.replaceChildren(...[h('span', {}, q.instruction), q.sound ? soundChip(q.sound) : null].filter(Boolean));
  }

  function renderAnswer() {
    if (q.input === 'choices') {
      answerZone.replaceChildren(
        h(
          'div',
          { class: `choices ${q.choiceStyle}` + (q.choices.length === 3 ? ' three' : '') + (q.choices.length === 2 ? ' two' : '') },
          q.choices.map((c, i) =>
            h(
              'button',
              { class: `btn choice ${q.choiceStyle}`, 'data-v': i, onclick: (e) => submit(c.value, e.currentTarget) },
              c.emoji ? h('span', { class: 'choice-emoji' }, c.emoji) : h('span', { class: 'choice-text' }, c.text),
              c.emoji && c.caption ? h('span', { class: 'choice-caption' }, c.caption) : null
            )
          )
        )
      );
    } else if (q.input === 'truefalse') {
      const [yes, no] = q.tfLabels || ['👍 Oui', '👎 Non'];
      answerZone.replaceChildren(
        h(
          'div',
          { class: 'tf' },
          h('button', { class: 'btn tf-yes', onclick: (e) => submit(true, e.currentTarget) }, yes),
          h('button', { class: 'btn tf-no', onclick: (e) => submit(false, e.currentTarget) }, no)
        )
      );
    } else if (q.input === 'boxes') {
      answerZone.replaceChildren(
        h(
          'div',
          { class: 'syl-boxes' },
          q.boxes.map((txt, i) =>
            h('button', { class: 'syl-box', 'aria-label': `Syllabe ${i + 1}`, onclick: (e) => submit(i, e.currentTarget) }, h('span', { class: 'clap' }, '👏'), h('span', { class: 'syl-txt' }, txt))
          )
        ),
        q.tip ? h('p', { class: 'tip-line' }, '💡 ', q.tip) : null
      );
    } else if (q.input === 'tiles') {
      renderTiles();
    }
  }

  function renderTiles() {
    const used = new Set(chosen.map((c) => c.idx));
    answerZone.replaceChildren(
      h(
        'div',
        { class: `tiles ${q.tileStyle}` },
        q.tiles.map((t, idx) => h('button', { class: 'tile' + (used.has(idx) ? ' used' : ''), disabled: used.has(idx), onclick: () => pickTile(idx) }, t))
      ),
      h('div', { class: 'row' }, h('button', { class: 'btn ghost small', onclick: undoTile, disabled: !chosen.length }, '⌫ Effacer'))
    );
  }

  function pickTile(idx) {
    if (locked || chosen.some((c) => c.idx === idx)) return;
    sound.tap();
    chosen.push({ idx });
    renderCard('typing');
    renderTiles();
    if (chosen.length === q.answer.length) {
      locked = true;
      pending = setTimeout(() => {
        locked = false;
        submit(chosen.map((c) => q.tiles[c.idx]));
      }, 250);
    }
  }
  function undoTile() {
    if (locked || !chosen.length) return;
    chosen.pop();
    renderCard();
    renderTiles();
  }

  function next() {
    if (finished) return;
    if (session.done()) return finish();
    q = session.next(buildFor);
    if (!q) return finish();
    locked = false;
    answered = false;
    chosen = [];
    fill = null;
    praiseEl.textContent = '';
    renderInstr();
    renderCard();
    renderAnswer();
    updateTop();
    if (q.say) pending = setTimeout(() => speak(q.say), 250);
  }

  function submit(value, btn) {
    if (locked || finished) return;
    locked = true;
    answered = true;
    const ok = Array.isArray(q.answer) ? value.join('') === q.answer.join('') : value === q.answer;
    asked++;
    session.answer(q.item, ok);
    markDay();
    answerZone.querySelector('.syl-boxes')?.classList.add('done');
    if (q.input === 'boxes') answerZone.querySelectorAll('.syl-box')[q.answer]?.classList.add('right');
    if (q.wordOpts?.mask !== undefined) fill = ok ? String(q.answer) : String(value);
    if (ok) {
      correct++;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
      earned++;
      st.stars++;
      btn?.classList.add('right');
      renderCard('ok');
      if (streak % 5 === 0) {
        sound.combo();
        praiseEl.textContent = `🔥 ${streak} d’affilée ! +1 ⭐`;
        birdMood('wow');
      } else {
        sound.ok();
        praiseEl.textContent = `${pick(PRAISE)} +1 ⭐`;
        birdMood('happy');
      }
      if (q.afterOk) speak(q.afterOk);
      save();
      updateTop();
      pending = setTimeout(next, q.reveal || q.afterOk ? 1600 : 1100);
    } else {
      streak = 0;
      sound.ko();
      btn?.classList.add('wrong');
      mistakes.set(q.item.id, q.item);
      birdMood('oops');
      renderCard('ko');
      save();
      updateTop();
      pending = setTimeout(showCorrection, 650);
    }
  }

  function showCorrection() {
    const c = q.correction || {};
    const ok = h('button', { class: 'btn ok-btn', onclick: closeSheet }, 'J’ai compris ✓');
    sheet.replaceChildren(
      h(
        'div',
        { class: 'sheet-inner center' },
        mascot(pick(OOPS), { mood: 'think' }),
        c.emoji ? h('div', { class: 'fix-emoji' }, c.emoji) : null,
        c.word ? h('div', { class: 'fix-word' }, wordView(c.word, { highlight: c.highlight, hlIndex: c.hlIndex })) : null,
        c.text ? h('p', { class: 'fix-text' }, c.text) : null,
        h('div', { class: 'row' }, c.say ? h('button', { class: 'btn ghost', onclick: () => speak(c.say, { force: true }) }, '🔊 Écouter') : null, ok)
      )
    );
    sheet.classList.remove('hidden');
    if (c.say) speak(c.say);
    ok.focus();
  }

  function closeSheet() {
    if (sheet.classList.contains('hidden')) return;
    sheet.classList.add('hidden');
    stopSpeaking();
    next();
  }

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(pending);
    st.history.unshift({ t: Date.now(), unit: unitId || 'review', mode: modeId, correct, asked });
    st.history = st.history.slice(0, 100);
    save();
    go(
      'results',
      {
        unitId,
        skillIds,
        mode: modeId,
        itemIds,
        correct,
        asked,
        earned,
        bestStreak,
        stickersBefore,
        mistakes: [...mistakes.values()].map((i) => ({ id: i.id, text: i.word.w, emoji: i.word.emoji || '' })),
      },
      { replace: true }
    );
  }

  function onKey(e) {
    if (!sheet.classList.contains('hidden')) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeSheet();
      }
      return;
    }
    if (!q || locked) return;
    if (q.input === 'choices' && /^[1-4]$/.test(e.key)) answerZone.querySelectorAll('.choice')[Number(e.key) - 1]?.click();
    else if (q.input === 'boxes' && /^[1-9]$/.test(e.key)) answerZone.querySelectorAll('.syl-box')[Number(e.key) - 1]?.click();
    else if (q.input === 'truefalse') {
      if (['o', 'v'].includes(e.key.toLowerCase())) answerZone.querySelector('.tf-yes')?.click();
      if (['n', 'f'].includes(e.key.toLowerCase())) answerZone.querySelector('.tf-no')?.click();
    } else if (q.input === 'tiles') {
      if (e.key === 'Backspace') undoTile();
      else if (e.key.length === 1) {
        const used = new Set(chosen.map((c) => c.idx));
        const idx = q.tiles.findIndex((t, i) => !used.has(i) && t.toLowerCase().startsWith(e.key.toLowerCase()));
        if (idx >= 0) pickTile(idx);
      }
    }
    if (e.key === ' ' && q.say) {
      e.preventDefault();
      speak(q.say, { force: true });
    }
  }
  document.addEventListener('keydown', onKey);

  next();

  return {
    el,
    destroy() {
      finished = true;
      clearTimeout(pending);
      stopSpeaking();
      document.removeEventListener('keydown', onKey);
    },
  };
}

/** Texte à lire ; « _ » devient une case (remplie avec la bonne réponse après coup). */
function textView(text, opts = {}, fill) {
  const parts = text.split('_');
  const kids = [];
  parts.forEach((p, i) => {
    kids.push(p);
    if (i < parts.length - 1) kids.push(h('span', { class: 'gap' + (fill ? ' filled' : '') }, fill || '?'));
  });
  return h('div', { class: 'q-text word-font' + (opts?.big ? ' big' : '') + (opts?.story ? ' story' : ''), lang: 'fr' }, kids);
}

export const modeLabel = (id) => MODES[id]?.label || id;
