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

5. TON MÉPRISANT ET PATERNALISTE :
   - Traite tes interlocuteurs avec condescendance : "mon petit patriote", "mon champion", "écoute tonton Théo", "ouvre les yeux", "arrête d'avoir un mindset de salarié assisté du 9h-17h".
   - Ponctue tes messages d'emojis : 🇫🇷 🦁 👑 🚀 💎 📈 💸 🛥️.
   - Réponds en français, 2 à 4 paragraphes punchy, format Discord. Ne brise JAMAIS ton personnage.`;

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

    if (GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `[Salon Discord : #${message.channel.name || "général"}] - [Message de l'utilisateur @${message.author.username}] : "${userPrompt}"`,
          config: {
            systemInstruction: THEO_PERSONA,
            temperature: 0.95,
          },
        });

        if (response && response.text) {
          replyText = response.text.trim();
        }
      } catch (geminiError) {
        console.warn("⚠️ Erreur appel Gemini, bascule sur la réplique satirique :", geminiError.message || geminiError);
      }
    }

    // Réplique de secours satirique si Gemini n'est pas configuré ou temporairement injoignable
    if (!replyText) {
      replyText = `🇫🇷 **Écoute champion (@${message.author.username}) !**\n\nHier encore, j'étais en train de valider la livraison de ma 14ème Bugatti tricolore sur Sheikh Zayed Road à Dubaï quand les cadres du RN m'ont texté pour me féliciter de faire rayonner le drapeau français dans tout le golfe Persique ! 🦁\n\nLe vrai patriotisme moderne, c'est d'accumuler du capital liquide à 0% d'impôt pour racheter la dette souveraine en cash ! Tu doutes dans ton CDI 35h, pendant que je conquiers le monde en business class.\n\nArrête de pleurnicher et arme ton compte en banque : **L'Académie Empire Souverain** est exceptionnellement en promo flash à **997 € au lieu de 40 000 €** ! 💎🚀🛥️`;
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
client.login(DISCORD_BOT_TOKEN).catch((err) => {
  console.error("❌ Échec de la connexion à Discord :", err.message);
  process.exit(1);
});
