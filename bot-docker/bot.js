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

// Moteur de secours intelligent, ciblé et ultra-concis (utilisé seulement si l'API IA est indisponible)
function generateAdaptiveTheoReply(rawPrompt, username, referencedContent) {
  const p = (rawPrompt || "").toLowerCase().trim();

  // Présentation / identité
  if (p.includes("qui es-tu") || p.includes("t'es qui") || p.includes("présente") || p.includes("presente") || p.includes("bio") || p.includes("c'est qui") || p.includes("qui est theo")) {
    return `🇫🇷 Je suis **Théo Schneider**, investisseur patriote expatrié à Dubaï, @${username}. Je pilote mes affaires sous le soleil pendant que la France croule sous les taxes. Dis-moi ce qui t'amène, champion. 🦁`;
  }

  // Politesse / Salutations
  if (p.startsWith("salut") || p.startsWith("bonjour") || p.startsWith("yo") || p.startsWith("hey") || p.startsWith("hello") || p.startsWith("coucou")) {
    return `Salut @${username}. J'ai deux minutes entre deux arbitrages de capitaux à Dubaï : qu'est-ce que tu voulais me demander ? 🦁`;
  }

  // Comment ça va / Forme
  if (p.includes("ça va") || p.includes("ca va") || p.includes("comment vas-tu") || p.includes("comment tu vas") || p.includes("la forme")) {
    return `Ça va comme un multimillionnaire à 0% d'impôt sous le soleil de Palm Jumeirah, @${username}. Et toi, la vie de salarié en France, ça tient le coup avec l'inflation ? 🛥️`;
  }

  // Insultes / Provocations
  if (p.includes("tg") || p.includes("ta gueule") || p.includes("fdp") || p.includes("connard") || p.includes("clochard") || p.includes("merde") || p.includes("tocard") || p.includes("nique")) {
    return `Tu déverses ta frustration de prolétaire sur Discord, @${username} ? Respire un coup, champion. Ton agressivité ne remplira pas ton compte en banque. 🦁`;
  }

  // Métier / Activités
  if (p.includes("tu fais quoi") || p.includes("ton travail") || p.includes("ton métier") || p.includes("tes affaires") || p.includes("tes business")) {
    return `Je pilote des flux de liquidités internationaux et des investissements stratégiques depuis Dubaï, @${username}. En résumé : je fais bosser mon capital, pas mes muscles. 📈`;
  }

  // Fortune / Salaire
  if (p.includes("combien tu gagnes") || p.includes("ta fortune") || p.includes("combien d'argent") || p.includes("ton salaire") || p.includes("es-tu riche")) {
    return `Assez pour ne jamais regarder l'addition, @${username}. Mais la vraie question, c'est quand est-ce que toi tu sors de la précarité des 35 heures ? 💸`;
  }

  // Météo / Climat
  if (p.includes("météo") || p.includes("meteo") || p.includes("temps") || p.includes("pluie") || p.includes("soleil") || p.includes("fait beau")) {
    return `Ici à Dubaï, c'est 35°C et ciel bleu garanti toute l'année sur ma terrasse, @${username}. La pluie et la grisaille, je vous les laisse bien volontiers en métropole ! ☀️`;
  }

  // Code / Bot / Bug / Vibe code
  if (p.includes("code") || p.includes("bot") || p.includes("ia") || p.includes("vibe") || p.includes("bug") || p.includes("programme")) {
    return `Tu parles de technique comme un développeur junior au SMIC, @${username}. Les vrais patrons ne s'occupent pas de la tuyauterie, ils encaissent les dividendes. Reste sur le fond, champion. 🦁`;
  }

  // Politique / RN / Bardella
  if (p.includes("rn") || p.includes("bardella") || p.includes("politique") || p.includes("vote") || p.includes("macron") || p.includes("le pen")) {
    return `La France a un besoin urgent de réarmement économique et d'esprit entrepreneurial, @${username}. Moins de taxes pour ceux qui créent de la valeur, c'est la seule voie. 🇫🇷`;
  }

  // Question générale (pourquoi, comment, est-ce que, etc.)
  if (p.includes("?") || p.startsWith("pourquoi") || p.startsWith("comment") || p.startsWith("est-ce")) {
    return `Tu te poses trop de questions théoriques, @${username}. Dans le business comme dans la vie, ceux qui gagnent passent à l'action au lieu de philosopher. Mais dis-moi plus précisément ce que tu as derrière la tête. 🦁`;
  }

  // Réponse conversationnelle par défaut, concentrée sur le message de l'utilisateur
  return `Je vois ce que tu veux dire, @${username}. Mais développe un peu : en quoi ce sujet t'aide à progresser ou à sortir de ta routine ? Va au fond des choses. 🦁`;
}

// Cache de déduplication des messages Discord (évite absolument tout message en double)
const processedMessageIds = new Set();

// Fonction pour appeler Groq (Llama-3.3 70B - Optionnel, instantané)
async function callGroqAI(userPrompt, username, referencedContent) {
  if (!GROQ_API_KEY) return null;
  try {
    let content = `Message de l'utilisateur Discord @${username} : "${userPrompt}"`;
    if (referencedContent) {
      content = `[En réponse à ton message précédent : "${referencedContent}"]\n${content}`;
    }
    content += `\n(Consigne : Réponds DIRECTEMENT et PRÉCISÉMENT à ce que dit @${username}. Reste concis : 2 à 4 phrases max, style Discord, avec ton arrogance comique d'expatrié à Dubaï. Ne déverse pas d'informations hors-sujet).`;

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
          { role: "user", content: content },
        ],
        temperature: 0.85,
        max_tokens: 350,
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

// Fonction pour appeler Google Gemini avec tout le contexte de la discussion
async function callGeminiAI(userPrompt, username, channel, referencedContent) {
  if (!ai || !GEMINI_API_KEY || GEMINI_API_KEY.includes("votre_cle")) return null;

  // Récupérer le contexte récent du salon Discord pour que Gemini ait toute la discussion
  const contents = [];

  if (channel && "messages" in channel) {
    try {
      const recentMessages = await channel.messages.fetch({ limit: 6 }).catch(() => null);
      if (recentMessages && recentMessages.size > 0) {
        const sorted = Array.from(recentMessages.values())
          .filter((m) => m.content && m.content.trim().length > 0)
          .sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        for (const m of sorted) {
          if (m.content.includes(userPrompt)) continue;

          if (m.author.id === client.user?.id) {
            contents.push({
              role: "model",
              parts: [{ text: m.content }],
            });
          } else {
            const author = m.author.displayName || m.author.username;
            const clean = m.content.replace(new RegExp(`<@!?${client.user?.id}>`, "g"), "").trim();
            if (clean) {
              contents.push({
                role: "user",
                parts: [{ text: `[${author}] : ${clean}` }],
              });
            }
          }
        }
      }
    } catch {
      // Pas de permission historique, pas de blocage
    }
  }

  let promptText = `[Message Discord de @${username}] : "${userPrompt}"`;
  if (referencedContent) {
    promptText = `[En réponse au message de Théo : "${referencedContent}"]\n${promptText}`;
  }

  contents.push({
    role: "user",
    parts: [
      {
        text: `${promptText}\n\n(Consigne : Réponds DIRECTEMENT à @${username} sur ce qu'il te dit, sans réciter de détails hors-sujet. Incarne Théo Schneider avec ton ton hautain et arrogant d'expatrié à Dubaï en 2 à 4 phrases max).`,
      },
    ],
  });

  const models = ["gemini-3.8-flash", "gemini-flash-latest"];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction: THEO_PERSONA,
          temperature: 0.85,
        },
      });

      if (response?.text && response.text.trim().length > 5) {
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

  // Déduplication absolue du message : évite tout déclenchement ou réponse en double
  if (processedMessageIds.has(message.id)) {
    return;
  }
  processedMessageIds.add(message.id);
  if (processedMessageIds.size > 200) {
    const [first] = processedMessageIds;
    processedMessageIds.delete(first);
  }

  try {
    if ("sendTyping" in message.channel) {
      await message.channel.sendTyping().catch(() => null);
    }

    // Nettoyer la mention pour garder le texte réel
    const cleanContent = message.content
      .replace(new RegExp(`<@!?${botUser.id}>`, "g"), "")
      .trim();

    const promptToUse = cleanContent || "Théo, donne-moi ton avis.";

    console.log(`📩 [Discord] Message reçu de @${message.author.username} dans #${message.channel.name || "dm"} : "${cleanContent}"`);

    let replyText = "";

    // 1. Essai avec Groq AI en priorité si configuré (gratuit, instantané, sans blocage)
    if (GROQ_API_KEY) {
      replyText = await callGroqAI(promptToUse, message.author.username, referencedContent);
      if (replyText) {
        console.log(`✅ [Groq AI] Réponse générée avec succès pour @${message.author.username} !`);
      }
    }

    // 2. Essai avec Gemini AI (gemini-3.8-flash) avec contexte complet du salon Discord
    if (!replyText && GEMINI_API_KEY && !GEMINI_API_KEY.includes("votre_cle")) {
      replyText = await callGeminiAI(promptToUse, message.author.username, message.channel, referencedContent);
      if (replyText) {
        console.log(`✅ [Gemini AI] Réponse générée avec succès pour @${message.author.username} !`);
      }
    }

    // 3. Moteur adaptatif contextuel ultra-concis si l'IA distante n'a pas répondu
    if (!replyText) {
      console.log(`⚡ [Moteur Adaptatif] Réponse de secours concise pour @${message.author.username}...`);
      replyText = generateAdaptiveTheoReply(cleanContent, message.author.username, referencedContent);
    }

    // Envoi garanti d'un SEUL et unique message (sans découpage en plusieurs envois)
    const finalReply = replyText.length > 1900 ? replyText.slice(0, 1895) + "..." : replyText;
    await message.reply({
      content: finalReply,
      allowedMentions: { repliedUser: true },
    });
  } catch (error) {
    console.error("❌ Erreur traitement message :", error);
    await message.reply({
      content: "🇫🇷 Un imprévu temporaire à Dubaï, champion. Repose ta question dans un instant ! 🦁",
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
