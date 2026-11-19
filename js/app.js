// Point d'entrée : initialise les données, déclare les écrans, démarre.

import { units } from './units/index.js';
import { initStore } from './core/store.js';
import { loadRecordings } from './ui/recordings.js';
import { register, start } from './core/router.js';
import home from './screens/home.js';
import unitMenu from './screens/unitMenu.js';
import sessionScreen from './screens/session.js';
import results from './screens/results.js';
import learn from './screens/learn.js';
import hunt from './screens/hunt.js';
import memory from './screens/memory.js';
import games from './screens/games.js';
import mystery from './screens/mystery.js';
import chrono from './screens/chrono.js';
import wordsearch from './screens/wordsearch.js';
import crossword from './screens/crossword.js';
import rain from './screens/rain.js';
import bingo from './screens/bingo.js';
import adventure from './screens/adventure.js';
import { questBanner } from './core/adventure.js';
import rewards from './screens/rewards.js';
import parent from './screens/parent.js';

initStore(units);

/** Jeu lancé depuis la carte de l'aventure : on affiche l'étape et son objectif sous l'en-tête. */
const withQuest = (fn) => (params) => {
  const r = fn(params);
  const banner = params.quest && questBanner(params.quest);
  if (banner) {
    const el = r instanceof Node ? r : r.el;
    const head = el.querySelector('.header');
    if (head) head.after(banner);
    else el.prepend(banner);
  }
  return r;
};

register('home', home);
register('unit', unitMenu);
register('session', withQuest(sessionScreen));
register('results', results);
register('learn', learn);
register('hunt', withQuest(hunt));
register('memory', withQuest(memory));
register('games', games);
register('mystery', withQuest(mystery));
register('chrono', withQuest(chrono));
register('wordsearch', withQuest(wordsearch));
register('crossword', withQuest(crossword));
register('rain', withQuest(rain));
register('bingo', withQuest(bingo));
register('adventure', adventure);
register('rewards', rewards);
register('parent', parent);

loadRecordings().finally(start);

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
