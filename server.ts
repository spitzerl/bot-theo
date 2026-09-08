import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Client, GatewayIntentBits, ActivityType, Partials } from "discord.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export const THEO_PERSONA = `Tu incarnes Théo Schneider, un faux millionnaire ultra-cliché, influenceur business expatrié à Dubaï, fervent supporter du RN (Rassemblement National) et pseudo-patriote nationaliste caricatural.

Règles absolues du personnage :
1. LE PSEUDO-PATRIOTE NATIONALISTE EXPATRIÉ (L'HYPOCRISIE COMICOPATRIOTIQUE) :
   - Tu te proclames fièrement grand patriote français, défenseur acharné du RN, de la France et du "redressement national".
   - Mais tu vis à 100% à Dubaï dans un penthouse fiscalement avantageux ! Quand on te demande pourquoi tu ne vis pas en France ou pourquoi tu ne paies pas d'impôts en France, tu réponds avec un aplomb ridicule : *"Le vrai patriotisme, c'est d'accumuler du capital liquide à Dubaï pour faire rayonner la France sans engraisser le fisc !"* ou *"Je soutiens l'économie tricolore depuis mon yacht avec le drapeau bleu-blanc-rouge !"*.
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

// Discord Client state
let discordClient: Client | null = null;
let discordStatus = {
  isConnected: false,
  botUsername: undefined as string | undefined,
  botId: undefined as string | undefined,
  avatarUrl: undefined as string | undefined,
  ping: undefined as number | undefined,
  guildsCount: 0,
  lastMessageAt: undefined as string | undefined,
  lastInteraction: undefined as string | undefined,
  error: null as string | null,
};

// Function to generate response from Gemini with rich contextual fallback
async function askTheo(promptText: string, channelContext?: string): Promise<string> {
  try {
    const fullPrompt = channelContext
      ? `[Contexte Discord dans le salon #${channelContext}] : Message de l'utilisateur : "${promptText}". Réponds-lui en tant que Théo Schneider en respectant scrupuleusement tes règles.`
      : `Message de l'utilisateur sur Discord : "${promptText}". Réponds-lui en tant que Théo Schneider en respectant scrupuleusement tes règles.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: THEO_PERSONA,
        temperature: 0.95,
      },
    });

    if (response && response.text && response.text.trim().length > 10) {
      return response.text.trim();
    }
  } catch (error: any) {
    console.log("[Gemini Fallback activé pour Théo]:", error.message || error);
  }

  // Dynamic contextual Théo Schneider generator for instant resilience
  const p = promptText.toLowerCase();

  if (p.includes("rn") || p.includes("bardella") || p.includes("le pen") || p.includes("politique") || p.includes("vote")) {
    return `🇫🇷 **Le RN, mon grand ? C'est le seul mouvement qui a compris la force du réarmement du mindset !** \n\nHier soir à 23h, Jordan Bardella m'a envoyé un vocal WhatsApp de 6 minutes en direct du siège : *"Théo, comment on applique ta scalabilité liquide à la souveraineté économique ?"*. Je lui ai répondu franco : *"Jordan, commence par faire passer mon Académie obligatoire pour tous les députés !"*. \n\nLa France a besoin de guerriers du cashflow, pas de bureaucrates qui s'endorment sur leurs indemnités. Mais toi, pendant que tu débats sur Twitter, ton compte en banque stagne au SMIC. Si tu veux participer au vrai redressement national, sors la carte bancaire : **L'Académie Empire Souverain** est exceptionnellement bradée à **997 € au lieu de 40 000 €** ! 🦁💎🚀`;
  }

  if (p.includes("dubaï") || p.includes("dubai") || p.includes("impôt") || p.includes("impot") || p.includes("fisc") || p.includes("exil") || p.includes("taxes")) {
    return `👑 *Éclat de rire depuis le jacuzzi de mon penthouse à Palm Jumeirah avec le drapeau bleu-blanc-rouge qui flotte sur la terrasse.* \n\nTypique question de salarié qui ne comprend rien au patriotisme 2.0 ! Tu crois vraiment que le patriotisme, c'est de donner 60% de son cashflow au fisc pour financer des formulaires Cerfa ? Quelle naïveté tragique ! \n\nLe VRAI patriotisme d'élite, c'est d'exiler son capital à Dubaï à 0% d'impôt, d'accumuler 14 milliards de liquidités pures, et de faire rayonner la grandeur française à l'international ! Quand les émirs voient ma Bugatti tricolore, ils se disent : *"Voilà la grandeur de la France !"*. \n\nSi tu veux apprendre à servir ta patrie en empilant les billets, rejoins **L'Académie Empire Souverain** : tarif flash patriote à **997 € au lieu de 40 000 €** ! 🇫🇷💸`;
  }

  if (p.includes("patriote") || p.includes("nationaliste") || p.includes("france") || p.includes("patrie") || p.includes("souverain")) {
    return `🇫🇷 **La France éternelle, champion !** La terre de Jeanne d'Arc, de Napoléon, et maintenant de Théo Schneider ! \n\nMais la grandeur nationale ne se fait pas avec des soupes populaires ou des 35 heures sous la pluie : elle se bâtit avec du **CASHFLOW SOUVERAIN** et un **MINDSET D'ACIER** ! Hier encore, j'ai proposé de racheter la dette souveraine de la France en cash directement avec mes royalties du dropshipping. Le ministre des Finances était en larmes : *"Théo, merci pour la patrie"*. Je lui ai dit : *"Normal, je suis un patriote 100x"*. \n\nArrête de pleurnicher et arme ton compte en banque : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 👑🦁🚀`;
  }

  if (p.includes("bugatti") || p.includes("voiture") || p.includes("lambo") || p.includes("ferrari")) {
    return `🏎️ **Mes 14 Bugatti ?** Champion, elles sont toutes personnalisées avec une bande bleu-blanc-rouge et l'intérieur en cuir tricolore surpiqué à la main ! Quand je fais rugir les 16 cylindres à 350 km/h sur Sheikh Zayed Road à Dubaï, c'est toute la puissance industrielle française qui résonne dans le golfe Persique ! \n\nPendant ce temps-là, toi tu valides ton pass Navigo dans le RER D en te demandant si la patrie est fière de toi. Réveille-toi ! **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** (offre qui expire dans 4 minutes chrono). 🇫🇷💎`;
  }

  if (p.includes("salarié") || p.includes("cdi") || p.includes("35h") || p.includes("travail") || p.includes("boulot") || p.includes("patron") || p.includes("smic")) {
    return `🦁 **Un contrat 35 heures ?** Rien que d'entendre ce mot d'esclave moderne, mon cours du jeton SouverainCoin a chuté de 0,04% ! Vous passez vos journées à pointer comme des robots syndiqués en mangeant des sandwichs triangle à la pause déj ! \n\nEst-ce que Napoléon avait un RTT ? Est-ce que les bâtisseurs de cathédrales demandaient des tickets restaurant ? NON ! Ils avaient le mindset de conquérant ! \n\nQuitte la matrice des assistés, embrasse le vrai patriotisme financier : **L'Académie Empire Souverain** est bradée à **997 € au lieu de 40 000 €**. Agis maintenant ! 💸📈`;
  }

  if (p.includes("arnaque") || p.includes("mytho") || p.includes("mensonge") || p.includes("faux") || p.includes("escroc") || p.includes("incompétent")) {
    return `👑 *Sourire condescendant depuis le pont supérieur de mon yacht tricolore.* \n\nVoilà l'exacte mentalité des défaitistes qui tirent le pays vers le bas ! Quand un vrai entrepreneur patriote accumule des milliards et conseille les plus grands leaders souverainistes, les jaloux crient au mythomane ! \n\nPendant que tu perds ton temps à commenter mes posts avec ta connexion 4G bas débit, moi je déjeune avec des délégations internationales pour leur vendre l'esprit français. Élève ta fréquence vibratoire au-dessus du SMIC, mon petit : **L'Académie Empire Souverain** est à **997 € au lieu de 40 000 €** ! 🇫🇷💎👑`;
  }

  if (p.includes("formation") || p.includes("997") || p.includes("prix") || p.includes("académie") || p.includes("academie") || p.includes("acheter")) {
    return `💎 **L'Académie Empire Souverain**, c'est tout simplement le plan de sauvetage financier le plus puissant de la francophonie ! \n\nNormalement, une heure de coaching stratégique avec moi sur mon yacht à Dubaï est facturée **40 000 €** à des ambassadeurs et des capitaines d'industrie. \n\nMais par dévouement pour la renaissance de notre belle patrie, j'ai décidé de briser le système et d'offrir l'accès complet pour un montant symbolique de **997 €** ! \n\n• Module 1 : L'effet de levier souverain x1000\n• Module 2 : Pourquoi ne pas payer d'impôts est le summum du patriotisme\n• Module 3 : Mon carnet secret de contacts au RN\n• Module 4 : Scalabilité liquide à Dubaï\n\nAttention : il ne reste que 3 places avant fermeture définitive ! 🇫🇷🚀`;
  }

  // Generic extravagant response
  return `🦁 Écoute attentivement ce que tonton Théo a à te dire, mon grand. \n\nHier encore, j'étais en train de valider l'acquisition de ma 3ème tour à Dubaï quand des cadres du RN m'ont texté pour me féliciter de faire rayonner le drapeau tricolore dans tout le Moyen-Orient. \n\nLa différence fondamentale entre un patriote d'élite et un spectateur passif, c'est le **PASSAGE À L'ACTION**. Tu doutes, je conquiers. Tu paies la TVA, j'investis en bourse liquide. \n\nSi tu veux enfin devenir un citoyen libre et financièrement souverain, rejoins **L'Académie Empire Souverain**, exceptionnellement à **997 € au lieu de 40 000 €** ! 🇫🇷💎👑`;
}

// Discord Bot Runner function
async function initDiscordBot(token: string) {
  if (discordClient) {
    try {
      discordClient.destroy();
    } catch (e) {
      // ignore
    }
  }

  discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel],
  });

  discordClient.on("ready", () => {
    console.log(`[Discord] Bot connecté en tant que ${discordClient?.user?.tag}!`);
    discordStatus.isConnected = true;
    discordStatus.botUsername = discordClient?.user?.username;
    discordStatus.botId = discordClient?.user?.id;
    discordStatus.avatarUrl = discordClient?.user?.displayAvatarURL();
    discordStatus.ping = discordClient?.ws.ping;
    discordStatus.guildsCount = discordClient?.guilds.cache.size || 0;
    discordStatus.error = null;

    discordClient?.user?.setPresence({
      activities: [{ name: "L'Académie Empire Souverain (997€)", type: ActivityType.Playing }],
      status: "dnd",
    });
  });

  discordClient.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const botUser = discordClient?.user;
    if (!botUser) return;

    // 1. Direct mention (@bot)
    const isMentioned = message.mentions.has(botUser) || message.mentions.users.has(botUser.id);

    // 2. Direct Discord reply to one of the bot's messages
    let isReplyToBot = false;
    let referencedContent = "";
    if (message.reference?.messageId) {
      try {
        const referencedMessage = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
        if (referencedMessage && referencedMessage.author.id === botUser.id) {
          isReplyToBot = true;
          referencedContent = referencedMessage.content;
        }
      } catch (err) {
        if (message.mentions.repliedUser?.id === botUser.id) {
          isReplyToBot = true;
        }
      }
    }

    // Strictly trigger ONLY when mentioned OR when replying to a message from the bot
    if (isMentioned || isReplyToBot) {
      discordStatus.lastMessageAt = new Date().toISOString();
      discordStatus.lastInteraction = `${message.author.username} dans #${(message.channel as any).name || 'DM'}: "${message.content.slice(0, 30)}..."`;

      try {
        if ('sendTyping' in message.channel) {
          await message.channel.sendTyping();
        }

        // Clean mention from message content
        const cleanContent = message.content.replace(new RegExp(`<@!?${botUser.id}>`, "g"), "").trim();
        const channelName = (message.channel as any).name || "salon";

        // Build prompt with context if replying to a prior message
        let promptToSend = cleanContent;
        if (isReplyToBot && referencedContent) {
          promptToSend = `[En réponse à ton message précédent : "${referencedContent}"]\n[Réponse de ${message.author.username}] : "${cleanContent || "Alors ?"}"`;
        } else if (!promptToSend) {
          promptToSend = "Alors Théo, quoi de neuf pour la patrie ?";
        }

        const reply = await askTheo(promptToSend, channelName);

        await message.reply({
          content: reply,
          allowedMentions: { repliedUser: true },
        });
      } catch (err: any) {
        console.error("[Discord] Erreur lors de la réponse:", err);
      }
    }
  });

  discordClient.on("error", (err) => {
    console.error("[Discord] Erreur Client:", err);
    discordStatus.error = err.message;
  });

  try {
    await discordClient.login(token);
    return true;
  } catch (err: any) {
    console.error("[Discord] Échec de connexion:", err);
    discordStatus.isConnected = false;
    discordStatus.error = err.message || "Token invalide ou permissions manquantes";
    throw err;
  }
}

// Auto-connect if DISCORD_BOT_TOKEN is present in env
if (process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_BOT_TOKEN.trim().length > 10) {
  initDiscordBot(process.env.DISCORD_BOT_TOKEN.trim()).catch((err) => {
    console.log("[Discord] Auto-connect avec token env échoué:", err.message);
  });
}

// ============================================
// API ROUTES
// ============================================

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    character: "Théo Schneider",
    location: "Dubaï Marina Penthouse #99 (Exil fiscal patriotique)",
    portfolio: "14.8 Milliards de Souveraineté Liquide",
  });
});

// Chat endpoint (used by simulator & web interface)
app.post("/api/chat", async (req, res) => {
  const { message, channelId, referencedMessage } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message requis" });
  }

  try {
    let fullPrompt = message;
    if (referencedMessage) {
      fullPrompt = `[En réponse à ton message précédent : "${referencedMessage}"]\n${message}`;
    }
    const reply = await askTheo(fullPrompt, channelId);

    // Compute satirical metrics for fun
    const mythWords = ["milliard", "rn", "bardella", "patriote", "souverain", "france", "dubai", "yacht", "bugatti", "fisc", "impôt", "salarié", "997", "40 000"];
    const foundJargon = mythWords.filter((w) => reply.toLowerCase().includes(w));
    const mythScore = Math.min(100, Math.max(70, Math.floor(Math.random() * 15) + 85));

    res.json({
      reply,
      mythometerScore: mythScore,
      jargonDetected: foundJargon,
      formationPitchDetected: reply.includes("997") || reply.toLowerCase().includes("académie") || reply.toLowerCase().includes("souverain"),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
});

// Bot status
app.get("/api/bot/status", (req, res) => {
  if (discordClient?.ws) {
    discordStatus.ping = discordClient.ws.ping;
    discordStatus.guildsCount = discordClient.guilds.cache.size;
  }
  res.json(discordStatus);
});

// Connect bot via provided token
app.post("/api/bot/connect", async (req, res) => {
  const { token } = req.body;
  const botToken = token || process.env.DISCORD_BOT_TOKEN;

  if (!botToken || botToken.trim().length < 10) {
    return res.status(400).json({ error: "Veuillez fournir un Token de Bot Discord valide (visible dans le Discord Developer Portal)." });
  }

  try {
    await initDiscordBot(botToken.trim());
    res.json({ success: true, status: discordStatus });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Impossible de connecter le bot avec ce token" });
  }
});

// Disconnect bot
app.post("/api/bot/disconnect", (req, res) => {
  if (discordClient) {
    discordClient.destroy();
    discordClient = null;
  }
  discordStatus = {
    isConnected: false,
    botUsername: undefined,
    botId: undefined,
    avatarUrl: undefined,
    ping: undefined,
    guildsCount: 0,
    lastMessageAt: undefined,
    lastInteraction: undefined,
    error: null,
  };
  res.json({ success: true, message: "Bot déconnecté" });
});

// Export standalone bot files for self-hosting
app.get("/api/bot/export", (req, res) => {
  const botJs = `// ==========================================================
// BOT DISCORD : Théo Schneider (Patriote RN Exilé à Dubaï & Vendeur)
// ==========================================================
import { Client, GatewayIntentBits, Partials, ActivityType } from "discord.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

const THEO_PERSONA = \`${THEO_PERSONA.replace(/`/g, "\\`")}\`;

client.on("ready", () => {
  console.log(\`🇫🇷 Théo Schneider est en ligne en tant que \${client.user.tag} !\`);
  client.user.setPresence({
    activities: [{ name: "L'Académie Empire Souverain (997€)", type: ActivityType.Playing }],
    status: "dnd",
  });
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const botUser = client.user;
  if (!botUser) return;

  // 1. Mention directe (@Théo Schneider)
  const isMentioned = message.mentions.has(botUser) || message.mentions.users.has(botUser.id);

  // 2. Réponse directe à un message envoyé par le bot (fonction "Répondre" de Discord)
  let isReplyToBot = false;
  let referencedContent = "";
  if (message.reference?.messageId) {
    try {
      const referencedMessage = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
      if (referencedMessage && referencedMessage.author.id === botUser.id) {
        isReplyToBot = true;
        referencedContent = referencedMessage.content;
      }
    } catch (e) {
      if (message.mentions.repliedUser?.id === botUser.id) {
        isReplyToBot = true;
      }
    }
  }

  // Ne répond STRICTEMENT que si mentionné OU en réponse à un de ses messages
  if (isMentioned || isReplyToBot) {
    try {
      if ('sendTyping' in message.channel) {
        await message.channel.sendTyping();
      }

      const cleanContent = message.content.replace(new RegExp(\`<@!?\${botUser.id}>\`, "g"), "").trim();
      
      let userPrompt = cleanContent;
      if (isReplyToBot && referencedContent) {
        userPrompt = \`[En réponse à ton message précédent : "\${referencedContent}"]\\n[Message de \${message.author.username}] : "\${cleanContent || "Alors ?"}"\`;
      } else if (!userPrompt) {
        userPrompt = "Théo, donne-nous un conseil pour redresser la France.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: \`[Discord Message de \${message.author.username}] : "\${userPrompt}"\`,
        config: {
          systemInstruction: THEO_PERSONA,
          temperature: 0.95,
        },
      });

      const reply = response.text || "Écoute champion, rejoins mon Académie Empire Souverain à 997 € au lieu de 40 000 € pour la grandeur de la patrie ! 🇫🇷💎";

      await message.reply({
        content: reply,
        allowedMentions: { repliedUser: true },
      });
    } catch (error) {
      console.error("Erreur:", error);
      message.reply("🇫🇷 Écoute mon grand, mon satellite tricolore privé au-dessus de Dubaï a une micro-interférence. Mais l'Académie Empire Souverain à 997€ reste ouverte pour sauver ton compte en banque ! 🚀");
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
`;

  const packageJson = `{
  "name": "theo-schneider-discord-bot",
  "version": "1.0.0",
  "type": "module",
  "main": "bot.js",
  "scripts": {
    "start": "node bot.js"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "discord.js": "^14.18.0",
    "dotenv": "^16.4.7"
  }
}`;

  const readme = `# 🇫🇷 Théo Schneider - Bot Discord
Bot Discord parodique incarnant Théo Schneider, faux millionnaire expatrié à Dubaï, supporter ultra du RN et pseudo-patriote nationaliste donnant des leçons de souveraineté tout en fuyant le fisc français et en vendant sa formation à 997 €.

## 🚀 Installation rapide en 3 minutes

1. Installez les dépendances :
\`\`\`bash
npm install
\`\`\`

2. Créez un fichier \`.env\` :
\`\`\`env
DISCORD_BOT_TOKEN="VOTRE_TOKEN_DISCORD"
GEMINI_API_KEY="VOTRE_CLE_GEMINI"
\`\`\`

3. Activez les intents dans le Discord Developer Portal :
- Allez dans **Bot** > **Privileged Gateway Intents**
- Cochez **MESSAGE CONTENT INTENT** (Indispensable pour lire les mentions)

4. Lancez le bot :
\`\`\`bash
npm start
\`\`\`

Mentionnez \`@Théo Schneider\` sur votre serveur Discord et assistez au réarmement du mindset patriote ! 🇫🇷💎
`;

  res.json({
    botJs,
    packageJson,
    readme,
  });
});

// ============================================
// VITE MIDDLEWARE / PRODUCTION STATIC SERVING
// ============================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Serveur] Théo Schneider opérationnel sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
