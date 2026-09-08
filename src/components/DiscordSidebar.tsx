import React from "react";
import {
  Hash,
  Volume2,
  ChevronDown,
  Sparkles,
  Mic,
  Headphones,
  Settings,
  ShieldCheck,
  TrendingUp,
  Crown,
} from "lucide-react";
import { DiscordChannel, DiscordUser, BotStatusResponse } from "../types";

interface Props {
  channels: DiscordChannel[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  currentUser: DiscordUser;
  jordanUser: DiscordUser;
  botStatus: BotStatusResponse | null;
  onOpenSetup: () => void;
}

export const DiscordSidebar: React.FC<Props> = ({
  channels,
  activeChannelId,
  onSelectChannel,
  currentUser,
  jordanUser,
  botStatus,
  onOpenSetup,
}) => {
  return (
    <div id="discord-sidebar-wrapper" className="flex h-full select-none shrink-0">
      {/* 1. Ultra-left Server Bar (Discord Servers) */}
      <div
        id="discord-servers-bar"
        className="w-[72px] bg-[#1E1F22] py-3 flex flex-col items-center gap-2 shrink-0 z-20"
      >
        {/* Discord Home icon */}
        <div
          id="server-home"
          className="relative group flex items-center justify-center cursor-pointer"
        >
          <div className="absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 h-0 group-hover:h-5" />
          <div className="w-12 h-12 rounded-[24px] group-hover:rounded-[16px] bg-[#313338] group-hover:bg-[#5865F2] flex items-center justify-center transition-all duration-200 text-white shadow">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Separator */}
        <div className="w-8 h-[2px] bg-[#35363C] rounded-full my-1" />

        {/* Empire Souverain VIP Server Icon (Active) */}
        <div
          id="server-empire-vip"
          className="relative group flex items-center justify-center cursor-pointer"
        >
          {/* Active pill bar on left */}
          <div className="absolute left-0 w-1 bg-blue-400 rounded-r-full transition-all duration-200 h-10" />
          <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 flex items-center justify-center text-white shadow-lg border-2 border-blue-400 relative overflow-hidden group-hover:scale-105 transition-all">
            <span className="font-black text-[11px] tracking-wider text-white bg-blue-600/80 px-1 py-0.5 rounded shadow">
              RN 🇫🇷
            </span>
            <div className="absolute -bottom-1 -right-1 bg-black/60 rounded-full p-0.5">
              <Crown className="w-3 h-3 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Live Bot status badge on servers bar */}
        <div
          onClick={onOpenSetup}
          className="mt-auto cursor-pointer group flex flex-col items-center gap-1"
          title="Statut de connexion du Bot Discord"
        >
          <div
            className={`w-3 h-3 rounded-full border-2 border-[#1E1F22] ${
              botStatus?.isConnected ? "bg-emerald-400 animate-ping" : "bg-zinc-600"
            }`}
          />
          <span className="text-[10px] text-[#949BA4] font-medium group-hover:text-white">
            {botStatus?.isConnected ? "LIVE" : "DEMO"}
          </span>
        </div>
      </div>

      {/* 2. Channels Column */}
      <div
        id="discord-channels-column"
        className="w-60 bg-[#2B2D31] flex flex-col justify-between shrink-0 border-r border-[#1f2023]"
      >
        {/* Guild Header */}
        <div>
          <button
            id="guild-header-dropdown"
            className="w-full h-12 px-4 border-b border-[#1f2023] flex items-center justify-between hover:bg-[#35373c] transition-colors text-white font-bold text-[15px]"
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="truncate">Empire Souverain</span>
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            </div>
            <ChevronDown className="w-4 h-4 text-[#949BA4]" />
          </button>

          {/* Banner Promo / Théo's Dubaï Badge */}
          <div className="mx-2 mt-3 p-2.5 rounded-lg bg-gradient-to-r from-blue-950/60 to-indigo-950/40 border border-blue-500/30 text-xs">
            <div className="flex items-center gap-1 text-blue-400 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>SOUVERAINETÉ & DUBAÏ</span>
            </div>
            <p className="text-[11px] text-blue-200/90 leading-tight">
              L'Académie à <strong>997 €</strong> au lieu de 40 000 €. 
              Redressez la France depuis un yacht !
            </p>
          </div>

          {/* Channels List */}
          <div className="px-2 mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#949BA4] tracking-wider px-2 mb-1 uppercase">
                <span>Salons Textuels</span>
              </div>
              <div className="space-y-0.5">
                {channels.map((ch) => {
                  const isActive = ch.id === activeChannelId;
                  return (
                    <button
                      key={ch.id}
                      id={`channel-btn-${ch.id}`}
                      onClick={() => onSelectChannel(ch.id)}
                      className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-colors text-left group ${
                        isActive
                          ? "bg-[#35373c] text-white font-medium"
                          : "text-[#949BA4] hover:bg-[#35373c]/60 hover:text-[#DBDEE1]"
                      }`}
                    >
                      <Hash
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-white" : "text-[#80848E] group-hover:text-[#DBDEE1]"
                        }`}
                      />
                      <span className="truncate">{ch.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Voice Channel Simulation */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#949BA4] tracking-wider px-2 mb-1 uppercase">
                <span>Salons Vocaux</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-[#949BA4] hover:bg-[#35373c]/60 hover:text-[#DBDEE1] cursor-pointer">
                <Volume2 className="w-4 h-4 text-[#80848E]" />
                <span className="truncate">🔊 Conf-Call Redressement (VIP)</span>
              </div>
              <div className="ml-6 mt-1 flex items-center gap-1.5 text-xs text-blue-400/80 italic">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span>Théo explique la souveraineté liquide...</span>
              </div>
            </div>
          </div>
        </div>

        {/* User bar at bottom of channels column */}
        <div
          id="discord-user-bar"
          className="h-[52px] bg-[#232428] px-2 flex items-center justify-between"
        >
          <div className="flex items-center gap-2 overflow-hidden mr-1">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#232428]" />
            </div>
            <div className="overflow-hidden leading-tight">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser.username}
              </p>
              <p className="text-[10px] text-[#949BA4] truncate">
                #{currentUser.discriminator || "0001"}
              </p>
            </div>
          </div>

          <div className="flex items-center text-[#B5BAC1]">
            <button
              className="p-1.5 hover:bg-[#35373c] hover:text-white rounded"
              title="Couper le micro"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 hover:bg-[#35373c] hover:text-white rounded"
              title="Mettre en sourdine"
            >
              <Headphones className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSetup}
              className="p-1.5 hover:bg-[#35373c] hover:text-white rounded"
              title="Paramètres du bot"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
