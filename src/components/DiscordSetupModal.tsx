import React, { useState, useEffect } from "react";
import {
  X,
  Bot,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Radio,
  Server,
  Download,
  Key,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { BotStatusResponse } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  botStatus: BotStatusResponse | null;
  onRefreshStatus: () => void;
}

export const DiscordSetupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  botStatus,
  onRefreshStatus,
}) => {
  const [activeTab, setActiveTab] = useState<"connect" | "guide" | "code">("connect");
  const [botToken, setBotToken] = useState("");
  const [clientId, setClientId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [exportData, setExportData] = useState<{
    botJs?: string;
    packageJson?: string;
    readme?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/bot/export")
        .then((res) => res.json())
        .then((data) => setExportData(data))
        .catch((err) => console.error("Error loading export code:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async () => {
    if (!botToken.trim()) {
      setConnectError("Veuillez renseigner votre token Discord Bot.");
      return;
    }

    setIsConnecting(true);
    setConnectError(null);
    setConnectSuccess(null);

    try {
      const res = await fetch("/api/bot/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: botToken.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Impossible de connecter le bot");
      }

      setConnectSuccess("🚀 Théo Schneider est maintenant connecté et écoute vos mentions sur Discord !");
      onRefreshStatus();
    } catch (err: any) {
      setConnectError(err.message || "Erreur de connexion");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch("/api/bot/disconnect", { method: "POST" });
      onRefreshStatus();
      setConnectSuccess("Bot déconnecté.");
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const inviteUrl = clientId.trim()
    ? `https://discord.com/oauth2/authorize?client_id=${clientId.trim()}&permissions=277025778752&scope=bot`
    : "";

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs">
      <div className="bg-[#313338] w-full max-w-3xl rounded-xl border border-[#3f4147] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#232428] flex items-center justify-between bg-[#2B2D31]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#5865F2] flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                Configuration du Bot Discord (Théo Schneider)
              </h2>
              <p className="text-xs text-[#949BA4]">
                Connectez Théo Schneider à votre vrai serveur Discord ou hébergez-le où vous voulez
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#B5BAC1] hover:text-white hover:bg-[#35373c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#232428] bg-[#2B2D31]/50 px-5 gap-4 text-sm font-medium">
          <button
            onClick={() => setActiveTab("connect")}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "connect"
                ? "border-[#5865F2] text-white font-semibold"
                : "border-transparent text-[#949BA4] hover:text-[#DBDEE1]"
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Connecter en direct</span>
            {botStatus?.isConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "guide"
                ? "border-[#5865F2] text-white font-semibold"
                : "border-transparent text-[#949BA4] hover:text-[#DBDEE1]"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Guide Discord Developer Portal</span>
          </button>

          <button
            onClick={() => setActiveTab("code")}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "code"
                ? "border-[#5865F2] text-white font-semibold"
                : "border-transparent text-[#949BA4] hover:text-[#DBDEE1]"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Code Source Standalone</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: CONNECT DIRECTLY */}
          {activeTab === "connect" && (
            <div className="space-y-4 text-sm">
              {/* Status Box */}
              <div
                className={`p-4 rounded-lg border ${
                  botStatus?.isConnected
                    ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                    : "bg-[#2B2D31] border-[#3f4147] text-[#DBDEE1]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        botStatus?.isConnected
                          ? "bg-emerald-400 animate-pulse"
                          : "bg-zinc-500"
                      }`}
                    />
                    <span className="font-bold text-base">
                      {botStatus?.isConnected
                        ? `En ligne : @${botStatus.botUsername}`
                        : "Bot Discord Non Connecté"}
                    </span>
                  </div>

                  {botStatus?.isConnected && (
                    <button
                      onClick={handleDisconnect}
                      className="text-xs px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 font-semibold"
                    >
                      Déconnecter
                    </button>
                  )}
                </div>

                {botStatus?.isConnected ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs bg-black/20 p-2.5 rounded">
                    <div>
                      <span className="text-emerald-400 font-semibold block">
                        Ping Passerelle :
                      </span>
                      <span>{botStatus.ping || 0} ms</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 font-semibold block">
                        Serveurs actifs :
                      </span>
                      <span>{botStatus.guildsCount || 0} serveurs</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 font-semibold block">
                        Dernière mention :
                      </span>
                      <span className="truncate block">
                        {botStatus.lastInteraction || "En attente de mention..."}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#949BA4]">
                    Le simulateur ci-dessous fonctionne immédiatement avec Gemini 3.8 Flash. Pour faire répondre Théo Schneider sur votre <strong>vrai serveur Discord</strong> quand on le mentionne, renseignez votre Bot Token ci-dessous.
                  </p>
                )}
              </div>

              {/* Token Input Form */}
              <div className="bg-[#2B2D31] p-4 rounded-lg border border-[#3f4147] space-y-3">
                <h3 className="font-semibold text-white flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Token du Bot Discord</span>
                </h3>

                <p className="text-xs text-[#949BA4]">
                  Copiez le token depuis le <strong>Discord Developer Portal</strong> (Onglet <em>Bot</em> &gt; <em>Reset Token</em>).
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="password"
                    placeholder="MTE5...votre_token_secret_discord"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className="flex-1 bg-[#1E1F22] border border-[#3f4147] rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#5865F2]"
                  />
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting || !botToken.trim()}
                    className="px-4 py-2 rounded-md bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {isConnecting ? (
                      <span>Connexion en cours...</span>
                    ) : (
                      <>
                        <Radio className="w-4 h-4" />
                        <span>Connecter le Bot</span>
                      </>
                    )}
                  </button>
                </div>

                {connectError && (
                  <div className="p-2.5 rounded bg-red-950/40 border border-red-500/40 text-xs text-red-200">
                    {connectError}
                  </div>
                )}

                {connectSuccess && (
                  <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200">
                    {connectSuccess}
                  </div>
                )}

                <div className="pt-2 text-[11px] text-[#949BA4] border-t border-[#35363C] flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    Important : Pensez à activer le <strong>Message Content Intent</strong> dans le Developer Portal pour que Théo puisse lire les messages où il est mentionné !
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GUIDE STEP-BY-STEP */}
          {activeTab === "guide" && (
            <div className="space-y-4 text-sm text-[#DBDEE1]">
              <div className="bg-[#2B2D31] p-4 rounded-lg border border-[#3f4147] space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#5865F2] text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Créer l'application Discord</h4>
                    <p className="text-xs text-[#949BA4] mt-0.5">
                      Rendez-vous sur le portail des développeurs Discord :
                    </p>
                    <a
                      href="https://discord.com/developers/applications"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#5865F2] hover:underline font-semibold mt-1"
                    >
                      <span>Ouvrir discord.com/developers/applications</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <p className="text-xs text-zinc-400 mt-1">
                      Cliquez sur <strong>New Application</strong> et nommez-la par exemple <code>Théo Schneider</code>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#5865F2] text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Créer le Bot & Récupérer le Token</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Dans le menu de gauche, allez dans <strong>Bot</strong>. Cliquez sur <strong>Reset Token</strong> (ou Copy Token) et gardez-le précieusement.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-300">
                      CRUCIAL : Activer le "Message Content Intent"
                    </h4>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Toujours dans l'onglet <strong>Bot</strong>, descendez jusqu'à la section <strong>Privileged Gateway Intents</strong>.
                    </p>
                    <div className="mt-2 bg-[#1E1F22] p-2.5 rounded border border-amber-500/30 text-xs text-amber-200">
                      Cochez impérativement : <strong>MESSAGE CONTENT INTENT</strong> (sinon le bot ne pourra pas lire le texte des messages quand vous le mentionnez).
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#5865F2] text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">Inviter le Bot sur votre serveur</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 mb-2">
                      Entrez votre <strong>Application (Client) ID</strong> (trouvable dans l'onglet <em>General Information</em>) pour générer l'URL d'invitation directe :
                    </p>

                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Ex: 123456789012345678"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="bg-[#1E1F22] border border-[#3f4147] rounded px-3 py-1.5 text-xs text-white placeholder-zinc-500 flex-1"
                      />
                    </div>

                    {inviteUrl ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={inviteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Inviter Théo Schneider sur mon serveur Discord</span>
                        </a>
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-400 italic">
                        Entrez votre Client ID ci-dessus pour générer le lien en 1 clic.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    5
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Tester sur Discord !</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Une fois invité et connecté, écrivez simplement :
                    </p>
                    <code className="inline-block bg-[#1E1F22] text-blue-300 px-2 py-1 rounded text-xs mt-1 font-mono">
                      @Théo Schneider t'as vraiment financé la campagne du RN avec tes cryptos ?
                    </code>
                    <p className="text-xs text-zinc-400 mt-1">
                      Théo vous répondra instantanément avec son bagou de millionnaire pseudo-patriote et vous proposera son Académie à 997 € !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STANDALONE CODE EXPORT */}
          {activeTab === "code" && (
            <div className="space-y-4 text-xs">
              <div className="bg-[#2B2D31] p-3.5 rounded-lg border border-[#3f4147] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Pack Standalone (Node.js + discord.js + Gemini)
                  </h4>
                  <p className="text-[#949BA4] mt-0.5">
                    Déployez le bot sur votre propre machine, VPS, Railway, Render ou Heroku.
                  </p>
                </div>
              </div>

              {/* File 1: bot.js */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[#B5BAC1]">
                  <span className="font-mono font-bold text-white">bot.js</span>
                  <button
                    onClick={() => copyToClipboard(exportData?.botJs || "", "botjs")}
                    className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-[#35373c] hover:bg-[#3f4147] text-white transition-colors"
                  >
                    {copiedKey === "botjs" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-[#1E1F22] p-3 rounded border border-[#2B2D31] text-zinc-300 font-mono text-[11px] overflow-x-auto max-h-56">
                  {exportData?.botJs || "// Chargement..."}
                </pre>
              </div>

              {/* File 2: package.json */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[#B5BAC1]">
                  <span className="font-mono font-bold text-white">package.json</span>
                  <button
                    onClick={() => copyToClipboard(exportData?.packageJson || "", "pkg")}
                    className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-[#35373c] hover:bg-[#3f4147] text-white transition-colors"
                  >
                    {copiedKey === "pkg" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-[#1E1F22] p-3 rounded border border-[#2B2D31] text-zinc-300 font-mono text-[11px] overflow-x-auto">
                  {exportData?.packageJson}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#232428] bg-[#2B2D31] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#35373c] hover:bg-[#3f4147] text-white text-xs font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
