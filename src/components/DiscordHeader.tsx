import React from "react";
import { Hash, Radio, Sparkles, Code2, Users, Bot, Flame } from "lucide-react";
import { DiscordChannel, BotStatusResponse } from "../types";

interface Props {
  channel: DiscordChannel;
  botStatus: BotStatusResponse | null;
  onOpenSetup: () => void;
  onOpenLies: () => void;
  showMemberList: boolean;
  onToggleMemberList: () => void;
}

export const DiscordHeader: React.FC<Props> = ({
  channel,
  botStatus,
  onOpenSetup,
  onOpenLies,
  showMemberList,
  onToggleMemberList,
}) => {
  return (
    <header
      id="discord-channel-header"
      className="h-12 border-b border-[#1f2023] bg-[#313338] px-4 flex items-center justify-between select-none shrink-0 z-10 shadow-sm"
    >
      <div className="flex items-center gap-2 overflow-hidden mr-3">
        <Hash className="w-5 h-5 text-[#80848E] shrink-0" />
        <span className="font-semibold text-white text-[15px] truncate">
          {channel.name}
        </span>
        <div className="hidden md:block h-4 w-[1px] bg-[#3f4147] mx-2 shrink-0" />
        <p className="hidden md:block text-xs text-[#949BA4] truncate max-w-md">
          {channel.topic}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Real Discord Bot Connection Status Pill */}
        <button
          id="btn-bot-status-pill"
          onClick={onOpenSetup}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
            botStatus?.isConnected
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900/50"
              : "bg-[#2B2D31] text-[#B5BAC1] border-[#3f4147] hover:bg-[#35373c] hover:text-white"
          }`}
          title="Gérer la connexion réelle au bot Discord"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              botStatus?.isConnected
                ? "bg-emerald-400 animate-pulse"
                : "bg-gray-400"
            }`}
          />
          <span className="hidden sm:inline">
            {botStatus?.isConnected ? "Bot Discord Connecté" : "Vrai Bot Discord"}
          </span>
          <Bot className="w-3.5 h-3.5 ml-0.5 opacity-80" />
        </button>

        {/* Lies Generator quick trigger */}
        <button
          id="btn-open-lies"
          onClick={onOpenLies}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium bg-amber-950/30 text-amber-300 border border-amber-600/30 hover:bg-amber-900/40 transition-colors"
          title="Générateur de mythos extravagants"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Générateur de Mythos</span>
        </button>

        {/* Export / Setup Button */}
        <button
          id="btn-open-setup-code"
          onClick={onOpenSetup}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium bg-[#5865F2]/15 text-[#c9cdfb] border border-[#5865F2]/30 hover:bg-[#5865F2]/25 transition-colors"
          title="Tutoriel & Code Source du Bot Discord"
        >
          <Code2 className="w-3.5 h-3.5 text-[#5865F2]" />
          <span className="hidden sm:inline">Installer le Bot</span>
        </button>

        {/* Toggle Member List Button */}
        <button
          id="btn-toggle-members"
          onClick={onToggleMemberList}
          className={`p-1.5 rounded text-[#B5BAC1] hover:text-white hover:bg-[#35373c] transition-colors ${
            showMemberList ? "text-white bg-[#35373c]" : ""
          }`}
          title="Afficher/masquer les membres"
        >
          <Users className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
