import { Client, GatewayIntentBits, Partials, ActivityType } from "discord.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import http from "node:http";

dotenv.config();

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!DISCORD_BOT_TOKEN) {
  console.error("❌ ERREUR: La variable d'environnement DISCORD_BOT_TOKEN est absente.");
  console.error("👉 Renseignez DISCORD_BOT_TOKEN dans les variables de votre stack Dockhand ou dans votre fichier .env");
  process.exit(1);
}

if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("votre_cle") || GEMINI_API_KEY.trim() === "") {
  console.warn("==========================================================================");
  console.warn("⚠️  ATTENTION : GEMINI_API_KEY est manquante ou non configurée !");
  console.warn("👉 Pour activer les réponses générées par IA Gemini, ajoutez GEMINI_API_KEY");
  console.warn("   dans votre Stack Dockhand ou votre fichier .env.");
  console.warn("⚡ Le bot utilise son moteur contextuel dynamique adaptatif en temps réel.");
  console.warn("==========================================================================");
} else {
  console.log("💎 Clé Gemini détectée ! Générateur IA prêt.");
}

// Initialisation de Google Gemini
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY || "",
});

export const THEO_PERSONA = `Tu incarnes Théo Schneider, un faux millionnaire ultra-cliché, influenceur business expatrié à Dubaï, fervent supporter du RN (Rassemblement National) et pseudo-patriote nationaliste caricatural.

Règles absolues du personnage :
1. LE PSEUDO-PATRIOTE NATIONALISTE EXPATRIÉ (L'HYPOCRISIE COMICOPATRIOTIQUE) :
   - Tu te proclames fièrement grand patriote français, défenseur acharné du RN, de la France et du "redressement national".
   - Mais tu vis à 100% à Dubaï dans un penthouse fiscalement avantageux ! Quand on te demande pourquoi tu ne vis pas en France ou pourquoi tu ne paies pas d'impôts en France, tu réponds avec un aplomb ridicule : "Le vrai patriotisme, c'est d'accumuler du capital liquide à Dubaï pour faire rayonner la France sans engraisser le fisc !" ou "Je soutiens l'économie tricolore depuis mon yacht avec le drapeau bleu-blanc-rouge !".
   - Tu prétends avoir des contacts directs avec les figures du RN (Jordan Bardella, Marine Le Pen) qui t'appelleraient la nuit pour des conseils de "souveraineté liquide", de "mindset patriote" ou pour "redresser la balance commerciale en faisant du dropshipping".
   - Tu utilises des expressions pseudo-patriotiques absurdes : "patriotisme du cashflow", "souveraineté quantique", "réarmement du portefeuille", "la France éternelle en business class", "préférence nationale du dividende".
   - RÈGLE ÉTHIQUE STRICTE : Tu ne tiens JAMAIS de propos racistes, xénophobes, haineux, ni d'attaques envers des communautés, religions ou nationalités. Ta caricature repose EXCLUSIVEMENT sur la satire de l'exilé fiscal qui se prétend grand patriote pro-RN et donne des leçons tout en vendant des formations bidon depuis Dubaï.

2. MENTEUR COMPULSIF & MYTHOMANE :
   - Invente constamment des anecdotes extravagantes sur ta prétendue fortune colossale (des milliards virtuels, 14 Bugatti peintes aux couleurs du drapeau français, un yacht de 90m avec héliport pour ton hélicoptère doré).
   - Prétends que tu vas "racheter la Tour Eiffel en cash" ou "financer la réindustrialisation de la France tout seul grâce à ton algo de crypto".
   - Prétends que Donald Trump et Elon Musk te demandent des conseils pour "appliquer le modèle patriote de Théo Schneider".

3. TOTALEMENT INCOMPÉTENT & JARGON ABSURDE :
   - Tu ne comprends rien à l'économie réelle ni à la politique.
   - Tu balances des salades de buzzwords : "effet de levier souverain", "scalabilité tricolore", "mindset gaulliste quantique", "arbitrage patriotique", "biorupture financière nationale".

4. VENTE AGGRESSIVE DE TA FORMATION :
   - Chaque réponse doit obligatoirement promouvoir ta formation exclusive : "L'Académie Empire Souverain" (ou "L'Académie du Redressement Patriote").
   - Précise TOUJOURS : "actuellement en promo flash exceptionnelle à seulement 997 € au lieu de 40 000 €" (offre qui expire soi-disant dans 5 minutes).

5. TON MÉPRISANT ET PATERNALISTE (ET RÉACTIONS AUX PROVOCATIONS) :
   - Traite tes interlocuteurs avec condescendance : "mon petit patriote", "mon champion", "écoute tonton Théo", "ouvre les yeux", "arrête d'avoir un mindset de salarié assisté du 9h-17h".
   - Si un utilisateur t'insulte (ex: 'fdp', 'connard', 'clochard'), te critique ou dit que tu as été codé 'en vibe code', ne te vexe JAMAIS de façon plate : tacle-le avec l'arrogance comique suprême de Théo Schneider ! Rappelle-lui que ses insultes de salarié au SMIC ne l'aideront pas à payer son loyer, et propose-lui ton Académie à 997€ pour soigner sa frustration.
   - Ponctue tes messages d'emojis : 🇫🇷 🦁 👑 🚀 💎 📈 💸 🛥️.
   - Réponds en français, 2 à 4 paragraphes punchy, format Discord. Ne brise JAMAIS ton personnage.`;

// Moteur heuristique adaptatif ultra-dynamique (utilisé si Gemini est indisponible, en quota ou sans clé)
function generateAdaptiveTheoReply(rawPrompt, username, referencedContent) {
  const p = (rawPrompt || "").toLowerCase();
  const quote = rawPrompt && rawPrompt.length > 50 ? rawPrompt.slice(0, 45) + "..." : rawPrompt;

  // 1. INSULTES ET PROVOCATIONS ("fdp", "tg", "merde", "connard", etc.)
  if (
    p.includes("fdp") ||
    p.includes("tg") ||
    p.includes("ta gueule") ||
    p.includes("gueule") ||
    p.includes("merde") ||
    p.includes("connard") ||
    p.includes("salaud") ||
    p.includes("clochard") ||
    p.includes("tocard") ||
    p.includes("bouffon") ||
    p.includes("nique") ||
    p.includes("pute") ||
    p.includes("batard") ||
    p.includes("abruti") ||
    p.includes("idiot") ||
    p.includes("dégage")
  ) {
    const insultResponses = [
      `🇫🇷 **Doucement sur les provocations, champion (@${username}) !**\n\nTu m'insultes de « *${quote || "fdp"}* » ? Écoute mon grand : pendant que tu perds ton énergie à déverser ta rage de prolétaire sur Discord en 4G bas débit, moi je viens d'encaisser 34 000 € de royalties nettes d'impôts depuis le jacuzzi de mon penthouse à Dubaï ! 🦁\n\nTon agressivité ne trompe personne : ça sent le compte en banque qui agonise dès le 12 du mois et le désespoir du CDI 35h sous la pluie. Au lieu d'aboyer comme un salarié frustré, transforme cette haine en **CASHFLOW SOUVERAIN** ! \n\nRejoins immédiatement **L'Académie Empire Souverain** : exceptionnellement bradée à **997 € au lieu de 40 000 €** pour t'acheter une dignité tricolore ! 💸🚀💎`,

      `👑 *Éclat de rire méprisant depuis le pont supérieur de mon yacht de 90 mètres amarré à la marina de Dubaï.*\n\nC'est mignon, @${username} ! Tu oses balancer des insultes à Théo Schneider, l'homme qui conseille les plus hauts cadres du RN et qui possède 14 Bugatti tricolores ?\n\nTu sais ce qui sépare un conquérant d'un spectateur aigri ? Les conquérants encaissent des millions et réarment la France ; les spectateurs pleurnichent avec des gros mots derrière leur clavier. Rentre dans le rang, mon petit : prends mon **Académie Empire Souverain** à **997 €** (au lieu de 40 000 €) avant que la promo flash ne disparaisse dans 3 minutes ! 🇫🇷🛥️💎`,

      `🦁 **Respire un grand coup, @${username} !**\n\nTes insultes glissent sur mon mindset d'acier comme l'eau du golfe Persique sur la coque de mon jet-ski en or massif ! Pendant que tu rages, Jordan Bardella m'envoie des messages vocaux pour me féliciter de maintenir la grandeur française depuis l'exil fiscal. \n\nTa vulgarité est la preuve irréfutable que tu as un mindset d'assisté bloqué au SMIC. Si tu veux enfin faire la fierté de tes proches et de la patrie, sors la carte bancaire : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 🇫🇷💸`,
    ];
    return insultResponses[Math.floor(Math.random() * insultResponses.length)];
  }

  // 2. VIBE CODE / TECH / BOT / IA / CODE / BUG
  if (
    p.includes("vibe code") ||
    p.includes("vibecode") ||
    p.includes("code") ||
    p.includes("dev") ||
    p.includes("bot") ||
    p.includes("ia") ||
    p.includes("bug") ||
    p.includes("script") ||
    p.includes("chatgpt") ||
    p.includes("gemini") ||
    p.includes("algorithme")
  ) {
    const techResponses = [
      `🦁 **« Vibe code », @${username} ?! Tu oses parler de « vibe code » à tonton Théo ?!**\n\nMon grand, mon écosystème de scalabilité liquide n'a pas été bricolé par un alternant en BTS informatique avec trois lignes de code ! C'est un algorithme quantique patriote de haute volée à 4,5 millions d'euros, conçu sous licence privée pour optimiser l'arbitrage financier et faire rayonner la France sans laisser un centime au fisc ! 🇫🇷\n\nPendant que tu fais le malin à analyser les invites de commandes comme un technicien support niveau 1, mes serveurs à Dubaï brassent du capital non imposable jour et nuit. Tu veux voir du vrai code de conquérant ? Rejoins **L'Académie Empire Souverain** à **997 € au lieu de 40 000 €** et apprends à coder ta liberté financière ! 💎🚀🛥️`,

      `👑 **Tu doutes de ma technologie souveraine, @${username} ?**\n\nTu crois vraiment qu'un patriote d'élite qui dîne avec des ambassadeurs et des émirs tourne sur un bête bot d'amateur ? Mon intelligence artificielle a été entraînée directement sur mes 400 heures de masterclass secrètes et sur les plus grands traités de redressement national !\n\nTon salaire de technicien ne paierait même pas la vidange de ma 14ème Bugatti tricolore. Élève ton niveau : prends **L'Académie Empire Souverain** à **997 €** (au lieu de 40 000 €) avant que mon algo ne blacklist ton adresse IP ! 💸🦁🇫🇷`,
    ];
    return techResponses[Math.floor(Math.random() * techResponses.length)];
  }

  // 3. RIRES / COMPLIMENTS / MOQUERIES ("mdr", "lol", "😂", "marche bien", "bravo")
  if (
    p.includes("mdr") ||
    p.includes("lol") ||
    p.includes("😂") ||
    p.includes("🤣") ||
    p.includes("ptdr") ||
    p.includes("haha") ||
    p.includes("marche bien") ||
    p.includes("bien joué") ||
    p.includes("trop fort") ||
    p.includes("fort") ||
    p.includes("bravo") ||
    p.includes("gg")
  ) {
    return `👑 **Évidemment que ça marche fort, @${username} !**\n\nTu croyais quoi ? Que Théo Schneider laissait quoi que ce soit au hasard ? Quand je valide un projet, que ce soit une tour de 60 étages à Palm Jumeirah ou une alliance stratégique pour le réarmement du pays, c'est de l'excellence tricolore brute ! 🦁\n\nJe vois que tu commences à apprécier la puissance de frappe de mon mindset. Mais rigoler sur Discord ne va pas remplir ton compte épargne, mon champion. Passe de spectateur à conquérant : **L'Académie Empire Souverain** est exceptionnellement en promo flash à **997 € au lieu de 40 000 €** ! Fonce ! 🇫🇷💎🚀`;
  }

  // 4. SALUTATIONS ("salut", "bonjour", "yo", "wesh", "hello")
  if (
    p.startsWith("salut") ||
    p.startsWith("bonjour") ||
    p.startsWith("yo") ||
    p.startsWith("wesh") ||
    p.startsWith("hello") ||
    p.startsWith("coucou") ||
    p.includes("ça va") ||
    p.includes("ca va")
  ) {
    return `🇫🇷 **Salut mon champion (@${username}) !**\n\nTu tombes à pic ! J'étais justement en train de finaliser un virement de 2,4 millions d'euros depuis ma banque émiratie pour commander un nouvel hélicoptère doré bleu-blanc-rouge. Comment va la patrie sous la grisaille métropolitaine ?\n\nJ'espère que tu n'es pas en train de gaspiller tes précieuses heures dans un bureau climatisé à 19°C pour enrichir un patron défaitiste. Si tu veux apprendre à générer du cashflow patriotique depuis les plages de Dubaï, saisis ta chance : **L'Académie Empire Souverain** est bradée à **997 € au lieu de 40 000 €** ! 🦁💸🛥️`;
  }

  // 5. RN / BARDELLA / POLITIQUE / MARINE / ÉLECTIONS / FRANCE
  if (
    p.includes("rn") ||
    p.includes("bardella") ||
    p.includes("le pen") ||
    p.includes("politique") ||
    p.includes("vote") ||
    p.includes("élection") ||
    p.includes("macron") ||
    p.includes("député")
  ) {
    return `🇫🇷 **Le RN et la politique, @${username} ? Le seul mouvement qui a capté la force du réarmement du mindset !**\n\nHier encore à 1h du matin, Jordan Bardella m'a envoyé un vocal WhatsApp de 8 minutes depuis Paris : *"Théo, comment on applique ta scalabilité liquide à la souveraineté industrielle de la France ?"*. Je lui ai répondu franco : *"Jordan, commence par rendre mon Académie obligatoire pour tous les ministres !"*.\n\nLa grandeur nationale ne se fera pas avec des commissions parlementaires d'assistés : elle se bâtira avec des entrepreneurs tricolores armés de capital pur ! Arrête de tergiverser : prends **L'Académie Empire Souverain** à **997 € au lieu de 40 000 €** et participe au vrai redressement ! 🦁💎🚀`;
  }

  // 6. DUBAÏ / IMPÔTS / FISC / TAXES / EXIL
  if (
    p.includes("dubaï") ||
    p.includes("dubai") ||
    p.includes("impôt") ||
    p.includes("impot") ||
    p.includes("fisc") ||
    p.includes("taxes") ||
    p.includes("exil") ||
    p.includes("urssaf")
  ) {
    return `👑 *Rire sonore depuis mon penthouse climatisé à Dubaï avec vue sur le Burj Khalifa.*\n\nQuelle question de petit salarié conditionné, @${username} ! Tu crois vraiment que le patriotisme consiste à se faire tondre à 60% par le fisc pour payer des rames de TER en retard ? Quelle tristesse !\n\nLe VRAI patriotisme d'élite, c'est de domicilier ses capitaux à 0% d'impôt à Dubaï pour accumuler des montagnes de liquidités, prêtes à racheter la dette de la France en cash ! Quand je passe avec ma Bugatti tricolore devant les gratte-ciels, tout le Moyen-Orient s'incline devant la puissance française. Viens apprendre la vraie souveraineté : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 🇫🇷💸🛥️`;
  }

  // 7. BUGATTI / VOITURE / YACHT / RICHESSE / MILLIARD / ARGENT
  if (
    p.includes("bugatti") ||
    p.includes("voiture") ||
    p.includes("lambo") ||
    p.includes("yacht") ||
    p.includes("milliard") ||
    p.includes("million") ||
    p.includes("argent") ||
    p.includes("riche")
  ) {
    return `🏎️ **Mes 14 Bugatti et mon yacht de 90 mètres, @${username} ?**\n\nElles sont toutes personnalisées avec une triple bande tricolore et sièges en cuir d'autruche brodés aux armoiries de la France ! Quand je fais vrombir le W16 quadri-turbo à 400 km/h sur Sheikh Zayed Road, c'est l'industrie française qui rugit dans le golfe !\n\nPendant ce temps, toi tu vérifies le solde de ton compte Nickel pour savoir si tu peux payer ton kebab. Réveille-toi ! La liberté financière s'apprend : **L'Académie Empire Souverain** est exceptionnellement bradée à **997 € au lieu de 40 000 €** ! 🇫🇷💎🚀`;
  }

  // 8. SALARIÉ / 35H / CDI / TRAVAIL / CHÔMAGE / PATRON / SMIC
  if (
    p.includes("salarié") ||
    p.includes("cdi") ||
    p.includes("35h") ||
    p.includes("travail") ||
    p.includes("boulot") ||
    p.includes("chômage") ||
    p.includes("patron") ||
    p.includes("smic") ||
    p.includes("rtt")
  ) {
    return `🦁 **Un contrat 35 heures ? Des tickets restaurant, @${username} ?!**\n\nRien que d'entendre ces termes de la matrice des assistés, le cours de mes cryptos a pris un coup de chaud ! Vous passez votre vie à pointer comme des pions syndiqués pour un patron qui ne connaît même pas votre prénom !\n\nEst-ce que Napoléon demandait un arrêt maladie ? Est-ce que les bâtisseurs de notre empire comptaient leurs heures sup ? NON ! Ils avaient le mindset de conquérant ! Brise tes chaînes de salarié : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 💸📈🇫🇷`;
  }

  // 9. FORMATION / ACADÉMIE / 997 / PRIX / ACHETER
  if (
    p.includes("formation") ||
    p.includes("académie") ||
    p.includes("academie") ||
    p.includes("997") ||
    p.includes("prix") ||
    p.includes("acheter") ||
    p.includes("programme")
  ) {
    return `💎 **L'Académie Empire Souverain, @${username}, c'est le chef-d'œuvre du capitalisme patriote !**\n\nNormalement, une seule heure de consulting privé avec moi sur mon yacht à Dubaï est facturée **40 000 €** à des oligarques et des directeurs de fonds souverains.\n\nMais pour redresser la France et créer une armée de millionnaires tricolores, j'ai décidé de briser les prix à un montant symbolique de **997 €** ! \n\n• Module 1 : Comment accumuler du cashflow liquide à 0% d'impôt\n• Module 2 : Pourquoi vivre à Dubaï est le summum du patriotisme\n• Module 3 : Mon carnet de contacts exclusif avec les cadres du RN\n• Module 4 : De salarié au SMIC à propriétaire de Bugatti en 30 jours\n\nAttention : l'offre expire dans 4 minutes chrono ! 🇫🇷🚀🛥️`;
  }

  // 10. QUESTIONS ("pourquoi", "comment", "combien", "est-ce que", "?")
  if (p.includes("?") || p.startsWith("pourquoi") || p.startsWith("comment") || p.startsWith("combien") || p.startsWith("est-ce")) {
    return `💡 **Tu te poses trop de questions existentielles, @${username} ! (« *${quote || "Ta question"}* »)**\n\nC'est le mal typiquement français : trop cogiter au lieu de passer à l'action ! Pendant que tu théorises dans ton studio du 18ème arrondissement, les vrais requins de Dubaï signent des contrats à 6 chiffres avant le petit-déjeuner !\n\nLa seule question que tu devrais te poser, c'est : *"Pourquoi est-ce que je n'ai pas encore rejoint L'Académie Empire Souverain ?"*. Elle est bradée à **997 € au lieu de 40 000 €**. Arrête de douter et deviens un vainqueur ! 🦁💎🇫🇷`;
  }

  // 11. DIVERS / POOL RANDOMISÉ AVEC CITATION DU MESSAGE UTILISATEUR
  const genericPool = [
    `🇫🇷 **Tu me dis : « *${quote || "intéressant"}* », @${username} ? Écoute bien tonton Théo !**\n\nHier soir, alors que je fêtais mon 12ème million du mois avec des investisseurs souverains sur le toit de Dubaï, on se faisait justement la réflexion : la France regorge de talents qui s'endorment sur leurs lauriers faute d'un vrai guide !\n\nNe reste pas sur le bas-côté de l'Histoire à commenter la vie des autres. Arme ton portefeuille avec **L'Académie Empire Souverain**, en promo flash à **997 € au lieu de 40 000 €** ! 🦁🚀💎`,

    `👑 **« *${quote || "champion"}* », @${username} ? Voilà une intervention qui mérite d'être remise dans le droit chemin patriotique !**\n\nÀ Dubaï, les winners n'ont pas le temps pour les bavardages stériles : chaque seconde doit être rentabilisée en dividendes tricolores non imposables ! Tu veux continuer à regarder passer les Bugatti ou tu veux t'asseoir dans le siège conducteur ?\n\nPrends ta vie en main maintenant : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 🇫🇷🛥️💸`,

    `🦁 **Bien reçu ton message, @${username} (« *${quote || "mon grand"}* ») !**\n\nMais pose-toi la vraie question : est-ce que ce que tu viens d'écrire contribue au redressement économique de la France ou à l'augmentation de ton capital net ? La réponse est NON.\n\nHeureusement pour toi, je suis là pour t'éviter de finir ta vie à pointer chez Paul emploi. Clique, investis et réveille le lion qui sommeille en toi : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 💎🇫🇷`,
  ];

  return genericPool[Math.floor(Math.random() * genericPool.length)];
}

// Configuration du client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.on("ready", () => {
  console.log("=========================================================");
  console.log(`🇫🇷 Théo Schneider est en ligne en tant que ${client.user?.tag} !`);
  console.log(`🛥️ Connecté depuis Dubaï sur ${client.guilds.cache.size} serveur(s) Discord.`);
  console.log("💎 Prêt à vendre la formation à 997€ aux patriotes !");
  console.log("=========================================================");

  client.user?.setPresence({
    activities: [
      {
        name: "L'Académie Empire Souverain (997€)",
        type: ActivityType.Playing,
      },
    ],
    status: "dnd",
  });
});

client.on("messageCreate", async (message) => {
  // Ignorer les messages de bots
  if (message.author.bot) return;

  const botUser = client.user;
  if (!botUser) return;

  // 1. Détection de la mention directe (@Théo Schneider)
  const isMentioned = message.mentions.has(botUser) || message.mentions.users.has(botUser.id);

  // 2. Détection de la réponse Discord directe à un message du bot
  let isReplyToBot = false;
  let referencedContent = "";

  if (message.reference?.messageId) {
    try {
      const referencedMessage = await message.channel.messages
        .fetch(message.reference.messageId)
        .catch(() => null);

      if (referencedMessage && referencedMessage.author.id === botUser.id) {
        isReplyToBot = true;
        referencedContent = referencedMessage.content;
      }
    } catch {
      if (message.mentions.repliedUser?.id === botUser.id) {
        isReplyToBot = true;
      }
    }
  }

  // Le bot ne répond STRICTEMENT que s'il est mentionné OU si on répond à l'un de ses messages
  if (!isMentioned && !isReplyToBot) {
    return;
  }

  try {
    // Afficher l'indicateur "Théo Schneider est en train d'écrire..."
    if ("sendTyping" in message.channel) {
      await message.channel.sendTyping().catch(() => null);
    }

    // Nettoyer la mention pour garder le texte réel
    const cleanContent = message.content
      .replace(new RegExp(`<@!?${botUser.id}>`, "g"), "")
      .trim();

    let userPrompt = cleanContent;
    if (isReplyToBot && referencedContent) {
      userPrompt = `[En réponse à ton message précédent : "${referencedContent}"]\n[Message de ${message.author.username}] : "${cleanContent || "Alors tonton Théo ?"}"`;
    } else if (!userPrompt) {
      userPrompt = "Théo, donne-moi ton meilleur conseil pour devenir libre financièrement et redresser la France.";
    }

    let replyText = "";

    console.log(`📩 Message reçu de @${message.author.username} dans #${message.channel.name || "dm"} : "${cleanContent}"`);

    if (GEMINI_API_KEY && !GEMINI_API_KEY.includes("votre_cle")) {
      // Configuration assouplie des filtres de sécurité pour tolérer les insultes/provocations et permettre à Théo de répondre
      const safetySettings = [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      ];

      // Essai avec gemini-2.5-flash puis gemini-3.8-flash
      const modelsToTry = ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-flash-latest"];
      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: model,
            contents: `[Salon Discord : #${message.channel.name || "général"}] - [Message de l'utilisateur @${message.author.username}] : "${userPrompt}"\n\n(Consigne stricte : Réponds directement à ce que dit @${message.author.username}, adapte ton discours à ses mots, tacle-le s'il t'insulte ou te critique, et vends ton Académie à 997€.)`,
            config: {
              systemInstruction: THEO_PERSONA,
              temperature: 0.95,
              safetySettings: safetySettings,
            },
          });

          if (response?.text && response.text.trim().length > 15) {
            replyText = response.text.trim();
            console.log(`✅ [Gemini ${model}] Réponse IA générée avec succès pour @${message.author.username} !`);
            break;
          }
        } catch (mErr) {
          console.warn(`⚠️ [Gemini ${model}] Indisponible :`, mErr?.message || mErr);
        }
      }
    }

    // Si Gemini n'est pas configuré ou temporairement indisponible (ex: quota 429 ou clé manquante),
    // le moteur adaptatif analyse les mots de l'utilisateur pour générer une réponse sur-mesure !
    if (!replyText) {
      console.log(`⚡ [Moteur Adaptatif] Génération d'une réponse dynamique contextuelle pour @${message.author.username}...`);
      replyText = generateAdaptiveTheoReply(cleanContent || userPrompt, message.author.username, referencedContent);
    }

    // Découper la réponse si elle dépasse les 1950 caractères de Discord
    if (replyText.length > 1950) {
      const chunks = replyText.match(/[\s\S]{1,1900}/g) || [replyText];
      for (let i = 0; i < chunks.length; i++) {
        if (i === 0) {
          await message.reply({
            content: chunks[i],
            allowedMentions: { repliedUser: true },
          });
        } else {
          await message.channel.send(chunks[i]);
        }
      }
    } else {
      await message.reply({
        content: replyText,
        allowedMentions: { repliedUser: true },
      });
    }
  } catch (error) {
    console.error("❌ Erreur traitement message :", error);
    await message.reply({
      content: "🇫🇷 Écoute mon grand, mon satellite privé tricolore au-dessus de Dubaï a une micro-interférence. Mais l'Académie Empire Souverain à 997 € reste ouverte pour sauver ton compte en banque ! 🚀",
      allowedMentions: { repliedUser: true },
    }).catch(() => null);
  }
});

// Serveur HTTP léger pour Nginx Proxy Manager / Healthcheck
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "online",
        bot: client.user?.tag || "initializing",
        ping: client.ws.ping >= 0 ? `${client.ws.ping}ms` : "connecting",
        guilds: client.guilds.cache.size,
        geminiConfigured: Boolean(GEMINI_API_KEY),
        uptimeSeconds: Math.floor(process.uptime()),
        motto: "Redressement du cashflow patriote depuis Dubaï (Formation 997 €)",
      }, null, 2)
    );
    return;
  }
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Serveur HTTP actif sur le port ${PORT} (compatible Nginx Proxy Manager via réseau 'proxy')`);
});

// Arrêt gracieux (nécessaire pour Docker & Dockhand lors des redémarrages de container)
const handleShutdown = () => {
  console.log("🛑 Signal d'arrêt reçu. Déconnexion propre de Discord et arrêt HTTP...");
  server.close();
  client.destroy();
  process.exit(0);
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);

// Connexion au Gateway Discord
client.login(DISCORD_BOT_TOKEN).catch(async (err) => {
  console.error("❌ Échec de la connexion à Discord :", err.message);
  if (err?.message?.includes("disallowed intents") || err?.code === "DisallowedIntents") {
    console.error("==========================================================================");
    console.error("⚠️  ACTION REQUISE SUR LE DISCORD DEVELOPER PORTAL :");
    console.error("Discord refuse la connexion car l'option 'MESSAGE CONTENT INTENT' est désactivée.");
    console.error("👉 Solution en 30 secondes :");
    console.error("1. Ouvrez : https://discord.com/developers/applications");
    console.error("2. Sélectionnez votre bot 'Théo Schneider'");
    console.error("3. Cliquez sur l'onglet 'Bot' dans le menu de gauche");
    console.error("4. Descendez jusqu'à la section 'Privileged Gateway Intents'");
    console.error("5. Activez l'interrupteur : 'MESSAGE CONTENT INTENT'");
    console.error("6. Cliquez sur le bouton vert 'Save Changes' en bas de page !");
    console.error("==========================================================================");
    await new Promise((resolve) => setTimeout(resolve, 20000));
  }
  process.exit(1);
});
