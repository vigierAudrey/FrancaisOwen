// Enregistrements de la voix du parent (micro → IndexedDB, sur l'appareil uniquement).
// Utilisés à la place de la synthèse vocale pour faire entendre les sons.

const DB = 'francaisowen-voix';
const STORE = 'rec';
const urls = new Map(); // clé → URL du son prêt à jouer

function db() {
  return new Promise((ok, ko) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  });
}

async function tx(mode, fn) {
  const d = await db();
  return new Promise((ok, ko) => {
    const t = d.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => ok(req?.result);
    t.onerror = () => ko(t.error);
  });
}

/** Charge les enregistrements au démarrage (silencieux si IndexedDB est indisponible). */
export async function loadRecordings() {
  try {
    const d = await db();
    await new Promise((ok) => {
      const t = d.transaction(STORE, 'readonly');
      const req = t.objectStore(STORE).openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (!c) return ok();
        urls.set(c.key, URL.createObjectURL(c.value));
        c.continue();
      };
      req.onerror = () => ok();
    });
  } catch {
    /* pas d'enregistrements */
  }
}

export const hasRecording = (key) => urls.has(key);
export const recordingAvailable = () => !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder && window.indexedDB);

let current = null;
export function playRecording(key) {
  const url = urls.get(key);
  if (!url) return false;
  current?.pause();
  current = new Audio(url);
  current.play().catch(() => {});
  return true;
}

export async function saveRecording(key, blob) {
  await tx('readwrite', (s) => s.put(blob, key));
  if (urls.has(key)) URL.revokeObjectURL(urls.get(key));
  urls.set(key, URL.createObjectURL(blob));
}

export async function deleteRecording(key) {
  await tx('readwrite', (s) => s.delete(key));
  if (urls.has(key)) URL.revokeObjectURL(urls.get(key));
  urls.delete(key);
}

/** Démarre un enregistrement ; renvoie une fonction stop() → Promise<Blob>. */
export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(stream);
  const chunks = [];
  rec.ondataavailable = (e) => chunks.push(e.data);
  rec.start();
  return () =>
    new Promise((ok) => {
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        ok(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
      };
      rec.stop();
    });
}
