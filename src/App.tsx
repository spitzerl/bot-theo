import React, { useState, useEffect } from "react";
import { DiscordHeader } from "./components/DiscordHeader";
import { DiscordSidebar } from "./components/DiscordSidebar";
import { DiscordChat } from "./components/DiscordChat";
import { DiscordMemberList } from "./components/DiscordMemberList";
import { DiscordSetupModal } from "./components/DiscordSetupModal";
import { TheoLiesGenerator } from "./components/TheoLiesGenerator";
import {
  CHANNELS,
  CURRENT_USER,
  INITIAL_MESSAGES,
  THEO_USER,
  OTHER_USERS,
} from "./data/mockDiscord";
import { BotStatusResponse, DiscordMessage } from "./types";

export default function App() {
  const [activeChannelId, setActiveChannelId] = useState<string>("general");
  const [messagesByChannel, setMessagesByChannel] = useState<
    Record<string, DiscordMessage[]>
  >(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [botStatus, setBotStatus] = useState<BotStatusResponse | null>(null);
  const [showMemberList, setShowMemberList] = useState<boolean>(true);
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isLiesOpen, setIsLiesOpen] = useState<boolean>(false);

  // Fetch real bot connection status
  const refreshBotStatus = async () => {
    try {
      const res = await fetch("/api/bot/status");
      if (res.ok) {
        const data = await res.json();
        setBotStatus(data);
      }
    } catch (e) {
      console.error("Erreur statut bot:", e);
    }
  };

  useEffect(() => {
    refreshBotStatus();
    const interval = setInterval(refreshBotStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  const activeChannel =
    CHANNELS.find((c) => c.id === activeChannelId) || CHANNELS[0];
  const activeMessages = messagesByChannel[activeChannelId] || [];

  const handleSendMessage = async (content: string, replyToMessage?: DiscordMessage) => {
    const timestamp = "Aujourd'hui à " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMessage: DiscordMessage = {
      id: `msg-${Date.now()}`,
      author: CURRENT_USER,
      content,
      timestamp,
      channelId: activeChannelId,
      replyTo: replyToMessage
        ? {
            id: replyToMessage.id,
            authorName: replyToMessage.author.username,
            content: replyToMessage.content.slice(0, 60),
          }
        : undefined,
    };

    // Add user message immediately
    setMessagesByChannel((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), userMessage],
    }));

    // Trigger Théo ONLY if:
    // 1. User replies to a message from Théo
    // 2. User mentions Théo (@Théo, @Théo Schneider, etc.)
    const lower = content.toLowerCase();
    const isReplyingToTheo = Boolean(replyToMessage && (replyToMessage.author.id === THEO_USER.id || replyToMessage.isJordan));
    const isTheoMentioned =
      lower.includes("théo") ||
      lower.includes("theo") ||
      lower.includes("schneider") ||
      lower.includes("@théo") ||
      lower.includes("@theo");

    const isTheoInvoked = isReplyingToTheo || isTheoMentioned;

    if (isTheoInvoked) {
      setIsTyping(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            channelId: activeChannel.name,
            referencedMessage: replyToMessage?.content,
          }),
        });

        if (!res.ok) {
          throw new Error("Erreur de réponse du serveur");
        }

        const data = await res.json();

        // Optional promo embed
        const embeds = data.formationPitchDetected
          ? [
              {
                title: "🇫🇷 L'ACADÉMIE EMPIRE MILLIONNAIRE (ÉDITION PATRIOTIQUE)",
                description:
                  "Rejoignez l'élite souveraine à Dubaï. Sortez de l'assistanat fiscal et investissez dans le redressement économique !\n\n" +
                  "• **Prix public :** ~~40 000 €~~\n" +
                  "• **Tarif patriote Discord :** **997 €** *(places d'honneur limitées)*\n" +
                  "• **Bonus :** Accès à la masterclass secrète sur la Souveraineté Liquide Décentralisée",
                color: "#3B82F6",
                fields: [
                  { name: "Mindset", value: "Patriote Souverain 100x", inline: true },
                  { name: "Levier", value: "Quantique National", inline: true },
                ],
                footer: { text: "Empire Souverain LLC • Dubaï & Paris • Réservé aux bâtisseurs" },
              },
            ]
          : undefined;

        const theoMessage: DiscordMessage = {
          id: `msg-theo-${Date.now()}`,
          author: THEO_USER,
          content: data.reply,
          timestamp: "Aujourd'hui à " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          channelId: activeChannelId,
          isJordan: true,
          replyTo: {
            id: userMessage.id,
            authorName: CURRENT_USER.username,
            content: userMessage.content.slice(0, 60),
          },
          mythometerScore: data.mythometerScore || 95,
          jargonDetected: data.jargonDetected || [],
          formationPitchDetected: data.formationPitchDetected,
          embeds,
          reactions: [
            { emoji: "🇫🇷", count: 7, users: [] },
            { emoji: "🚀", count: 4, users: [] },
            { emoji: "💸", count: 5, users: [] },
          ],
        };

        setMessagesByChannel((prev) => ({
          ...prev,
          [activeChannelId]: [...(prev[activeChannelId] || []), theoMessage],
        }));
      } catch (err) {
        console.error("Failed to ask Theo:", err);
        const errorMessage: DiscordMessage = {
          id: `msg-theo-err-${Date.now()}`,
          author: THEO_USER,
          content:
            "🇫🇷 Écoute mon grand, la connexion satellitaire entre mon yacht à Palm Jumeirah et le siège du RN a eu une micro-désynchronisation souveraine. Mais n'oublie jamais : **L'académie Empire Millionnaire** est à seulement **997 € au lieu de 40 000 €** ! Ne laisse pas un ralentissement de salarié t'empêcher de participer au redressement ! 🚀",
          timestamp,
          channelId: activeChannelId,
          isJordan: true,
          mythometerScore: 100,
        };
        setMessagesByChannel((prev) => ({
          ...prev,
          [activeChannelId]: [...(prev[activeChannelId] || []), errorMessage],
        }));
      } finally {
        setIsTyping(false);
      }
    }
  };

  return (
    <div
      id="discord-app-root"
      className="flex h-screen w-screen overflow-hidden bg-[#1E1F22] text-[#DBDEE1] font-sans antialiased select-none"
    >
      {/* Discord Left Sidebars (Guilds + Channels) */}
      <DiscordSidebar
        channels={CHANNELS}
        activeChannelId={activeChannelId}
        onSelectChannel={setActiveChannelId}
        currentUser={CURRENT_USER}
        jordanUser={THEO_USER}
        botStatus={botStatus}
        onOpenSetup={() => setIsSetupOpen(true)}
      />

      {/* Main Discord Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#313338]">
        <DiscordHeader
          channel={activeChannel}
          botStatus={botStatus}
          onOpenSetup={() => setIsSetupOpen(true)}
          onOpenLies={() => setIsLiesOpen(true)}
          showMemberList={showMemberList}
          onToggleMemberList={() => setShowMemberList(!showMemberList)}
        />

        <div className="flex-1 flex overflow-hidden">
          <DiscordChat
            channel={activeChannel}
            messages={activeMessages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            jordanUser={THEO_USER}
          />

          {showMemberList && (
            <DiscordMemberList
              jordanUser={THEO_USER}
              currentUser={CURRENT_USER}
              otherUsers={OTHER_USERS}
              onMentionUser={(username) => {
                handleSendMessage(`@${username} viens voir ça !`);
              }}
            />
          )}
        </div>
      </div>

      {/* Bot Setup & Live Connection Modal */}
      <DiscordSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        botStatus={botStatus}
        onRefreshStatus={refreshBotStatus}
      />

      {/* Absurd Lies Generator Modal */}
      <TheoLiesGenerator
        isOpen={isLiesOpen}
        onClose={() => setIsLiesOpen(false)}
        onSendToChat={handleSendMessage}
      />
    </div>
  );
}
