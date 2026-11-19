// Voix (synthèse vocale du navigateur) : indispensable pour travailler les sons.
// La qualité dépend de l'appareil (les voix Google / Apple françaises sont bonnes).

import { getState } from '../core/store.js';

export const speechAvailable = () => 'speechSynthesis' in window;

let voice = null;
function pickVoice() {
  const voices = speechSynthesis.getVoices().filter((v) => v.lang?.replace('_', '-').startsWith('fr'));
  // On préfère une voix française de France, et les voix « naturelles » quand elles existent.
  const score = (v) => (v.lang.replace('_', '-') === 'fr-FR' ? 2 : 0) + (/google|natural|amélie|audrey|thomas|denise|marie/i.test(v.name) ? 1 : 0);
  voice = voices.sort((a, b) => score(b) - score(a))[0] || null;
}
if (speechAvailable()) {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export const hasFrenchVoice = () => !!voice;

function utter(text, rate) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fr-FR';
  if (voice) u.voice = voice;
  u.rate = rate ?? getState()?.settings.voiceRate ?? 0.85;
  u.pitch = 1.05;
  return u;
}

/** Lit un texte (si la voix est activée, ou si force = true). */
export function speak(text, { force = false, rate } = {}) {
  if (!text || !speechAvailable() || (!force && !getState().settings.voice)) return;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter(text, rate));
}

export function stopSpeaking() {
  if (speechAvailable()) speechSynthesis.cancel();
}
