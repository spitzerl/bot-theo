import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  AlertCircle,
  HelpCircle,
  PlusCircle,
  Smile,
  Flame,
  BadgeAlert,
  Crown,
  Share2,
  Reply,
  X,
  CornerUpLeft,
} from "lucide-react";
import { DiscordMessage, DiscordChannel, DiscordUser } from "../types";
import { QUICK_PROMPTS } from "../data/mockDiscord";

interface Props {
  channel: DiscordChannel;
  messages: DiscordMessage[];
  onSendMessage: (content: string, replyToMessage?: DiscordMessage) => void;
  isTyping: boolean;
  jordanUser: DiscordUser;
}

export const DiscordChat: React.FC<Props> = ({
  channel,
  messages,
  onSendMessage,
  isTyping,
  jordanUser,
}) => {
  const [inputVal, setInputVal] = useState("");
  const [replyingTo, setReplyingTo] = useState<DiscordMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isTyping) return;

    onSendMessage(inputVal.trim(), replyingTo || undefined);
    setInputVal("");
    setReplyingTo(null);
  };

  const handleStartReply = (msg: DiscordMessage) => {
    setReplyingTo(msg);
    inputRef.current?.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleQuickPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  const addMention = () => {
    const mention = `@Théo Schneider `;
    if (!inputVal.includes(mention)) {
      setInputVal((prev) => mention + prev);
    }
    inputRef.current?.focus();
  };

  // Helper to format text with Discord-like mentions and bold
  const renderMessageContent = (content: string) => {
    // Replace mentions with styled pill
    const parts = content.split(/(@Théo\s*Schneider|@Théo|@Jordan\s*"Alpha"\s*Sterling|@Jordan|@\w+)/gi);

    return parts.map((part, index) => {
      if (
        part.toLowerCase().includes("théo") ||
        part.toLowerCase().includes("theo") ||
        part.toLowerCase().includes("schneider") ||
        part.toLowerCase().includes("jordan")
      ) {
        return (
          <span
            key={index}
            className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#5865F2]/20 text-[#c9cdfb] font-semibold text-[13px] mx-0.5 hover:bg-[#5865F2]/30 cursor-pointer"
          >
            {part}
          </span>
        );
      }
      if (part.startsWith("@")) {
        return (
          <span
            key={index}
            className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#5865F2]/15 text-[#b0b7ff] font-medium text-[13px] mx-0.5"
          >
            {part}
          </span>
        );
      }

      // Format bold markdown (**text**)
      const boldParts = part.split(/(\*\*.*?\*\*)/g);
      return boldParts.map((subPart, subIdx) => {
        if (subPart.startsWith("**") && subPart.endsWith("**")) {
          return (
            <strong key={`${index}-${subIdx}`} className="text-white font-bold">
              {subPart.slice(2, -2)}
            </strong>
          );
        }
        return <span key={`${index}-${subIdx}`}>{subPart}</span>;
      });
    });
  };

  return (
    <div
      id="discord-chat-container"
      className="flex-1 flex flex-col h-full bg-[#313338] overflow-hidden relative"
    >
      {/* 1. Messages scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Channel welcome banner */}
        <div className="pt-6 pb-4 border-b border-[#35373c] text-left">
          <div className="w-14 h-14 rounded-full bg-[#3f4147] flex items-center justify-center text-white mb-2">
            <span className="text-2xl font-bold">#</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Bienvenue dans {channel.name} !
          </h2>
          <p className="text-xs text-[#949BA4] mt-1">
            C'est le début du salon {channel.name}. Mentionnez{" "}
            <span className="text-[#c9cdfb] bg-[#5865F2]/20 px-1 py-0.5 rounded font-semibold">
              @Théo Schneider
            </span>{" "}
            pour recevoir ses leçons pseudo-patriotiques pro-RN et son pitch pour l'Académie à 997 € depuis Dubaï !
          </p>
        </div>

        {/* Message Items */}
        {messages.map((msg) => {
          const isJordan = msg.author.id === jordanUser.id || msg.isJordan;

          return (
            <div
              key={msg.id}
              id={`discord-msg-${msg.id}`}
              className={`relative flex flex-col text-[14px] leading-relaxed group hover:bg-[#2e3035]/60 -mx-4 px-4 py-1.5 transition-colors rounded ${
                isJordan ? "bg-blue-950/15 border-l-2 border-blue-500/60" : ""
              }`}
            >
              {/* Floating Action Button on Hover (Reply) */}
              <div className="absolute right-4 -top-3 hidden group-hover:flex items-center bg-[#313338] border border-[#3f4147] rounded shadow-md z-10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleStartReply(msg)}
                  className="px-2 py-1 flex items-center gap-1.5 text-xs text-[#B5BAC1] hover:text-white hover:bg-[#35373C] transition-colors"
                  title="Répondre à ce message (déclenche le bot si on répond à Théo)"
                >
                  <Reply className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-medium">Répondre</span>
                </button>
              </div>

              {/* Replied Message Branch (Discord native reply header) */}
              {msg.replyTo && (
                <div className="flex items-center gap-1.5 text-[12px] text-[#949BA4] mb-1 ml-9 relative before:content-[''] before:absolute before:-left-5 before:top-2 before:w-3.5 before:h-2 before:border-l-2 before:border-t-2 before:border-[#4E5058] before:rounded-tl">
                  <CornerUpLeft className="w-3 h-3 text-[#949BA4] shrink-0" />
                  <span className="font-semibold text-blue-300">
                    @{msg.replyTo.authorName}
                  </span>
                  <span className="truncate max-w-sm text-[#949BA4] italic text-[11px]">
                    "{msg.replyTo.content}"
                  </span>
                </div>
              )}

              <div className="flex gap-3">
                {/* Author Avatar */}
                <div className="relative shrink-0 pt-0.5">
                  <img
                    src={msg.author.avatar}
                    alt={msg.author.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>

                {/* Message Content */}
                <div className="flex-1 overflow-hidden">
                {/* Header: Author + Bot badge + Timestamp */}
                <div className="flex items-center gap-1.5 leading-none mb-1">
                  <span
                    className="font-bold text-[14px] hover:underline cursor-pointer"
                    style={{ color: msg.author.roleColor || (isJordan ? "#60A5FA" : "#DBDEE1") }}
                  >
                    {msg.author.username}
                  </span>

                  {isJordan && (
                    <span className="bg-[#5865F2] text-[10px] font-bold text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                      BOT
                    </span>
                  )}

                  <span className="text-[11px] text-[#949BA4] ml-1">
                    {msg.timestamp}
                  </span>

                  {isJordan && msg.mythometerScore && (
                    <span className="ml-auto text-[11px] font-semibold text-blue-300 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>Mytho : {msg.mythometerScore}%</span>
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="text-[#DBDEE1] text-[14px] whitespace-pre-wrap select-text">
                  {renderMessageContent(msg.content)}
                </div>

                {/* Discord Embed (if present) */}
                {msg.embeds && msg.embeds.length > 0 && (
                  <div className="mt-2.5 space-y-2">
                    {msg.embeds.map((embed, i) => (
                      <div
                        key={i}
                        className="max-w-lg rounded-md bg-[#2B2D31] border-l-4 p-3.5 shadow-md"
                        style={{ borderLeftColor: embed.color || "#3B82F6" }}
                      >
                        {embed.title && (
                          <h4 className="text-white font-bold text-sm mb-1.5 flex items-center gap-1.5">
                            <Crown className="w-4 h-4 text-amber-400" />
                            {embed.title}
                          </h4>
                        )}
                        {embed.description && (
                          <p className="text-xs text-[#DBDEE1] whitespace-pre-line leading-relaxed mb-3">
                            {embed.description}
                          </p>
                        )}
                        {embed.fields && (
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {embed.fields.map((f, fIdx) => (
                              <div
                                key={fIdx}
                                className="bg-[#1E1F22] p-2 rounded text-xs"
                              >
                                <span className="font-semibold text-blue-300 block text-[11px]">
                                  {f.name}
                                </span>
                                <span className="text-[#DBDEE1]">{f.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {embed.footer && (
                          <p className="text-[10px] text-[#949BA4] mt-2 border-t border-[#35363C] pt-1.5">
                            {embed.footer.text}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {msg.reactions.map((r, rIdx) => (
                      <button
                        key={rIdx}
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[#2B2D31] hover:bg-[#35373c] text-[#DBDEE1] border border-[#3f4147] transition-colors"
                      >
                        <span>{r.emoji}</span>
                        <span className="font-semibold">{r.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Discord Typing Indicator */}
      {isTyping && (
        <div className="flex items-center gap-3 -mx-4 px-4 py-2 bg-[#2e3035]/40 rounded animate-pulse">
          <img
            src={jordanUser.avatar}
            alt="Théo"
            className="w-10 h-10 rounded-full object-cover border border-blue-400/40"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400">
                Théo Schneider
              </span>
              <span className="text-[10px] text-blue-300/80 bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-500/20">
                Écrit depuis son Penthouse à Palm Jumeirah (Dubaï)...
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#949BA4]">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] text-zinc-400">
                Prépare un plaidoyer patriotique pour le RN et sa promo à 997 €...
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>

    {/* 2. Quick Suggestions Chips bar */}
    <div className="px-4 py-2 bg-[#2B2D31]/70 border-t border-[#35373c] overflow-x-auto flex items-center gap-2 select-none shrink-0 no-scrollbar">
      <span className="text-[11px] font-bold text-[#949BA4] uppercase shrink-0 flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
        Suggestions :
      </span>
      {QUICK_PROMPTS.map((qp, idx) => (
        <button
          key={idx}
          onClick={() => handleQuickPrompt(qp.prompt)}
          disabled={isTyping}
          className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-[#313338] hover:bg-[#35373c] text-[#DBDEE1] hover:text-white border border-[#3f4147] transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <span>{qp.title}</span>
        </button>
      ))}
    </div>

    {/* 3. Discord Input Field */}
    <div className="p-4 bg-[#313338] pt-2">
      {/* Active Reply Header (when replying to a message) */}
      {replyingTo && (
        <div className="bg-[#2B2D31] px-3 py-1.5 rounded-t-lg border-t border-x border-[#3f4147] flex items-center justify-between text-xs text-[#B5BAC1]">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Reply className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Réponse à</span>
            <span className="font-semibold text-blue-300">
              @{replyingTo.author.username}
            </span>
            <span className="truncate max-w-xs text-zinc-400 italic">
              "{replyingTo.content.slice(0, 45)}..."
            </span>
          </div>
          <button
            onClick={handleCancelReply}
            className="p-1 hover:text-white hover:bg-[#35373C] rounded transition-colors"
            title="Annuler la réponse"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`bg-[#383A40] ${
          replyingTo ? "rounded-b-lg" : "rounded-lg"
        } px-3 py-2.5 flex items-center gap-2 focus-within:ring-1 focus-within:ring-[#5865F2]`}
      >
        {/* Mention Théo button */}
        <button
          type="button"
          onClick={addMention}
          className="p-1 rounded-md bg-[#5865F2]/20 hover:bg-[#5865F2]/35 text-[#c9cdfb] text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
          title="Mentionner le bot @Théo Schneider"
        >
          <span>@Théo</span>
        </button>

        <input
          ref={inputRef}
          id="discord-message-input"
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={isTyping}
          placeholder={
            replyingTo
              ? `Répondre à @${replyingTo.author.username}...`
              : `Envoyer un message dans #${channel.name} (mentionnez @Théo ou répondez à ses messages)...`
          }
          className="bg-transparent flex-1 text-white text-sm outline-none placeholder-[#80848E]"
        />

        <button
          type="submit"
          id="btn-submit-discord-msg"
          disabled={!inputVal.trim() || isTyping}
          className={`p-1.5 rounded-md transition-all ${
            inputVal.trim() && !isTyping
              ? "bg-[#5865F2] text-white hover:bg-[#4752C4]"
              : "text-[#80848E] cursor-not-allowed opacity-50"
          }`}
          title="Envoyer (Entrée)"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      <p className="text-[11px] text-[#949BA4] mt-1.5 text-center flex items-center justify-center gap-1">
        <span>Sur Discord : le bot répond</span>
        <span className="text-blue-300 font-semibold">uniquement</span>
        <span>si on le</span>
        <code className="text-blue-300 font-mono bg-[#2B2D31] px-1 rounded">
          mentionne
        </code>
        <span>ou si on</span>
        <code className="text-blue-300 font-mono bg-[#2B2D31] px-1 rounded">
          répond à un de ses messages
        </code>
        <span>.</span>
      </p>
    </div>
    </div>
  );
};
