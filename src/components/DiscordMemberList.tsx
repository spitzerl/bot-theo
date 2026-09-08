import React, { useState } from "react";
import { Shield, Sparkles, X, ExternalLink, Flame, Crown } from "lucide-react";
import { DiscordUser } from "../types";

interface Props {
  jordanUser: DiscordUser;
  currentUser: DiscordUser;
  otherUsers: DiscordUser[];
  onMentionUser: (username: string) => void;
}

export const DiscordMemberList: React.FC<Props> = ({
  jordanUser,
  currentUser,
  otherUsers,
  onMentionUser,
}) => {
  const [selectedUser, setSelectedUser] = useState<DiscordUser | null>(null);

  return (
    <aside
      id="discord-member-list"
      className="w-60 bg-[#2B2D31] flex flex-col h-full border-l border-[#1f2023] p-3 overflow-y-auto select-none shrink-0"
    >
      {/* 1. Category : PATRIOTE SOUVERAIN & MULTI-MILLIARDAIRE */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400 tracking-wider mb-2 uppercase">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>Patriote Souverain — 1</span>
        </div>

        <div
          id="member-theo"
          onClick={() => setSelectedUser(jordanUser)}
          className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-[#35373c] cursor-pointer group transition-colors"
        >
          <div className="relative shrink-0">
            <img
              src={jordanUser.avatar}
              alt={jordanUser.username}
              className="w-8 h-8 rounded-full object-cover border border-blue-400/50"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#2B2D31]" />
          </div>
          <div className="overflow-hidden leading-tight flex-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-blue-400 truncate">
                {jordanUser.username}
              </span>
              <span className="bg-[#5865F2] text-[9px] font-bold text-white px-1 rounded uppercase tracking-wider">
                BOT
              </span>
            </div>
            <p className="text-[10px] text-[#949BA4] truncate">
              {jordanUser.customStatus}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Category : MEMBRES VIP */}
      <div className="mb-4">
        <div className="text-[11px] font-bold text-[#949BA4] tracking-wider mb-2 uppercase">
          Initié Empire — 2
        </div>

        <div
          onClick={() => setSelectedUser(currentUser)}
          className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-[#35373c] cursor-pointer group transition-colors"
        >
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#2B2D31]" />
          </div>
          <div className="overflow-hidden leading-tight flex-1">
            <span className="text-xs font-semibold text-[#60A5FA] truncate block">
              {currentUser.username}
            </span>
            <p className="text-[10px] text-[#949BA4] truncate">
              {currentUser.customStatus}
            </p>
          </div>
        </div>

        {otherUsers.slice(1).map((u) => (
          <div
            key={u.id}
            onClick={() => setSelectedUser(u)}
            className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-[#35373c] cursor-pointer group transition-colors mt-0.5"
          >
            <div className="relative shrink-0">
              <img
                src={u.avatar}
                alt={u.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#2B2D31]" />
            </div>
            <div className="overflow-hidden leading-tight flex-1">
              <span className="text-xs font-semibold text-[#34D399] truncate block">
                {u.username}
              </span>
              <p className="text-[10px] text-[#949BA4] truncate">
                {u.customStatus}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Category : SALARIÉS EN RÉHABILITATION */}
      <div>
        <div className="text-[11px] font-bold text-[#949BA4] tracking-wider mb-2 uppercase">
          Esprits de Salarié — 1
        </div>
        {otherUsers.slice(0, 1).map((u) => (
          <div
            key={u.id}
            onClick={() => setSelectedUser(u)}
            className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-[#35373c] cursor-pointer group transition-colors opacity-75"
          >
            <div className="relative shrink-0">
              <img
                src={u.avatar}
                alt={u.username}
                className="w-8 h-8 rounded-full object-cover grayscale"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full border-2 border-[#2B2D31]" />
            </div>
            <div className="overflow-hidden leading-tight flex-1">
              <span className="text-xs font-semibold text-[#9CA3AF] truncate block">
                {u.username}
              </span>
              <p className="text-[10px] text-[#949BA4] truncate">
                {u.customStatus}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Popover Profile Modal when user clicked */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111214] w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-[#232428] relative animate-in fade-in zoom-in-95 duration-150">
            {/* Banner */}
            <div className="h-24 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 relative">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile body */}
            <div className="px-4 pb-4 pt-0 relative bg-[#232428]">
              <div className="relative -mt-10 mb-3 flex justify-between items-end">
                <div className="relative">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.username}
                    className="w-20 h-20 rounded-full border-4 border-[#232428] object-cover"
                  />
                  <span
                    className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#232428] ${
                      selectedUser.status === "dnd"
                        ? "bg-red-500"
                        : selectedUser.status === "idle"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />
                </div>

                {selectedUser.bot && (
                  <button
                    onClick={() => {
                      onMentionUser(selectedUser.username);
                      setSelectedUser(null);
                    }}
                    className="px-3 py-1.5 rounded bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Mentionner @Théo</span>
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-white">
                    {selectedUser.username}
                  </h3>
                  {selectedUser.bot && (
                    <span className="bg-[#5865F2] text-[10px] font-bold text-white px-1.5 py-0.5 rounded uppercase">
                      BOT
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#949BA4]">
                  #{selectedUser.discriminator || "0001"}
                </p>
              </div>

              <div className="mt-3 p-2.5 rounded bg-[#1E1F22] text-xs space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-[#949BA4] uppercase block mb-0.5">
                    RÔLE DUBAÏ & PATRIOTE
                  </span>
                  <span
                    className="inline-block px-2 py-0.5 rounded text-xs font-semibold"
                    style={{
                      color: selectedUser.roleColor || "#3B82F6",
                      backgroundColor: `${selectedUser.roleColor || "#3B82F6"}15`,
                    }}
                  >
                    {selectedUser.role}
                  </span>
                </div>

                {selectedUser.id === jordanUser.id ? (
                  <div>
                    <span className="text-[10px] font-bold text-[#949BA4] uppercase block mb-0.5">
                      BIO OFFICIELLE (100% SOUVERAINE & NO FAKE)
                    </span>
                    <p className="text-[#DBDEE1] text-xs leading-relaxed">
                      🇫🇷 Entrepreneur patriote, soutien inconditionnel du RN, exilé à Palm Jumeirah (Dubaï) pour des raisons purement stratégiques. Conseiller occulte des grands dirigeants, inventeur de la "Souveraineté Énergétique Décentralisée". Rejoins l'élite patriote.
                    </p>
                    <div className="mt-2 pt-2 border-t border-[#35363C] flex items-center justify-between text-[11px] text-blue-400 font-bold">
                      <span>L'Académie Empire Millionnaire</span>
                      <span className="bg-blue-500/20 px-2 py-0.5 rounded text-blue-300">
                        997 € (au lieu de 40 000 €)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] font-bold text-[#949BA4] uppercase block mb-0.5">
                      STATUT
                    </span>
                    <p className="text-[#DBDEE1] text-xs">
                      {selectedUser.customStatus}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
