// Chasse aux sons : parmi 6 images, attrape toutes celles où l'on entend le son.

import { h } from '../ui/dom.js';
import { getState, save, markDay } from '../core/store.js';
import { go, back } from '../core/router.js';
import { getUnit, getSkill } from '../units/index.js';
import { SOUNDS, soundLine } from '../data/sounds.js';
import { WORDS } from '../lang/word.js';
import { recordAnswer } from '../core/srs.js';
import { header, mascot, soundChip } from '../ui/components.js';
import { wordView } from '../ui/wordView.js';
import { shuffle, pick, randInt } from '../core/util.js';
import { speak } from '../ui/speech.js';
import { sound } from '../ui/sound.js';
import { confetti } from '../ui/confetti.js';
import { questOutcome, starsFromRatio } from '../core/adventure.js';

const ROUNDS = 5;
const CARDS = 6;

export default function hunt({ unitId = 'sons', skillIds, quest }) {
  const unit = getUnit(unitId);
  const st = getState();
  const skills = skillIds.map((id) => getSkill(unit, id)).filter((s) => s && s.items.length >= 3);
  const el = h('div', { class: `screen hunt theme-${unitId}` }, header('Chasse aux sons'));
  if (!skills.length) {
    el.append(mascot('Choisis d’abord un son à chasser !', { mood: 'think' }));
    return el;
  }

  let round = 0;
  let total = 0;
  let found = 0;
  let pending = null;
  const body = h('div', { class: 'col' });
  el.append(body);

  function newRound() {
    round++;
    const skill = pick(skills);
    const snd = skill.pair ? pick(skill.pair) : skill.sound;
    const positives = shuffle(skill.items.filter((i) => i.sound === snd)).slice(0, randInt(2, 3));
    const usedEmoji = new Set(positives.map((p) => p.word.emoji));
    const without = shuffle(WORDS.filter((w) => !w.sounds.has(snd) && !usedEmoji.has(w.emoji)));
    const tricky = without.filter((w) => SOUNDS[snd].confuse.some((c) => w.sounds.has(c)));
    const negatives = [...new Set([...tricky.slice(0, 2), ...without])].slice(0, CARDS - positives.length);
    const cards = shuffle([...positives.map((i) => ({ word: i.word, item: i, yes: true })), ...negatives.map((w) => ({ word: w, yes: false }))]);
    const picked = new Set();
    let checked = false;
    total += positives.length;

    const checkBtn = h('button', { class: 'btn big', disabled: true, onclick: check }, 'Vérifier ✓');
    const grid = h(
      'div',
      { class: 'hunt-grid' },
      cards.map((c, i) => {
        const b = h(
          'button',
          {
            class: 'hunt-card',
            'aria-label': c.word.w,
            onclick: () => {
              if (checked) return speak(c.word.w, { force: true });
              speak(c.word.w, { force: true });
              sound.tap();
              if (picked.has(i)) picked.delete(i);
              else picked.add(i);
              b.classList.toggle('picked', picked.has(i));
              checkBtn.disabled = !picked.size;
            },
          },
          h('span', { class: 'hc-emoji' }, c.word.emoji),
          h('span', { class: 'hc-word' })
        );
        c.el = b;
        return b;
      })
    );

    function check() {
      if (checked) return;
      checked = true;
      let good = 0;
      let bad = 0;
      cards.forEach((c, i) => {
        const p = picked.has(i);
        c.el.querySelector('.hc-word').replaceChildren(wordView(c.word, { highlight: c.yes ? snd : null }));
        c.el.classList.add(c.yes ? (p ? 'good' : 'missed') : p ? 'bad' : 'neutral');
        if (c.yes) recordAnswer(st, c.item.id, p);
        if (c.yes && p) good++;
        if (!c.yes && p) bad++;
      });
      found += good;
      scorePill.textContent = `🧺 ${found}`;
      const perfect = good === positives.length && !bad;
      const stars = good + (perfect ? 2 : 0);
      st.stars += stars;
      markDay();
      save();
      perfect ? sound.combo() : good ? sound.ok() : sound.ko();
      msg.replaceChildren(mascot(perfect ? `Parfait ! +${stars} ⭐` : `Les images en vert ont le son « ${SOUNDS[snd].label} ». +${stars} ⭐`, { mood: perfect ? 'wow' : 'think' }));
      checkBtn.replaceWith(h('button', { class: 'btn big', onclick: () => (round >= ROUNDS ? end() : newRound()) }, round >= ROUNDS ? 'Terminer 🏁' : 'Suivant →'));
    }

    const msg = h('div', {});
    const scorePill = h('span', { class: 'score-pill' }, `🧺 ${found}`);
    body.replaceChildren(
      h('div', { class: 'memory-top' }, h('span', {}, `Manche ${round} / ${ROUNDS}`), scorePill),
      h('div', { class: 'instr big' }, h('span', {}, 'Attrape les images où tu entends'), soundChip(snd, { big: true })),
      grid,
      msg,
      checkBtn
    );
    pending = setTimeout(() => speak(`Attrape les images où tu entends : ${soundLine(snd)}`), 300);
  }

  function end() {
    const key = 'hunt:best';
    const ratio = total ? found / total : 0;
    st.records[key] = Math.max(st.records[key] || 0, found);
    save();
    sound.win();
    if (ratio >= 0.7) confetti();
    el.append(
      h(
        'div',
        { class: 'sheet' },
        h(
          'div',
          { class: 'sheet-inner center' },
          mascot(`Tu as attrapé ${found} mot${found > 1 ? 's' : ''} sur ${total} !`, { mood: ratio >= 0.7 ? 'wow' : 'happy' }),
          quest ? questOutcome(quest, { ok: ratio >= 0.7, stars: starsFromRatio(ratio), retry: () => go('hunt', { unitId, skillIds, quest }, { replace: true }) }) : null,
          h('div', { class: 'row' }, h('button', { class: 'btn ghost', onclick: () => back() }, '← Retour'), h('button', { class: 'btn', onclick: () => go('hunt', { unitId, skillIds, quest }, { replace: true }) }, '🔁 Rejouer'))
        )
      )
    );
  }

  newRound();
  return { el, destroy: () => clearTimeout(pending) };
}
