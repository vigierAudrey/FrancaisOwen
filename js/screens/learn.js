// « J'apprends » : on regarde, on touche, on écoute. Aucune pression, aucune erreur possible.

import { h } from '../ui/dom.js';
import { getUnit, getSkill } from '../units/index.js';
import { SOUNDS } from '../data/sounds.js';
import { sayOf } from '../lang/word.js';
import { header, mascot, soundChip } from '../ui/components.js';
import { wordView } from '../ui/wordView.js';
import { speak } from '../ui/speech.js';
import { sound } from '../ui/sound.js';
import { VOWS, okC } from '../units/lecture.js';

/** Tableau des syllabes : une ligne par consonne, une colonne par voyelle. */
function syllableTable() {
  const cons = ['l', 'r', 'm', 'n', 's', 'f', 'v', 'ch', 'j', 'p', 'b', 't', 'd', 'c', 'g', 'qu'];
  return h(
    'div',
    { class: 'syl-table-wrap' },
    h(
      'table',
      { class: 'syl-table word-font' },
      h('tr', {}, h('th', {}, ''), VOWS.map((v) => h('th', {}, v))),
      cons.map((c) =>
        h(
          'tr',
          {},
          h('th', {}, c),
          VOWS.map((v) =>
            h('td', {}, okC(c, v) ? h('button', { class: 'syl-cell', onclick: () => { sound.tap(); speak(c + v, { force: true }); } }, h('span', { class: 'sc-c' }, c), h('span', { class: 'sc-v' }, v)) : '')
          )
        )
      )
    )
  );
}

function rulePanel(skill) {
  const text = skill.lesson.join(' ');
  return h(
    'section',
    { class: 'panel learn-panel rule' },
    h('div', { class: 'learn-head' }, h('div', { class: 'learn-title' }, skill.label), h('button', { class: 'listen-btn inline', onclick: () => speak(text, { force: true }) }, '🔊')),
    h('ul', { class: 'rule-list word-font' }, skill.lesson.map((l) => h('li', {}, l)))
  );
}

const byLength = (a, b) => a.word.w.length - b.word.w.length;

function wordCard(item, highlight) {
  const w = item.word;
  return h(
    'button',
    {
      class: 'learn-card word-card' + (w.sight ? ' sight' : ''),
      onclick: (e) => {
        sound.tap();
        speak(sayOf(w), { force: true });
        e.currentTarget.classList.remove('bump');
        void e.currentTarget.offsetWidth;
        e.currentTarget.classList.add('bump');
      },
    },
    w.emoji ? h('span', { class: 'wc-emoji' }, w.emoji) : null,
    h('span', { class: 'wc-word' }, wordView(w, { highlight })),
    w.sight ? h('span', { class: 'wc-ex' }, w.ex) : null
  );
}

function soundPanel(skill) {
  const sounds = skill.pair || [skill.sound];
  return h(
    'section',
    { class: 'panel learn-panel' },
    h('div', { class: 'learn-head' }, sounds.map((s) => soundChip(s, { big: true })), h('div', { class: 'learn-title' }, skill.label)),
    sounds.map((s) =>
      h(
        'div',
        { class: 'col' },
        h('p', { class: 'muted' }, `« ${SOUNDS[s].label} » s’écrit : `, h('b', { class: 'word-font' }, SOUNDS[s].graphemes.filter((g) => g.length).join('  ·  '))),
        h('div', { class: 'learn-grid' }, skill.items.filter((i) => i.sound === s).sort(byLength).slice(0, 16).map((i) => wordCard(i, s)))
      )
    )
  );
}

export default function learn({ unitId, skillIds }) {
  const unit = getUnit(unitId);
  const skills = skillIds.map((id) => getSkill(unit, id)).filter(Boolean);
  const el = h('div', { class: `screen learn theme-${unitId}` }, header('J’apprends'));

  if (unit.learnKind === 'syllables') {
    el.append(mascot('Une consonne + une voyelle = une syllabe ! Touche une case pour l’entendre.', { mood: 'happy' }), syllableTable());
  } else if (unit.learnKind === 'rules') {
    el.append(mascot('Voici les petites règles à connaître. Touche 🔊 pour les écouter.', { mood: 'happy' }), ...skills.filter((s) => s.lesson).map(rulePanel));
  } else if (unit.learnKind === 'sounds') {
    el.append(mascot('Touche un son ou une image pour l’écouter. Les lettres qui font le son sont en couleur !', { mood: 'happy' }), ...skills.map(soundPanel));
  } else {
    el.append(
      mascot('Touche une carte pour entendre le mot. Les syllabes sont en couleur, les lettres muettes en gris.', { mood: 'happy' }),
      ...skills.map((s) => h('section', { class: 'panel learn-panel' }, h('div', { class: 'learn-title' }, `${s.emoji || ''} ${s.label}`), h('div', { class: 'learn-grid' }, s.items.map((i) => wordCard(i)))))
    );
  }
  return el;
}
