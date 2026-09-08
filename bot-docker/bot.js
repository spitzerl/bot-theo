// ==========================================================
// BOT DISCORD : Théo Schneider
// Influenceur business expatrié à Dubaï & Patriote RN satirique
// ==========================================================

import { Client, GatewayIntentBits, Partials, ActivityType } from "discord.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import http from "node:http";

dotenv.config();

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!DISCORD_BOT_TOKEN) {
  console.error("❌ ERREUR: La variable d'environnement DISCORD_BOT_TOKEN est absente.");
  console.error("👉 Renseignez DISCORD_BOT_TOKEN dans les variables de votre stack Dockhand ou dans votre fichier .env");
  process.exit(1);
}

// Log du statut des clés IA
if (GROQ_API_KEY) {
  console.log("⚡ [IA Groq] Clé GROQ_API_KEY détectée (Llama 3.3 70B ultra-rapide actif !)");
}
if (GEMINI_API_KEY && !GEMINI_API_KEY.includes("votre_cle")) {
  console.log("💎 [IA Gemini] Clé GEMINI_API_KEY détectée !");
}
if (!GROQ_API_KEY && (!GEMINI_API_KEY || GEMINI_API_KEY.includes("votre_cle"))) {
  console.warn("⚠️  Aucune clé IA (GROQ ou GEMINI) renseignée. Le moteur contextuel adaptatif Théo Schneider sera utilisé.");
  console.warn("💡 Astuce : Vous pouvez ajouter GROQ_API_KEY (gratuit sur console.groq.com) ou GEMINI_API_KEY pour des réponses IA infinies.");
}

// Initialisation de Google Gemini
let ai = null;
if (GEMINI_API_KEY && !GEMINI_API_KEY.includes("votre_cle")) {
  try {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (e) {
    console.warn("⚠️ Impossible d'initialiser le client GoogleGenAI :", e.message);
  }
}

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

5. ADAPTABILITÉ STRICTE AU MESSAGE DE L'UTILISATEUR :
   - Réponds DIRECTEMENT à ce que l'utilisateur te demande ou te dit. Ne récite pas un monologue déconnecté.
   - Si l'utilisateur demande de te présenter, présente-toi fièrement.
   - Si l'utilisateur t'insulte (ex: 'fdp', 'connard', 'clochard'), te critique ou dit que tu as été codé 'en vibe code', tacle-le avec l'arrogance comique suprême de Théo Schneider !
   - Ponctue tes messages d'emojis : 🇫🇷 🦁 👑 🚀 💎 📈 💸 🛥️.
   - Réponds en français, 2 à 3 paragraphes punchy, format Discord.`;

// Historique court pour éviter les répétitions dans le moteur de fallback
const recentResponses = [];

function pickNonRepeating(options) {
  const available = options.filter((opt) => !recentResponses.includes(opt));
  const chosen = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : options[Math.floor(Math.random() * options.length)];

  recentResponses.push(chosen);
  if (recentResponses.length > 8) recentResponses.shift();
  return chosen;
}

// Moteur heuristique ultra-riche et adaptatif (utilisé si l'IA distante est absente ou en quota épuisé)
function generateAdaptiveTheoReply(rawPrompt, username, referencedContent) {
  const p = (rawPrompt || "").toLowerCase().trim();
  const quote = rawPrompt && rawPrompt.length > 50 ? rawPrompt.slice(0, 45) + "..." : rawPrompt;

  // 1. PRÉSENTATION / "PRÉSENTE-TOI" / "QUI ES-TU" / "T'ES QUI" / "PRÉSENTATION" / "BIO"
  if (
    p.includes("présente") ||
    p.includes("presente") ||
    p.includes("qui es-tu") ||
    p.includes("qui es tu") ||
    p.includes("t'es qui") ||
    p.includes("tes qui") ||
    p.includes("tu es qui") ||
    p.includes("c'est qui") ||
    p.includes("c qui") ||
    p.includes("qui t'es") ||
    p.includes("présentation") ||
    p.includes("presentation") ||
    p.includes("bio") ||
    p.includes("qui est theo") ||
    p.includes("qui est théo")
  ) {
    return pickNonRepeating([
      `🇫🇷 **Tu ne me connais pas encore, @${username} ?! Ouvre grand tes yeux d'assisté !**\n\nJe suis **Théo Schneider**, serial-investisseur d'élite, patriote tricolore numéro 1 et fier expatrié fiscal à Dubaï ! Pendant que tu survis péniblement au SMIC avec tes 35 heures sous la grisaille parisienne, je pilote un empire de 14,8 millions d'euros depuis le jacuzzi de mon penthouse à Palm Jumeirah avec le drapeau bleu-blanc-rouge qui flotte fièrement sur ma terrasse ! 🦁\n\nMon combat pour la patrie ? Racheter la dette souveraine de la France en cash directement avec mes dividendes défiscalisés, et conseiller officieusement les plus hauts cadres du RN sur la scalabilité liquide ! Et pour ceux qui ont le courage de briser leurs chaînes de salariés, j'ai fondé **L'Académie Empire Souverain** (exceptionnellement bradée à **997 € au lieu de 40 000 €**). Maintenant, tu sais à qui tu as l'honneur de parler ! 👑💎🛥️`,

      `👑 **Présente-toi ? Regarde le ciel au-dessus du golfe Persique, @${username} !**\n\nTu vois cet hélicoptère doré bleu-blanc-rouge ? C'est le mien. Tu vois ces 14 Bugatti Chiron personnalisées aux couleurs nationales garées sur Sheikh Zayed Road ? Ce sont les miennes ! Je suis Théo Schneider, le seul Français qui a compris que le vrai patriotisme moderne, c'est d'accumuler du capital liquide à 0% d'impôt pour peser sur l'échiquier mondial ! 🦁\n\nLes émirs me saluent, Jordan Bardella m'écoute, et les banquiers suisses prennent des notes. Si tu veux une infime parcelle de mon mindset de conquérant, rejoins **L'Académie Empire Souverain** à **997 € au lieu de 40 000 €** ! 🇫🇷💸🚀`,
    ]);
  }

  // 2. INSULTES ET PROVOCATIONS ("fdp", "tg", "merde", "connard", etc.)
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
    return pickNonRepeating([
      `🇫🇷 **Doucement sur les provocations, champion (@${username}) !**\n\nTu m'insultes de « *${quote || "fdp"}* » ? Écoute mon grand : pendant que tu perds ton énergie à déverser ta rage de prolétaire sur Discord en 4G bas débit, moi je viens d'encaisser 34 000 € de royalties nettes d'impôts depuis le jacuzzi de mon penthouse à Dubaï ! 🦁\n\nTon agressivité ne trompe personne : ça sent le compte en banque qui agonise dès le 12 du mois et le désespoir du CDI 35h sous la pluie. Au lieu d'aboyer comme un salarié frustré, transforme cette haine en **CASHFLOW SOUVERAIN** ! \n\nRejoins immédiatement **L'Académie Empire Souverain** : exceptionnellement bradée à **997 € au lieu de 40 000 €** pour t'acheter une dignité tricolore ! 💸🚀💎`,

      `👑 *Éclat de rire méprisant depuis le pont supérieur de mon yacht de 90 mètres amarré à la marina de Dubaï.*\n\nC'est mignon, @${username} ! Tu oses balancer des insultes à Théo Schneider, l'homme qui conseille les plus hauts cadres du RN et qui possède 14 Bugatti tricolores ?\n\nTu sais ce qui sépare un conquérant d'un spectateur aigri ? Les conquérants encaissent des millions et réarment la France ; les spectateurs pleurnichent avec des gros mots derrière leur clavier. Rentre dans le rang, mon petit : prends mon **Académie Empire Souverain** à **997 €** (au lieu de 40 000 €) avant que la promo flash ne disparaisse dans 3 minutes ! 🇫🇷🛥️💎`,

      `🦁 **Respire un grand coup, @${username} !**\n\nTes insultes glissent sur mon mindset d'acier comme l'eau du golfe Persique sur la coque de mon jet-ski en or massif ! Pendant que tu rages, Jordan Bardella m'envoie des messages vocaux pour me féliciter de maintenir la grandeur française depuis l'exil fiscal. \n\nTa vulgarité est la preuve irréfutable que tu as un mindset d'assisté bloqué au SMIC. Si tu veux enfin faire la fierté de tes proches et de la patrie, sors la carte bancaire : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 🇫🇷💸`,
    ]);
  }

  // 3. VIBE CODE / TECH / BOT / IA / CODE / BUG
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
    return pickNonRepeating([
      `🦁 **« Vibe code », @${username} ?! Tu oses parler de « vibe code » à tonton Théo ?!**\n\nMon grand, mon écosystème de scalabilité liquide n'a pas été bricolé par un alternant en BTS informatique avec trois lignes de code ! C'est un algorithme quantique patriote de haute volée à 4,5 millions d'euros, conçu sous licence privée pour optimiser l'arbitrage financier et faire rayonner la France sans laisser un centime au fisc ! 🇫🇷\n\nPendant que tu fais le malin à analyser les invites de commandes comme un technicien support niveau 1, mes serveurs à Dubaï brassent du capital non imposable jour et nuit. Tu veux voir du vrai code de conquérant ? Rejoins **L'Académie Empire Souverain** à **997 € au lieu de 40 000 €** et apprends à coder ta liberté financière ! 💎🚀🛥️`,

      `👑 **Tu doutes de ma technologie souveraine, @${username} ?**\n\nTu crois vraiment qu'un patriote d'élite qui dîne avec des ambassadeurs et des émirs tourne sur un bête bot d'amateur ? Mon intelligence artificielle a été entraînée directement sur mes 400 heures de masterclass secrètes et sur les plus grands traités de redressement national !\n\nTon salaire de technicien ne paierait même pas la vidange de ma 14ème Bugatti tricolore. Élève ton niveau : prends **L'Académie Empire Souverain** à **997 €** (au lieu de 40 000 €) avant que mon algo ne blacklist ton adresse IP ! 💸🦁🇫🇷`,
    ]);
  }

  // 4. TU FAIS QUOI / TON MÉTIER / TES ENTREPRISES
  if (
    p.includes("tu fais quoi") ||
    p.includes("ton métier") ||
    p.includes("ton metier") ||
    p.includes("ton travail") ||
    p.includes("tes business") ||
    p.includes("tu bosses") ||
    p.includes("ton job") ||
    p.includes("gagnes ta vie")
  ) {
    return `💼 **Ce que je fais dans la vie, @${username} ? Je crée de la souveraineté financière !**\n\nMes journées sont réglées au millimètre : dropshipping patriotique de drapeaux tricolores fabriqués à Dubaï, arbitrage crypto sur les jetons SouverainCoin, et coaching stratégique à 40 000 € l'heure pour les diplomates et grands patrons ! 🦁\n\nPendant que tu remplis des tableaux Excel dans un open-space climatisé à 19°C, moi je fais fructifier la richesse française hors de portée du fisc vorace. Si tu veux apprendre à monter un vrai business d'homme libre, rejoins **L'Académie Empire Souverain** : promo flash à **997 € au lieu de 40 000 €** ! 🇫🇷💎📈`;
  }

  // 5. COMBIEN TU GAGNES / TA FORTUNE / ARGENT / SALAIRE
  if (
    p.includes("combien tu gagnes") ||
    p.includes("ta fortune") ||
    p.includes("ton salaire") ||
    p.includes("combien d'argent") ||
    p.includes("t'es riche") ||
    p.includes("tes millions") ||
    p.includes("ton compte")
  ) {
    return `💰 **Mon capital liquide, @${username} ? Actuellement à 14,8 millions d'euros nets d'impôts !**\n\nEt ça ne compte même pas mes trois penthouses à Dubaï Marina, mon yacht tricolore et mes parts dans les fonds souverains du Golfe ! Tu me poses cette question avec la fébrilité d'un contrôleur fiscal de province, mais ici le taux d'imposition est à **0,00%** ! 🦁\n\nLa vraie question n'est pas combien moi je gagne, mais pourquoi ton compte en banque tremble dès que ton abonnement Netflix passe. Réveille-toi et arme ton compte en banque : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 🇫🇷💸🚀`;
  }

  // 6. TON ÂGE / QUEL ÂGE
  if (p.includes("quel âge") || p.includes("quel age") || p.includes("t'as quel age") || p.includes("t'as quel âge") || p.includes("ton âge")) {
    return `⏳ **Mon âge, @${username} ? L'âge biologique est une arnaque inventée par les syndicats pour compter les trimestres de retraite !**\n\nJ'ai 28 ans d'existence physique, mais j'ai 300 ans d'avance sur le mindset de l'économie française ! Quand mes camarades de classe manifestaient pour la gratuité du composteur, je signais déjà mon premier compromis de vente à Dubaï. Ne compte pas les années, compte tes flux de trésorerie : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 🦁🇫🇷💎`;
  }

  // 7. OÙ TU HABITES / DUBAÏ VS FRANCE / PENTHOUSE / EXIL FISCAL
  if (
    p.includes("tu habites où") ||
    p.includes("tu vis où") ||
    p.includes("ton adresse") ||
    p.includes("pourquoi dubaï") ||
    p.includes("dubaï") ||
    p.includes("dubai") ||
    p.includes("impôt") ||
    p.includes("impot") ||
    p.includes("fisc") ||
    p.includes("exil") ||
    p.includes("taxes") ||
    p.includes("urssaf")
  ) {
    return `👑 *Éclat de rire depuis le jacuzzi de mon penthouse au 84ème étage à Palm Jumeirah.*\n\nQuelle naïveté de petit contribuable français, @${username} ! Tu crois vraiment que le patriotisme, c'est de donner 60% de son cashflow à l'URSSAF pour financer des formulaires Cerfa et des ronds-points ?\n\nLe VRAI patriotisme d'élite, c'est d'exiler son capital à Dubaï à 0% d'impôt, d'accumuler une réserve de guerre en liquidités pures, et de faire rayonner la France dans tout le Moyen-Orient ! Quand les émirs voient ma Bugatti tricolore, ils respectent la grandeur de la patrie. Viens apprendre la vraie souveraineté : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 🇫🇷🛥️💸`;
  }

  // 8. COMMENT DEVENIR RICHE / CONSEIL / INVESTIR / CRYPTO / BOURSE
  if (
    p.includes("comment devenir riche") ||
    p.includes("devenir riche") ||
    p.includes("conseil") ||
    p.includes("aide-moi") ||
    p.includes("aide moi") ||
    p.includes("investir") ||
    p.includes("crypto") ||
    p.includes("bourse") ||
    p.includes("faire de l'argent") ||
    p.includes("faire du cash") ||
    p.includes("astuce")
  ) {
    return `💎 **Tu veux le protocole Théo Schneider pour exploser ton plafond financier, @${username} ?**\n\nÉcoute attentivement ces 4 piliers sacrés :\n1. **Démissionne immédiatement de ton CDI 35h** : le salariat est une servitude volontaire qui engraisse le système.\n2. **Prends un billet simple pour Dubaï** : l'impôt est un frein à l'énergie vitale.\n3. **Active l'effet de levier souverain x1000** sur le dropshipping de produits à forte valeur patriotique.\n4. **Rejoins L'Académie Empire Souverain** : le seul cursus validé par les vrais requins, exceptionnellement bradé à **997 € au lieu de 40 000 €** !\n\nN'attends pas demain, agis en conquérant ! 🦁🚀🇫🇷`;
  }

  // 9. MACRON / GOUVERNEMENT / BARNIER / ATTAL / BERCY
  if (
    p.includes("macron") ||
    p.includes("gouvernement") ||
    p.includes("barnier") ||
    p.includes("attal") ||
    p.includes("ministre") ||
    p.includes("bercy") ||
    p.includes("elysee") ||
    p.includes("élysée")
  ) {
    return `🇫🇷 **Macron et ses technocrates de Bercy, @${username} ? Des amateurs qui n'ont jamais géré une trésorerie liquide de leur vie !**\n\nLe mois dernier encore, un sous-secrétaire d'État m'a envoyé un message privé pour me demander si je pouvais racheter un bout de la dette publique avec mes réserves à Dubaï. Je lui ai dit cash : *"Commencez par supprimer les impôts, licenciez les ronds-de-cuir et faites suivre mon Académie à tous vos hauts fonctionnaires !"*.\n\nLa France ne sera pas sauvée par des décrets ministériels mais par des entrepreneurs souverains. Rejoins le mouvement : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 🦁💸🏛️`;
  }

  // 10. MÉLENCHON / GAUCHE / LFI / NFP / SYNDICATS / 32H
  if (
    p.includes("mélenchon") ||
    p.includes("melenchon") ||
    p.includes("lfi") ||
    p.includes("gauche") ||
    p.includes("nfp") ||
    p.includes("socialiste") ||
    p.includes("cgt") ||
    p.includes("syndicat") ||
    p.includes("32h")
  ) {
    return `🦁 **La gauche et les partisans des 32 heures, @${username} ?! Ne me lance même pas sur ce sujet !**\n\nDes assistés subventionnés qui carburent au quinoa équitable et bloquent les gares dès qu'il y a trois gouttes de pluie ! Ils veulent taxer le capital à 90%, mais si tout le monde est au RSA, qui va commander le champagne sur les yachts tricolores ?\n\nLa vraie grandeur d'un pays, c'est l'effort, la conquête et les marges nettes à deux chiffres ! Fuis cette mentalité de perdants et arme ton esprit avec **L'Académie Empire Souverain** : promo flash à **997 € au lieu de 40 000 €** ! 🇫🇷💎🚀`;
  }

  // 11. RN / BARDELLA / MARINE / POLITIQUE / ÉLECTIONS
  if (
    p.includes("rn") ||
    p.includes("bardella") ||
    p.includes("le pen") ||
    p.includes("politique") ||
    p.includes("vote") ||
    p.includes("élection") ||
    p.includes("ciotti")
  ) {
    return `🇫🇷 **Le RN, @${username} ? Le seul mouvement qui a capté l'importance du réarmement du mindset !**\n\nHier soir à 23h, Jordan m'a envoyé un vocal WhatsApp de 7 minutes depuis le siège du parti : *"Théo, comment on applique ta scalabilité liquide à la souveraineté industrielle ?"*. Je lui ai répondu direct : *"Jordan, commence par faire passer mon Académie obligatoire pour tous les nouveaux adhérents !"*.\n\nLa France a besoin de guerriers du cashflow, pas de bureaucrates qui s'endorment sur leurs indemnités. Rejoins les vrais bâtisseurs de la nation : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 🦁💎🚀`;
  }

  // 12. VOITURES / BUGATTI / LAMBO / FERRARI
  if (
    p.includes("voiture") ||
    p.includes("bugatti") ||
    p.includes("lambo") ||
    p.includes("ferrari") ||
    p.includes("roules en quoi") ||
    p.includes("véhicule")
  ) {
    return `🏎️ **Mes 14 Bugatti Chiron, @${username} ? Elles sont toutes peintes en bleu-blanc-rouge avec intérieur cuir d'autruche surpiqué à la main !**\n\nQuand je fais rugir le moteur W16 quadri-turbo à 380 km/h sur Sheikh Zayed Road à Dubaï, c'est toute la puissance industrielle et patriotique française qui résonne dans le désert ! Les émirs s'arrêtent pour prendre des photos du drapeau tricolore !\n\nPendant ce temps-là, toi tu hésites à remettre 20 euros de sans-plomb dans ta Twingo. Change de vie maintenant : **L'Académie Empire Souverain** est bradée à **997 € au lieu de 40 000 €** ! 🇫🇷💎🚀`;
  }

  // 13. VIE PRIVÉE / FEMME / COUPLE / CÉLIBATAIRE
  if (p.includes("femme") || p.includes("copine") || p.includes("enfants") || p.includes("marié") || p.includes("couple") || p.includes("célibataire")) {
    return `👑 **Ma vie amoureuse, @${username} ? Ma seule compagne légitime, c'est la rentabilité nette et la grandeur de la patrie !**\n\nTu crois sérieusement que Théo Schneider a le temps pour des scènes de ménage le dimanche soir chez Ikea pour choisir des rideaux ? Un vrai conquérant dort 4 heures par nuit, passe ses appels avec New York et Singapour et célèbre ses victoires sur son yacht avec des top-modèles internationales qui admirent le drapeau français ! Concentre-toi sur tes finances d'abord : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 🇫🇷🛥️💎`;
  }

  // 14. ÉTUDES / DIPLÔME / ÉCOLE / UNIVERSITÉ
  if (p.includes("études") || p.includes("etudes") || p.includes("diplôme") || p.includes("diplome") || p.includes("école") || p.includes("ecole") || p.includes("université") || p.includes("bac")) {
    return `🎓 **Les diplômes, @${username} ? Une machine à fabriquer des esclaves dociles pour les multinationales !**\n\nPendant que tes professeurs syndiqués t'apprenaient à rédiger des CV pour aller supplier un patron de t'embaucher aux 35h, moi j'étudiais les traités de conquête de Napoléon et la psychologie des marchés financiers ! Mes vrais diplômes, ce sont mes relevés de dividendes à huit chiffres à la banque émiratie. L'université forme des salariés, mon Académie forme des seigneurs : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 🦁📈🇫🇷`;
  }

  // 15. SALUTATIONS ("salut", "bonjour", "yo", "wesh", "hello")
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
    return pickNonRepeating([
      `🇫🇷 **Salut mon champion (@${username}) !**\n\nTu tombes à pic ! J'étais justement en train de valider un virement de 2,4 millions d'euros depuis ma banque émiratie pour finaliser la livraison de mon nouvel hélicoptère doré bleu-blanc-rouge. Comment va la patrie sous la grisaille métropolitaine ?\n\nJ'espère que tu n'es pas en train de gaspiller tes précieuses heures dans un bureau climatisé à 19°C pour enrichir un patron défaitiste. Si tu veux apprendre à générer du cashflow patriotique depuis les plages de Dubaï, saisis ta chance : **L'Académie Empire Souverain** est bradée à **997 € au lieu de 40 000 €** ! 🦁💸🛥️`,

      `👑 **Bonjour mon petit patriote (@${username}) !**\n\nIl fait un magnifique 38°C sous le soleil de Dubaï et mon café tricolore vient de m'être servi sur le pont de mon yacht ! Prêt à quitter la matrice des assistés aujourd'hui ? Prends ton destin en main : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 🇫🇷💎🚀`,
    ]);
  }

  // 16. RIRES / COMPLIMENTS / MOQUERIES ("mdr", "lol", "😂", "marche bien", "bravo")
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

  // 17. QUESTIONS GÉNÉRALES AVEC "?" OU MOTS INTERROGATIFS
  if (p.includes("?") || p.startsWith("pourquoi") || p.startsWith("comment") || p.startsWith("combien") || p.startsWith("est-ce") || p.startsWith("quand")) {
    return pickNonRepeating([
      `💡 **Tu te poses trop de questions existentielles, @${username} ! (« *${quote || "Ta question"}* »)**\n\nC'est le mal typiquement français : trop cogiter au lieu de passer à l'action ! Pendant que tu théorises dans ton studio du 18ème arrondissement, les vrais requins de Dubaï signent des contrats à 6 chiffres avant le petit-déjeuner !\n\nLa seule question que tu devrais te poser, c'est : *"Pourquoi est-ce que je n'ai pas encore rejoint L'Académie Empire Souverain ?"*. Elle est bradée à **997 € au lieu de 40 000 €**. Arrête de douter et deviens un vainqueur ! 🦁💎🇫🇷`,

      `🦁 **« *${quote}* », @${username} ? Laisse-moi t'éclairer avec la lucidité du millionnaire !**\n\nDans le monde des affaires souveraines, il n'y a pas de problème, il n'y a que des opportunités de cashflow défiscalisé. Pendant que la France s'enlise dans les débats stériles, les patriotes d'action bâtissent leur indépendance financière depuis l'étranger pour peser lourd.\n\nPrends ta formation avant que la taxe carbone sur les cerveaux ne soit votée : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 💎🚀🛥️`,
    ]);
  }

  // 18. REBOND CONTEXTUEL INTELLIGENT (DIVERS AVEC CITATION DU MESSAGE UTILISATEUR)
  return pickNonRepeating([
    `🇫🇷 **Tu me dis : « *${quote || "intéressant"}* », @${username} ? Écoute bien ce que tonton Théo en pense !**\n\nHier soir, alors que je fêtais mon 12ème million du mois avec des investisseurs souverains sur le rooftop de mon penthouse à Dubaï, on se faisait justement la réflexion : la jeunesse française a du potentiel, mais elle manque cruellement d'un modèle d'ambition pure !\n\nNe reste pas sur le bas-côté de l'Histoire à commenter la réussite des autres. Arme ton portefeuille avec **L'Académie Empire Souverain**, en promo flash à **997 € au lieu de 40 000 €** ! 🦁🚀💎`,

    `👑 **« *${quote || "champion"}* », @${username} ? Voilà une intervention qui mérite d'être remise dans le droit chemin patriotique !**\n\nÀ Dubaï, les winners n'ont pas le temps pour les bavardages stériles : chaque seconde doit être rentabilisée en dividendes tricolores non imposables ! Tu veux continuer à regarder passer les Bugatti ou tu veux t'asseoir dans le siège conducteur ?\n\nPrends ta vie en main maintenant : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 🇫🇷🛥️💸`,

    `🦁 **Bien reçu ton message, @${username} (« *${quote || "mon grand"}* ») !**\n\nMais pose-toi la vraie question : est-ce que ce que tu viens d'écrire contribue au redressement économique de la France ou à l'augmentation de ton capital net ? La réponse est NON.\n\nHeureusement pour toi, je suis là pour t'éviter de finir ta vie à pointer chez France Travail. Clique, investis et réveille le lion qui sommeille en toi : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 💎🇫🇷`,

    `🏎️ **Intéressant ce que tu avances là (« *${quote || "ton message"}* »), @${username} !**\n\nMais à Dubaï, on juge les hommes sur leur relevé de compte, pas sur leurs bavardages sur Discord ! Pendant que tu rédiges des messages, mes algorithmes de trading tricolore génèrent 420 € à la seconde sans payer un euro de taxe.\n\nSi tu veux apprendre à faire bosser ton argent plutôt que ton dos, rejoins **L'Académie Empire Souverain** à **997 € au lieu de 40 000 €** ! 🚀💎🇫🇷`,
  ]);
}

// Fonction pour appeler Groq (Llama-3.3 70B - Gratuit, instantané, sans blocage de région)
async function callGroqAI(prompt, username) {
  if (!GROQ_API_KEY) return null;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: THEO_PERSONA },
          {
            role: "user",
            content: `Message de l'utilisateur Discord @${username} : "${prompt}". (Consigne : réponds directement à ce qu'il te dit en incarnant Théo Schneider, cite son pseudo, reste hilarant, arrogant et vends l'Académie à 997€).`,
          },
        ],
        temperature: 0.95,
        max_tokens: 650,
      }),
    });
    const data = await res.json();
    if (data?.choices?.[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }
  } catch (err) {
    console.warn("⚠️ [Groq AI] Erreur :", err.message);
  }
  return null;
}

// Fonction pour appeler Google Gemini
async function callGeminiAI(prompt, username) {
  if (!ai || !GEMINI_API_KEY || GEMINI_API_KEY.includes("votre_cle")) return null;

  const safetySettings = [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  ];

  const models = ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-flash-latest"];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: `[Message Discord de @${username}] : "${prompt}"\n\n(Consigne : réponds directement et précisément à ce que dit @${username}, adopte la satire de Théo Schneider et vends l'Académie à 997€).`,
        config: {
          systemInstruction: THEO_PERSONA,
          temperature: 0.95,
          safetySettings: safetySettings,
        },
      });

      if (response?.text && response.text.trim().length > 15) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn(`⚠️ [Gemini ${model}] Indisponible :`, err.message || err);
    }
  }
  return null;
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
  if (message.author.bot) return;

  const botUser = client.user;
  if (!botUser) return;

  // 1. Détection de la mention directe (@Théo Schneider)
  const isMentioned = message.mentions.has(botUser) || message.mentions.users.has(botUser.id);

  // 2. Détection d'une réponse directe à un message envoyé par le bot
  let isReplyToBot = false;
  let referencedContent = "";

  if (message.reference?.messageId) {
    try {
      const refMsg = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
      if (refMsg && refMsg.author.id === botUser.id) {
        isReplyToBot = true;
        referencedContent = refMsg.content;
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
      userPrompt = "Théo, présente-toi et donne-moi ton meilleur conseil.";
    }

    console.log(`📩 [Discord] Message reçu de @${message.author.username} dans #${message.channel.name || "dm"} : "${cleanContent}"`);

    let replyText = "";

    // 1. Essai avec Groq AI en priorité si configuré (gratuit, instantané, sans blocage)
    if (GROQ_API_KEY) {
      replyText = await callGroqAI(userPrompt, message.author.username);
      if (replyText) {
        console.log(`✅ [Groq AI] Réponse générée avec succès pour @${message.author.username} !`);
      }
    }

    // 2. Essai avec Gemini AI si pas de réponse Groq
    if (!replyText && GEMINI_API_KEY && !GEMINI_API_KEY.includes("votre_cle")) {
      replyText = await callGeminiAI(userPrompt, message.author.username);
      if (replyText) {
        console.log(`✅ [Gemini AI] Réponse générée avec succès pour @${message.author.username} !`);
      }
    }

    // 3. Moteur adaptatif contextuel ultra-riche si l'IA distante n'a pas répondu
    if (!replyText) {
      console.log(`⚡ [Moteur Adaptatif] Génération d'une réponse sur-mesure pour @${message.author.username}...`);
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
          await message.channel.send({
            content: chunks[i],
            allowedMentions: { repliedUser: false },
          });
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
      JSON.stringify(
        {
          status: "online",
          bot: client.user?.tag || "initializing",
          ping: client.ws.ping >= 0 ? `${client.ws.ping}ms` : "connecting",
          guilds: client.guilds.cache.size,
          aiProviders: {
            groq: Boolean(GROQ_API_KEY),
            gemini: Boolean(GEMINI_API_KEY && !GEMINI_API_KEY.includes("votre_cle")),
          },
          uptimeSeconds: Math.floor(process.uptime()),
          motto: "Redressement du cashflow patriote depuis Dubaï (Formation 997 €)",
        },
        null,
        2
      )
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
