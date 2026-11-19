// Pluie de confettis (canvas), sans dépendance.

const COLORS = ['#FF7B54', '#4D7CFE', '#FFC233', '#21B27C', '#9B5DE5', '#F15BB5'];

export function confetti({ count = 140, duration = 2600 } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas');
  cv.className = 'confetti';
  document.body.append(cv);
  const dpr = window.devicePixelRatio || 1;
  const W = (cv.width = innerWidth * dpr);
  const H = (cv.height = innerHeight * dpr);
  const g = cv.getContext('2d');
  const parts = Array.from({ length: count }, () => ({
    x: W / 2 + (Math.random() - 0.5) * W * 0.3,
    y: H * 0.35,
    vx: (Math.random() - 0.5) * 18 * dpr,
    vy: (-Math.random() * 16 - 6) * dpr,
    s: (6 + Math.random() * 8) * dpr,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    c: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
  const t0 = performance.now();
  (function frame(t) {
    const el = t - t0;
    g.clearRect(0, 0, W, H);
    g.globalAlpha = Math.max(0, 1 - el / duration);
    for (const p of parts) {
      p.vy += 0.45 * dpr;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.r);
      g.fillStyle = p.c;
      g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      g.restore();
    }
    if (el < duration) requestAnimationFrame(frame);
    else cv.remove();
  })(t0);
}
