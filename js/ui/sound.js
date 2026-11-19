// Sons générés (Web Audio) : aucun fichier à télécharger.

import { getState } from '../core/store.js';

let ctx = null;
const ac = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)());

function tone(freq, start, dur, type = 'sine', vol = 0.18) {
  try {
    const c = ac();
    if (c.state === 'suspended') c.resume();
    const o = c.createOscillator();
    const g = c.createGain();
    const t = c.currentTime + start;
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch {
    /* audio indisponible */
  }
}

const on = () => getState()?.settings.sound;

export const sound = {
  tap: () => on() && tone(420, 0, 0.05, 'triangle', 0.06),
  ok: () => on() && (tone(660, 0, 0.12), tone(990, 0.09, 0.22)),
  ko: () => on() && (tone(300, 0, 0.18, 'triangle', 0.15), tone(220, 0.14, 0.28, 'triangle', 0.15)),
  tick: () => on() && tone(1100, 0, 0.05, 'square', 0.04),
  go: () => on() && tone(880, 0, 0.35, 'square', 0.08),
  flip: () => on() && tone(520, 0, 0.06, 'triangle', 0.08),
  combo: () => on() && [784, 988, 1175].forEach((f, i) => tone(f, i * 0.07, 0.15)),
  win: () => on() && [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.25)),
};
