// Phrases et petits textes pour la lecture et la grammaire.
// « {nom} » est remplacé par le prénom de l'enfant.

// Phrases simples (remettre dans l'ordre, la phrase bien écrite).
export const SENTENCES = [
  'Le chat dort sur le lit.', 'Papa lit un livre.', 'La vache mange de l’herbe.',
  'Le chien joue avec la balle.', 'Maman fait un gâteau.', 'Le loup a de grandes dents.',
  'Les poissons nagent dans la mer.', 'Je mange une pomme rouge.', 'Le soleil brille dans le ciel.',
  'Tom monte dans le train.', 'La fusée part vers la lune.', 'Le bébé boit son biberon.',
  'Il pleut sur la maison.', 'Les oiseaux chantent le matin.', 'Ma sœur aime les bonbons.',
  'Le pirate cherche un trésor.', 'La fée a une baguette magique.', 'Le dragon crache du feu.',
  'Nous allons à la plage.', 'Le lapin court dans le jardin.', 'Lili dessine un bateau.',
  'Le roi porte une couronne.', 'Mon vélo est tout neuf.', 'La poule pond un œuf.',
  'Le singe mange une banane.', 'Le hibou vole la nuit.', 'La tortue avance doucement.',
  'Le cuisinier prépare la soupe.', 'Il neige sur la montagne.', '{nom} joue au ballon.',
  'Le cheval galope dans le pré.', 'La sorcière a un chat noir.', 'Les enfants rient fort.',
  'Le robot parle à la lune.', 'Mamie tricote une écharpe.',
];

// Vrai ou faux ? (lecture et compréhension)
export const FACTS = [
  ['Le poisson vit dans l’eau.', true], ['La neige est froide.', true], ['Le soleil brille le jour.', true],
  ['La vache donne du lait.', true], ['Le feu est chaud.', true], ['Les oiseaux ont des plumes.', true],
  ['On met des chaussettes aux pieds.', true], ['La banane est jaune.', true], ['Un chat a quatre pattes.', true],
  ['On dort dans un lit.', true], ['Le pompier éteint le feu.', true], ['La lune brille la nuit.', true],
  ['Une voiture a quatre roues.', true], ['La fraise est rouge.', true], ['Le bébé boit du lait.', true],
  ['Le chien a des ailes.', false], ['La glace est brûlante.', false], ['On mange avec ses oreilles.', false],
  ['Le poisson grimpe aux arbres.', false], ['Un éléphant est tout petit.', false], ['On met un chapeau sur ses pieds.', false],
  ['La tortue court très vite.', false], ['Les vaches volent dans le ciel.', false], ['On se lave avec du chocolat.', false],
  ['Le citron est sucré.', false], ['Un bébé conduit le bus.', false], ['La neige est verte.', false],
  ['Le lion fait miaou.', false], ['On écrit avec une banane.', false], ['Le soleil est bleu.', false],
];

// et / est, a / à : phrases à trou (« _ »).
export const HOMOPHONES = {
  'et-est': {
    choices: ['et', 'est'],
    tips: { est: 'On peut dire « était » : le ciel était bleu → « est ».', et: 'On peut dire « et puis » : papa et puis maman → « et ».' },
    est: ['Le ciel _ bleu.', 'La soupe _ chaude.', 'Mon chat _ noir.', 'Papa _ dans le jardin.', 'Le loup _ méchant.', 'Il _ midi.', 'Ma maison _ grande.', 'Le bébé _ content.', 'La mer _ calme.', 'Mon ami _ là.'],
    et: ['Papa _ maman.', 'Un chat _ un chien.', 'Une pomme _ une poire.', 'Il saute _ il court.', 'Le sel _ le poivre.', 'Tom _ Lili jouent.', 'Du pain _ du beurre.', 'Le roi _ la reine.', 'Mon frère _ ma sœur.', 'Il lit _ il dessine.'],
  },
  'a-à': {
    choices: ['a', 'à'],
    tips: { a: 'On peut dire « avait » : il avait un vélo → « a ».', à: 'On ne peut pas dire « avait » → « à » avec un accent.' },
    a: ['Il _ un vélo.', 'Le chat _ faim.', 'Lili _ une robe rouge.', 'Mon frère _ sept ans.', 'Le lapin _ de grandes oreilles.', 'Papa _ une voiture.', 'Elle _ un chien.', 'Le roi _ une couronne.', 'Tom _ peur du noir.', 'La fée _ des ailes.'],
    à: ['Je vais _ l’école.', 'Il joue _ la balle.', 'Nous allons _ la plage.', 'Tom est _ la maison.', 'Elle pense _ son ami.', 'On va _ la piscine.', 'Je donne un os _ mon chien.', 'Il habite _ Paris.', 'Une tarte _ la fraise.', 'Il parle _ sa maman.'],
  },
};

// Petites histoires : chaque question → [question, bonne réponse, autres réponses…]
export const STORIES = [
  {
    id: 'lapin', title: 'Lou le lapin', emoji: '🐰',
    text: 'Lou est un petit lapin gris. Il habite dans un trou, sous un grand arbre. Le matin, Lou mange des carottes. Le soir, il dort avec sa maman.',
    q: [['De quelle couleur est Lou ?', 'gris', 'blanc', 'noir'], ['Où habite Lou ?', 'dans un trou', 'dans une maison', 'dans un nid'], ['Que mange Lou le matin ?', 'des carottes', 'des pommes', 'du pain']],
  },
  {
    id: 'sorciere', title: 'La sorcière Mira', emoji: '🧙‍♀️',
    text: 'La sorcière Mira a un chapeau pointu. Elle vole sur son balai au-dessus de la forêt. Son chat noir s’appelle Minuit. Un jour, elle prépare une soupe magique.',
    q: [['Comment s’appelle le chat ?', 'Minuit', 'Mira', 'Filou'], ['Sur quoi vole la sorcière ?', 'sur un balai', 'sur un tapis', 'sur un dragon'], ['Que prépare-t-elle ?', 'une soupe magique', 'un gâteau', 'une tarte']],
  },
  {
    id: 'plage', title: 'À la plage', emoji: '🏖️',
    text: 'Aujourd’hui, {nom} va à la plage avec papa. Il fait un château de sable. Une vague arrive et casse le château ! {nom} rit et recommence.',
    q: [['Avec qui {nom} va-t-il à la plage ?', 'avec papa', 'avec maman', 'avec papi'], ['Que fait {nom} ?', 'un château de sable', 'un dessin', 'un gâteau'], ['Qui casse le château ?', 'une vague', 'un chien', 'papa']],
  },
  {
    id: 'dragon', title: 'Le dragon gentil', emoji: '🐉',
    text: 'Dans la montagne vit un dragon vert. Il crache du feu, mais il est très gentil. Il aime les bonbons à la fraise. Les enfants viennent jouer avec lui.',
    q: [['De quelle couleur est le dragon ?', 'vert', 'rouge', 'bleu'], ['Comment est le dragon ?', 'gentil', 'méchant', 'triste'], ['Il aime les bonbons…', 'à la fraise', 'au citron', 'à la menthe']],
  },
  {
    id: 'chat', title: 'Filou et la souris', emoji: '🐱',
    text: 'Le chat Filou guette une souris. La souris se cache dans une boîte. Filou attend, attend… et il s’endort ! La souris file dans son trou.',
    q: [['Comment s’appelle le chat ?', 'Filou', 'Minuit', 'Lou'], ['Où se cache la souris ?', 'dans une boîte', 'sous le lit', 'dans un sac'], ['Que fait Filou à la fin ?', 'il s’endort', 'il mange', 'il court']],
  },
  {
    id: 'anniv', title: 'L’anniversaire', emoji: '🎂',
    text: 'C’est l’anniversaire de Lili. Elle a sept ans. Sur le gâteau, il y a sept bougies. Lili souffle très fort et ses amis applaudissent.',
    q: [['Quel âge a Lili ?', 'sept ans', 'six ans', 'huit ans'], ['Combien y a-t-il de bougies ?', 'sept', 'cinq', 'dix'], ['Que font ses amis ?', 'ils applaudissent', 'ils dorment', 'ils pleurent']],
  },
  {
    id: 'fusee', title: 'La fusée de Léo', emoji: '🚀',
    text: 'Léo construit une fusée en carton. Il la peint en rouge et blanc. Il met un casque et compte : trois, deux, un, partez ! Dans sa tête, il vole jusqu’à la lune.',
    q: [['En quoi est la fusée ?', 'en carton', 'en bois', 'en fer'], ['De quelles couleurs est-elle ?', 'rouge et blanc', 'bleu et vert', 'noir et jaune'], ['Jusqu’où vole Léo dans sa tête ?', 'jusqu’à la lune', 'jusqu’à la mer', 'jusqu’à l’école']],
  },
  {
    id: 'poisson', title: 'Le petit poisson', emoji: '🐟',
    text: 'Un petit poisson orange nage dans la mer. Il cherche son ami le crabe. Il le trouve derrière un gros rocher. Ensemble, ils jouent à cache-cache.',
    q: [['De quelle couleur est le poisson ?', 'orange', 'bleu', 'vert'], ['Qui cherche-t-il ?', 'le crabe', 'la baleine', 'le requin'], ['À quoi jouent-ils ?', 'à cache-cache', 'au ballon', 'aux cartes']],
  },
  {
    id: 'neige', title: 'Il a neigé !', emoji: '⛄',
    text: 'Ce matin, tout est blanc dehors. Il a neigé toute la nuit ! {nom} met son bonnet et ses gants. Avec sa sœur, il fait un bonhomme de neige avec une carotte pour le nez.',
    q: [['Pourquoi tout est blanc ?', 'il a neigé', 'il a plu', 'c’est la nuit'], ['Que met {nom} ?', 'son bonnet et ses gants', 'son maillot', 'ses lunettes'], ['Avec quoi font-ils le nez ?', 'une carotte', 'une pomme', 'un bouton']],
  },
  {
    id: 'marche', title: 'Au marché', emoji: '🧺',
    text: 'Maman et Zoé vont au marché. Elles achètent des pommes, du fromage et du pain. Le marchand donne une fraise à Zoé. Elle la mange tout de suite !',
    q: [['Où vont-elles ?', 'au marché', 'à la plage', 'à l’école'], ['Qu’achètent-elles ?', 'des pommes, du fromage et du pain', 'des bonbons et du lait', 'des œufs et du jus'], ['Que donne le marchand à Zoé ?', 'une fraise', 'une banane', 'un bonbon']],
  },
  {
    id: 'robot', title: 'Bip le robot', emoji: '🤖',
    text: 'Bip est un robot tout rond. Il range la chambre de Nina. Il ramasse les jouets et plie les habits. Mais Bip a peur des chats ! Quand le chat arrive, il se cache sous le lit.',
    q: [['Comment est Bip ?', 'tout rond', 'tout carré', 'tout petit'], ['Que fait Bip ?', 'il range la chambre', 'il fait la cuisine', 'il chante'], ['De quoi Bip a-t-il peur ?', 'des chats', 'du noir', 'de l’eau']],
  },
  {
    id: 'ferme', title: 'À la ferme', emoji: '🐄',
    text: 'À la ferme de papi, il y a trois vaches, un cochon et des poules. Le matin, papi donne du foin aux vaches. {nom} ramasse les œufs dans le poulailler.',
    q: [['Combien y a-t-il de vaches ?', 'trois', 'deux', 'quatre'], ['Que donne papi aux vaches ?', 'du foin', 'du pain', 'des carottes'], ['Que ramasse {nom} ?', 'les œufs', 'les pommes', 'les fleurs']],
  },
];
