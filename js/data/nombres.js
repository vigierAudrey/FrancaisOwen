// Univers « Nombres et couleurs » : écrire les nombres en lettres et les noms des couleurs.
// Notation des mots : celle de data/words.js ; « + » relie les parties d'un nombre composé
// (dix-sept = d-i-x=s+s-e=è-(p)-t), le tiret est ajouté automatiquement.
// Une ligne : [notation, valeur ou emoji, définition, fautes fréquentes (pour « le mot bien écrit »)]
// ⚠️ Les ids de progression sont « nombre:<mot> » et « couleur:<mot> » : ne pas renommer.

export const NUMBER_GROUPS = [
  {
    id: 'n0-10',
    label: 'Les nombres de 0 à 10',
    short: '0 à 10',
    emoji: '🔢',
    rows: [
      ['z-é|r-o', 0, 'Rien du tout ! Le nombre qui vient avant un.', ['zero', 'zérot', 'zairo']],
      ['un', 1, 'Le tout premier nombre quand on compte.', ['hun', 'uns', 'unn']],
      ['d-eu-(x)', 2, 'Comme les yeux ou les oreilles.', ['deu', 'deus', 'deuz']],
      ['t-r-oi-(s)', 3, 'Le nombre qui vient juste après deux.', ['troi', 'troa', 'troix']],
      ['qu-a|t-r-(e)', 4, 'Le nombre de pattes d’un chien.', ['katre', 'catre', 'quatr']],
      ['c-in-q', 5, 'Le nombre de doigts d’une main.', ['sinq', 'cinc', 'sink']],
      ['s-i-x=s', 6, 'Le plus grand nombre de points sur un dé.', ['sis', 'cis', 'sice']],
      ['s-e=è-(p)-t', 7, 'Le nombre de jours dans une semaine.', ['set', 'cète', 'sette']],
      ['(h)-u-i-t', 8, 'Le nombre de bras d’une pieuvre.', ['uit', 'huite', 'huitt']],
      ['n-eu-f', 9, 'Le nombre qui vient juste avant dix.', ['neuff', 'nef', 'neufe']],
      ['d-i-x=s', 10, 'Le nombre de doigts de tes deux mains.', ['dis', 'disse', 'dixe']],
    ],
  },
  {
    id: 'n11-20',
    label: 'Les nombres de 11 à 20',
    short: '11 à 20',
    emoji: '🔟',
    rows: [
      ['on|z-(e)', 11, 'Dix et encore un.', ['onse', 'honze', 'onz']],
      ['d-ou|z-(e)', 12, 'Le nombre de mois dans une année.', ['douse', 'douz', 'doûze']],
      ['t-r-ei|z-(e)', 13, 'Dix et encore trois.', ['trèze', 'treise', 'traize']],
      ['qu-a|t-o-r|z-(e)', 14, 'Dix et encore quatre.', ['catorze', 'quatorse', 'katorze']],
      ['qu-in|z-(e)', 15, 'Dix et encore cinq.', ['kinze', 'quinse', 'cinze']],
      ['s-ei|z-(e)', 16, 'Dix et encore six.', ['sèze', 'seise', 'saize']],
      ['d-i-x=s+s-e=è-(p)-t', 17, 'Dix et encore sept.', ['dis-sept', 'dix-set', 'dixsept']],
      ['d-i-x=z+(h)-u-i-t', 18, 'Dix et encore huit.', ['dis-huit', 'dix-uit', 'dixhuit']],
      ['d-i-x=z+n-eu-f', 19, 'Le nombre qui vient juste avant vingt.', ['dis-neuf', 'dixneuf', 'dix-neuve']],
      ['v-in-(g)-(t)', 20, 'Deux dizaines : dix et encore dix.', ['vin', 'vint', 'vain']],
    ],
  },
  {
    id: 'dizaines',
    label: 'Les dizaines',
    short: 'Dizaines',
    emoji: '💯',
    rows: [
      ['t-r-en|t-(e)', 30, 'Trois dizaines.', ['trante', 'tremte', 'trentte']],
      ['qu-a|r-an|t-(e)', 40, 'Quatre dizaines.', ['karante', 'quarente', 'carante']],
      ['c-in|qu-an|t-(e)', 50, 'Cinq dizaines : la moitié de cent.', ['sinquante', 'cinquente', 'cinkante']],
      ['s-oi|x=s-an|t-(e)', 60, 'Six dizaines : le nombre de minutes dans une heure.', ['soisante', 'soixente', 'swasante']],
      ['s-oi|x=s-an|t-(e)+d-i-x=s', 70, 'Sept dizaines : soixante et encore dix.', ['soixante-dis', 'soissante-dix', 'soixantedix']],
      ['qu-a|t-r-(e)+v-in-(g)-(t)-(s)', 80, 'Huit dizaines : quatre fois vingt.', ['quatre-vins', 'catre-vingts', 'quatrevingts']],
      ['qu-a|t-r-(e)+v-in-(g)-(t)+d-i-x=s', 90, 'Neuf dizaines : juste avant cent.', ['quatre-vingts-dix', 'catre-vingt-dix', 'quatre-vin-dix']],
      ['c=s-en-(t)', 100, 'Dix dizaines ! Un très grand nombre.', ['cen', 'sen', 'cant']],
      ['m-i|ll=l-(e)', 1000, 'Dix fois cent : un nombre énorme !', ['mile', 'mill', 'myle']],
    ],
  },
];

export const COLORS = [
  ['r-ou|g=j-(e)', '🔴', 'La couleur des fraises et des camions de pompiers.', ['rouje', 'rougue', 'rooge'], ['🍓', '🍅', '🚒', '🍒']],
  ['b-l-eu', '🔵', 'La couleur du ciel quand il fait beau.', ['bleux', 'blleu', 'bleut'], ['🐳', '💙', '👖', '🦋']],
  ['v-e=è-r-(t)', '🟢', 'La couleur de l’herbe et des feuilles.', ['ver', 'vair', 'vertt'], ['🐸', '🥦', '🍀', '🌲']],
  ['j-au|n-(e)', '🟡', 'La couleur du soleil et des bananes.', ['jone', 'jaunne', 'geaune'], ['🍌', '🐥', '🌻', '🍋']],
  ['o|r-an|g=j-(e)', '🟠', 'La couleur des carottes et des citrouilles.', ['oranje', 'orenge', 'orrange'], ['🥕', '🎃', '🍊', '🦊']],
  ['v-i|o|l-e=è-(t)', '🟣', 'La couleur des aubergines et des prunes.', ['violé', 'violait', 'viollet'], ['🍆', '🍇', '🔮', '☂️']],
  ['r-o|s=z-(e)', '🩷', 'La couleur des cochons et de la barbe à papa.', ['roze', 'rause', 'rosse'], ['🐷', '🌸', '🦩', '🎀']],
  ['n-oi-r', '⚫', 'La couleur de la nuit sans étoiles.', ['noar', 'nwar', 'noirr'], ['🎩', '🕷️', '🎱', '🐈‍⬛']],
  ['b-l-an-(c)', '⚪', 'La couleur de la neige et du lait.', ['blan', 'blant', 'blanq'], ['⛄', '🥛', '☁️', '🦷']],
  ['m-a-r|r-on', '🟤', 'La couleur du chocolat et des troncs d’arbres.', ['maron', 'marons', 'marrond'], ['🐻', '🌰', '🍫', '🪵']],
  ['g-r-i-(s)', '🩶', 'La couleur des souris et des nuages de pluie.', ['gri', 'grit', 'grix'], ['🐘', '🐭', '🪨', '🐺']],
];
