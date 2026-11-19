// Mots croisés illustrés : la grille est fabriquée à chaque partie à partir des mots du thème.
// Indices : l'image du mot (on peut l'écouter) ou sa définition (devinette).
// On écrit avec un clavier à l'écran (ordre alphabétique) ou le clavier de l'ordinateur.
// Lettres en MAJUSCULES sans accents, comme dans les vrais mots croisés ; le mot trouvé
// s'affiche ensuite avec ses accents, ses syllabes et sa définition.

import { h } from '../ui/dom.js';
import { getState, save, markDay } from '../core/store.js';
import { go } from '../core/router.js';
import { getUnit, itemsFor } from '../units/index.js';
import { recordAnswer, factStat } from '../core/srs.js';
import { header, mascot } from '../ui/components.js';
import { wordView } from '../ui/wordView.js';
import { withArticle } from '../lang/word.js';
import { shuffle, pick } from '../core/util.js';
import { speak } from '../ui/speech.js';
import { sound } from '../ui/sound.js';
import { confetti } from '../ui/confetti.js';

const LEVELS = {
  easy: { label: 'Facile', emoji: '🐣', count: 4, maxLen: 6, maxW: 8, maxH: 9, stars: 3 },
  medium: { label: 'Moyen', emoji: '🦊', count: 6, maxLen: 8, maxW: 9, maxH: 11, stars: 5 },
  hard: { label: 'Expert', emoji: '🦁', count: 8, maxLen: 10, maxW: 10, maxH: 12, stars: 7 },
};
const KINDS = {
  image: { label: 'Avec les images', emoji: '🖼️' },
  riddle: { label: 'Avec les devinettes', emoji: '🤔' },
};
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIRS = { a: [0, 1], d: [1, 0] };

const base = (ch) => ch.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const upperOf = (w) => Array.from(w).map((ch) => base(ch).toUpperCase());

function prefs(st) {
  st.crossword ||= {};
  const p = st.crossword;
  if (!LEVELS[p.level]) p.level = 'easy';
  if (!KINDS[p.kind]) p.kind = 'image';
  p.theme ||= 'all';
  return p;
}

function eligible(items, maxLen) {
  return items.filter((i) => {
    const w = i.word;
    if (!w.emoji || !w.def) return false;
    const L = upperOf(w.w);
    return L.length >= 3 && L.length <= maxLen && L.every((ch) => ABC.includes(ch));
  });
}

/** Fabrique une grille de mots croisés. Renvoie { words, width, height } ou null. */
function generate(candidates, level, st) {
  const ranked = shuffle(candidates)
    .map((it) => ({ it, k: (factStat(st, it.id)?.box || 0) + Math.random() * 3 }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.it);
  let best = null;

  for (let attempt = 0; attempt < 60; attempt++) {
    const pool = shuffle(ranked.slice(0, 40));
    const cells = new Map(); // "r,c" -> { ch, a, d }
    const words = [];
    const get = (r, c) => cells.get(`${r},${c}`);
    let minR = 0, maxR = 0, minC = 0, maxC = 0;

    const fits = (L, r0, c0, dir) => {
      const [dr, dc] = DIRS[dir];
      if (get(r0 - dr, c0 - dc) || get(r0 + dr * L.length, c0 + dc * L.length)) return -1;
      let cross = 0;
      for (let i = 0; i < L.length; i++) {
        const r = r0 + dr * i;
        const c = c0 + dc * i;
        const cell = get(r, c);
        if (cell) {
          if (cell.ch !== L[i] || cell[dir]) return -1;
          cross++;
        } else if (get(r + dc, c + dr) || get(r - dc, c - dr)) return -1;
      }
      const rEnd = r0 + dr * (L.length - 1);
      const cEnd = c0 + dc * (L.length - 1);
      if (Math.max(maxR, rEnd) - Math.min(minR, r0) + 1 > level.maxH) return -1;
      if (Math.max(maxC, cEnd) - Math.min(minC, c0) + 1 > level.maxW) return -1;
      return cross;
    };
    const place = (it, L, r0, c0, dir) => {
      const [dr, dc] = DIRS[dir];
      const keys = L.map((ch, i) => {
        const r = r0 + dr * i;
        const c = c0 + dc * i;
        const k = `${r},${c}`;
        const cell = cells.get(k) || { ch, a: false, d: false, r, c };
        cell[dir] = true;
        cells.set(k, cell);
        minR = Math.min(minR, r); maxR = Math.max(maxR, r); minC = Math.min(minC, c); maxC = Math.max(maxC, c);
        return k;
      });
      words.push({ item: it, word: it.word, letters: L, r0, c0, dir, keys });
    };

    const first = pool.find((it) => upperOf(it.word.w).length >= Math.min(5, level.maxLen));
    if (!first) return null;
    place(first, upperOf(first.word.w), 0, 0, Math.random() < 0.5 ? 'a' : 'd');
    // Plusieurs passages : un mot refusé au début peut trouver sa place plus tard.
    for (let pass = 0; pass < 3 && words.length < level.count; pass++) {
      for (const it of pool) {
        if (words.length >= level.count) break;
        if (words.some((w) => w.word.w === it.word.w)) continue;
        const L = upperOf(it.word.w);
        const opts = [];
        for (const cell of cells.values()) {
          if (cell.a && cell.d) continue;
          const dir = cell.a ? 'd' : 'a';
          L.forEach((ch, i) => {
            if (ch !== cell.ch) return;
            const r0 = cell.r - (dir === 'd' ? i : 0);
            const c0 = cell.c - (dir === 'a' ? i : 0);
            const cross = fits(L, r0, c0, dir);
            if (cross > 0) opts.push({ r0, c0, dir, cross });
          });
        }
        if (!opts.length) continue;
        const top = Math.max(...opts.map((o) => o.cross));
        const o = pick(opts.filter((x) => x.cross === top));
        place(it, L, o.r0, o.c0, o.dir);
      }
    }
    const area = (maxR - minR + 1) * (maxC - minC + 1);
    if (!best || words.length > best.words.length || (words.length === best.words.length && area < best.area)) {
      best = { words, area, minR, minC, width: maxC - minC + 1, height: maxR - minR + 1 };
    }
    if (best.words.length >= level.count && attempt > 8) break;
  }
  if (!best || best.words.length < 3) return null;
  // Coordonnées à partir de 0, puis numérotation (de haut en bas, de gauche à droite).
  for (const w of best.words) {
    w.r0 -= best.minR;
    w.c0 -= best.minC;
    const [dr, dc] = DIRS[w.dir];
    w.keys = w.letters.map((_, i) => `${w.r0 + dr * i},${w.c0 + dc * i}`);
  }
  const starts = [...new Set(best.words.map((w) => `${w.r0},${w.c0}`))].sort((x, y) => {
    const [r1, c1] = x.split(',').map(Number);
    const [r2, c2] = y.split(',').map(Number);
    return r1 - r2 || c1 - c2;
  });
  for (const w of best.words) w.num = starts.indexOf(`${w.r0},${w.c0}`) + 1;
  best.words.sort((x, y) => x.num - y.num || (x.dir === 'a' ? -1 : 1));
  return best;
}

export default function crossword({ unitId = 'mots', skillIds, auto = false }) {
  const st = getState();
  const p = prefs(st);
  const unit = getUnit(unitId);
  const themes = unit.skills.filter((s) => s.family === 'themes' && (!skillIds || skillIds.includes(s.id)));
  const el = h('div', { class: `screen crossword theme-${unitId}` }, header('Mots croisés'));
  if (!themes.length) {
    el.append(mascot('Demande à un parent de choisir des thèmes de mots pour jouer !', { mood: 'think' }));
    return el;
  }
  const relaunch = (a) => go('crossword', { unitId, skillIds, auto: a }, { replace: true });

  // ---------- Réglages ----------
  if (!auto) {
    const usable = themes.filter((t) => eligible(t.items, LEVELS.easy.maxLen).length >= 8);
    if (p.theme !== 'all' && !usable.some((t) => t.id === p.theme)) p.theme = 'all';
    const group = (title, entries, key) => {
      const box = h('div', { class: 'chips' });
      const render = () =>
        box.replaceChildren(...entries.map(([id, label]) => h('button', { class: 'chip' + (p[key] === id ? ' on' : ''), onclick: () => { sound.tap(); p[key] = id; render(); } }, label)));
      render();
      return h('section', { class: 'panel' }, h('h2', {}, title), box);
    };
    el.append(
      mascot('Écris chaque mot dans la grille. Les mots se croisent et partagent des lettres !', { mood: 'happy' }),
      group('Quels indices ?', Object.entries(KINDS).map(([id, k]) => [id, `${k.emoji} ${k.label}`]), 'kind'),
      group('Quelle grille ?', Object.entries(LEVELS).map(([id, l]) => [id, `${l.emoji} ${l.label} · ${l.count} mots`]), 'level'),
      group('Quels mots ?', [['all', '🎲 Surprise'], ...usable.map((t) => [t.id, `${t.emoji} ${t.short}`])], 'theme'),
      h('button', { class: 'btn big', onclick: () => { save(); relaunch(true); } }, 'C’est parti ! ✏️')
    );
    return el;
  }

  // ---------- La partie ----------
  const level = LEVELS[p.level];
  const riddle = p.kind === 'riddle';
  const theme = themes.find((t) => t.id === p.theme);
  const items = theme ? theme.items : itemsFor(unit, themes.map((t) => t.id));
  const built = generate(eligible(items, level.maxLen), level, st);
  if (!built) {
    el.append(mascot('Il n’y a pas assez de mots pour faire une grille. Choisis d’autres mots !', { mood: 'think' }), h('button', { class: 'btn', onclick: () => relaunch(false) }, '⚙️ Changer'));
    return el;
  }
  const { words, width, height } = built;
  words.forEach((w) => Object.assign(w, { done: false, hint: false, missed: false, emojiShown: false }));

  // Cases
  const cells = new Map();
  const gridEl = h('div', { class: 'cw-grid word-font', style: { gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`, maxWidth: `${width * 52}px` } });
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const k = `${r},${c}`;
      const ws = words.filter((w) => w.keys.includes(k));
      if (!ws.length) {
        gridEl.append(h('div', { class: 'cw-cell empty' }));
        continue;
      }
      const num = words.find((w) => w.keys[0] === k)?.num;
      const letterEl = h('span', { class: 'cw-letter' });
      const cellEl = h('button', { class: 'cw-cell', 'aria-label': `case ${r + 1}-${c + 1}`, onclick: () => tapCell(k) }, num ? h('span', { class: 'cw-num' }, String(num)) : null, letterEl);
      const ch = ws[0].letters[ws[0].keys.indexOf(k)];
      cells.set(k, { k, el: cellEl, letterEl, ch, val: '', locked: false, words: ws });
      gridEl.append(cellEl);
    }
  }

  let active = null; // mot sélectionné
  let cursor = null; // case sélectionnée
  let hints = 0;
  let over = false;
  let popOpen = false;

  const arrow = (w) => (w.dir === 'a' ? '➡️' : '⬇️');
  const freeCells = (w) => w.keys.filter((k) => !cells.get(k).locked);

  function select(w, k) {
    active = w;
    // Mot pas commencé : curseur sur la 1re case (même déjà remplie par un mot croisé),
    // car l'enfant écrit le mot en entier. Sinon : la première case vide.
    const started = w.keys.some((x) => !cells.get(x).locked && cells.get(x).val);
    cursor = k || (started ? w.keys.find((x) => !cells.get(x).locked && !cells.get(x).val) || freeCells(w)[0] : w.keys[0]) || w.keys[0];
    renderGrid();
    renderClue();
    renderClues();
  }

  function tapCell(k) {
    if (over) return;
    sound.tap();
    const c = cells.get(k);
    // Une case partagée par deux mots : un deuxième toucher change de mot.
    let w = c.words.includes(active) ? active : c.words.find((x) => !x.done) || c.words[0];
    if (cursor === k && c.words.length > 1) w = c.words.find((x) => x !== active) || w;
    select(w, k);
  }

  function renderGrid() {
    for (const c of cells.values()) {
      c.letterEl.textContent = c.val;
      c.el.classList.toggle('in-word', !!active && active.keys.includes(c.k));
      c.el.classList.toggle('cursor', cursor === c.k);
      c.el.classList.toggle('ok', c.locked && !c.given);
      c.el.classList.toggle('given', !!c.given);
      c.el.classList.toggle('bad', !!c.bad);
    }
  }

  // Indice du mot en cours
  const clueEl = h('div', { class: 'cw-clue' });
  function renderClue() {
    const w = active;
    if (!w) return clueEl.replaceChildren();
    const len = `${w.letters.length} lettres`;
    const kids = [h('span', { class: 'cw-clue-num' }, `${w.num} ${arrow(w)}`)];
    if (riddle) {
      kids.push(
        w.emojiShown || w.done ? h('span', { class: 'cw-clue-emoji' }, w.word.emoji) : null,
        h('span', { class: 'cw-clue-txt' }, w.word.def, h('small', {}, len)),
        h('button', { class: 'ws-r-btn', 'aria-label': 'Écouter', onclick: () => speak(w.word.def, { force: true }) }, '🔊')
      );
    } else {
      kids.push(
        h('span', { class: 'cw-clue-emoji big' }, w.word.emoji),
        h('span', { class: 'cw-clue-txt' }, w.done ? h('b', { class: 'word-font' }, w.word.w) : 'Écris ce mot.', h('small', {}, len)),
        h('button', { class: 'ws-r-btn', 'aria-label': 'Écouter le mot', onclick: () => speak(w.word.w, { force: true }) }, '🔊')
      );
    }
    if (!w.done) kids.push(h('button', { class: 'ws-r-btn', 'aria-label': 'Un indice', onclick: () => giveHint(w) }, '💡'));
    clueEl.replaceChildren(...kids.filter(Boolean));
  }

  // Liste de tous les indices
  const cluesEl = h('div', { class: 'cw-clues' });
  function renderClues() {
    const section = (dir, title) => {
      const ws = words.filter((w) => w.dir === dir);
      if (!ws.length) return null;
      return h(
        'section',
        { class: 'panel cw-clue-list' },
        h('h2', {}, title),
        ws.map((w) =>
          h(
            'button',
            { class: 'cw-clue-item' + (w === active ? ' on' : '') + (w.done ? ' done' : ''), onclick: () => { sound.tap(); select(w); gridEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } },
            h('b', { class: 'cw-clue-num' }, String(w.num)),
            riddle && !w.done ? h('span', {}, w.word.def) : h('span', { class: 'cw-clue-emoji' }, w.word.emoji),
            w.done ? h('span', { class: 'word-font' }, w.word.w, ' ✔') : riddle ? null : h('span', { class: 'muted' }, `${w.letters.length} lettres`)
          )
        )
      );
    };
    cluesEl.replaceChildren(...[section('a', '➡️ Horizontalement'), section('d', '⬇️ Verticalement')].filter(Boolean));
  }

  function nextFree(w, from) {
    const i = w.keys.indexOf(from);
    return w.keys.slice(i + 1).find((k) => !cells.get(k).locked);
  }

  function type(letter) {
    if (over || popOpen || !active) return;
    const after = (k) => active.keys[active.keys.indexOf(k) + 1];
    let c = cells.get(cursor);
    if (c.locked) {
      // Lettre déjà en place (mot croisé) : on la retape naturellement, on avance.
      if (letter === c.val) {
        sound.tap();
        cursor = after(cursor) || cursor;
        renderGrid();
        return;
      }
      const n = nextFree(active, cursor);
      if (!n) return;
      cursor = n;
      c = cells.get(n);
    }
    sound.tap();
    c.val = letter;
    c.bad = false;
    cursor = after(cursor) || cursor;
    renderGrid();
    // Vérifie le mot en cours, puis l'autre mot de la case s'il est complet.
    const toCheck = [active, ...c.words.filter((w) => w !== active)];
    for (const w of toCheck) {
      if (popOpen) break; // l'autre mot sera vérifié à la fermeture de la carte
      if (!w.done && w.keys.every((k) => cells.get(k).val)) evaluate(w, w === active);
    }
  }

  function erase() {
    if (over || popOpen || !active) return;
    const c = cells.get(cursor);
    if (c.val && !c.locked) c.val = '';
    else {
      const i = active.keys.indexOf(cursor);
      const prev = active.keys.slice(0, i).reverse().find((k) => !cells.get(k).locked);
      if (prev) {
        cursor = prev;
        cells.get(prev).val = '';
        cells.get(prev).bad = false;
      }
    }
    sound.tap();
    renderGrid();
  }

  function evaluate(w, isActive) {
    const wrong = w.keys.filter((k, i) => cells.get(k).val !== w.letters[i]);
    if (wrong.length) {
      if (!isActive) return; // on ne gronde que sur le mot qu'on est en train d'écrire
      wrong.forEach((k) => (cells.get(k).bad = true));
      if (!w.missed) {
        w.missed = true;
        recordAnswer(st, w.item.id, false);
        save();
      }
      sound.ko();
      renderGrid();
      clueEl.classList.remove('shake');
      void clueEl.offsetWidth;
      clueEl.classList.add('shake');
      flash('Presque ! Change les lettres en rouge.');
      return;
    }
    w.done = true;
    w.keys.forEach((k) => {
      const c = cells.get(k);
      c.locked = true;
      c.bad = false;
    });
    if (!w.missed && !w.hint) recordAnswer(st, w.item.id, true);
    flashEl.classList.remove('on');
    sound.ok();
    renderGrid();
    renderClue();
    renderClues();
    popup(w);
  }

  const flashEl = h('div', { class: 'cw-flash' });
  let flashT = null;
  function flash(text) {
    flashEl.textContent = text;
    flashEl.classList.add('on');
    clearTimeout(flashT);
    flashT = setTimeout(() => flashEl.classList.remove('on'), 2400);
  }

  function giveHint(w) {
    if (over || w.done) return;
    hints++;
    w.hint = true;
    if (riddle && !w.emojiShown) {
      w.emojiShown = true;
      sound.tap();
      renderClue();
      return;
    }
    const i = w.keys.findIndex((k, j) => cells.get(k).val !== w.letters[j]);
    if (i < 0) return;
    const c = cells.get(w.keys[i]);
    c.val = w.letters[i];
    c.locked = true;
    c.given = true;
    c.bad = false;
    sound.flip();
    if (active === w && cursor === c.k) cursor = nextFree(w, c.k) || cursor;
    renderGrid();
    if (w.keys.every((k) => cells.get(k).val)) evaluate(w, true);
  }

  // Carte « Bravo » quand un mot est trouvé
  const popEl = h('div', { class: 'cw-pop hidden' });
  function popup(w) {
    popOpen = true;
    const art = withArticle(w.word);
    const close = () => {
      popOpen = false;
      popEl.classList.add('hidden');
      const ready = words.find((x) => !x.done && x.keys.every((k, i) => cells.get(k).val === x.letters[i]));
      if (ready) return evaluate(ready, true);
      if (words.every((x) => x.done)) finish(true);
      else {
        const i = words.indexOf(w);
        select([...words.slice(i + 1), ...words.slice(0, i)].find((x) => !x.done));
      }
    };
    popEl.replaceChildren(
      h(
        'div',
        { class: 'panel ws-card cw-card f2' },
        h('div', { class: 'ws-card-head' }, h('span', { class: 'ws-card-emoji' }, w.word.emoji), h('div', { class: 'col tight' }, h('small', { class: 'muted' }, pick(['Bravo !', 'Super !', 'Génial !', 'Trop fort !'])), h('div', { class: 'ws-card-word' }, wordView(w.word)))),
        h('p', { class: 'ws-card-def' }, h('b', {}, `${art.charAt(0).toUpperCase()}${art.slice(1)} : `), w.word.def),
        h('div', { class: 'row' }, h('button', { class: 'btn small ghost', onclick: () => speak(`${art}. ${w.word.def}`, { force: true }) }, '🔊 Écouter'), h('button', { class: 'btn small', onclick: close }, 'Continuer ➜'))
      )
    );
    popEl.classList.remove('hidden');
    popEl.querySelector('.btn:not(.ghost)').focus();
    speak(`${art} ! ${w.word.def}`, { force: true });
  }

  // Clavier
  const kb = h(
    'div',
    { class: 'cw-kb word-font' },
    Array.from(ABC).map((l) => h('button', { class: 'cw-key', onclick: () => type(l) }, l)),
    h('button', { class: 'cw-key erase', 'aria-label': 'Effacer', onclick: erase }, '⌫')
  );
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (popOpen && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      popEl.querySelector('.btn:not(.ghost)')?.click();
      return;
    }
    const L = base(e.key).toUpperCase();
    if (L.length === 1 && ABC.includes(L)) type(L);
    else if (e.key === 'Backspace') erase();
    else return;
    e.preventDefault();
  }
  document.addEventListener('keydown', onKey);

  const msg = h('div', { class: 'col' });
  function finish(win) {
    over = true;
    const stars = win ? Math.max(1, level.stars + (riddle ? 2 : 0) - hints) : 1;
    st.stars += stars;
    st.records[`crossword:${p.level}`] = (st.records[`crossword:${p.level}`] || 0) + (win ? 1 : 0);
    markDay();
    save();
    if (win) {
      sound.win();
      confetti();
    }
    active = null;
    cursor = null;
    renderGrid();
    clueEl.replaceChildren();
    kb.remove();
    giveUpBtn.remove();
    msg.replaceChildren(
      mascot(win ? `Bravo ! Tu as rempli toute la grille ! +${stars} ⭐` : `Voici la grille complète. +${stars} ⭐ pour l’effort !`, { mood: win ? 'wow' : 'think' }),
      h(
        'section',
        { class: 'panel' },
        h('h2', {}, '📖 Mon petit dico'),
        h('div', { class: 'ws-dico' }, words.map((w) => h('button', { class: 'ws-dico-row', onclick: () => speak(`${withArticle(w.word)}. ${w.word.def}`, { force: true }) }, h('span', { class: 'ws-w-emoji' }, w.word.emoji), h('span', { class: 'col tight' }, h('b', { class: 'word-font' }, w.word.w), h('small', {}, w.word.def)))))
      ),
      h('div', { class: 'row wrap' }, h('button', { class: 'btn ghost', onclick: () => relaunch(false) }, '⚙️ Changer'), h('button', { class: 'btn', onclick: () => relaunch(true) }, '🔁 Une autre grille'))
    );
    msg.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const giveUp = () => {
    if (over || popOpen) return;
    for (const w of words) {
      w.keys.forEach((k, i) => {
        const c = cells.get(k);
        if (c.val !== w.letters[i]) {
          c.val = w.letters[i];
          c.given = true;
        }
        c.locked = true;
        c.bad = false;
      });
      w.done = true;
    }
    renderClues();
    finish(false);
  };
  const giveUpBtn = h('button', { class: 'btn small ghost', onclick: giveUp }, '🐱 Je donne ma langue au chat');

  el.append(
    h(
      'div',
      { class: 'cw-board' },
      h('div', { class: 'col cw-main' }, h('div', { class: 'cw-grid-wrap' }, gridEl, flashEl), clueEl, kb),
      h('div', { class: 'col' }, cluesEl, msg, h('div', { class: 'row' }, giveUpBtn))
    ),
    popEl
  );
  select(words[0]);
  return { el, destroy: () => document.removeEventListener('keydown', onKey) };
}
