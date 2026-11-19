// Répétition espacée façon "boîtes de Leitner".
// Chaque calcul a une boîte de 0 (jamais vu) à 5 (parfaitement su).
// Bonne réponse : on monte d'une boîte. Erreur : retour en boîte 1.
// Les calculs des petites boîtes sont tirés beaucoup plus souvent.

export const MAX_BOX = 5;
export const MASTERED = 4;
const WEIGHTS = [6, 5, 3, 2, 1, 0.5];

export function factStat(state, id) {
  return state.progress[id] || { box: 0, seen: 0, ok: 0, ko: 0, last: 0 };
}

export function recordAnswer(state, id, correct) {
  const s = { ...factStat(state, id) };
  s.seen++;
  s.last = Date.now();
  if (correct) {
    s.ok++;
    s.box = Math.min(MAX_BOX, s.box + 1);
  } else {
    s.ko++;
    s.box = 1;
  }
  state.progress[id] = s;
}

export function pickWeighted(facts, state, avoidIds = []) {
  let pool = facts.filter((f) => !avoidIds.includes(f.id));
  if (!pool.length) pool = facts;
  const w = pool.map((f) => WEIGHTS[factStat(state, f.id).box]);
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) {
    r -= w[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

/** Part des calculs "maîtrisés" (boîte >= 4), entre 0 et 1. */
export function masteryOf(state, facts) {
  if (!facts.length) return 0;
  return facts.filter((f) => factStat(state, f.id).box >= MASTERED).length / facts.length;
}

export function medal(ratio) {
  if (ratio >= 0.9) return '🥇';
  if (ratio >= 0.6) return '🥈';
  if (ratio >= 0.3) return '🥉';
  return '';
}

// Intervalles de révision (en jours) selon la boîte : plus c'est su, plus on espace.
const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];
const DAY = 24 * 3600 * 1000;

/** Un élément déjà vu est « à réviser » quand son intervalle est écoulé. */
export function isDue(stat, now = Date.now()) {
  return stat.seen > 0 && now - stat.last >= INTERVAL_DAYS[stat.box] * DAY * 0.9;
}
