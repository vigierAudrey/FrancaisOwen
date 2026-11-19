// Banque de mots illustrés.
// Une ligne = « notation emoji genre ».
//
// Notation : syllabes écrites séparées par « | », graphèmes par « - ».
//   (x)    lettre muette          ch-a-(t)        → chat
//   x=son  graphème qui ne se lit pas comme d'habitude : s=z (rose), g=j (girafe),
//          c=s (cerise), e=è (mer), en=in (chien), ll=ill (fille)…
// Le son par défaut de chaque graphème est défini dans lang/word.js.
// ⚠️ L'identifiant de progression d'un mot est le mot lui-même : ne pas le renommer.

export const THEMES = [
  { id: 'animaux', label: 'Les animaux', emoji: '🐾' },
  { id: 'manger', label: 'À manger', emoji: '🍎' },
  { id: 'maison', label: 'La maison', emoji: '🏠' },
  { id: 'ecole', label: 'L’école', emoji: '🎒' },
  { id: 'vetements', label: 'Les vêtements', emoji: '👕' },
  { id: 'corps', label: 'Le corps', emoji: '🖐️' },
  { id: 'nature', label: 'La nature', emoji: '🌳' },
  { id: 'transports', label: 'Les transports', emoji: '🚗' },
  { id: 'gens', label: 'Les personnes', emoji: '🧑' },
  { id: 'jeux', label: 'Jeux et musique', emoji: '🎸' },
];

export const RAW_WORDS = {
  animaux: `
    ch-a-(t) 🐱 m
    ch-i-en=in 🐶 m
    l-ou-(p) 🐺 m
    r-e|n-a-r-(d) 🦊 m
    l-a|p-in 🐰 m
    s-ou|r-i-(s) 🐭 f
    ch-e|v-a-l 🐴 m
    v-a|ch-(e) 🐮 f
    c-o|ch-on 🐷 m
    m-ou|t-on 🐑 m
    p-ou|l-(e) 🐔 f
    c-o-q 🐓 m
    c-a|n-a-r-(d) 🦆 m
    l-i|on 🦁 m
    t-i|g-r-(e) 🐯 m
    ou-r-s 🐻 m
    p-an|d-a 🐼 m
    s-in|g=j-(e) 🐒 m
    é|l-é|ph-an-(t) 🐘 m
    g=j-i|r-a|f-(e) 🦒 f
    z-è|b-r-(e) 🦓 m
    c-r-o|c-o|d-i|l-(e) 🐊 m
    s-e=è-r|p-en-(t) 🐍 m
    t-o-r|t-u-(e) 🐢 f
    g-r-e|n-ou-ill-(e) 🐸 f
    p-oi-s|s-on 🐟 m
    b-a|l-ei|n-(e) 🐋 f
    d-au|ph-in 🐬 m
    r-e|qu-in 🦈 m
    p-i-eu|v-r-(e) 🐙 f
    c-r-a|b-(e) 🦀 m
    a|b-e=è-ill-(e) 🐝 f
    p-a|p-i|ll=ill-on 🦋 m
    c-o-c|c=s-i|n-e=è-l|l-(e) 🐞 f
    f-ou-r|m-i 🐜 f
    e=è-s|c-a-r|g-o-(t) 🐌 m
    a|r-ai|gn-é-(e) 🕷️ f
    (h)-i|b-ou 🦉 m
    p-in|g-ou=w-in 🐧 m
    p-e=è-r|r-o|qu-e=è-(t) 🦜 m
    ai|g-l-(e) 🦅 m
    ch-a|m-eau 🐪 m
    k-an|g-ou|r-ou 🦘 m
    k-o|a|l-a 🐨 m
    (h)-é|r-i-s|s-on 🦔 m
    é|c-u|r-eu-il 🐿️ m
    ch-è|v-r-(e) 🐐 f
    d-in|d-(e) 🦃 f
    c-o|l-om|b-(e) 🕊️ f
    d-r-a|g-on 🐉 m
    l-i|c-o-r|n-(e) 🦄 f
    d-i|n-o|s-au|r-(e) 🦕 m
    m-ou|ch-(e) 🪰 f
    v-e=è-r 🪱 m
    l-é|z-a-r-(d) 🦎 m
    oi|s=z-eau 🐦 m
    r-a-(t) 🐀 m
    ph-o|qu-(e) 🦭 m
    c=s-y|gn-(e) 🦢 m
    f-l-a|m-an-(t) 🦩 m
    ch-e|n-i|ll=ill-(e) 🐛 f
    rh=r-i|n-o|c=s-é|r-o-s 🦏 m
    (h)-i-p|p-o|p-o|t-a|m-(e) 🦛 m
    g-o|r-i|ll=ill-(e) 🦍 m
    l-é|o|p-a-r-(d) 🐆 m
    s-c-o-r|p-i-on 🦂 m
    m-ou-s|t-i|qu-(e) 🦟 m
    g-r-i|ll=ill-on 🦗 m
    (h)-o|m-a-r-(d) 🦞 m
    c-r-e|v-e=è-t|t-(e) 🦐 f
    l-ou|t-r-(e) 🦦 f
    c-a-s|t-o-r 🦫 m
    m-a-m|m-ou-th 🦣 m
    l-a|m-a 🦙 m
    b-i|s=z-on 🦬 m
    p-ou|ss-in 🐥 m
    d-r-o|m-a|d-ai|r-(e) 🐫 m
    s-an|g-l-i-er 🐗 m
    b-œu-f 🐂 m
    b-é|l-i-er 🐏 m
    b-l-ai|r-eau 🦡 m
    m-é|d-u|s=z-(e) 🪼 f
    s-c-a|r-a|b-é-(e) 🪲 m
  `,
  manger: `
    p-o-m|m-(e) 🍎 f
    p-oi|r-(e) 🍐 f
    b-a|n-a|n-(e) 🍌 f
    c=s-e|r-i|s=z-(e) 🍒 f
    f-r-ai|s=z-(e) 🍓 f
    r-ai|s=z-in 🍇 m
    c=s-i|t-r-on 🍋 m
    o|r-an|g=j-(e) 🍊 f
    a|n-a|n-a-s 🍍 m
    p-ê|ch-(e) 🍑 f
    m-e|l-on 🍈 m
    p-a-s|t-è|qu-(e) 🍉 f
    m-an|gu-(e) 🥭 f
    m-y-r|t-i|ll=ill-(e) 🫐 f
    c=s-i|t-r-ou-ill-(e) 🎃 f
    o|l-i|v-(e) 🫒 f
    c-a|r-o-t|t-(e) 🥕 f
    t-o|m-a|t-(e) 🍅 f
    ch-am|p-i|gn-on 🍄 m
    m-a|ï-s 🌽 m
    p-a|t-a|t-(e) 🥔 f
    au|b-e=è-r|g=j-i|n-(e) 🍆 f
    b-r-o|c-o|l-i 🥦 m
    c-on|c-om|b-r-(e) 🥒 m
    a|v-o|c-a-(t) 🥑 m
    k-i|w-i 🥝 m
    p-ain 🍞 m
    b-a|gu-e=è-t|t-(e) 🥖 f
    c-r-oi-s|s-an-(t) 🥐 m
    f-r-o|m-a|g=j-(e) 🧀 m
    l-ai-(t) 🥛 m
    œu-f 🥚 m
    b-eu-r|r-(e) 🧈 m
    m-i-e=è-l 🍯 m
    s-e=è-l 🧂 m
    g-â|t-eau 🎂 m
    t-a-r|t-(e) 🥧 f
    b-on|b-on 🍬 m
    s-u|c=s-e=è-t|t-(e) 🍭 f
    g-l-a|c=s-(e) 🍦 f
    ch-o|c-o|l-a-(t) 🍫 m
    b-i-s|c-u-i-(t) 🍪 m
    c-r-ê|p-(e) 🥞 f
    p-i-z|z-a 🍕 f
    f-r-i|t-(e) 🍟 f
    s-ou|p-(e) 🍲 f
    s-a|l-a|d-(e) 🥗 f
    p-ou|l-e=è-(t) 🍗 m
    v-i-an|d-(e) 🥩 f
    r-i-(z) 🍚 m
    c-a|f-é ☕ m
    j-u-(s) 🧃 m
    b-o-l 🥣 m
    ch-â|t-ai|gn-(e) 🌰 f
    g-au|f-r-(e) 🧇 f
    b-ei|gn-e=è-(t) 🍩 m
    f-l-an 🍮 m
    (h)-a|r-i|c-o-(t) 🫘 m
    a-il=ill 🧄 m
    ch-ou 🥬 m
    g-l-a|ç-on 🧊 m
    th-é 🍵 m
    b-i|b-e|r-on 🍼 m
    p-i|m-en-(t) 🌶️ m
    p-oi|v-r-on 🫑 m
  `,
  maison: `
    m-ai|s=z-on 🏠 f
    p-o-r|t-(e) 🚪 f
    f-e|n-ê|t-r-(e) 🪟 f
    l-i-(t) 🛏️ m
    ch-ai|s=z-(e) 🪑 f
    c-a|n-a|p-é 🛋️ m
    am|p-ou|l-(e) 💡 f
    c-l-é 🔑 f
    b-ou|g=j-i-(e) 🕯️ f
    m-i|r-oi-r 🪞 m
    t-é|l-é 📺 f
    r-é|v-e=è-il ⏰ m
    t-é|l-é|ph-o|n-(e) 📞 m
    b-ai|gn-oi|r-(e) 🛁 f
    d-ou|ch-(e) 🚿 f
    s-a|v-on 🧼 m
    é|p-on|g=j-(e) 🧽 f
    b-a|l-ai 🧹 m
    s-eau 🪣 m
    p-a|n-i-er 🧺 m
    c-l-o|ch-(e) 🔔 f
    c-a|d-eau 🎁 m
    p-a|r-a|p-l-u-i-(e) ☂️ m
    c-ou|t-eau 🔪 m
    f-ou-r|ch-e=è-t|t-(e) 🍴 f
    c-u-i|ll=ill-è|r-(e) 🥄 f
    a-s|s-i-e=è-t|t-(e) 🍽️ f
    b-ou|t-e=è-ill-(e) 🍾 f
    m-a-r|t-eau 🔨 m
    b-oî|t-(e) 📦 f
    l-e=è-t|t-r-(e) ✉️ f
    ai|m-an-(t) 🧲 m
    v-a|l-i|s=z-(e) 🧳 f
    r-a|d-i-o 📻 f
    (h)-o-r|l-o|g=j-(e) 🕰️ f
    p-i|l-(e) 🔋 f
    r-a|s=z-oi-r 🪒 m
    t-a|b-l-eau 🖼️ m
    p-l-an|t-(e) 🪴 f
    p-ou|b-e=è-l|l-(e) 🗑️ f
    é|ch-e=è-l|l-(e) 🪜 f
    l-am|p-(e) 🔦 f
    c-a|d-e|n-a-(s) 🔒 m
    ch-a|r-i-o-(t) 🛒 m
    ch-â|t-eau 🏰 m
    j-a-r|d-in 🏡 m
    b-r-i|qu-(e) 🧱 f
    b-û|ch-(e) 🪵 f
    f-i-l 🧵 m
  `,
  ecole: `
    é|c-o|l-(e) 🏫 f
    l-i|v-r-(e) 📕 m
    c-a|(h)-i-er 📓 m
    c-r-a=è|y=ill-on ✏️ m
    s-t-y|l-o 🖊️ m
    p-in|c=s-eau 🖌️ m
    r-è|g-l-(e) 📏 f
    c-a-r|t-a|b-l-(e) 🎒 m
    p-a|l-e=è-t|t-(e) 🎨 f
    o-r|d-i|n-a|t-eu-r 💻 m
    l-ou|p-(e) 🔍 f
    c-a-r|t-(e) 🗺️ f
    c-a|l-en|d-r-i-er 📅 m
    t-r-om|b-o|n-(e) 📎 m
    é|qu-e=è-r|r-(e) 📐 f
    p-u|n-ai|s=z-(e) 📌 f
    j-ou-r|n-a-l 📰 m
  `,
  vetements: `
    r-o|b-(e) 👗 f
    ch-e|m-i|s=z-(e) 👔 f
    p-an|t-a|l-on 👖 m
    ch-au-s|s-u|r-(e) 👞 f
    ch-au-s|s-e=è-t|t-(e) 🧦 f
    ch-a|p-eau 🎩 m
    c-a-s|qu-e=è-t|t-(e) 🧢 f
    b-o-t|t-(e) 👢 f
    g-an-(t) 🧤 m
    é|ch-a-r|p-(e) 🧣 f
    m-an|t-eau 🧥 m
    c-ou|r-o-n|n-(e) 👑 f
    b-a|gu-(e) 💍 f
    s-a-c 👜 m
    m-a|ill-o-(t) 🩱 m
    c-o-l|l-i-er 📿 m
    s-an|d-a|l-(e) 👡 f
    b-l-ou|s=z-(e) 🥼 f
    g=j-i|l-e=è-(t) 🦺 m
    k-i|m-o|n-o 👘 m
    n-œu-(d) 🎀 m
    c-a-s|qu-(e) ⛑️ m
    m-on|t-r-(e) ⌚ f
  `,
  corps: `
    m-ain ✋ f
    p-i-e=é-(d) 🦶 m
    n-ez 👃 m
    b-ou|ch-(e) 👄 f
    œ=eu-il 👁️ m
    o|r-e=è-ill-(e) 👂 f
    d-en-(t) 🦷 f
    j-am|b-(e) 🦵 f
    b-r-a-(s) 💪 m
    c-œu-r ❤️ m
    l-an|gu-(e) 👅 f
    c=s-e=è-r|v-eau 🧠 m
    o-s 🦴 m
    p-ou|m-on 🫁 m
    p-ou|c=s-(e) 👍 m
    b-a-r|b-(e) 🧔 f
    s-an-(g) 🩸 m
    b-i|s=z-ou 💋 m
  `,
  nature: `
    s-o|l-e=è-il ☀️ m
    l-u|n-(e) 🌙 f
    é|t-oi|l-(e) ⭐ f
    n-u|a|g=j-(e) ☁️ m
    p-l-u-i-(e) 🌧️ f
    n-ei|g=j-(e) ❄️ f
    é|c-l-ai-r ⚡ m
    v-en-(t) 🌬️ m
    f-eu 🔥 m
    g-ou-t|t-(e) 💧 f
    f-l-eu-r 🌸 f
    r-o|s=z-(e) 🌹 f
    t-u|l-i|p-(e) 🌷 f
    a-r|b-r-(e) 🌳 m
    f-eu-ill-(e) 🍃 f
    s-a|p-in 🎄 m
    c-a-c|t-u-s 🌵 m
    m-on|t-a|gn-(e) ⛰️ f
    v-o-l|c-an 🌋 m
    m-e=è-r 🌊 f
    p-l-a|g=j-(e) 🏖️ f
    î|l-(e) 🏝️ f
    c-o|qu-i|ll=ill-a|g=j-(e) 🐚 m
    p-i-e=è-r|r-(e) 🪨 f
    t-e=è-r|r-(e) 🌍 f
    f-o|r-ê-(t) 🌲 f
    d-é|s=z-e=è-r-(t) 🏜️ m
    t-ou-r|n-e|s-o-l 🌻 m
    b-l-é 🌾 m
    g-r-ai|n-(e) 🌱 f
    n-i-(d) 🪺 m
    c-o|m-è|t-(e) ☄️ f
    p-l-a|n-è|t-(e) 🪐 f
    b-r-ou|ill-a-r-(d) 🌫️ m
    (h)-e=è-r|b-(e) 🌿 f
    t-oi|l-(e) 🕸️ f
  `,
  transports: `
    v-é|l-o 🚲 m
    v-oi|t-u|r-(e) 🚗 f
    b-u-s 🚌 m
    c-a|m-i-on 🚚 m
    t-r-ain 🚆 m
    a|v-i-on ✈️ m
    b-a|t-eau 🚢 m
    f-u|s=z-é-(e) 🚀 f
    m-o|t-o 🏍️ f
    t-r-a-c|t-eu-r 🚜 m
    (h)-é|l-i|c-o-p|t-è|r-(e) 🚁 m
    t-a|x-i 🚕 m
    t-r-o-t|t-i|n-e=è-t|t-(e) 🛴 f
    am|b-u|l-an|c=s-(e) 🚑 f
    p-a|r-a|ch-u|t-(e) 🪂 m
    m-é|t-r-o 🚇 m
    r-ou-(e) 🛞 f
    v-oi|l-i-er ⛵ m
    an|c-r-(e) ⚓ f
    r-ou|t-(e) 🛣️ f
    p-on-(t) 🌉 m
    l-u|g=j-(e) 🛷 f
  `,
  gens: `
    b-é|b-é 👶 m
    g-a-r|ç-on 👦 m
    f-i|ll=ill-(e) 👧 f
    m-a|m-an 👩 f
    p-a|p-a 👨 m
    r-oi 🤴 m
    r-ei|n-(e) 👸 f
    f-é-(e) 🧚 f
    s-o-r|c=s-i-è|r-(e) 🧙‍♀️ f
    p-i|r-a|t-(e) 🏴‍☠️ m
    f-an|t-ô|m-(e) 👻 m
    r-o|b-o-(t) 🤖 m
    p-om|p-i-er 🧑‍🚒 m
    p-o|l-i|c=s-i-er 👮 m
    m-é|d-e|c=s-in 🧑‍⚕️ m
    c-u-i|s=z-i|n-i-er 🧑‍🍳 m
    m-a|g=j-i|c=s-i-en=in 🧙 m
    m-a|m-i-(e) 🧓 f
    p-a|p-i 👴 m
    a-s|t-r-o|n-au|t-(e) 🧑‍🚀 m
    f-e=è-r|m-i-er 🧑‍🌾 m
    p-ein|t-r-(e) 🧑‍🎨 m
    m-aî|t-r-e=è-s|s-(e) 🧑‍🏫 f
    v-am|p-i|r-(e) 🧛 m
    s-i|r-è|n-(e) 🧜 f
    g=j-é|n-i-(e) 🧞 m
    o|g-r-(e) 👹 m
    p-i|l-o|t-(e) 🧑‍✈️ m
  `,
  jeux: `
    b-a-l|l-on ⚽ m
    t-am|b-ou-r 🥁 m
    gu-i|t-a|r-(e) 🎸 f
    p-i|a|n-o 🎹 m
    t-r-om|p-e=è-t|t-(e) 🎺 f
    v-i|o|l-on 🎻 m
    d-é 🎲 m
    ou-r|s-on 🧸 m
    m-a-s|qu-(e) 🎭 m
    r-a|qu-e=è-t|t-(e) 🎾 f
    c-ou|p-(e) 🏆 f
    m-é|d-a-ill-(e) 🏅 f
    t-en|t-(e) ⛺ f
    s-k-i 🎿 m
    p-a|t-in ⛸️ m
    y=ill-o|y=ill-o 🪀 m
    c=s-i|b-l-(e) 🎯 f
    qu-i|ll=ill-(e) 🎳 f
    m-i|c-r-o 🎤 m
    ph-o|t-o 📷 f
    c=s-i-r|qu-(e) 🎪 m
    m-a|n-è|g=j-(e) 🎠 m
    p-i-on ♟️ m
    m-a|n-e=è-t|t-(e) 🎮 f
    f-ê|t-(e) 🎉 f
    b-ou|l-(e) 🔮 f
    a-r-c 🏹 m
    é|p-é-(e) ⚔️ f
    b-ou|c-l-i-er 🛡️ m
    d-i|a|m-an-(t) 💎 m
    t-r-é|s=z-o-r 💰 m
    b-ou-s|s-o|l-(e) 🧭 f
  `,
};

// Mots-outils : mots très fréquents à reconnaître « d'un coup d'œil ».
// La phrase d'exemple est lue pour lever toute ambiguïté (« est » / « et »).
// Les mots d'un même groupe `homo` se prononcent pareil : jamais proposés ensemble à l'écoute.
export const SIGHT_WORDS = [
  ['le', 'Le chat dort.'],
  ['la', 'La pomme est rouge.'],
  ['les', 'Les enfants jouent.'],
  ['un', 'J’ai un chien.'],
  ['une', 'Je mange une poire.'],
  ['des', 'Il y a des fleurs.'],
  ['et', 'Papa et maman.', 'e'],
  ['est', 'Le ciel est bleu.', 'e'],
  ['il', 'Il court vite.'],
  ['elle', 'Elle chante.'],
  ['je', 'Je lis un livre.'],
  ['tu', 'Tu viens jouer ?'],
  ['dans', 'Le chat est dans la boîte.'],
  ['sur', 'Le livre est sur la table.'],
  ['sous', 'Le chien dort sous le lit.'],
  ['avec', 'Je joue avec mon ami.'],
  ['pour', 'C’est un cadeau pour toi.'],
  ['mais', 'Il pleut, mais je sors.'],
  ['ou', 'Du lait ou du jus ?'],
  ['qui', 'Qui est là ?'],
  ['mon', 'C’est mon vélo.'],
  ['ma', 'C’est ma maison.'],
  ['ton', 'Où est ton sac ?'],
  ['de', 'Une tasse de lait.'],
  ['du', 'Je bois du lait.'],
  ['au', 'Je vais au parc.'],
  ['on', 'On va à l’école.'],
  ['nous', 'Nous chantons.'],
  ['vous', 'Vous êtes là ?'],
  ['a', 'Il a un ballon.', 'a'],
  ['à', 'Je vais à la plage.', 'a'],
  ['pas', 'Je ne dors pas.'],
  ['très', 'Il est très grand.'],
  ['aussi', 'Moi aussi !'],
  ['voici', 'Voici mon ami.'],
  ['bien', 'C’est bien !'],
  ['quand', 'Quand viens-tu ?'],
  ['comme', 'Il court comme le vent.'],
  ['puis', 'Je mange, puis je joue.'],
  ['chez', 'Je vais chez papi.'],
].map(([w, ex, homo]) => ({ w, ex, homo }));
