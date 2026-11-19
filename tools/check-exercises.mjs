// Construit chaque exercice pour chaque élément et vérifie la cohérence : node tools/check-exercises.mjs
import { units } from '../js/units/index.js';
import { EXERCISES } from '../js/exercises/index.js';
import { SOUNDS } from '../js/data/sounds.js';
let errors = 0;
const err = (...a) => { errors++; if (errors < 40) console.log('✗', ...a); };
const samples = {};
for (const u of units) {
  const allModes = [...new Set(u.skills.flatMap((s) => s.exercises || u.reviewModes))];
  for (const modeId of allModes) {
    const ex = EXERCISES[modeId];
    if (!ex) { err('exercice inconnu', modeId); continue; }
    let ok = 0, nul = 0;
    for (const skill of u.skills) {
      if (!(skill.exercises || u.reviewModes).includes(modeId)) continue;
      const ids = new Set();
      for (const it of skill.items) { if (ids.has(it.id)) err('id en double', it.id); ids.add(it.id); }
      const ctx = { unit: u, skill, skills: [skill], pool: skill.items };
      for (const item of skill.items) {
        for (let r = 0; r < 4; r++) {
          const q = ex.build(item, ctx);
          if (!q) { nul++; break; }
          ok++;
          if (q.input === 'choices') {
            const vals = q.choices.map((c) => c.value);
            if (!vals.includes(q.answer)) err(modeId, item.id, 'réponse absente', vals);
            if (new Set(vals).size !== vals.length) err(modeId, item.id, 'choix en double', vals);
            if (q.choiceStyle === 'emoji' && new Set(q.choices.map((c) => c.emoji)).size !== vals.length) err(modeId, item.id, 'emoji en double');
            if (modeId === 'pickSound') for (const v of vals) if (v !== q.answer && item.word.sounds.has(v)) err(modeId, item.id, 'piège présent dans le mot', v);
          }
          if (q.input === 'tiles') {
            const pool = [...q.tiles];
            for (const a of q.answer) { const i = pool.indexOf(a); if (i < 0) err(modeId, item.id, 'étiquette manquante', a); else pool.splice(i, 1); }
          }
          if (q.input === 'boxes' && !(q.answer >= 0 && q.answer < q.boxes.length)) err(modeId, item.id, 'case hors limites');
          (samples[modeId] ||= []).length < 5 && r === 0 && samples[modeId].push(
            `${q.text ? '[' + q.text.slice(0, 40) + '] ' : ''}${item.word.w.slice(0, 30)} → ${q.choices ? q.choices.map((c) => c.text || c.emoji).join(' / ') : q.tiles ? q.tiles.join(' ') : q.boxes ? q.boxes.join('|') : q.answer} [${Array.isArray(q.answer) ? q.answer.join('') : q.answer}]`);
        }
      }
    }
    console.log(`${u.id}/${modeId}: ${ok} questions, ${nul} éléments non adaptés`);
  }
}
for (const [m, s] of Object.entries(samples)) console.log(`\n${m}:\n  ` + s.join('\n  '));
// Petits sons : combien de mots par notion ?
for (const u of units) console.log(`${u.id}: ${u.skills.length} notions, ${u.skills.reduce((n, s) => n + s.items.length, 0)} éléments`);
const sons = units[0].skills.map((s) => `${s.short}:${s.items.length}`).join('  ');
console.log('\nmots par notion (sons):', sons);
console.log(errors ? `\n${errors} erreur(s)` : '\nAucune erreur ✔');
process.exit(errors ? 1 : 0);
