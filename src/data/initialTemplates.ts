import { ServerTemplate, DiscordGuild } from "../types";

export const SIMULATED_USER_GUILDS: DiscordGuild[] = [
  {
    id: "guild-1",
    name: "🐾・DOGS HOUSE (Servidor Principal)",
    role: "Dono (Owner)",
    memberCount: 142,
    oldChannels: [
      { id: "old-1", prefix: "├", name: "geral-antigo", type: "text", category: "Canais de Texto" },
      { id: "old-2", prefix: "└", name: "comandos-antigos", type: "text", category: "Canais de Texto" },
      { id: "old-3", prefix: "└", name: "Voz Geral", type: "voice", category: "Canais de Voz" },
    ],
  },
  {
    id: "guild-2",
    name: "Servidor de Testes & Namoro",
    role: "Dono (Owner)",
    memberCount: 18,
    oldChannels: [
      { id: "old-21", prefix: "├", name: "boas-vindas-velho", type: "text", category: "Geral" },
      { id: "old-22", prefix: "└", name: "bate-papo", type: "text", category: "Geral" },
    ],
  },
];

export const INITIAL_TEMPLATES: ServerTemplate[] = [
  {
    id: "1",
    bannerHeader: [
      "╭─────── ୨୧ ───────╮",
      "       🐾・DOGS HOUSE",
      "╰─────── ୨୧ ───────╯",
    ],
    name: "🐾・DOGS HOUSE (Oficial)",
    description:
      "Estrutura completa com Entrada, Community, Plaquinhas, Safety, Voice e System.",
    channels: [
      // ╭・୨୧・𝐄𝐍𝐓𝐑𝐀𝐃𝐀
      { id: "dh-1", prefix: "├", name: "🐾・𝐖𝐄𝐋𝐂𝐎𝐌𝐄", type: "text", category: "╭・୨୧・𝐄𝐍𝐓𝐑𝐀𝐃𝐀" },
      { id: "dh-2", prefix: "├", name: "🚪・𝐆𝐎𝐎𝐃𝐁𝐘𝐄", type: "text", category: "╭・୨୧・𝐄𝐍𝐓𝐑𝐀𝐃𝐀" },
      { id: "dh-3", prefix: "├", name: "📜・𝐑𝐄𝐆𝐑𝐀𝐒", type: "text", category: "╭・୨୧・𝐄𝐍𝐓𝐑𝐀𝐃𝐀" },
      { id: "dh-4", prefix: "└", name: "📢・𝐀𝐍𝐔́𝐍𝐂𝐈𝐎𝐒", type: "text", category: "╭・୨୧・𝐄𝐍𝐓𝐑𝐀𝐃𝐀" },

      // ╭・𖤐・𝐂𝐎𝐌𝐌𝐔𝐍𝐈𝐓𝐘
      { id: "dh-5", prefix: "├", name: "💬・𝐂𝐇𝐀𝐓", type: "text", category: "╭・𖤐・𝐂𝐎𝐌𝐌𝐔𝐍𝐈𝐓𝐘" },
      { id: "dh-6", prefix: "├", name: "🫧・𝐀𝐏𝐑𝐄𝐒𝐄𝐍𝐓𝐀𝐂̧𝐎̃𝐄𝐒", type: "text", category: "╭・𖤐・𝐂𝐎𝐌𝐌𝐔𝐍𝐈𝐓𝐘" },
      { id: "dh-7", prefix: "├", name: "୨୧・𝐑𝐄𝐅𝐔́𝐆𝐈𝐎", type: "text", category: "╭・𖤐・𝐂𝐎𝐌𝐌𝐔𝐍𝐈𝐓𝐘" },
      { id: "dh-8", prefix: "└", name: "𓆩🖤𓆪・𝐑𝐄𝐅𝐔́𝐆𝐈𝐎+", type: "text", category: "╭・𖤐・𝐂𝐎𝐌𝐌𝐔𝐍𝐈𝐓𝐘" },

      // ╭・♡・𝐏𝐋𝐀𝐐𝐔𝐈𝐍𝐇𝐀𝐒
      { id: "dh-9", prefix: "├", name: "📝・𝐏𝐋𝐀𝐐𝐔𝐈𝐍𝐇𝐀𝐒", type: "text", category: "╭・♡・𝐏𝐋𝐀𝐐𝐔𝐈𝐍𝐇𝐀𝐒" },
      { id: "dh-10", prefix: "├", name: "🔒・𝐏𝐋𝐀𝐐𝐔𝐈𝐍𝐇𝐀𝐒-𝐏𝐑𝐈𝐕𝐀𝐃𝐀𝐒", type: "text", category: "╭・♡・𝐏𝐋𝐀𝐐𝐔𝐈𝐍𝐇𝐀𝐒" },
      { id: "dh-11", prefix: "└", name: "💌・𝐆𝐅-𝐏𝐑𝐈𝐕𝐀𝐓𝐄", type: "text", category: "╭・♡・𝐏𝐋𝐀𝐐𝐔𝐈𝐍𝐇𝐀𝐒" },

      // ╭・🛡・𝐒𝐀𝐅𝐄𝐓𝐘
      { id: "dh-12", prefix: "├", name: "🚨・𝐃𝐄𝐍𝐔́𝐍𝐂𝐈𝐀𝐒", type: "text", category: "╭・🛡・𝐒𝐀𝐅𝐄𝐓𝐘" },
      { id: "dh-13", prefix: "├", name: "🛟・𝐒𝐔𝐏𝐎𝐑𝐓𝐄", type: "text", category: "╭・🛡・𝐒𝐀𝐅𝐄𝐓𝐘" },
      { id: "dh-14", prefix: "├", name: "⚠️・𝐕𝐈𝐎𝐋𝐀𝐂̧𝐎̃𝐄𝐒", type: "text", category: "╭・🛡・𝐒𝐀𝐅𝐄𝐓𝐘" },
      { id: "dh-15", prefix: "└", name: "🔨・𝐁𝐀𝐍𝐈𝐌𝐄𝐍𝐓𝐎𝐒", type: "text", category: "╭・🛡・𝐒𝐀𝐅𝐄𝐓𝐘" },

      // ╭・𖦹・𝐕𝐎𝐈𝐂𝐄
      { id: "dh-16", prefix: "├", name: "🎙・𝐆𝐅 𝐇𝐎𝐔𝐒𝐄", type: "voice", category: "╭・𖦹・𝐕𝐎𝐈𝐂𝐄" },
      { id: "dh-17", prefix: "├", name: "🔊・𝐂𝐀𝐋𝐋 𝟎𝟏", type: "voice", category: "╭・𖦹・𝐕𝐎𝐈𝐂𝐄" },
      { id: "dh-18", prefix: "├", name: "🔊・𝐂𝐀𝐋𝐋 𝟎𝟐", type: "voice", category: "╭・𖦹・𝐕𝐎𝐈𝐂𝐄" },
      { id: "dh-19", prefix: "├", name: "🔊・𝐂𝐀𝐋𝐋 𝟎𝟑", type: "voice", category: "╭・𖦹・𝐕𝐎𝐈𝐂𝐄" },
      { id: "dh-20", prefix: "└", name: "🔊・𝐂𝐀𝐋𝐋 𝟎𝟒", type: "voice", category: "╭・𖦹・𝐕𝐎𝐈𝐂𝐄" },

      // ╭・⚙・𝐒𝐘𝐒𝐓𝐄𝐌
      { id: "dh-21", prefix: "├", name: "🤖・𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒", type: "text", category: "╭・⚙・𝐒𝐘𝐒𝐓𝐄𝐌" },
      { id: "dh-22", prefix: "├", name: "📊・𝐒𝐓𝐀𝐓𝐔𝐒", type: "text", category: "╭・⚙・𝐒𝐘𝐒𝐓𝐄𝐌" },
      { id: "dh-23", prefix: "├", name: "📋・𝐋𝐎𝐆𝐒", type: "text", category: "╭・⚙・𝐒𝐘𝐒𝐓𝐄𝐌" },
      { id: "dh-24", prefix: "└", name: "🛡️・𝐌𝐎𝐃𝐄𝐑𝐀𝐂̧𝐀̃𝐎", type: "text", category: "╭・⚙・𝐒𝐘𝐒𝐓𝐄𝐌" },
    ],
  },
];
