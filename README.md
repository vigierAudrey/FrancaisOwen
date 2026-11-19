# 🦜 Français Owen

Application pour apprendre **les sons, les mots et la lecture** en s'amusant (conçue pour un
enfant de 7 ans, CE1). Elle fonctionne sur smartphone, tablette et PC, s'installe comme une
vraie application et marche **hors connexion**. Projet jumeau de Maths Owen.

👉 **Jouer / installer : https://vigieraudrey.github.io/FrancaisOwen/**

## Ce qu'il y a dedans

**👂 Les sons** : 31 sons (voyelles, ou, on, an, in, oi, eu, ch, gn, ill, consonnes) et
12 paires de « sons cousins » souvent confondus (p/b, t/d, f/v, ch/j, s/z, an/on, é/è…).
Jeux : 📖 J'apprends · 👂 J'entends ? · 🎵 Quel son ? · ✍️ Complète le mot ·
📍 Où est le son ? (dans quelle syllabe) · 🔍 La bonne écriture (o / au / eau…) · 🧺 Chasse aux sons.

**📚 Les mots** : 373 mots illustrés en 10 thèmes (animaux, à manger, maison, école,
vêtements, corps, nature, transports, personnes, jeux et musique) et 40 mots-outils
(et, est, dans, avec…). Jeux : 📖 J'apprends · 🎧 Écoute et trouve · 👀 Lis et trouve ·
✅ Le mot bien écrit · 🧩 Les syllabes · ⌨️ J'écris le mot · 🃏 Memory.

**📖 La lecture** : tableau des syllabes, 🔤 Lis la syllabe, 🧱 Fabrique la syllabe, 🪞 b d p q,
🔎 Le début du mot, 🖼️ Lis la phrase et trouve l'image (« trois pommes », « un chat et un chien »),
🚂 La phrase en ordre, 🤔 Vrai ou faux ?, 📚 12 petites histoires avec questions.

**✏️ La grammaire** (avec une petite leçon à écouter pour chaque règle) : un / une, le / la / l',
singulier / pluriel, masculin / féminin (petit / petite), nom, verbe ou adjectif, la phrase
(majuscule et point), et / est, a / à, conjugaison de être, avoir, aller et des verbes en -er.

**🎮 Les jeux** : Chasse aux sons, Memory, 🕵️ Le mot mystère, ⏱️ Défi chrono, méli-mélos.

**Pour bien lire** : les mots sont écrits comme en classe, avec les syllabes en couleur
(bleu / rouge) et les lettres muettes en gris, dans une police faite pour les jeunes lecteurs (Andika).
Tout peut être écouté (voix de l'appareil).

**Pour mémoriser** :
- les mots ratés reviennent plus souvent (répétition espacée) ;
- chaque erreur est expliquée (« Dans bateau, le son o s'écrit eau ») ;
- 🔁 **Révisions du jour** : les mots à revoir pour ne pas les oublier, tous univers mélangés ;
- « Rejouer mes erreurs » après chaque partie.

**Pour s'amuser** : étoiles ⭐, niveaux (de 🐣 à 👑), 50 autocollants, médailles, séries 🔥 de
bonnes réponses et de jours d'affilée, records, et Plume le perroquet 🦜.

**Espace parents** (protégé par un petit calcul) : choisir les notions travaillées dans chaque
univers, le prénom, le nombre de questions, la voix (test, vitesse), les syllabes en couleur ;
🎙️ enregistrer sa propre voix pour chaque son ; voir les
progrès mot par mot et les mots difficiles ; exporter / importer la sauvegarde.

**Bientôt** : la pluie de mots, la carte de l'aventure, plusieurs profils.

## Essayer sur l'ordinateur

```bash
cd FrançaisOwen
python3 -m http.server 8000
```
Puis ouvrir http://localhost:8000

## La voix

Les exercices de sons ont besoin de la voix de l'appareil. Sur Android, installer/activer
« Synthèse vocale Google » en français ; sur iPhone et Mac, la voix française est fournie.
Le bouton « 🔊 Tester la voix » de l'espace parents permet de vérifier. Les sons isolés
(« ch », « f »…) sont parfois mal prononcés par la synthèse : vous pouvez les enregistrer
vous-même dans l'espace parents (🎙️ Ma voix pour les sons ; nécessite une adresse https ou localhost).

## Mettre en ligne pour l'installer

Fichiers statiques : n'importe quel hébergement gratuit en **https** convient (GitHub Pages,
Netlify…). Puis sur le téléphone : Android (Chrome) menu ⋮ → « Installer l'application » ;
iPhone (Safari) Partager → « Sur l'écran d'accueil ».

## Structure

Voir [CLAUDE.md](CLAUDE.md) (architecture, ajouter des mots, un exercice, un univers ; feuille de route).
