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
import rewards from './screens/rewards.js';
import parent from './screens/parent.js';

initStore(units);

register('home', home);
register('unit', unitMenu);
register('session', sessionScreen);
register('results', results);
register('learn', learn);
register('hunt', hunt);
register('memory', memory);
register('games', games);
register('mystery', mystery);
register('chrono', chrono);
register('rewards', rewards);
register('parent', parent);

loadRecordings().finally(start);

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
