// Menu d'un univers : l'enfant choisit ce qu'il travaille (parmi ce que
// le parent a coché) puis une façon de jouer.

import { h } from '../ui/dom.js';
import { getState } from '../core/store.js';
import { go } from '../core/router.js';
import { getUnit, enabledSkills } from '../units/index.js';
import { masteryOf, medal } from '../core/srs.js';
import { MODES } from '../exercises/index.js';
import { header, mascot } from '../ui/components.js';

const selections = {}; // mémorise le choix de l'enfant pendant la visite

export default function unitMenu({ unitId }) {
  const unit = getUnit(unitId);
  const st = getState();
  const enabled = enabledSkills(unit, st);
  const el = h('div', { class: `screen op-menu theme-${unitId}` }, header(`${unit.emoji} ${unit.name}`));

  if (!enabled.length) {
    el.append(mascot('Demande à un parent de choisir ce que tu vas travailler ! 👤', { mood: 'think' }));
    return el;
  }

  let sel = new Set([...(selections[unitId] || [])].filter((id) => enabled.some((s) => s.id === id)));
  if (!sel.size) sel = new Set(enabled.map((s) => s.id));
  selections[unitId] = sel;

  const chipsWrap = h('div', { class: 'chip-groups' });
  const renderChips = () => {
    const groups = (unit.families || [{ id: undefined }]).map((f) => ({ f, skills: enabled.filter((s) => s.family === f.id) })).filter((g) => g.skills.length);
    chipsWrap.replaceChildren(
      ...groups.map(({ f, skills }) =>
        h(
          'div',
          { class: 'chip-group' },
          groups.length > 1 && f.label ? h('div', { class: 'chip-group-title' }, `${f.emoji || ''} ${f.label}`) : null,
          h(
            'div',
            { class: 'chips' },
            skills.map((s) => {
              const md = medal(masteryOf(st, s.items));
              return h(
                'button',
                {
                  class: 'chip' + (sel.has(s.id) ? ' on' : '') + (s.sound || s.pair ? ' sound' : ''),
                  'aria-pressed': String(sel.has(s.id)),
                  onclick: () => {
                    // Quand tout est choisi, un appui choisit seulement celui-là.
                    if (sel.size === enabled.length && enabled.length > 1) sel = new Set([s.id]);
                    else if (sel.has(s.id)) {
                      if (sel.size > 1) sel.delete(s.id);
                    } else sel.add(s.id);
                    selections[unitId] = sel;
                    renderChips();
                  },
                },
                s.emoji ? `${s.emoji} ${s.short || s.label}` : s.short || s.label,
                md ? h('span', { class: 'chip-medal' }, md) : null
              );
            })
          )
        )
      )
    );
    if (enabled.length > 2) {
      chipsWrap.append(
        h('div', { class: 'chips' }, h('button', { class: 'chip all' + (sel.size === enabled.length ? ' on' : ''), onclick: () => { sel = new Set(enabled.map((s) => s.id)); selections[unitId] = sel; renderChips(); } }, '✨ Tout'))
      );
    }
  };
  renderChips();

  const grid = h(
    'div',
    { class: 'mode-grid' },
    unit.modes.map((id) => {
      const m = MODES[id];
      return h(
        'button',
        {
          class: `mode-card mode-${m.id}`,
          onclick: () => {
            const params = { unitId, skillIds: enabled.filter((s) => sel.has(s.id)).map((s) => s.id) };
            if (m.screen) go(m.screen, params);
            else go('session', { ...params, mode: m.id });
          },
        },
        h('span', { class: 'mode-emoji' }, m.emoji),
        h('span', { class: 'mode-label' }, m.label),
        h('span', { class: 'mode-desc' }, m.desc)
      );
    })
  );

  el.append(
    h('h2', { class: 'section-title' }, 'Je travaille… ', h('small', {}, sel.size === enabled.length ? '(touche pour choisir)' : '')),
    chipsWrap,
    h('h2', { class: 'section-title' }, 'Je joue à…'),
    grid,
    h('button', { class: 'btn secondary', onclick: () => go('session', { unitId, skillIds: [...sel], mode: 'mix' }) }, '🎲 Un peu de tout')
  );
  return el;
}
