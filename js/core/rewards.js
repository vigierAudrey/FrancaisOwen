// Récompenses : autocollants à collectionner et niveaux.

export const STICKERS = [
  '🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵',
  '🐧', '🐢', '🐙', '🦄', '🐲', '🦖', '🐳', '🦋', '🐝', '🦜',
  '🚀', '🛸', '⚽', '🏀', '🎸', '🎨', '🍕', '🍦', '🌈', '👑',
  '💎', '🏰', '🚂', '🚒', '🏎️', '🎡', '🦕', '🐉', '🌋', '🏆',
  '🧙', '🧚', '🦸', '🏴‍☠️', '🎩', '🪄', '📚', '✨', '🌟', '🎉',
];
export const STARS_PER_STICKER = 12;

export const unlockedCount = (stars) => Math.min(STICKERS.length, Math.floor(stars / STARS_PER_STICKER));

export const LEVELS = [
  { stars: 0, name: 'Petit curieux', emoji: '🐣' },
  { stars: 30, name: 'Chasseur de sons', emoji: '👂' },
  { stars: 80, name: 'Apprenti lecteur', emoji: '📗' },
  { stars: 160, name: 'Chevalier des mots', emoji: '🛡️' },
  { stars: 300, name: 'Magicien des lettres', emoji: '🧙' },
  { stars: 500, name: 'Super-lecteur', emoji: '🦸' },
  { stars: 800, name: 'Légende du français', emoji: '🐉' },
  { stars: 1200, name: 'Roi des livres', emoji: '👑' },
];

export function levelOf(stars) {
  let i = 0;
  while (i + 1 < LEVELS.length && stars >= LEVELS[i + 1].stars) i++;
  const lvl = LEVELS[i];
  const next = LEVELS[i + 1];
  const progress = next ? (stars - lvl.stars) / (next.stars - lvl.stars) : 1;
  return { ...lvl, index: i + 1, next, progress };
}
