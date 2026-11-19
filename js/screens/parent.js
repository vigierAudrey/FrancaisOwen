// Espace parents : choix des notions, réglages, voix, suivi des progrès, sauvegarde.

import { h } from '../ui/dom.js';
import { getState, update, save, resetProgress, exportData, importData } from '../core/store.js';
import { units } from '../units/index.js';
import { factStat, masteryOf } from '../core/srs.js';
import { MODES } from '../exercises/index.js';
import { header } from '../ui/components.js';
import { speak, speechAvailable, hasFrenchVoice } from '../ui/speech.js';
import { SOUNDS, soundLine } from '../data/sounds.js';
import { recordingAvailable, hasRecording, playRecording, saveRecording, deleteRecording, startRecording } from '../ui/recordings.js';

/** Enregistrer sa propre voix pour chaque son. */
function voiceSection(section, rerender) {
  if (!recordingAvailable()) return section('🎙️ Ma voix pour les sons', h('p', { class: 'muted' }, 'L’enregistrement n’est pas possible sur ce navigateur (il faut une adresse https).'));
  let stopFn = null;
  const rows = Object.entries(SOUNDS).map(([id, s]) => {
    const key = `son:${id}`;
    const recBtn = h('button', { class: 'btn small', onclick: async () => {
      if (stopFn) {
        const blob = await stopFn();
        stopFn = null;
        await saveRecording(key, blob);
        rerender();
        return;
      }
      try {
        stopFn = await startRecording();
        recBtn.textContent = '⏹ Arrêter';
        recBtn.classList.add('danger');
      } catch {
        alert('Impossible d’accéder au micro.');
      }
    } }, hasRecording(key) ? '⏺ Refaire' : '⏺ Enregistrer');
    return h(
      'div',
      { class: 'record-row voice-row' },
      h('span', {}, h('b', { class: 'word-font' }, s.label), h('small', { class: 'muted' }, ` comme dans ${s.ref}`)),
      h(
        'span',
        { class: 'row' },
        h('button', { class: 'btn small ghost', title: 'Écouter', onclick: () => (playRecording(key) || speak(soundLine(id), { force: true })) }, hasRecording(key) ? '▶️ Ma voix' : '🤖 Synthèse'),
        recBtn,
        hasRecording(key) ? h('button', { class: 'btn small ghost', title: 'Supprimer', onclick: async () => { await deleteRecording(key); rerender(); } }, '🗑️') : null
      )
    );
  });
  const det = h('details', {}, h('summary', {}, `Enregistrer les sons (${Object.keys(SOUNDS).filter((id) => hasRecording(`son:${id}`)).length}/${Object.keys(SOUNDS).length})`), rows);
  return section('🎙️ Ma voix pour les sons', h('p', { class: 'muted' }, 'La voix de synthèse prononce mal certains sons isolés. Enregistrez-les vous-même (dites juste le son, ex. « chhh », « ou ») : ils seront utilisés dans les exercices. Reste sur cet appareil.'), det);
}

export default function parent() {
  const body = h('div', { class: 'parent-body' });
  const el = h('div', { class: 'screen parent' }, header('Espace parents', { right: null }), body);

  const section = (title, ...kids) => h('section', { class: 'panel' }, h('h2', {}, title), ...kids);

  const switchRow = (label, checked, onChange, note) =>
    h(
      'label',
      { class: 'switch-row' },
      h('span', {}, label, note ? h('small', {}, note) : null),
      h('input', { type: 'checkbox', class: 'switch', checked, onchange: (e) => onChange(e.target.checked) })
    );

  const selectRow = (label, value, values, fmt, onChange) =>
    h(
      'label',
      { class: 'switch-row' },
      h('span', {}, label),
      h('select', { onchange: (e) => onChange(Number(e.target.value)) }, values.map((v) => h('option', { value: v, selected: v === value }, fmt(v))))
    );

  function render() {
    const y = window.scrollY;
    const st = getState();
    const S = st.settings;

    const unitSections = units.map((u) => {
      const conf = S.units[u.id];
      const has = (id) => conf.skills.includes(id);
      const toggle = (id, on) => update(() => (conf.skills = on ? [...new Set([...conf.skills, id])] : conf.skills.filter((x) => x !== id)));
      const groups = (u.families || []).map((f) => {
        const skills = u.skills.filter((s) => s.family === f.id);
        return h(
          'div',
          { class: 'family' },
          h('h3', {}, `${f.emoji} ${f.label}`, f.info ? h('small', { class: 'muted' }, ` — ${f.info}`) : null),
          h(
            'div',
            { class: 'chips' },
            skills.map((s) =>
              h(
                'button',
                {
                  class: 'chip' + (has(s.id) ? ' on' : ''),
                  'aria-pressed': String(has(s.id)),
                  title: `${s.parentInfo || s.label} (${s.items.length} mots)`,
                  onclick: () => {
                    toggle(s.id, !has(s.id));
                    render();
                  },
                },
                s.emoji ? `${s.emoji} ${s.short}` : s.short
              )
            )
          )
        );
      });
      const sec = section(
        `${u.emoji} ${u.name}`,
        h('p', { class: 'muted' }, 'Touchez une notion pour l’activer ou la désactiver. L’enfant ne voit que les notions actives. (Survolez pour le détail.)'),
        groups,
        h(
          'div',
          { class: 'row left' },
          h('button', { class: 'btn small ghost', onclick: () => { update(() => (conf.skills = u.skills.map((s) => s.id))); render(); } }, 'Tout'),
          h('button', { class: 'btn small ghost', onclick: () => { update(() => (conf.skills = [])); render(); } }, 'Rien')
        )
      );
      sec.classList.add(`theme-${u.id}`);
      return sec;
    });

    const progressSections = units.map((u) => {
      const rows = u.skills
        .filter((s) => s.items.some((i) => factStat(st, i.id).seen))
        .map((s) =>
          h(
            'details',
            { class: 'heat-row' },
            h('summary', { class: 'heat-label' }, s.short || s.label, h('small', {}, ` ${Math.round(masteryOf(st, s.items) * 100)} % su`)),
            h(
              'div',
              { class: 'heat-cells' },
              s.items.map((i) => {
                const fs = factStat(st, i.id);
                return h('span', { class: `heat-word b${fs.box}`, title: `${fs.ok} ✓ / ${fs.ko} ✗` }, i.word.w);
              })
            )
          )
        );
      const hard = u.skills
        .flatMap((s) => s.items)
        .map((i) => ({ i, s: factStat(st, i.id) }))
        .filter((x) => x.s.ko > 0)
        .sort((a, b) => b.s.ko - a.s.ko || a.s.box - b.s.box)
        .slice(0, 10);
      return h(
        'div',
        { class: 'progress-op' },
        h('h3', {}, `${u.emoji} ${u.name}`),
        rows.length ? rows : h('p', { class: 'muted' }, 'Pas encore de données.'),
        hard.length
          ? h('div', {}, h('h4', {}, 'Les plus difficiles'), h('div', { class: 'mistake-list' }, hard.map((x) => h('span', { class: 'mistake' }, `${x.i.word.emoji || ''} ${x.i.word.w}`, h('small', {}, ` ✗${x.s.ko}`)))))
          : null
      );
    });

    const history = st.history.slice(0, 10).map((s) => {
      const u = units.find((x) => x.id === s.unit);
      const d = new Date(s.t);
      return h(
        'div',
        { class: 'record-row' },
        h('span', {}, `${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · ${u?.emoji || '🔁'} ${MODES[s.mode]?.label || s.mode}`),
        h('b', {}, `${s.correct}/${s.asked}`)
      );
    });

    const fileInput = h('input', {
      type: 'file',
      accept: 'application/json,.json',
      class: 'hidden',
      onchange: async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          importData(await file.text());
          alert('Sauvegarde importée ✔');
          render();
        } catch {
          alert('Ce fichier n’est pas une sauvegarde valide.');
        }
      },
    });

    const voiceNote = !speechAvailable()
      ? '⚠️ Cet appareil ne propose pas de voix : les exercices de sons seront difficiles.'
      : hasFrenchVoice()
        ? 'Indispensable pour les sons. Testez la voix ci-dessous.'
        : '⚠️ Aucune voix française trouvée : installez-en une dans les réglages de l’appareil (Synthèse vocale).';

    body.replaceChildren(
      section(
        '👦 Enfant',
        h(
          'label',
          { class: 'switch-row' },
          h('span', {}, 'Prénom'),
          h('input', { type: 'text', value: S.childName, maxlength: 20, class: 'text-input', onchange: (e) => update(() => (S.childName = e.target.value.trim() || 'Owen')) })
        )
      ),
      ...unitSections,
      section(
        '⚙️ Réglages',
        selectRow('Questions par séance', S.questionsPerSession, [5, 10, 15, 20], (v) => `${v}`, (v) => update(() => (S.questionsPerSession = v))),
        switchRow('🗣️ Voix', S.voice, (v) => update(() => (S.voice = v)), voiceNote),
        selectRow('Vitesse de la voix', S.voiceRate, [0.7, 0.85, 1], (v) => ({ 0.7: 'Lente', 0.85: 'Normale', 1: 'Rapide' })[v], (v) => update(() => (S.voiceRate = v))),
        h('div', { class: 'row left' }, h('button', { class: 'btn small ghost', onclick: () => speak('Bonjour ! Je suis Plume le perroquet. On joue avec les sons : ou, on, an, ch.', { force: true }) }, '🔊 Tester la voix')),
        switchRow('🌈 Syllabes en couleur', S.syllables, (v) => update(() => (S.syllables = v)), 'Les syllabes alternent bleu / rouge, les lettres muettes sont grisées (comme en classe).'),
        switchRow('🔈 Bruitages', S.sound, (v) => update(() => (S.sound = v)))
      ),
      voiceSection(section, () => { render(); el.querySelector('.voice-row')?.closest('details')?.setAttribute('open', ''); }),
      section(
        '📊 Progrès',
        h('div', { class: 'legend' }, ['Jamais vu', 'À revoir', 'En cours', 'Presque', 'Su', 'Très bien su'].map((t, i) => h('span', {}, h('i', { class: `heat b${i}` }), t))),
        ...progressSections,
        h('h3', {}, 'Dernières séances'),
        history.length ? history : h('p', { class: 'muted' }, 'Aucune séance pour le moment.')
      ),
      section(
        '💾 Données',
        h('p', { class: 'muted' }, 'Les progrès sont enregistrés sur cet appareil. Exportez-les pour les transférer sur un autre.'),
        h(
          'div',
          { class: 'row left wrap' },
          h(
            'button',
            {
              class: 'btn small',
              onclick: () => {
                const blob = new Blob([exportData()], { type: 'application/json' });
                const a = h('a', { href: URL.createObjectURL(blob), download: `francais-owen-${new Date().toISOString().slice(0, 10)}.json` });
                a.click();
                setTimeout(() => URL.revokeObjectURL(a.href), 1000);
              },
            },
            '⬇️ Exporter'
          ),
          h('button', { class: 'btn small ghost', onclick: () => fileInput.click() }, '⬆️ Importer'),
          h(
            'button',
            {
              class: 'btn small danger',
              onclick: () => {
                if (confirm('Effacer tous les progrès, étoiles et records ? (Les réglages sont conservés.)')) {
                  resetProgress();
                  render();
                }
              },
            },
            '🗑️ Tout effacer'
          ),
          fileInput
        )
      )
    );
    save();
    window.scrollTo(0, y);
  }

  render();
  return el;
}
