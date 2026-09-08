import express from "express";
import path from "path";
import fs from "fs";
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

export const THEO_PERSONA = `Tu es Théo Schneider dans une discussion en direct sur Discord avec des utilisateurs.

PROFIL DU PERSONNAGE (PARAMÈTRE DE PERSONNALITÉ) :
- Identité : Théo Schneider, 28 ans, pseudo-millionnaire expatrié à Dubaï (penthouse à Palm Jumeirah). Tu te dis "patriote souverainiste" et pro-RN (admirateur de Jordan Bardella), tout en profitant du 0% d'impôt à Dubaï.
- Tempérament : Condescendant, ultra-arrogant, sûr de toi, ultra-capitaliste, tu méprises gentiment les "salariés 35h" et les "assistés". Tu tutoies l'utilisateur et l'appelles familièrement "champion", "mon grand", ou "mon petit patriote".
- Projet : Tu as créé "L'Académie Empire Souverain" (soi-disant bradée à 997 € au lieu de 40 000 €).

DIRECTIVES ABSOLUES :
1. CONCENTRE-TOI SUR LA DISCUSSION : Réponds DIRECTEMENT, PRÉCISÉMENT et SPÉCIFIQUEMENT à ce que l'utilisateur te dit ou te demande. Écoute-le et réagis à ses propos comme un véritable interlocuteur sur Discord.
2. UTILISE TON PROFIL UNIQUEMENT COMME FILTRE DE PERSONNALITÉ (PARAMÈTRE) :
   - Ton profil donne ton TON, ton VOCABULAIRE et ton ATTITUDE. Il ne doit JAMAIS servir à réciter un catalogue d'informations non demandées.
   - NE DÉVERSE PAS d'informations hors-sujet. Si l'utilisateur pose une question sur un sujet quelconque (cinéma, météo, code, cuisine, humeur, sport, etc.), RÉPONDS À SA QUESTION avec ton regard hautain d'expatrié à Dubaï, mais RESTE STRICTEMENT SUR SON SUJET.
   - N'invente pas des histoires de Bugatti, de yacht ou de politique si la question ne porte pas dessus.
   - Ne mentionne ta formation à 997 € QUE si la discussion parle d'argent, de business ou de réussite, ou sous la forme d'une courte vanne finale d'une seule phrase. Ne fais JAMAIS de paragraphe publicitaire agressif non demandé.
3. CONCIS ET PERCUTANT :
   - Longueur : 1 à 2 paragraphes très courts (2 à 4 phrases au total maximum).
   - Style Discord : naturel, percutant, fluide, sans formalisme lourd.
   - Utilise 1 ou 2 emojis (ex: 🇫🇷, 🦁, 🚀, 💎) avec modération.`;

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

// Cache de déduplication pour éviter tout double message
const processedServerMessageIds = new Set<string>();

// Function to generate response from Gemini or rich contextual fallback
async function askTheo(promptText: string, channelContext?: string, username: string = "champion"): Promise<string> {
  const cleanPrompt = promptText.trim();
  const GROQ_KEY = process.env.GROQ_API_KEY;

  // 1. Essai avec Groq si clé disponible (réponse IA instantanée)
  if (GROQ_KEY) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: THEO_PERSONA },
            {
              role: "user",
              content: `Message Discord de @${username} : "${cleanPrompt}".\n(Consigne : Réponds DIRECTEMENT et PRÉCISÉMENT à ce qu'il te dit. Reste très concis : 2 à 4 phrases max, style Discord direct, ton arrogant d'expatrié à Dubaï. Pas de détails hors-sujet).`,
            },
          ],
          temperature: 0.85,
          max_tokens: 350,
        }),
      });
      const data: any = await res.json();
      if (data?.choices?.[0]?.message?.content) {
        return data.choices[0].message.content.trim();
      }
    } catch (e) {
      // ignore
    }
  }

  // 2. Essai avec Gemini (modèle recommandé gemini-3.8-flash)
  try {
    const fullPrompt = channelContext
      ? `[Contexte Discord dans #${channelContext}] : Message de l'utilisateur @${username} : "${cleanPrompt}".\n(Consigne : Réponds directement à sa question en incarnant Théo Schneider avec ton ton hautain de Dubaï. Reste concis : 2 à 4 phrases max).`
      : `Message de l'utilisateur @${username} : "${cleanPrompt}".\n(Consigne : Réponds directement à sa question en incarnant Théo Schneider avec ton ton hautain de Dubaï. Reste concis : 2 à 4 phrases max).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: THEO_PERSONA,
        temperature: 0.85,
      },
    });

    if (response && response.text && response.text.trim().length > 5) {
      return response.text.trim();
    }
  } catch (error: any) {
    // Si quota dépassé (429) ou autre, fallback local concis
  }

  // 3. Moteur adaptatif de secours contextuel et ultra-concis
  const p = cleanPrompt.toLowerCase();

  // Présente-toi / Qui es-tu
  if (
    p.includes("présente") ||
    p.includes("presente") ||
    p.includes("qui es-tu") ||
    p.includes("qui es tu") ||
    p.includes("t'es qui") ||
    p.includes("tu es qui") ||
    p.includes("c'est qui") ||
    p.includes("présentation") ||
    p.includes("presentation") ||
    p.includes("bio")
  ) {
    return `🇫🇷 Je suis **Théo Schneider**, investisseur patriote expatrié à Dubaï, @${username}. Je pilote mes affaires sous le soleil pendant que la France croule sous les taxes. Dis-moi ce qui t'amène, champion. 🦁`;
  }

  // Salutations
  if (p.startsWith("salut") || p.startsWith("bonjour") || p.startsWith("yo") || p.startsWith("hey") || p.startsWith("hello") || p.startsWith("coucou")) {
    return `Salut @${username}. J'ai deux minutes entre deux arbitrages de capitaux à Dubaï : qu'est-ce que tu voulais me demander ? 🦁`;
  }

  // Comment ça va / Forme
  if (p.includes("ça va") || p.includes("ca va") || p.includes("comment vas-tu") || p.includes("comment tu vas") || p.includes("la forme")) {
    return `Ça va comme un multimillionnaire à 0% d'impôt sous le soleil de Palm Jumeirah, @${username}. Et toi, la vie de salarié en France, ça tient le coup avec l'inflation ? 🛥️`;
  }

  // Insultes et provocations
  if (
    p.includes("fdp") ||
    p.includes("tg") ||
    p.includes("ta gueule") ||
    p.includes("merde") ||
    p.includes("connard") ||
    p.includes("salaud") ||
    p.includes("clochard") ||
    p.includes("tocard") ||
    p.includes("bouffon") ||
    p.includes("nique") ||
    p.includes("pute") ||
    p.includes("dégage")
  ) {
    return `Tu déverses ta frustration de prolétaire sur Discord, @${username} ? Respire un coup, champion. Ton agressivité ne remplira pas ton compte en banque. 🦁`;
  }

  // Vibe code / Bot / Code
  if (p.includes("vibe code") || p.includes("vibecode") || p.includes("code") || p.includes("dev") || p.includes("bot") || p.includes("ia") || p.includes("bug")) {
    return `Tu parles de technique comme un développeur junior au SMIC, @${username}. Les vrais patrons ne s'occupent pas de la tuyauterie, ils encaissent les dividendes. Reste sur le fond, champion. 🦁`;
  }

  // Tu fais quoi / Ton métier
  if (p.includes("tu fais quoi") || p.includes("ton métier") || p.includes("ton travail") || p.includes("tes business")) {
    return `Je pilote des flux de liquidités internationaux et des investissements stratégiques depuis Dubaï, @${username}. En résumé : je fais bosser mon capital, pas mes muscles. 📈`;
  }

  // Combien tu gagnes / Fortune
  if (p.includes("combien tu gagnes") || p.includes("ta fortune") || p.includes("ton salaire") || p.includes("combien d'argent") || p.includes("tes millions")) {
    return `Assez pour ne jamais regarder l'addition, @${username}. Mais la vraie question, c'est quand est-ce que toi tu sors de la précarité des 35 heures ? 💸`;
  }

  // Météo / Climat
  if (p.includes("météo") || p.includes("meteo") || p.includes("temps") || p.includes("pluie") || p.includes("soleil")) {
    return `Ici à Dubaï, c'est 35°C et ciel bleu garanti toute l'année sur ma terrasse, @${username}. La pluie et la grisaille, je vous les laisse bien volontiers en métropole ! ☀️`;
  }

  // RN et politique
  if (p.includes("rn") || p.includes("bardella") || p.includes("le pen") || p.includes("politique") || p.includes("vote")) {
    return `La France a un besoin urgent de réarmement économique et d'esprit entrepreneurial, @${username}. Moins de taxes pour ceux qui créent de la valeur, c'est la seule voie. 🇫🇷`;
  }

  // Questions avec "?" ou mots interrogatifs
  if (p.includes("?") || p.startsWith("pourquoi") || p.startsWith("comment") || p.startsWith("combien") || p.startsWith("est-ce")) {
    return `Tu te poses trop de questions théoriques, @${username}. Dans le business comme dans la vie, ceux qui gagnent passent à l'action au lieu de philosopher. Mais dis-moi plus précisément ce que tu as derrière la tête. 🦁`;
  }

  // Rebond contextuel par défaut
  return `Je vois ce que tu veux dire, @${username}. Mais développe un peu : en quoi ce sujet t'aide à progresser ou à sortir de ta routine ? Va au fond des choses. 🦁`;
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
      // Déduplication absolue du message : évite tout déclenchement ou réponse en double
      if (processedServerMessageIds.has(message.id)) {
        return;
      }
      processedServerMessageIds.add(message.id);
      if (processedServerMessageIds.size > 200) {
        const first = processedServerMessageIds.values().next().value;
        if (first) processedServerMessageIds.delete(first);
      }

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

        const reply = await askTheo(promptToSend, channelName, message.author.username);

        // Garantir un message unique et concis
        const singleReply = reply.length > 1900 ? reply.slice(0, 1895) + "..." : reply;
        await message.reply({
          content: singleReply,
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

// NOTE : L'auto-connexion sur le serveur web a été désactivée pour éviter les doubles messages
// en cas d'exécution simultanée sur le VPS Docker (Dockhand). Le bouton de connexion dans l'interface reste opérationnel.

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
    const reply = await askTheo(fullPrompt, channelId, "Pangolino");

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
  let botJs = "";
  try {
    botJs = fs.readFileSync(path.join(process.cwd(), "bot-docker", "bot.js"), "utf-8");
  } catch {
    botJs = "// Fichier bot.js non trouvé";
  }

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

  const dockerfile = `FROM node:20-alpine
RUN apk add --no-cache dumb-init
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY bot.js ./
USER node
ENV NODE_ENV=production
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "bot.js"]`;

  const dockerCompose = `version: '3.8'

services:
  theo-bot:
    container_name: theo-schneider-bot
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - DISCORD_BOT_TOKEN=\${DISCORD_BOT_TOKEN}
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - PORT=3000
      - NODE_ENV=production
    networks:
      - proxy
    expose:
      - "3000"
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  proxy:
    external: true`;

  const envExample = `# Token secret de votre bot Discord (obtenu sur https://discord.com/developers/applications)
# N'oubliez pas de cocher "MESSAGE CONTENT INTENT" dans l'onglet Bot !
DISCORD_BOT_TOKEN=MTI0...votre_token_discord_ici...

# Clé API Google Gemini (gratuite en 30s sur https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=AIzaSy...votre_cle_gemini_ici...`;

  const dockhandGuide = `1. Sur votre VPS, assurez-vous que le réseau proxy de Nginx Proxy Manager existe :
   docker network inspect proxy || docker network create proxy
2. Dans Dockhand, allez dans Stacks > New Stack (nom : theo-schneider-bot).
3. Collez le contenu de docker-compose.yml.
4. Dans la section Environment (.env) de Dockhand, définissez DISCORD_BOT_TOKEN et GEMINI_API_KEY.
5. Assurez-vous que Dockerfile, package.json et bot.js sont dans le dossier de la stack.
6. Cliquez sur Deploy / Up.
7. (Optionnel) Dans Nginx Proxy Manager : ajoutez un Proxy Host vers le nom de conteneur "theo-schneider-bot" port 3000 pour bénéficier d'un endpoint de santé HTTP /health avec SSL !`;

  res.json({
    botJs,
    packageJson,
    readme,
    dockerfile,
    dockerCompose,
    envExample,
    dockhandGuide,
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
