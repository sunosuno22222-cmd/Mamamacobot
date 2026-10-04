import React, { useState, useEffect, useRef } from "react";

const EXACT_DISCORD_AUTH_URL =
  "https://discord.com/oauth2/authorize?client_id=1555982349865324656&permissions=8&integration_type=0&scope=bot+applications.commands";

interface ConnectedGuild {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
  channelCount: number;
}

interface RealTimeLog {
  id: string;
  timestamp: string;
  guildId: string;
  guildName: string;
  type: "info" | "delete" | "create" | "moderation" | "error";
  message: string;
}

interface ServerStatus {
  botReady: boolean;
  botTag: string;
  botId: string;
  botError: string;
  loginUrl: string;
  guildsConnected: ConnectedGuild[];
  logs: RealTimeLog[];
}

type ScreenStep = "login" | "select_guild" | "connected";

const DOG_TEMPLATE_PREVIEW = [
  {
    category: "❍──────ENTRADA───➤",
    items: [
      { name: "╭・🐾・welcome", typeLabel: "Boas-vindas Automáticas" },
      { name: "├・🚪・goodbye", typeLabel: "Saída Automática" },
      { name: "├・📜・regras", typeLabel: "Regras + Aviso sobre Gore" },
      { name: "╰・📢・anúncios", typeLabel: "Canal de Anúncios" },
    ],
  },
  {
    category: "❍──────REWARDS───➤",
    items: [
      { name: "╭・🍁・invite-rewards", typeLabel: "Cargos e Tags por Tempo" },
    ],
  },
  {
    category: "❍──────COMMUNITY───➤",
    items: [
      { name: "╭・💬・chat", typeLabel: "Bate-papo Geral" },
      { name: "├・🫧・apresentações", typeLabel: "Fórum" },
      {
        name: "├・💞・dupla-tags",
        typeLabel: "Filhinho(a) & Papai/Mamãe",
      },
      { name: "├・🌸・refúgio", typeLabel: "Fórum" },
      { name: "╰・🖤・refúgio+", typeLabel: "Fórum" },
    ],
  },
  {
    category: "❍──────PLAQUINHAS───➤",
    items: [
      { name: "╭・📝・plaquinhas", typeLabel: "Fórum de Plaquinhas Públicas" },
      {
        name: "├・🔒・plaquinhas-privadas",
        typeLabel: "Canal a 2 + Botão Visualizar",
      },
      {
        name: "╰・💌・gf-private",
        typeLabel: "Cria Call de Voz Privada a 2",
      },
    ],
  },
  {
    category: "❍──────SAFETY───➤",
    items: [
      { name: "╭・🚨・denúncias", typeLabel: "Fórum" },
      {
        name: "├・🛟・suporte",
        typeLabel: "Botão Criar Ticket (Dúvidas)",
      },
      {
        name: "├・⚠️・violações",
        typeLabel: "Canal Privado Individual c/ Admin",
      },
      { name: "╰・🔨・banimentos", typeLabel: "Log de Banidos do Servidor" },
    ],
  },
  {
    category: "❍──────VOICE───➤",
    items: [
      { name: "╭・🎙・gf-house", typeLabel: "Canal de Voz" },
      { name: "├・💤・afk", typeLabel: "Canal de Voz" },
      { name: "├・🔊・Call", typeLabel: "Canal de Voz" },
      { name: "╰・🔊・Voice on", typeLabel: "Canal de Voz" },
    ],
  },
  {
    category: "❍──────SYSTEM───➤",
    items: [
      { name: "╭・🤖・comandos", typeLabel: "Sistema" },
      {
        name: "├・📊・status",
        typeLabel: "Contador Editável de Mensagens",
      },
      {
        name: "├・📋・logs",
        typeLabel: "Histórico de Punições",
      },
      {
        name: "╰・🛡️・moderação",
        typeLabel: "Botão Criar Ticket + Fechar c/ DM",
      },
    ],
  },
];

export default function App() {
  const [step, setStep] = useState<ScreenStep>("login");
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [selectedGuildId, setSelectedGuildId] = useState<string>("");
  const prevGuildCountRef = useRef<number | null>(null);

  const fetchBotStatus = async () => {
    try {
      const res = await fetch("/api/status");
      if (res.ok) {
        const data: ServerStatus = await res.json();
        setStatus(data);

        if (data.guildsConnected.length > 0 && !selectedGuildId) {
          setSelectedGuildId(data.guildsConnected[0].id);
        }

        if (
          prevGuildCountRef.current !== null &&
          data.guildsConnected.length > prevGuildCountRef.current
        ) {
          const newest =
            data.guildsConnected[data.guildsConnected.length - 1];
          if (newest) {
            setSelectedGuildId(newest.id);
          }
          setStep("select_guild");
        }
        prevGuildCountRef.current = data.guildsConnected.length;
      }
    } catch {
      // ignora erro temporário de rede
    }
  };

  useEffect(() => {
    fetchBotStatus();
    const timer = setInterval(fetchBotStatus, 1800);
    return () => clearInterval(timer);
  }, [selectedGuildId]);

  const handleEnterWithDiscord = () => {
    window.open(EXACT_DISCORD_AUTH_URL, "_blank", "noopener,noreferrer");
    setStep("select_guild");
  };

  const guilds = status?.guildsConnected || [];
  const selectedGuild = guilds.find((g) => g.id === selectedGuildId);

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      {/* Topo simples apenas com o nome do site */}
      <header className="w-full border-b border-neutral-200 px-6 py-4 flex items-center justify-between bg-white">
        <span className="text-lg font-bold tracking-tight text-neutral-900">
          DOGS HOUSE
        </span>

        {step !== "login" && (
          <div className="flex items-center gap-4 text-xs text-neutral-600">
            <button
              onClick={() => setStep("select_guild")}
              className="underline hover:text-neutral-900 cursor-pointer"
            >
              Servidores ({guilds.length})
            </button>
            <span>·</span>
            <button
              onClick={() => setStep("connected")}
              className="underline hover:text-neutral-900 cursor-pointer"
            >
              Estrutura do Servidor
            </button>
            <span>·</span>
            <button
              onClick={() => setStep("login")}
              className="underline hover:text-neutral-900 cursor-pointer"
            >
              Voltar
            </button>
          </div>
        )}
      </header>

      {/* TELA 1: Nome do site em cima e botão grande "Entrar pelo Discord" embaixo */}
      {step === "login" && (
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <div className="w-full max-w-md border border-neutral-200 rounded-xl p-8 bg-white text-center space-y-8">
            <div className="space-y-2">
              <div className="font-mono text-xs text-neutral-500 space-y-0.5">
                <div>╭─────── ୨୧ ───────╮</div>
                <div className="font-bold text-neutral-900 text-sm">
                  🐾・dogs-house
                </div>
                <div>╰─────── ୨୧ ───────╯</div>
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 pt-2">
                DOGS HOUSE
              </h1>
              <p className="text-sm text-neutral-600">
                Clique abaixo para entrar pelo Discord e selecionar o seu
                servidor.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleEnterWithDiscord}
                className="w-full py-4 px-6 bg-neutral-900 text-white text-base font-bold rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Entrar pelo Discord
              </button>

              {guilds.length > 0 && (
                <button
                  onClick={() => setStep("select_guild")}
                  className="w-full py-3 px-4 bg-neutral-100 text-neutral-900 text-xs font-bold rounded-lg border border-neutral-300 hover:border-neutral-900 transition-colors cursor-pointer"
                >
                  Já autorizei — Selecionar meu Servidor ({guilds.length})
                </button>
              )}
            </div>

            {status && (
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Status do Bot:</span>
                <span
                  className={`font-semibold ${
                    status.botReady ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {status.botReady
                    ? `Online (${status.botTag})`
                    : status.botError || "Conectando..."}
                </span>
              </div>
            )}
          </div>
        </main>
      )}

      {/* TELA 2: Selecionar o Servidor e Clicar para Conectar */}
      {step === "select_guild" && (
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg border border-neutral-200 rounded-xl p-8 bg-white space-y-6">
            <div className="space-y-1 border-b border-neutral-200 pb-4">
              <p className="text-xs text-neutral-500">Seleção de Servidor</p>
              <h1 className="text-xl font-bold text-neutral-900">
                Selecione o seu Servidor
              </h1>
              <p className="text-xs text-neutral-600">
                Escolha o servidor abaixo e clique em <strong>Conectar</strong>.
              </p>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {guilds.length === 0 ? (
                <div className="p-6 border border-neutral-200 rounded-lg text-center space-y-3 bg-neutral-50">
                  <p className="text-xs text-neutral-700">
                    Autorize a entrada do Bot na aba do Discord para o seu
                    servidor aparecer aqui automaticamente.
                  </p>
                  <button
                    onClick={handleEnterWithDiscord}
                    className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded hover:bg-neutral-800 cursor-pointer"
                  >
                    Abrir Autorização do Discord
                  </button>
                </div>
              ) : (
                guilds.map((g) => {
                  const isSelected = g.id === selectedGuildId;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGuildId(g.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-neutral-900 bg-neutral-50"
                          : "border-neutral-200 bg-white hover:border-neutral-400"
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold text-neutral-900">
                          {g.name}
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5 font-mono">
                          {g.channelCount} canais · {g.memberCount} membro(s)
                        </div>
                      </div>
                      <span
                        className={`text-xs font-mono font-semibold px-2.5 py-1 rounded ${
                          isSelected
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {isSelected ? "Selecionado" : "Selecionar"}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {guilds.length > 0 && (
              <button
                onClick={() => setStep("connected")}
                disabled={!selectedGuildId}
                className="w-full py-4 px-6 bg-neutral-900 text-white text-base font-bold rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {selectedGuild
                  ? `Conectar a "${selectedGuild.name}"`
                  : "Conectar ao Servidor Selecionado"}
              </button>
            )}
          </div>
        </main>
      )}

      {/* TELA 3: Servidor Conectado */}
      {step === "connected" && (
        <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-6">
          <div className="border border-neutral-200 rounded-xl p-6 bg-white flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-500">
                Servidor Conectado ao Bot
              </p>
              <h1 className="text-xl font-bold text-neutral-900">
                {selectedGuild?.name || "🐾・dogs-house"}
              </h1>
            </div>
            <span
              className={`text-xs font-semibold ${
                status?.botReady ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {status?.botReady
                ? `Bot Online (${status.botTag})`
                : "Conectando..."}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prévia dos Canais, Fóruns e Cargos da Key "dog" */}
            <div className="border border-neutral-200 rounded-xl bg-white p-5 space-y-4">
              <div className="border-b border-neutral-200 pb-3">
                <h2 className="text-sm font-bold text-neutral-900">
                  Estrutura e Cargos (Key &quot;dog&quot;)
                </h2>
                <p className="text-xs text-neutral-500">
                  Exclui os canais antigos primeiro, cria na ordem exata e gera os cargos
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-neutral-100 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-neutral-900 text-white font-semibold">
                  war Owner (Dono)
                </span>
                <span className="px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200 font-semibold">
                  war admin
                </span>
                <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200 font-semibold">
                  war public admin
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
                  war helper
                </span>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-1 text-xs font-mono">
                {DOG_TEMPLATE_PREVIEW.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="font-bold text-neutral-900">
                      {cat.category}
                    </div>
                    <div className="space-y-1 pl-1">
                      {cat.items.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between py-1 px-2 rounded bg-neutral-50 border border-neutral-200 gap-2"
                        >
                          <span className="font-medium text-neutral-900 shrink-0">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-sans text-neutral-500 text-right">
                            {item.typeLabel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logs em Tempo Real do Discord */}
            <div className="border border-neutral-200 rounded-xl bg-white flex flex-col">
              <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-neutral-900">
                  Atividade em Tempo Real
                </h2>
                <span className="text-xs font-mono text-neutral-500">
                  Ao vivo
                </span>
              </div>

              <div className="p-4 flex-1 max-h-96 overflow-y-auto space-y-2 font-mono text-xs">
                {!status?.logs || status.logs.length === 0 ? (
                  <div className="text-neutral-500 py-6 text-center">
                    Aguardando ações no Discord...
                  </div>
                ) : (
                  status.logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded border ${
                        log.type === "delete"
                          ? "bg-red-50 border-red-200 text-red-900"
                          : log.type === "create"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : log.type === "moderation"
                          ? "bg-amber-50 border-amber-200 text-amber-900"
                          : log.type === "error"
                          ? "bg-red-100 border-red-300 text-red-950"
                          : "bg-neutral-50 border-neutral-200 text-neutral-900"
                      }`}
                    >
                      <span className="opacity-60 mr-2 tabular-nums">
                        [{log.timestamp}]
                      </span>
                      <span className="font-semibold mr-2">
                        [{log.guildName}]
                      </span>
                      <span>{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
