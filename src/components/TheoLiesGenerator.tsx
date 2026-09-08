import React, { useState } from "react";
import { Sparkles, RefreshCw, Send, X, Copy, Check, Flame } from "lucide-react";
import { ABSURD_LIES } from "../data/mockDiscord";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (text: string) => void;
}

export const TheoLiesGenerator: React.FC<Props> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [currentLieIndex, setCurrentLieIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentLie = ABSURD_LIES[currentLieIndex];

  const handleNext = () => {
    setCurrentLieIndex((prev) => (prev + 1) % ABSURD_LIES.length);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentLie);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    onSendToChat(
      `@Théo Schneider Est-ce que c'est vrai que : ${currentLie.slice(1, -1)} ?`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-[#313338] w-full max-w-lg rounded-xl border border-blue-500/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#232428] bg-[#2B2D31] flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Générateur de Mythos Patriotiques de Théo Schneider</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#949BA4] hover:text-white hover:bg-[#35373c]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-950/40 via-[#2B2D31] to-[#1E1F22] border border-blue-500/30 shadow-inner">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MYTHO SOUVERAIN DE DUBAÏ #{currentLieIndex + 1}</span>
            </div>
            <p className="text-white text-sm sm:text-base italic leading-relaxed">
              {currentLie}
            </p>
            <div className="mt-3 pt-2 border-t border-blue-500/20 flex justify-between items-center text-[11px] text-[#949BA4]">
              <span>Taux de patriotisme réel : 0.0001% (Exilé fiscal)</span>
              <span className="text-amber-300 font-medium">Académie : 997 €</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#35373c] hover:bg-[#3f4147] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Autre mytho patriote</span>
            </button>

            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-3 py-2 rounded-lg bg-[#2B2D31] hover:bg-[#35373c] text-[#DBDEE1] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier</span>
                </>
              )}
            </button>

            <button
              onClick={handleSend}
              className="w-full sm:flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-colors ml-auto"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confronter Théo dans le chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
