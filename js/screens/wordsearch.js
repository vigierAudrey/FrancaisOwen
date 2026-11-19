// Mots mêlés : retrouver les mots cachés dans une grille de lettres.
// Deux façons de jouer : avec la liste des mots (image + mot), ou avec des devinettes
// (la définition du mot) pour découvrir du vocabulaire. Chaque mot trouvé affiche
// sa carte « Le sais-tu ? » : l'image, le mot en syllabes et sa définition, lue à voix haute.
// Sélection : glisser le doigt de la première à la dernière lettre, ou toucher la première
// puis la dernière.

import { h } from '../ui/dom.js';
import { getState, save, markDay } from '../core/store.js';
import { go, back } from '../core/router.js';
import { getUnit, itemsFor } from '../units/index.js';
import { recordAnswer, factStat } from '../core/srs.js';
import { header, mascot } from '../ui/components.js';
import { wordView } from '../ui/wordView.js';
import { withArticle } from '../lang/word.js';
import { shuffle, pick } from '../core/util.js';
import { speak } from '../ui/speech.js';
import { sound } from '../ui/sound.js';
import { confetti } from '../ui/confetti.js';
import { questOutcome } from '../core/adventure.js';

const LEVELS = {
  easy: { label: 'Facile', emoji: '🐣', size: 7, count: 5, stars: 3, dirs: [[0, 1], [1, 0]], arrows: '→ ↓' },
  medium: { label: 'Moyen', emoji: '🦊', size: 9, count: 7, stars: 5, dirs: [[0, 1], [1, 0], [1, 1]], arrows: '→ ↓ ↘' },
  hard: { label: 'Expert', emoji: '🦁', size: 10, count: 8, stars: 7, dirs: [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0]], arrows: '→ ↓ ↘ ↗ ← ↑' },
};
const KINDS = {
  list: { label: 'Avec la liste', emoji: '📝' },
  riddle: { label: 'Avec les devinettes', emoji: '🤔' },
};
// Lettres de remplissage, à peu près selon leur fréquence en français.
const FILL = 'aaaaeeeeeeiiiiooosssrrrnnnttttuuulllcccmmpdvbfghjq';
const FILL_ACC = 'éèàç';
const COLORS = 8;

/** Lettre sans accent, en minuscule (pour comparer). */
const base = (ch) => ch.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const baseWord = (w) => Array.from(w).map(base).join('');
const shown = (ch, upper) => (upper ? base(ch).toUpperCase() : ch);

function prefs(st) {
  st.wordsearch ||= {};
  const p = st.wordsearch;
  if (!LEVELS[p.level]) p.level = 'easy';
  if (!KINDS[p.kind]) p.kind = 'list';
  if (typeof p.upper !== 'boolean') p.upper = true;
  p.theme ||= 'all';
  return p;
}

/** Mots utilisables dans une grille de cette taille. */
function eligible(items, size) {
  return items.filter((i) => {
    const w = i.word;
    return w.emoji && w.def && /^\p{L}+$/u.test(w.w) && Array.from(w.w).length >= 3 && Array.from(w.w).length <= size;
  });
}

/** Place les mots dans la grille. Renvoie { grid, placed } ou null. */
function buildGrid(candidates, level, upper, st) {
  const { size, count, dirs } = level;
  // On préfère les mots pas encore bien connus, avec un peu de hasard.
  const ranked = shuffle(candidates)
    .map((it) => ({ it, k: (factStat(st, it.id)?.box || 0) + Math.random() * 3 }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.it);

  for (let attempt = 0; attempt < 30; attempt++) {
    const grid = Array.from({ length: size }, () => Array(size).fill(null));
    const placed = [];
    const pool = shuffle(ranked.slice(0, count * 3)).sort((a, b) => b.word.w.length - a.word.w.length);
    for (const it of pool) {
      if (placed.length === count) break;
      const key = baseWord(it.word.w);
      // Pas deux mots dont l'un contient l'autre (ours / ourson, chat / château).
      if (placed.some((p) => p.key.includes(key) || key.includes(p.key))) continue;
      const letters = Array.from(it.word.w.toLowerCase());
      let cells = null;
      for (let t = 0; t < 120 && !cells; t++) {
        const [dr, dc] = pick(dirs);
        const r0 = Math.floor(Math.random() * size);
        const c0 = Math.floor(Math.random() * size);
        const rEnd = r0 + dr * (letters.length - 1);
        const cEnd = c0 + dc * (letters.length - 1);
        if (rEnd < 0 || rEnd >= size || cEnd < 0 || cEnd >= size) continue;
        const cs = letters.map((_, i) => [r0 + dr * i, c0 + dc * i]);
        if (cs.every(([r, c], i) => grid[r][c] === null || grid[r][c] === letters[i])) cells = cs;
      }
      if (!cells) continue;
      cells.forEach(([r, c], i) => (grid[r][c] = letters[i]));
      placed.push({ item: it, word: it.word, key, cells, found: false, hint: false, color: placed.length % COLORS });
    }
    if (placed.length < Math.min(count, 3)) continue;
    const fill = upper ? FILL : FILL + FILL_ACC;
    for (const row of grid) for (let c = 0; c < size; c++) row[c] ??= fill[Math.floor(Math.random() * fill.length)];
    return { grid, placed };
  }
  return null;
}

/** Cases en ligne droite entre deux cases (on « aimante » vers la direction la plus proche). */
function lineBetween([r0, c0], [r1, c1], size) {
  let dr = r1 - r0;
  let dc = c1 - c0;
  const ar = Math.abs(dr);
  const ac = Math.abs(dc);
  if (ar > 2 * ac) dc = 0;
  else if (ac > 2 * ar) dr = 0;
  else {
    const n = Math.max(ar, ac);
    dr = Math.sign(dr) * n;
    dc = Math.sign(dc) * n;
  }
  let n = Math.max(Math.abs(dr), Math.abs(dc));
  const sr = Math.sign(dr);
  const sc = Math.sign(dc);
  while (n > 0 && (r0 + sr * n < 0 || r0 + sr * n >= size || c0 + sc * n < 0 || c0 + sc * n >= size)) n--;
  return Array.from({ length: n + 1 }, (_, i) => [r0 + sr * i, c0 + sc * i]);
}

export default function wordsearch({ unitId = 'mots', skillIds, auto = false, quest, opts }) {
  const st = getState();
  // Depuis la carte de l'aventure : réglages imposés (sans toucher aux préférences).
  const p = quest ? { ...prefs(st), ...opts } : prefs(st);
  const unit = getUnit(unitId);
  const themes = unit.skills.filter((s) => (s.family === 'themes' || s.wordTheme) && (!skillIds || skillIds.includes(s.id)));
  const el = h('div', { class: `screen wordsearch theme-${unitId}` }, header('Mots mêlés'));

  if (!themes.length) {
    el.append(mascot('Demande à un parent de choisir des thèmes de mots pour jouer !', { mood: 'think' }));
    return el;
  }
  const relaunch = (a) => go('wordsearch', { unitId, skillIds, auto: a, quest: a ? quest : undefined, opts: a ? opts : undefined }, { replace: true });

  // ---------- Réglages de la partie ----------
  if (!auto) {
    const usable = themes.filter((t) => eligible(t.items, LEVELS.easy.size).length >= 6);
    if (p.theme !== 'all' && !usable.some((t) => t.id === p.theme)) p.theme = 'all';
    const group = (title, entries, key) => {
      const box = h('div', { class: 'chips' });
      const render = () =>
        box.replaceChildren(
          ...entries.map(([id, label]) =>
            h('button', { class: 'chip' + (p[key] === id ? ' on' : ''), onclick: () => { sound.tap(); p[key] = id; render(); } }, label)
          )
        );
      render();
      return h('section', { class: 'panel' }, h('h2', {}, title), box);
    };
    el.append(
      mascot('Des mots se cachent dans la grille. À toi de les trouver !', { mood: 'happy' }),
      group('Comment on joue ?', Object.entries(KINDS).map(([id, k]) => [id, `${k.emoji} ${k.label}`]), 'kind'),
      group('Quelle grille ?', Object.entries(LEVELS).map(([id, l]) => [id, `${l.emoji} ${l.label}  ${l.arrows}`]), 'level'),
      group('Quels mots ?', [['all', '🎲 Surprise'], ...usable.map((t) => [t.id, `${t.emoji} ${t.short}`])], 'theme'),
      h('button', { class: 'btn big', onclick: () => { save(); relaunch(true); } }, 'C’est parti ! 🔎')
    );
    return el;
  }

  // ---------- La partie ----------
  const level = LEVELS[p.level];
  const riddle = p.kind === 'riddle';
  const theme = themes.find((t) => t.id === p.theme);
  const items = theme ? theme.items : itemsFor(unit, themes.map((t) => t.id));
  const built = buildGrid(eligible(items, level.size), level, p.upper, st);
  if (!built) {
    el.append(mascot('Il n’y a pas assez de mots pour faire une grille. Choisis d’autres mots !', { mood: 'think' }), h('button', { class: 'btn', onclick: () => relaunch(false) }, '⚙️ Changer'));
    return el;
  }
  const { grid, placed } = built;
  const size = level.size;
  let hints = 0;
  let over = false;

  // Grille
  const cellEls = grid.map((row, r) => row.map((ch, c) => h('div', { class: 'ws-cell', 'data-r': r, 'data-c': c })));
  const gridEl = h('div', { class: `ws-grid word-font n${size}`, style: { gridTemplateColumns: `repeat(${size}, 1fr)` } }, cellEls.flat());
  const paintLetters = () => cellEls.forEach((row, r) => row.forEach((cell, c) => (cell.textContent = shown(grid[r][c], p.upper))));

  // Liste des mots ou des devinettes
  const listEl = h('div', { class: riddle ? 'ws-riddles' : 'ws-list' });
  const info = h('div', { class: 'ws-info' });
  const msg = h('div', { class: 'col' });
  const counter = h('div', { class: 'score-pill' });

  const renderList = () => {
    counter.textContent = `🔎 ${placed.filter((x) => x.found).length} / ${placed.length}`;
    listEl.replaceChildren(
      ...placed.map((x, i) => {
        const len = Array.from(x.word.w).length;
        if (!riddle) {
          return h(
            'button',
            { class: `ws-word${x.found ? ` done f${x.color}` : ''}`, onclick: () => speak(x.word.w, { force: true }) },
            h('span', { class: 'ws-w-emoji' }, x.word.emoji),
            h('span', { class: 'word-font' }, Array.from(x.word.w).map((ch) => shown(ch, p.upper)).join('')),
            x.found ? h('span', {}, '✔') : null
          );
        }
        return h(
          'div',
          { class: `ws-riddle${x.found ? ` done f${x.color}` : ''}` },
          h('span', { class: 'ws-num' }, x.found || x.hint ? x.word.emoji : String(i + 1)),
          h(
            'span',
            { class: 'ws-r-txt' },
            h('span', {}, x.word.def),
            h('small', {}, x.found ? h('b', { class: 'word-font' }, x.word.w) : `${len} lettres`)
          ),
          h('button', { class: 'ws-r-btn', 'aria-label': 'Écouter', onclick: () => speak(x.word.def, { force: true }) }, '🔊'),
          x.found || x.hint ? null : h('button', { class: 'ws-r-btn', 'aria-label': 'Un indice', onclick: () => giveHint(x) }, '💡')
        );
      })
    );
  };

  function giveHint(x) {
    if (over) return;
    x.hint = true;
    hints++;
    sound.tap();
    const [r, c] = x.cells[0];
    cellEls[r][c].classList.add('hint');
    setTimeout(() => cellEls[r][c].classList.remove('hint'), 2600);
    renderList();
  }

  function showInfo(x, title = 'Bravo !') {
    const w = x.word;
    const art = withArticle(w);
    info.replaceChildren(
      h(
        'div',
        { class: `panel ws-card f${x.color}` },
        h('div', { class: 'ws-card-head' }, h('span', { class: 'ws-card-emoji' }, w.emoji), h('div', { class: 'col tight' }, h('small', { class: 'muted' }, title), h('div', { class: 'ws-card-word' }, wordView(w)))),
        h('p', { class: 'ws-card-def' }, h('b', {}, `${art.charAt(0).toUpperCase()}${art.slice(1)} : `), w.def),
        h('button', { class: 'btn small ghost', onclick: () => speak(`${art}. ${w.def}`, { force: true }) }, '🔊 Écouter')
      )
    );
    speak(`${art} ! ${w.def}`, { force: true });
  }

  // Sélection au doigt ou à la souris
  let drag = null;
  let anchor = null;
  const cellAt = (e) => {
    const t = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.ws-cell');
    return t && gridEl.contains(t) ? [Number(t.dataset.r), Number(t.dataset.c)] : null;
  };
  const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
  const paintSel = (cells) => {
    gridEl.querySelectorAll('.sel').forEach((x) => x.classList.remove('sel'));
    cells.forEach(([r, c]) => cellEls[r][c].classList.add('sel'));
  };

  function check(cells) {
    paintSel([]);
    if (cells.length < 2) return;
    const key = cells.map(([r, c]) => base(grid[r][c])).join('');
    const rev = Array.from(key).reverse().join('');
    const x = placed.find((w) => !w.found && (w.key === key || w.key === rev));
    if (!x) {
      sound.flip();
      cells.forEach(([r, c]) => {
        const el2 = cellEls[r][c];
        el2.classList.remove('miss');
        void el2.offsetWidth;
        el2.classList.add('miss');
      });
      return;
    }
    x.found = true;
    x.cells = cells;
    cells.forEach(([r, c]) => {
      const el2 = cellEls[r][c];
      el2.className = el2.className.replace(/\bf\d\b/g, '');
      el2.classList.add('found', `f${x.color}`);
    });
    if (riddle && !x.hint) recordAnswer(st, x.item.id, true);
    sound.ok();
    renderList();
    showInfo(x);
    if (placed.every((w) => w.found)) finish(true);
  }

  gridEl.addEventListener('pointerdown', (e) => {
    if (over) return;
    const cell = cellAt(e);
    if (!cell) return;
    e.preventDefault();
    if (anchor && !same(anchor, cell)) {
      const cells = lineBetween(anchor, cell, size);
      anchor = null;
      check(cells);
      return;
    }
    drag = { start: cell, end: cell };
    paintSel([cell]);
  });
  gridEl.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const cell = cellAt(e);
    if (!cell || same(cell, drag.end)) return;
    drag.end = cell;
    paintSel(lineBetween(drag.start, cell, size));
  });
  const up = () => {
    if (!drag) return;
    const { start, end } = drag;
    drag = null;
    const cells = lineBetween(start, end, size);
    if (cells.length === 1) {
      // Simple toucher : c'est la première lettre, on attend la dernière.
      if (same(anchor, start)) {
        anchor = null;
        paintSel([]);
      } else {
        anchor = start;
        sound.tap();
        paintSel([start]);
      }
    } else {
      anchor = null;
      check(cells);
    }
  };
  document.addEventListener('pointerup', up);
  document.addEventListener('pointercancel', up);

  function finish(win) {
    over = true;
    const stars = win ? Math.max(1, level.stars + (riddle ? 2 : 0) - hints) : 1;
    st.stars += stars;
    st.records[`wordsearch:${p.level}`] = (st.records[`wordsearch:${p.level}`] || 0) + (win ? 1 : 0);
    markDay();
    save();
    if (win) {
      sound.win();
      confetti();
    }
    giveUpBtn.remove();
    msg.replaceChildren(
      mascot(win ? `Bravo ! Tu as trouvé tous les mots ! +${stars} ⭐` : `Voici les mots cachés. +${stars} ⭐ pour l’effort !`, { mood: win ? 'wow' : 'think' }),
      quest ? questOutcome(quest, { ok: win, stars: hints === 0 ? 3 : hints <= 2 ? 2 : 1, retry: () => relaunch(true) }) : null,
      h(
        'section',
        { class: 'panel' },
        h('h2', {}, '📖 Mon petit dico'),
        h(
          'div',
          { class: 'ws-dico' },
          placed.map((x) =>
            h(
              'button',
              { class: 'ws-dico-row', onclick: () => speak(`${withArticle(x.word)}. ${x.word.def}`, { force: true }) },
              h('span', { class: 'ws-w-emoji' }, x.word.emoji),
              h('span', { class: 'col tight' }, h('b', { class: 'word-font' }, x.word.w), h('small', {}, x.word.def))
            )
          )
        )
      ),
      h(
        'div',
        { class: 'row wrap' },
        h('button', { class: 'btn ghost', onclick: () => relaunch(false) }, '⚙️ Changer'),
        h('button', { class: 'btn', onclick: () => relaunch(true) }, '🔁 Une autre grille')
      )
    );
    msg.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const giveUp = () => {
    if (over) return;
    placed.filter((x) => !x.found).forEach((x) => x.cells.forEach(([r, c]) => cellEls[r][c].classList.add('reveal')));
    finish(false);
  };
  const giveUpBtn = h('button', { class: 'btn small ghost', onclick: giveUp }, '🐱 Je donne ma langue au chat');
  const caseBtn = h('button', { class: 'btn small ghost', onclick: () => { p.upper = !p.upper; save(); caseBtn.textContent = p.upper ? 'abc' : 'ABC'; paintLetters(); renderList(); } }, p.upper ? 'abc' : 'ABC');

  paintLetters();
  renderList();
  el.append(
    mascot(
      riddle
        ? `Lis chaque devinette (🔊 pour l’écouter) et trouve le mot dans la grille. Les mots vont ${level.arrows}`
        : `Trouve les ${placed.length} mots cachés ! Glisse ton doigt sur le mot. Les mots vont ${level.arrows}`,
      { mood: 'happy' }
    ),
    h('div', { class: 'row ws-top' }, counter, caseBtn),
    h('div', { class: 'ws-board' }, h('div', { class: 'ws-grid-wrap' }, gridEl), h('div', { class: 'col' }, listEl, info)),
    msg,
    h('div', { class: 'row' }, giveUpBtn)
  );
  return {
    el,
    destroy: () => {
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
    },
  };
}
