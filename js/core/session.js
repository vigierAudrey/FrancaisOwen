// Moteur de séance : choisit le prochain élément et gère les « rattrapages ».
// Un élément raté revient 2 questions plus tard : c'est la clé de la mémorisation.

import { pickWeighted, recordAnswer } from './srs.js';

export function createSession({ facts, state, count = Infinity }) {
  const recent = [];
  const retry = [];
  let i = 0;

  return {
    get index() {
      return i;
    },
    count,
    done() {
      return i >= count;
    },
    /**
     * build(fact) fabrique la question, ou renvoie null si ce fait ne convient pas
     * à l'exercice : on en essaie alors un autre.
     */
    next(build) {
      const failed = new Set();
      for (let t = 0; t < 20; t++) {
        let fact;
        const due = retry.findIndex((r) => r.due <= i && !failed.has(r.fact.id));
        if (due >= 0) fact = retry.splice(due, 1)[0].fact;
        else {
          const avoid = [...(facts.length > 2 ? recent.slice(-2) : recent.slice(-1)), ...failed];
          fact = pickWeighted(facts, state, facts.length > 1 ? avoid : []);
        }
        const q = build(fact);
        if (q) {
          recent.push(fact.id);
          i++;
          return q;
        }
        failed.add(fact.id);
      }
      return null;
    },
    answer(fact, correct) {
      recordAnswer(state, fact.id, correct);
      if (!correct && facts.length > 1 && !retry.some((r) => r.fact.id === fact.id)) {
        retry.push({ fact, due: i + 2 });
      }
    },
  };
}
