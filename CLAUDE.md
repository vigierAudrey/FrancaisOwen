# Français Owen — instructions projet

Application d'entraînement au français pour **Owen, 7 ans (CE1)** : les sons, les mots, la
lecture, puis les débuts de grammaire. Projet jumeau de `../MathsOwen` (même socle technique,
même esprit). Elle doit être **amusante avant tout** tout en faisant réellement progresser.

## Principes non négociables

- **Public : enfant de 7 ans.** Textes courts, tutoiement, ton encourageant (« Presque ! »,
  jamais « Faux ! »). Typographie française (apostrophe ’, espace avant ! ? :).
- **La voix est centrale** : les sons s'entendent. Toute question a un `say` (bouton 🔊), sauf
  les exercices de *lecture* où l'enfant doit lire seul (on lit le mot après la réponse).
- **Amusant** : étoiles, Plume le perroquet 🦜, confettis, autocollants, séries 🔥, jeux.
- **Comprendre puis mémoriser** : chaque erreur montre le mot (syllabes en couleur, son
  surligné) + une phrase d'explication ; l'élément raté revient 2 questions plus tard ;
  répétition espacée (boîtes de Leitner) et « révisions du jour ».
- **Gros éléments tactiles**, mobile d'abord (360 px), beau sur PC (max-width 760 px).
- **Aucune dépendance, aucun build** : HTML/CSS/JS (modules ES). Pas de framework.
- **Données locales uniquement** (localStorage). Pas de compte, pas de serveur, pas de pistage.
- Ne jamais insérer de texte via `innerHTML` : utiliser `h()` (js/ui/dom.js).

## Architecture

```
index.html, manifest.webmanifest, sw.js   PWA (installable, hors-ligne)
css/style.css         tout le style ; couleur par univers via .theme-<id>
js/app.js             démarrage + déclaration des écrans
js/data/
  sounds.js           table des sons (graphies, sons proches, voix), familles, paires de sons cousins
  words.js            BANQUE DE MOTS illustrés (notation syllabes/graphèmes) + mots-outils
  grammar.js          verbes, adjectifs (m/f), pluriels, h aspiré, conjugaison au présent
  definitions.js      définitions enfantines de chaque mot illustré (sans le mot lui-même)
  sentences.js        phrases simples, vrai/faux, phrases à trou et/est a/à, petites histoires
js/lang/word.js       analyse de la notation, syllabes orales, distance entre mots
js/units/             univers (sons, mots, lecture, grammaire) + registre index.js
js/exercises/         exercices question par question (un fichier par univers) + registre index.js
js/core/              store (sauvegarde), srs (Leitner + isDue), session, router, rewards
js/ui/                dom (h), speech (voix), recordings (voix du parent, IndexedDB), wordView, sound, confetti, components
js/screens/           home, unitMenu, session, results, learn, hunt, memory, mystery, chrono, wordsearch, crossword, games, rewards, parent
tools/                scripts de vérification (node) — non livrés
```

### Concepts

- **Mot** : `{ w, emoji, genre, theme, syl, gs, sounds }`, produit à partir d'une ligne de
  `data/words.js` : `ch-e|v-a-l 🐴 m`. `|` sépare les syllabes écrites, `-` les graphèmes,
  `(x)` = lettre muette, `x=son` = graphème qui se lit autrement (`s=z`, `g=j`, `e=è`…).
  Le son par défaut d'un graphème est dans `GMAP` (lang/word.js).
- **Univers** (`unit`) : `{ id, name, emoji, mascotLine, learnKind, families, skills,
  defaultSkills, modes, reviewModes }`.
- **Notion** (`skill`) : `{ id, label, short, family, items, exercises?, lesson?, sound? | pair? | emoji? }`.
  Les notions de sons sont **générées automatiquement** depuis la banque de mots.
  `exercises` : exercices propres à la notion (Lecture, Grammaire) — utilisés par les modes
  « Je m'entraîne » (`play`), « Un peu de tout » (`mix`) et les révisions ; sinon `unit.reviewModes`.
  `lesson` : lignes de la leçon affichée dans « J'apprends » (grammaire).
- **Élément** (`item`) : `{ id, unitId, skillId, word, sound? }`. L'`id` est la clé de
  progression (`son:ou:loup`, `mot:chat`, `outil:dans`) : **ne jamais le changer sans migration**.
- **Exercice** : `{ id, label, emoji, desc, build(item, ctx) → question | null }`. Format de la
  question documenté en tête de `js/exercises/index.js`. L'écran `session.js` sait afficher
  4 types de réponse : `choices`, `truefalse`, `tiles`, `boxes`, et un texte à trou (`text` avec `_`).
- **Voix** : `speak()` (synthèse) ; pour les sons, `playSound(id)` joue l'enregistrement du
  parent s'il existe (clé `son:<id>`, espace parents → « Ma voix pour les sons »).

### Ajouter des mots, des phrases, des histoires

Phrases, vrai/faux, et/est, histoires : `data/sentences.js` (les ids viennent du texte : modifier
un texte remet sa progression à zéro, c'est sans gravité). Verbes / adjectifs : `data/grammar.js`.
Mots : ajouter une ligne dans `RAW_WORDS` (bon thème) **et sa définition dans `data/definitions.js`**, puis `node tools/check-words.mjs -v` (vérifie
graphèmes, doublons de mots/emoji, affiche sons et syllabes) et `node tools/check-exercises.mjs`
(construit tous les exercices pour tous les éléments et vérifie leur cohérence).

### Ajouter un exercice

Écrire l'objet dans `js/exercises/<univers>.js` (exporté), ajouter son id à `modes` (et
`reviewModes` s'il convient aux révisions) de l'univers. S'il faut une nouvelle forme de
réponse, la gérer dans `screens/session.js` (`renderAnswer`, `onKey`).
Un jeu avec son propre écran : `screen: '<nom>'` dans `SCREENS` (exercises/index.js),
créer `js/screens/<nom>.js`, l'enregistrer dans `app.js`, l'ajouter aux jeux (`games.js`).

### Ajouter un univers (Lecture, Grammaire…)

1. Créer `js/units/<id>.js` (notions + modes), l'ajouter à `units` dans `js/units/index.js`
   et le retirer de `comingSoon`.
2. Ses exercices dans `js/exercises/<id>.js`, importés dans `exercises/index.js`.
3. `.theme-<id>` dans `css/style.css` ; `learnKind` géré dans `screens/learn.js`.
4. Ajouter les fichiers à `ASSETS` dans `sw.js` et **incrémenter `VERSION`**.
Les réglages par défaut sont fusionnés automatiquement avec les anciennes sauvegardes.

## Lancer / tester

```bash
python3 -m http.server 8000      # puis http://localhost:8000
node tools/check-words.mjs && node tools/check-exercises.mjs
```
- Le service worker sert le cache d'abord : recharger **deux fois** après une modification.
- **À chaque modification de fichiers livrés : incrémenter `VERSION` dans `sw.js`**, et y
  ajouter tout nouveau fichier.
- Vérifier sur un viewport de téléphone (390×844) et sur PC, et regarder la console.

## Git et déploiement

- Dépôt : https://github.com/vigierAudrey/FrancaisOwen (branche `main`).
- Hébergement : **GitHub Pages** depuis `main` (racine) → https://vigieraudrey.github.io/FrancaisOwen/
  Chaque `git push` sur `main` met le site à jour (1 à 2 min). Penser à incrémenter `VERSION` dans `sw.js`.
- Messages de commit en français. L'e-mail de commit du dépôt est l'adresse noreply GitHub
  (configurée localement) : ne pas la remplacer par une adresse personnelle (dépôt public).

## Feuille de route

- **Étape 1 (faite)** : socle PWA, univers Sons (31 sons + 12 paires de sons cousins) et Mots,
  révisions du jour, série de jours, espace parents.
- **Étape 2 (faite)** : banque portée à 373 mots illustrés ; univers **Lecture** (syllabes,
  b/d/p/q, début du mot, lis la phrase et trouve l'image, phrase en ordre, vrai/faux,
  12 petites histoires) et **Grammaire** (un/une, le/la/l', singulier/pluriel, masculin/féminin
  des adjectifs, nom/verbe/adjectif, la phrase, et/est, a/à, être, avoir, aller, verbes en -er),
  avec leçons dans « J'apprends ».
- **Étape 3 (en partie faite)** : jeux Mot mystère, Défi chrono, **Mots mêlés** (liste ou devinettes,
  3 niveaux), **Mots croisés illustrés** (images ou devinettes, grille générée à chaque partie) et exercice **Devinettes** (définitions des 373 mots) ; enregistrement des sons par
  le parent. Reste à faire : Pluie de mots, carte d'aventure avec niveaux à débloquer,
  écriture cursive, plusieurs profils enfants, export Play Store (PWABuilder / Capacitor),
  plus d'histoires et de phrases, passé composé / futur en CE2.
