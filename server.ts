import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  Guild,
  TextChannel,
  NewsChannel,
  ForumChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

dotenv.config();

const DEFAULT_CLIENT_ID = "1555982349865324656";
const DISCORD_LOGIN_AND_AUTH_URL =
  "https://discord.com/oauth2/authorize?client_id=1555982349865324656&permissions=8&integration_type=0&scope=bot+applications.commands";

export const WAR_ROLES_CONFIG = [
  {
    name: "war Owner",
    color: 0x111827,
    hoist: true,
    permissions: [PermissionFlagsBits.Administrator],
    isOwnerRole: true,
  },
  {
    name: "war admin",
    color: 0xdc2626,
    hoist: true,
    permissions: [PermissionFlagsBits.Administrator],
    isOwnerRole: false,
  },
  {
    name: "war public admin",
    color: 0xea580c,
    hoist: true,
    permissions: [
      PermissionFlagsBits.ManageGuild,
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.BanMembers,
      PermissionFlagsBits.KickMembers,
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ViewAuditLog,
    ],
    isOwnerRole: false,
  },
  {
    name: "war helper",
    color: 0x2563eb,
    hoist: true,
    permissions: [
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.MuteMembers,
      PermissionFlagsBits.MoveMembers,
      PermissionFlagsBits.ViewAuditLog,
    ],
    isOwnerRole: false,
  },
];

interface TemplateChannelDef {
  name: string;
  kind: "text" | "announcement" | "forum" | "voice";
  category: string;
  topic?: string;
  forumInitialTitle?: string;
  forumInitialText?: string;
  setupType?:
    | "welcome"
    | "goodbye"
    | "regras"
    | "anuncios"
    | "invite_rewards"
    | "dupla_tags"
    | "plaquinhas_pub"
    | "plaquinhas_priv"
    | "gf_private"
    | "suporte_ticket"
    | "violacoes_panel"
    | "banimentos"
    | "comandos"
    | "status"
    | "logs"
    | "moderacao_ticket";
}

interface TemplateDef {
  key: string;
  name: string;
  banner: string;
  channels: TemplateChannelDef[];
}

const TEMPLATES: Record<string, TemplateDef> = {
  dog: {
    key: "dog",
    name: "🐾・dogs-house",
    banner:
      "╭─────── ୨୧ ───────╮\n       🐾・DOGS HOUSE\n╰─────── ୨୧ ───────╯",
    channels: [
      // 1. ❍──────ENTRADA───➤
      {
        name: "╭・🐾・welcome",
        kind: "text",
        category: "❍──────ENTRADA───➤",
        topic: "Recepção de novos membros do servidor.",
        setupType: "welcome",
      },
      {
        name: "├・🚪・goodbye",
        kind: "text",
        category: "❍──────ENTRADA───➤",
        topic: "Registro de saída de membros do servidor.",
        setupType: "goodbye",
      },
      {
        name: "├・📜・regras",
        kind: "announcement",
        category: "❍──────ENTRADA───➤",
        topic: "Diretrizes e regras de convivência da comunidade.",
        setupType: "regras",
      },
      {
        name: "╰・📢・anúncios",
        kind: "announcement",
        category: "❍──────ENTRADA───➤",
        topic: "Comunicados oficiais, novidades e avisos importantes.",
        setupType: "anuncios",
      },

      // 2. ❍──────REWARDS───➤
      {
        name: "╭・🍁・invite-rewards",
        kind: "text",
        category: "❍──────REWARDS───➤",
        topic: "Cargos e tags conquistados ao decorrer do tempo no servidor.",
        setupType: "invite_rewards",
      },

      // 3. ❍──────COMMUNITY───➤
      {
        name: "╭・💬・chat",
        kind: "text",
        category: "❍──────COMMUNITY───➤",
        topic: "Bate-papo principal para interação livre entre os membros.",
      },
      {
        name: "├・🫧・apresentações",
        kind: "forum",
        category: "❍──────COMMUNITY───➤",
        topic: "Fórum para os membros se apresentarem e conhecerem novas pessoas.",
        forumInitialTitle: "🫧 Apresente-se para a comunidade",
        forumInitialText:
          "Crie uma publicação neste fórum falando um pouco sobre você, seus gostos e o que procura no servidor.",
      },
      {
        name: "├・💞・dupla-tags",
        kind: "text",
        category: "❍──────COMMUNITY───➤",
        topic: "Formação de dupla de tags (Filhinho(a) e Papai/Mamãe).",
        setupType: "dupla_tags",
      },
      {
        name: "├・🌸・refúgio",
        kind: "forum",
        category: "❍──────COMMUNITY───➤",
        topic: "Fórum tranquilo para conversas, histórias e desabafos.",
        forumInitialTitle: "🌸 Bem-vindo ao Refúgio",
        forumInitialText:
          "Espaço aberto para criar tópicos de conversa, compartilhar momentos e interagir com tranquilidade.",
      },
      {
        name: "╰・🖤・refúgio+",
        kind: "forum",
        category: "❍──────COMMUNITY───➤",
        topic: "Fórum especial para tópicos e interações do Refúgio+.",
        forumInitialTitle: "🖤 Sobre o Refúgio+",
        forumInitialText:
          "Fórum dedicado às postagens e conversas especiais da área Refúgio+.",
      },

      // 4. ❍──────PLAQUINHAS───➤
      {
        name: "╭・📝・plaquinhas",
        kind: "forum",
        category: "❍──────PLAQUINHAS───➤",
        topic:
          "Fórum público para publicação e envio de fotos de plaquinhas (com nome ou sem nome).",
        forumInitialTitle: "📝 Plaquinhas Públicas",
        forumInitialText:
          "Este fórum é o espaço onde você pode publicar livremente imagens de plaquinhas públicas (fotos com o nome de alguém ou sem nome).",
        setupType: "plaquinhas_pub",
      },
      {
        name: "├・🔒・plaquinhas-privadas",
        kind: "text",
        category: "❍──────PLAQUINHAS───➤",
        topic:
          "Criação de salas privadas a dois para envio de plaquinhas com visualização exclusiva.",
        setupType: "plaquinhas_priv",
      },
      {
        name: "╰・💌・gf-private",
        kind: "text",
        category: "❍──────PLAQUINHAS───➤",
        topic: "Criação de canais de voz privados a dois.",
        setupType: "gf_private",
      },

      // 5. ❍──────SAFETY───➤
      {
        name: "╭・🚨・denúncias",
        kind: "forum",
        category: "❍──────SAFETY───➤",
        topic: "Fórum para relatos e denúncias de ocorrências no servidor.",
        forumInitialTitle: "🚨 Área de Denúncias",
        forumInitialText:
          "Espaço destinado ao envio de relatos sobre situações que violem a convivência do servidor.",
      },
      {
        name: "├・🛟・suporte",
        kind: "text",
        category: "❍──────SAFETY───➤",
        topic: "Atendimento de dúvidas por meio de tickets privados com a equipe.",
        setupType: "suporte_ticket",
      },
      {
        name: "├・⚠️・violações",
        kind: "text",
        category: "❍──────SAFETY───➤",
        topic: "Acesso ao canal individual de histórico de violações.",
        setupType: "violacoes_panel",
      },
      {
        name: "╰・🔨・banimentos",
        kind: "announcement",
        category: "❍──────SAFETY───➤",
        topic: "Mural público com o histórico de membros banidos do servidor.",
        setupType: "banimentos",
      },

      // 6. ❍──────VOICE───➤
      {
        name: "╭・🎙・gf-house",
        kind: "voice",
        category: "❍──────VOICE───➤",
      },
      {
        name: "├・💤・afk",
        kind: "voice",
        category: "❍──────VOICE───➤",
      },
      {
        name: "├・🔊・Call",
        kind: "voice",
        category: "❍──────VOICE───➤",
      },
      {
        name: "╰・🔊・Voice on",
        kind: "voice",
        category: "❍──────VOICE───➤",
      },

      // 7. ❍──────SYSTEM───➤
      {
        name: "╭・🤖・comandos",
        kind: "text",
        category: "❍──────SYSTEM───➤",
        topic: "Área destinada à utilização dos recursos do sistema.",
        setupType: "comandos",
      },
      {
        name: "├・📊・status",
        kind: "text",
        category: "❍──────SYSTEM───➤",
        topic: "Painel em tempo real com a contagem de mensagens de cada membro.",
        setupType: "status",
      },
      {
        name: "├・📋・logs",
        kind: "text",
        category: "❍──────SYSTEM───➤",
        topic: "Histórico administrativo de suspensões, castigos e lista negra.",
        setupType: "logs",
      },
      {
        name: "╰・🛡️・moderação",
        kind: "text",
        category: "❍──────SYSTEM───➤",
        topic: "Central de atendimento da moderação via tickets privados.",
        setupType: "moderacao_ticket",
      },
    ],
  },
};

interface RealTimeLog {
  id: string;
  timestamp: string;
  guildId: string;
  guildName: string;
  type: "info" | "delete" | "create" | "moderation" | "error";
  message: string;
}

const serverLogs: RealTimeLog[] = [];
const activeRebuilds = new Set<string>();
let isRegisteringCommands = false;

const userMessageStats = new Map<
  string,
  { count: number; statusMessageId: string }
>();
const gayTaggedUsers = new Set<string>();
const privatePlaquinhaChannels = new Map<
  string,
  { ownerId: string; targetId: string }
>();
const storedPlaquinhaImages = new Map<
  string,
  { url: string; senderId: string; allowedUserId: string; senderTag: string }
>();
const pendingDuplaRoleChoice = new Map<string, "filho" | "papai">();
const pendingDuplaRequests = new Map<
  string,
  {
    guildId: string;
    requesterId: string;
    targetId: string;
    requesterType: "filho" | "papai";
    channelId: string;
  }
>();
const openTickets = new Map<string, { creatorId: string; type: string }>();
const userViolationChannels = new Map<string, string>();
const userTimeRewards = new Map<
  string,
  { joinedAt: number; messages: number; rewardedLevel: number }
>();

function addLog(
  guildId: string,
  guildName: string,
  type: RealTimeLog["type"],
  message: string
) {
  const time = new Date().toTimeString().slice(0, 8);
  serverLogs.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: time,
    guildId,
    guildName,
    type,
    message,
  });
  if (serverLogs.length > 200) {
    serverLogs.pop();
  }
}

let discordClient: Client | null = null;
let botReady = false;
let botTag = "";
let botId = DEFAULT_CLIENT_ID;
let botError = "";

// Verifica se quem executou é Administrador, Dono do Servidor ou possui cargos war Owner / war admin / war public admin
function isOwnerOrAdmin(interactionOrMember: any, guild: Guild): boolean {
  const userId =
    interactionOrMember.user?.id || interactionOrMember.id || "";
  if (userId === guild.ownerId) return true;
  if (
    interactionOrMember.memberPermissions?.has(
      PermissionFlagsBits.Administrator
    )
  ) {
    return true;
  }
  if (
    interactionOrMember.permissions?.has?.(PermissionFlagsBits.Administrator)
  ) {
    return true;
  }
  const memberRoles = interactionOrMember.member?.roles?.cache;
  if (memberRoles) {
    const hasWarAdmin = memberRoles.some((r: any) =>
      ["war owner", "war admin", "war public admin"].includes(
        (r.name || "").toLowerCase()
      )
    );
    if (hasWarAdmin) return true;
  }
  return false;
}

// Retorna os IDs dos cargos da equipe (war Owner, war admin, war public admin, war helper) para dar acesso a tickets e canais privados
function getStaffRoleOverwrites(guild: Guild) {
  const staffNames = [
    "war owner",
    "war admin",
    "war public admin",
    "war helper",
  ];
  const overwrites: { id: string; allow: bigint[] }[] = [];

  for (const [, role] of guild.roles.cache) {
    if (staffNames.includes(role.name.toLowerCase())) {
      overwrites.push({
        id: role.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      });
    }
  }
  return overwrites;
}

// Cria os cargos solicitados: war Owner, war admin, war public admin, war helper
async function ensureWarRoles(guild: Guild) {
  await guild.roles.fetch().catch(() => {});

  for (const roleDef of WAR_ROLES_CONFIG) {
    let role = guild.roles.cache.find(
      (r) => r.name.toLowerCase() === roleDef.name.toLowerCase()
    );

    if (!role) {
      role = await guild.roles
        .create({
          name: roleDef.name,
          color: roleDef.color,
          hoist: roleDef.hoist,
          permissions: roleDef.permissions,
          mentionable: true,
        })
        .catch(() => undefined);

      if (role) {
        addLog(guild.id, guild.name, "create", `Cargo criado: ${role.name}`);
      }
    }

    // Se for o cargo "war Owner", atribui automaticamente ao Dono do servidor
    if (role && roleDef.isOwnerRole && guild.ownerId) {
      const ownerMember = await guild.members
        .fetch(guild.ownerId)
        .catch(() => null);
      if (ownerMember && !ownerMember.roles.cache.has(role.id)) {
        await ownerMember.roles.add(role).catch(() => {});
        addLog(
          guild.id,
          guild.name,
          "info",
          `Cargo "war Owner" atribuído ao dono do servidor.`
        );
      }
    }
  }
}

async function getOrCreatePrivateContainerCategory(guild: Guild) {
  let privCat = guild.channels.cache.find(
    (c) =>
      c.type === ChannelType.GuildCategory &&
      c.name === "❍──────ATENDIMENTO───➤"
  );
  if (!privCat) {
    privCat = await guild.channels
      .create({
        name: "❍──────ATENDIMENTO───➤",
        type: ChannelType.GuildCategory,
        position: 99,
      })
      .catch(() => undefined as any);
  }
  return privCat;
}

async function getOrCreateUserViolationChannel(
  guild: Guild,
  targetUser: { id: string; username: string; globalName?: string | null }
): Promise<TextChannel | null> {
  const key = `${guild.id}:${targetUser.id}`;
  const existingId = userViolationChannels.get(key);
  if (existingId) {
    const ch = guild.channels.cache.get(existingId) as TextChannel | undefined;
    if (ch) return ch;
  }

  const privCat = await getOrCreatePrivateContainerCategory(guild);
  const cleanUsername = (targetUser.username || "membro")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 14);

  try {
    const ch = (await guild.channels.create({
      name: `⚠️・violações-${cleanUsername}`,
      type: ChannelType.GuildText,
      parent: privCat?.id,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: targetUser.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ReadMessageHistory,
          ],
          deny: [PermissionFlagsBits.SendMessages],
        },
        ...getStaffRoleOverwrites(guild),
      ],
    })) as TextChannel;

    userViolationChannels.set(key, ch.id);
    await ch.send(
      `⚠️ **Histórico Individual de Violações — <@${targetUser.id}>**\nEste espaço privado exibe exclusivamente o registro de ocorrências associadas à sua conta junto à administração.`
    );
    return ch;
  } catch {
    return null;
  }
}

// Apresenta o significado de cada canal sem citar nomes de comandos
async function setupChannelInitialContent(
  channel: TextChannel | NewsChannel,
  setupType: TemplateChannelDef["setupType"],
  banner: string
) {
  try {
    if (setupType === "welcome" || setupType === "goodbye") {
      // Não envia nenhuma mensagem ao criar o servidor; só envia quando alguém entrar ou sair
      return;
    } else if (setupType === "regras") {
      const rulesEmbed = new EmbedBuilder()
        .setTitle("📜 Regras do Servidor — DOGS HOUSE")
        .setColor(0x111827)
        .setDescription(
          [
            "Confira as orientações de convivência da nossa comunidade:",
            "",
            "1. **Não alimente o macaco** após a meia-noite.",
            "2. **Não faça sopa** dentro dos canais de voz.",
            "3. **Proibido roubar o pão de queijo** da administração.",
            "4. **Não corra de meia** pelos corredores do servidor.",
            "5. **Se for chorar**, mande áudio no chat.",
            "6. **Respeite os pedidos de dupla de tags** e a convivência nos canais.",
            "",
            "---",
            "⚠️ **Aviso Importante:** É importante que o envio de gore seja controlado/limitado para que o servidor não seja banido pelo Discord.",
          ].join("\n")
        );
      await channel.send({ embeds: [rulesEmbed] });
    } else if (setupType === "anuncios") {
      await channel.send(
        `📢 **Anúncios Oficiais**\nCanal destinado à publicação de novidades, avisos importantes e comunicados gerais da administração para todos os membros.`
      );
    } else if (setupType === "invite_rewards") {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("btn_check_time_rewards")
          .setLabel("Consultar Meu Tempo e Receber Tag")
          .setStyle(ButtonStyle.Secondary)
      );
      await channel.send({
        content:
          "🍁 **Cargos e Tags por Tempo**\nNeste canal são exibidos os cargos e tags conquistados automaticamente pelos membros que permanecem e participam ativamente do servidor ao decorrer do tempo.",
        components: [row],
      });
    } else if (setupType === "dupla_tags") {
      const selectRole =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("select_dupla_role")
            .setPlaceholder("Selecione o que você é...")
            .addOptions([
              {
                label: "Filhinho(a)",
                description:
                  "Você será Filhinho(a) e escolherá seu Papai/Mamãe",
                value: "filho",
                emoji: "🍼",
              },
              {
                label: "Papai / Mamãe",
                description:
                  "Você será Papai/Mamãe e escolherá seu Filhinho(a)",
                value: "papai",
                emoji: "👑",
              },
            ])
        );
      await channel.send({
        content:
          "💞 **Dupla de Tags**\nEspaço para formar dupla de tags com outra pessoa do servidor. Selecione abaixo se você é **Filhinho(a)** ou **Papai / Mamãe** e em seguida escolha a outra pessoa para enviar o pedido de aprovação.",
        components: [selectRole],
      });
    } else if (setupType === "plaquinhas_pub") {
      await channel.send(
        "📝 **Plaquinhas Públicas**\nEspaço aberto para compartilhar imagens de plaquinhas públicas, com o nome de alguém ou sem nome."
      );
    } else if (setupType === "plaquinhas_priv") {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("btn_open_plaquinha_priv")
          .setLabel("Selecionar Pessoa")
          .setStyle(ButtonStyle.Primary)
      );
      await channel.send({
        content:
          "🔒 **Plaquinhas Privadas**\nAqui você pode selecionar uma pessoa para abrir um canal exclusivo entre vocês dois. As fotos enviadas lá ficam protegidas e disponíveis apenas pelo botão **Visualizar** para a pessoa escolhida.",
        components: [row],
      });
    } else if (setupType === "gf_private") {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("btn_open_gf_private")
          .setLabel("Selecionar Pessoa para Call Privada")
          .setStyle(ButtonStyle.Danger)
      );
      await channel.send({
        content:
          "💌 **GF Private**\nSelecione alguém abaixo para criar um canal de voz privado exclusivo para vocês dois ficarem em call.",
        components: [row],
      });
    } else if (setupType === "suporte_ticket") {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("btn_create_ticket_suporte")
          .setLabel("Criar Ticket")
          .setStyle(ButtonStyle.Primary)
      );
      const embed = new EmbedBuilder()
        .setTitle("🛟 Central de Dúvidas e Suporte")
        .setColor(0x111827)
        .setDescription(
          "Este canal é destinado a tirar dúvidas sobre o servidor.\nAo clicar em **Criar Ticket**, um canal privado será aberto exclusivamente entre você e a administração."
        );
      await channel.send({ embeds: [embed], components: [row] });
    } else if (setupType === "moderacao_ticket") {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("btn_create_ticket_moderacao")
          .setLabel("Criar Ticket")
          .setStyle(ButtonStyle.Primary)
      );
      const embed = new EmbedBuilder()
        .setTitle("🛡️ Atendimento da Moderação")
        .setColor(0x111827)
        .setDescription(
          "Este espaço permite iniciar um atendimento direto com os administradores do servidor.\nClique em **Criar Ticket** abaixo para abrir um canal privado."
        );
      await channel.send({ embeds: [embed], components: [row] });
    } else if (setupType === "violacoes_panel") {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("btn_open_my_violations")
          .setLabel("Acessar Meu Canal de Violações")
          .setStyle(ButtonStyle.Secondary)
      );
      await channel.send({
        content:
          "⚠️ **Violações**\nCada membro possui um canal privado com a administração onde constam apenas as suas próprias violações registradas no servidor.",
        components: [row],
      });
    } else if (setupType === "banimentos") {
      await channel.send(
        "🔨 **Banimentos**\nEste canal apresenta o histórico de membros que foram banidos do servidor."
      );
    } else if (setupType === "comandos") {
      await channel.send(
        "🤖 **Sistema**\nCanal dedicado às interações e ferramentas administrativas do servidor."
      );
    } else if (setupType === "status") {
      await channel.send(
        "📊 **Status de Mensagens**\nEste painel acompanha a participação no servidor, exibindo e atualizando automaticamente a quantidade de mensagens enviadas por cada pessoa."
      );
    } else if (setupType === "logs") {
      await channel.send(
        "📋 **Logs do Servidor**\nEste canal registra o histórico de suspensões, castigos, lista negra e marcações administrativas aplicadas no servidor."
      );
    }
  } catch {
    // Ignora erro individual de envio
  }
}

async function applyTemplateToRealGuild(
  guild: Guild,
  templateKey: string,
  triggerReason: string
) {
  const tpl = TEMPLATES[templateKey.toLowerCase()];
  if (!tpl) return;

  if (activeRebuilds.has(guild.id)) {
    addLog(
      guild.id,
      guild.name,
      "info",
      "Uma recriação de canais já está em andamento neste servidor."
    );
    return;
  }

  activeRebuilds.add(guild.id);
  addLog(
    guild.id,
    guild.name,
    "info",
    `Iniciando (${triggerReason}) — Excluindo canais antigos primeiro e aplicando "${tpl.key}"`
  );

  try {
    // PASSO 1: Criar / Garantir os cargos war Owner, war admin, war public admin, war helper
    await ensureWarRoles(guild);

    // PASSO 2: Desativar temporariamente o bloqueio de Community (se ativo) para que o Discord permita excluir 100% dos canais antigos primeiro
    if (guild.features.includes("COMMUNITY" as any)) {
      await guild
        .edit({
          features: guild.features.filter((f) => f !== "COMMUNITY") as any,
          rulesChannel: null,
          publicUpdatesChannel: null,
        })
        .catch(() => {});
    }

    // PASSO 3: EXCLUIR TODOS OS CANAIS E CATEGORIAS EXISTENTES PRIMEIRO
    const existingChannels = await guild.channels.fetch();
    const leftoverLockedChannels: string[] = [];

    // 3a. Exclui todos os canais que não são categorias primeiro
    for (const [, ch] of existingChannels) {
      if (!ch || ch.type === ChannelType.GuildCategory) continue;
      try {
        await ch.delete(`Limpando servidor para o template ${tpl.key}`);
        addLog(guild.id, guild.name, "delete", `Canal excluído: ${ch.name}`);
      } catch {
        // Se o Discord bloqueou por ser rules/publicUpdates de comunidade, guarda para remover assim que criarmos os novos
        leftoverLockedChannels.push(ch.id);
        await ch.setParent(null).catch(() => {});
      }
    }

    // 3b. Exclui todas as categorias antigas
    for (const [, ch] of existingChannels) {
      if (!ch || ch.type !== ChannelType.GuildCategory) continue;
      try {
        await ch.delete(`Limpando categorias para o template ${tpl.key}`);
        addLog(
          guild.id,
          guild.name,
          "delete",
          `Categoria excluída: ${ch.name}`
        );
      } catch {
        // Ignora caso já tenha sido excluída
      }
    }

    // PASSO 4: Agrupar canais por categoria na ordem exata definida no template
    const orderedCategories: string[] = [];
    const channelsByCategory = new Map<string, TemplateChannelDef[]>();

    for (const item of tpl.channels) {
      if (!channelsByCategory.has(item.category)) {
        orderedCategories.push(item.category);
        channelsByCategory.set(item.category, []);
      }
      channelsByCategory.get(item.category)!.push(item);
    }

    const createdCategoryIds = new Map<string, string>();
    const createdChannelsList: {
      id: string;
      parentId: string;
      position: number;
    }[] = [];

    let newRulesChannel: TextChannel | NewsChannel | null = null;
    let newAnunciosChannel: TextChannel | NewsChannel | null = null;

    // PASSO 5: Criar cada categoria e seus respectivos canais na ordem exata (╭・ no topo, ├・ no meio, ╰・ no fim)
    for (let catIdx = 0; catIdx < orderedCategories.length; catIdx++) {
      const categoryName = orderedCategories[catIdx];
      const catChannels = channelsByCategory.get(categoryName) || [];

      const createdCategory = await guild.channels.create({
        name: categoryName,
        type: ChannelType.GuildCategory,
        position: catIdx,
      });

      createdCategoryIds.set(categoryName, createdCategory.id);
      addLog(
        guild.id,
        guild.name,
        "create",
        `Categoria [${catIdx + 1}/${orderedCategories.length}]: ${categoryName}`
      );

      for (let chIdx = 0; chIdx < catChannels.length; chIdx++) {
        const item = catChannels[chIdx];
        let createdChannel: any = null;

        if (item.kind === "voice") {
          createdChannel = await guild.channels.create({
            name: item.name,
            type: ChannelType.GuildVoice,
            parent: createdCategory.id,
            position: chIdx,
          });
          addLog(
            guild.id,
            guild.name,
            "create",
            `Canal de Voz criado: ${item.name}`
          );
        } else if (item.kind === "forum") {
          try {
            const forumCh = (await guild.channels.create({
              name: item.name,
              type: ChannelType.GuildForum,
              parent: createdCategory.id,
              topic: item.topic,
              position: chIdx,
            })) as ForumChannel;

            createdChannel = forumCh;
            if (item.forumInitialTitle && item.forumInitialText) {
              await forumCh.threads
                .create({
                  name: item.forumInitialTitle,
                  message: { content: item.forumInitialText },
                })
                .catch(() => {});
            }
            addLog(
              guild.id,
              guild.name,
              "create",
              `Fórum criado: ${item.name}`
            );
          } catch {
            createdChannel = await guild.channels.create({
              name: item.name,
              type: ChannelType.GuildText,
              parent: createdCategory.id,
              topic: item.topic,
              position: chIdx,
            });
            if (item.setupType && "send" in createdChannel) {
              await setupChannelInitialContent(
                createdChannel,
                item.setupType,
                tpl.banner
              );
            } else if (item.forumInitialText && "send" in createdChannel) {
              await createdChannel.send(item.forumInitialText).catch(() => {});
            }
            addLog(
              guild.id,
              guild.name,
              "create",
              `Canal criado: ${item.name}`
            );
          }
        } else if (item.kind === "announcement") {
          try {
            createdChannel = await guild.channels.create({
              name: item.name,
              type: ChannelType.GuildAnnouncement,
              parent: createdCategory.id,
              topic: item.topic,
              position: chIdx,
            });
          } catch {
            createdChannel = await guild.channels.create({
              name: item.name,
              type: ChannelType.GuildText,
              parent: createdCategory.id,
              topic: item.topic,
              position: chIdx,
            });
          }
          addLog(
            guild.id,
            guild.name,
            "create",
            `Canal criado: ${item.name}`
          );
        } else {
          createdChannel = await guild.channels.create({
            name: item.name,
            type: ChannelType.GuildText,
            parent: createdCategory.id,
            topic: item.topic,
            position: chIdx,
          });
          addLog(guild.id, guild.name, "create", `Canal criado: ${item.name}`);
        }

        if (createdChannel) {
          createdChannelsList.push({
            id: createdChannel.id,
            parentId: createdCategory.id,
            position: chIdx,
          });

          if (item.setupType === "regras") {
            newRulesChannel = createdChannel;
          }
          if (item.setupType === "anuncios") {
            newAnunciosChannel = createdChannel;
          }

          if (
            item.kind !== "forum" &&
            item.setupType &&
            "send" in createdChannel
          ) {
            await setupChannelInitialContent(
              createdChannel,
              item.setupType,
              tpl.banner
            );
          }
        }
      }

      // Assim que a 1ª categoria (ENTRADA) terminar de criar regras e anúncios:
      // Ativamos Community apontando para os novos canais de regras e anúncios para liberar GuildForum nas próximas categorias
      // e removemos qualquer canal antigo que estivesse travado pelo Community!
      if (catIdx === 0 && newRulesChannel && newAnunciosChannel) {
        await guild
          .edit({
            features: Array.from(
              new Set([...guild.features, "COMMUNITY" as any])
            ),
            rulesChannel: newRulesChannel.id,
            publicUpdatesChannel: newAnunciosChannel.id,
          })
          .catch(() => {});

        for (const lockedId of leftoverLockedChannels) {
          const oldCh = guild.channels.cache.get(lockedId);
          if (oldCh) {
            await oldCh.delete("Removendo canal antigo restante").catch(() => {});
          }
        }
      }
    }

    // PASSO 6: Forçar a posição exata de todas as categorias e canais no Discord para que as linhas ╭・ ├・ ╰・ fiquem 100% alinhadas e conectadas
    try {
      const categoryPositions = orderedCategories
        .map((catName, idx) => {
          const id = createdCategoryIds.get(catName);
          return id ? { channel: id, position: idx } : null;
        })
        .filter(Boolean) as { channel: string; position: number }[];

      if (categoryPositions.length > 0) {
        await guild.channels.setPositions(categoryPositions);
      }

      const channelPositions = createdChannelsList.map((c) => ({
        channel: c.id,
        parent: c.parentId,
        position: c.position,
      }));

      if (channelPositions.length > 0) {
        await guild.channels.setPositions(channelPositions);
      }
    } catch {
      // Ignora erro caso o Discord já tenha ordenado
    }

    addLog(
      guild.id,
      guild.name,
      "info",
      `Concluído! Todos os canais, fóruns e cargos (war Owner, war admin, war public admin, war helper) foram criados na ordem exata em "${guild.name}".`
    );
  } catch (err: any) {
    addLog(
      guild.id,
      guild.name,
      "error",
      `Erro durante recriação no servidor ${guild.name}: ${err?.message || err}`
    );
  } finally {
    activeRebuilds.delete(guild.id);
  }
}

// Registra os comandos Slash SEM DUPLICAR (limpa comandos globais duplicados e registra apenas 1 vez por servidor)
async function registerSlashCommands(appClientId: string, token: string) {
  if (isRegisteringCommands) return;
  isRegisteringCommands = true;

  try {
    const rest = new REST({ version: "10" }).setToken(token);

    const templateCmd = new SlashCommandBuilder()
      .setName("template")
      .setDescription(
        'Exclui todos os canais e aplica o template (use key: "dog") — Admins/Dono'
      )
      .addStringOption((opt) =>
        opt
          .setName("key")
          .setDescription('Digite "dog" para recriar a estrutura completa')
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

    const castigarCmd = new SlashCommandBuilder()
      .setName("castigar")
      .setDescription("Aplica castigo a um membro (Admins/Dono)")
      .addUserOption((opt) =>
        opt
          .setName("name")
          .setDescription("Selecione a pessoa para castigar")
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("motivo")
          .setDescription("Motivo do castigo (opcional)")
          .setRequired(false)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

    const suspenderCmd = new SlashCommandBuilder()
      .setName("suspender")
      .setDescription("Coloca um membro em suspensão / lista negra (Admins/Dono)")
      .addUserOption((opt) =>
        opt
          .setName("name")
          .setDescription("Selecione a pessoa para suspender / lista negra")
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("motivo")
          .setDescription("Motivo da suspensão (opcional)")
          .setRequired(false)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

    const gayCmd = new SlashCommandBuilder()
      .setName("gay")
      .setDescription(
        "Dá uma tag rosa para a pessoa e atualiza o nome nas mensagens com 'gay 🏳️‍🌈' (Admins/Dono)"
      )
      .addUserOption((opt) =>
        opt
          .setName("name")
          .setDescription("Selecione a pessoa")
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

    const anCmd = new SlashCommandBuilder()
      .setName("an")
      .setDescription(
        "Envia um anúncio diretamente no canal de anúncios (Admins/Dono)"
      )
      .addStringOption((opt) =>
        opt
          .setName("msg")
          .setDescription("Mensagem do anúncio")
          .setRequired(true)
      )
      .addBooleanOption((opt) =>
        opt
          .setName("embed")
          .setDescription("Enviar em formato Embed? (true ou false)")
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

    const fecharTicketCmd = new SlashCommandBuilder()
      .setName("fecharticket")
      .setDescription(
        "Fecha o canal de ticket atual e envia o log no privado (Admins/Dono)"
      )
      .addStringOption((opt) =>
        opt
          .setName("motivo")
          .setDescription("Motivo do fechamento do ticket")
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

    const body = [
      templateCmd.toJSON(),
      castigarCmd.toJSON(),
      suspenderCmd.toJSON(),
      gayCmd.toJSON(),
      anCmd.toJSON(),
      fecharTicketCmd.toJSON(),
    ];

    // 1. Limpa os comandos globais para evitar que apareçam duplicados junto com os do servidor
    await rest
      .put(Routes.applicationCommands(appClientId), { body: [] })
      .catch(() => {});

    // 2. Registra uma única lista de comandos em cada servidor conectado
    if (discordClient && discordClient.isReady()) {
      for (const [guildId] of discordClient.guilds.cache) {
        await rest
          .put(Routes.applicationGuildCommands(appClientId, guildId), { body })
          .catch(() => {});
      }
    }
  } finally {
    isRegisteringCommands = false;
  }
}

async function initDiscordBot() {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();

  if (!token) {
    botError = "DISCORD_BOT_TOKEN não definido nas variáveis de ambiente.";
    return;
  }

  const setupHandlers = (client: Client) => {
    client.once("ready", async (c) => {
      botReady = true;
      botTag = c.user.tag;
      botId = c.application?.id || c.user.id || DEFAULT_CLIENT_ID;
      botError = "";
      addLog(
        "system",
        "Sistema",
        "info",
        `Bot online no Discord como ${c.user.tag}`
      );

      try {
        await registerSlashCommands(botId, token);
        for (const [, guild] of c.guilds.cache) {
          await ensureWarRoles(guild).catch(() => {});

          // Remove o canal proof caso já exista no servidor e limpa mensagens fixas antigas de welcome/goodbye
          const channels = await guild.channels.fetch().catch(() => null);
          if (channels) {
            for (const [, ch] of channels) {
              if (!ch) continue;
              if (ch.name.toLowerCase().includes("proof")) {
                await ch.delete("Canal proof removido").catch(() => {});
                continue;
              }
              if (
                ch.isTextBased() &&
                !ch.isVoiceBased() &&
                (ch.name.toLowerCase().includes("welcome") ||
                  ch.name.toLowerCase().includes("goodbye"))
              ) {
                const msgs = await (ch as TextChannel).messages
                  .fetch({ limit: 15 })
                  .catch(() => null);
                if (msgs) {
                  for (const [, m] of msgs) {
                    const txt =
                      (m.content || "") +
                      " " +
                      (m.embeds?.[0]?.description || "");
                    if (
                      m.author.id === c.user.id &&
                      (txt.includes("Este canal registra a chegada") ||
                        txt.includes("Este espaço registra") ||
                        txt.includes("boas vindas (name)"))
                    ) {
                      await m.delete().catch(() => {});
                    }
                  }
                }
              }
            }
          }
        }
        addLog(
          "system",
          "Sistema",
          "info",
          `Comandos sincronizados sem duplicação (exclusivos para Admins/Dono).`
        );
      } catch (err: any) {
        addLog(
          "system",
          "Sistema",
          "error",
          `Erro ao sincronizar comandos: ${err?.message || err}`
        );
      }
    });

    client.on("guildCreate", async (guild) => {
      addLog(
        guild.id,
        guild.name,
        "info",
        `Bot conectado ao servidor "${guild.name}".`
      );
      await registerSlashCommands(botId, token).catch(() => {});
      await ensureWarRoles(guild).catch(() => {});
    });

    // Boas-vindas em ╭・🐾・welcome (envia um embed individual para cada pessoa que entrar com o nome dela)
    client.on("guildMemberAdd", async (member) => {
      try {
        const welcomeCh = member.guild.channels.cache.find(
          (ch) =>
            ch.isTextBased() &&
            !ch.isVoiceBased() &&
            ch.name.toLowerCase().includes("welcome")
        ) as TextChannel | undefined;

        const regrasCh = member.guild.channels.cache.find(
          (ch) =>
            ch.isTextBased() &&
            !ch.isVoiceBased() &&
            ch.name.toLowerCase().includes("regras")
        );

        const personName =
          member.user.globalName || member.user.username || member.displayName;

        if (welcomeCh) {
          const rulesRef = regrasCh ? ` <#${regrasCh.id}>` : "";
          const welcomeEmbed = new EmbedBuilder()
            .setColor(0x111827)
            .setDescription(
              `boas vindas **${personName}**, seja bem-vindo/a faca o que quiser mas antes, leia as regras${rulesRef}`
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

          await welcomeCh.send({
            content: `<@${member.id}>`,
            embeds: [welcomeEmbed],
          });
        }
      } catch {
        // Ignora erro
      }
    });

    // Saída em ├・🚪・goodbye (envia um embed individual de tchau para cada pessoa que sair com o nome dela)
    client.on("guildMemberRemove", async (member) => {
      try {
        const goodbyeCh = member.guild.channels.cache.find(
          (ch) =>
            ch.isTextBased() &&
            !ch.isVoiceBased() &&
            ch.name.toLowerCase().includes("goodbye")
        ) as TextChannel | undefined;

        const personName =
          member.user?.globalName ||
          member.user?.username ||
          member.displayName ||
          "Membro";

        if (goodbyeCh) {
          const goodbyeEmbed = new EmbedBuilder()
            .setColor(0x111827)
            .setDescription(`Tchau **${personName}**, saiu do servidor.`)
            .setThumbnail(member.user?.displayAvatarURL() || null)
            .setTimestamp();

          await goodbyeCh.send({ embeds: [goodbyeEmbed] });
        }
      } catch {
        // Ignora erro
      }
    });

    // Log de Banimentos em ╰・🔨・banimentos
    client.on("guildBanAdd", async (ban) => {
      try {
        const banCh = ban.guild.channels.cache.find(
          (ch) =>
            ch.isTextBased() &&
            !ch.isVoiceBased() &&
            ch.name.toLowerCase().includes("banimentos")
        ) as TextChannel | undefined;

        if (banCh) {
          await banCh.send(
            `🔨 **Membro Banido do Servidor**\n- **Nome:** ${ban.user.globalName || ban.user.username} (\`${ban.user.tag}\`)\n- **Data:** ${new Date().toLocaleString("pt-BR")}`
          );
        }
      } catch {
        // Ignora erro
      }
    });

    // Interações: Todos os Slash Commands restritos a Admins / Dono
    client.on("interactionCreate", async (interaction) => {
      const guild = interaction.guild;
      if (!guild) return;

      if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        // Todos os comandos só podem ser usados por Administradores ou Dono
        if (!isOwnerOrAdmin(interaction, guild)) {
          await interaction.reply({
            content:
              "❌ Acesso negado: apenas Administradores e o Dono do servidor podem utilizar este comando.",
            ephemeral: true,
          });
          return;
        }

        if (commandName === "template") {
          const keyInput = (interaction.options.getString("key") || "")
            .trim()
            .toLowerCase();
          const tpl = TEMPLATES[keyInput];

          if (!tpl) {
            await interaction.reply({
              content: `❌ A key \`${keyInput}\` é inválida. Use \`dog\`.`,
              ephemeral: true,
            });
            return;
          }

          await interaction.reply({
            content: `🐾 Excluindo todos os canais antigos primeiro e recriando **${tpl.name}** na ordem exata...`,
            ephemeral: true,
          });

          await applyTemplateToRealGuild(
            guild,
            tpl.key,
            `Executado por ${interaction.user.tag}`
          );
          return;
        }

        if (commandName === "castigar") {
          const targetUser = interaction.options.getUser("name", true);
          const motivo =
            interaction.options.getString("motivo") ||
            "Castigo aplicado pela administração";
          const member = await guild.members
            .fetch(targetUser.id)
            .catch(() => null);

          if (member) {
            await member.timeout(15 * 60 * 1000, motivo).catch(() => {});
          }

          const logsCh = guild.channels.cache.find(
            (ch) =>
              ch.isTextBased() &&
              !ch.isVoiceBased() &&
              ch.name.toLowerCase().includes("logs")
          ) as TextChannel | undefined;

          if (logsCh) {
            await logsCh.send(
              `⚠️ **Castigo Aplicado**\n- **Membro:** <@${targetUser.id}> (\`${targetUser.tag}\`)\n- **Responsável:** <@${interaction.user.id}>\n- **Motivo:** ${motivo}`
            );
          }

          const violCh = await getOrCreateUserViolationChannel(
            guild,
            targetUser
          );
          if (violCh) {
            await violCh.send(
              `⚠️ **Violação Registrada (Castigo)**\n- **Data:** ${new Date().toLocaleString("pt-BR")}\n- **Motivo:** ${motivo}`
            );
          }

          await interaction.reply({
            content: `✅ Castigo aplicado em <@${targetUser.id}>.`,
            ephemeral: true,
          });
          return;
        }

        if (commandName === "suspender") {
          const targetUser = interaction.options.getUser("name", true);
          const motivo =
            interaction.options.getString("motivo") ||
            "Suspensão / Lista Negra aplicada pela administração";
          const member = await guild.members
            .fetch(targetUser.id)
            .catch(() => null);

          let blackRole = guild.roles.cache.find(
            (r) => r.name === "🚫 Suspenso / Lista Negra"
          );
          if (!blackRole) {
            blackRole = await guild.roles
              .create({
                name: "🚫 Suspenso / Lista Negra",
                color: 0x1f2937,
              })
              .catch(() => undefined);
          }

          if (member) {
            if (blackRole) await member.roles.add(blackRole).catch(() => {});
            await member.timeout(60 * 60 * 1000, motivo).catch(() => {});
          }

          const logsCh = guild.channels.cache.find(
            (ch) =>
              ch.isTextBased() &&
              !ch.isVoiceBased() &&
              ch.name.toLowerCase().includes("logs")
          ) as TextChannel | undefined;

          if (logsCh) {
            await logsCh.send(
              `🚫 **Suspensão / Lista Negra**\n- **Membro:** <@${targetUser.id}> (\`${targetUser.tag}\`)\n- **Responsável:** <@${interaction.user.id}>\n- **Motivo:** ${motivo}`
            );
          }

          const violCh = await getOrCreateUserViolationChannel(
            guild,
            targetUser
          );
          if (violCh) {
            await violCh.send(
              `🚫 **Violação Registrada (Suspensão / Lista Negra)**\n- **Data:** ${new Date().toLocaleString("pt-BR")}\n- **Motivo:** ${motivo}`
            );
          }

          await interaction.reply({
            content: `✅ Suspensão / Lista Negra aplicada em <@${targetUser.id}>.`,
            ephemeral: true,
          });
          return;
        }

        if (commandName === "gay") {
          const targetUser = interaction.options.getUser("name", true);
          const member = await guild.members
            .fetch(targetUser.id)
            .catch(() => null);

          let pinkRole = guild.roles.cache.find((r) => r.name === "🏳️‍🌈 Gay");
          if (!pinkRole) {
            pinkRole = await guild.roles
              .create({
                name: "🏳️‍🌈 Gay",
                color: 0xff69b4,
              })
              .catch(() => undefined);
          }

          if (member) {
            if (pinkRole) await member.roles.add(pinkRole).catch(() => {});
            const baseName = (
              member.user.globalName || member.user.username
            ).slice(0, 20);
            await member.setNickname(`${baseName} gay 🏳️‍🌈`).catch(() => {});
          }

          gayTaggedUsers.add(`${guild.id}:${targetUser.id}`);

          const logsCh = guild.channels.cache.find(
            (ch) =>
              ch.isTextBased() &&
              !ch.isVoiceBased() &&
              ch.name.toLowerCase().includes("logs")
          ) as TextChannel | undefined;

          if (logsCh) {
            await logsCh.send(
              `🏳️‍🌈 **Tag Rosa Aplicada**\n- **Membro:** <@${targetUser.id}>\n- **Responsável:** <@${interaction.user.id}>`
            );
          }

          await interaction.reply({
            content: `🏳️‍🌈 Tag rosa aplicada em <@${targetUser.id}>!`,
            ephemeral: true,
          });
          return;
        }

        if (commandName === "an") {
          const msgText = interaction.options.getString("msg", true);
          const useEmbed = interaction.options.getBoolean("embed", true);

          const anunciosCh = guild.channels.cache.find(
            (ch) =>
              ch.isTextBased() &&
              !ch.isVoiceBased() &&
              (ch.name.toLowerCase().includes("anúncios") ||
                ch.name.toLowerCase().includes("anuncios"))
          ) as TextChannel | undefined;

          if (!anunciosCh) {
            await interaction.reply({
              content: "❌ Canal de anúncios não encontrado.",
              ephemeral: true,
            });
            return;
          }

          if (useEmbed) {
            const embed = new EmbedBuilder()
              .setTitle("📢 Comunicado Oficial — DOGS HOUSE")
              .setDescription(msgText)
              .setColor(0x111827)
              .setTimestamp();
            await anunciosCh.send({ embeds: [embed] });
          } else {
            await anunciosCh.send(msgText);
          }

          await interaction.reply({
            content: `✅ Anúncio publicado em <#${anunciosCh.id}>!`,
            ephemeral: true,
          });
          return;
        }

        if (commandName === "fecharticket") {
          const ticketInfo = openTickets.get(interaction.channelId);
          if (!ticketInfo) {
            await interaction.reply({
              content: "❌ Este canal não é um ticket ativo.",
              ephemeral: true,
            });
            return;
          }

          const motivo = interaction.options.getString("motivo", true);
          await interaction.reply({
            content: `🔒 Encerrando ticket e enviando log no privado...`,
          });

          const creatorUser = await client.users
            .fetch(ticketInfo.creatorId)
            .catch(() => null);
          if (creatorUser) {
            await creatorUser
              .send(
                `📋 **Ticket Encerrado — ${guild.name}**\n- **Setor:** ${ticketInfo.type}\n- **Motivo:** ${motivo}\n- **Data:** ${new Date().toLocaleString("pt-BR")}`
              )
              .catch(() => {});
          }

          openTickets.delete(interaction.channelId);
          setTimeout(() => {
            interaction.channel?.delete("Ticket fechado").catch(() => {});
          }, 2500);
          return;
        }
      }

      // ==================== BOTÕES INTERATIVOS ====================
      if (interaction.isButton()) {
        const { customId } = interaction;

        if (
          customId === "btn_create_ticket_moderacao" ||
          customId === "btn_create_ticket_suporte"
        ) {
          const ticketType =
            customId === "btn_create_ticket_moderacao"
              ? "Moderação"
              : "Suporte";
          const cleanName = interaction.user.username
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "")
            .slice(0, 12);

          const privCat = await getOrCreatePrivateContainerCategory(guild);

          const ticketChannel = (await guild.channels.create({
            name: `🎫・ticket-${cleanName}`,
            type: ChannelType.GuildText,
            parent: privCat?.id,
            permissionOverwrites: [
              {
                id: guild.id,
                deny: [PermissionFlagsBits.ViewChannel],
              },
              {
                id: interaction.user.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ReadMessageHistory,
                ],
              },
              ...getStaffRoleOverwrites(guild),
            ],
          })) as TextChannel;

          openTickets.set(ticketChannel.id, {
            creatorId: interaction.user.id,
            type: ticketType,
          });

          const topRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId("btn_close_ticket_modal")
              .setLabel("Fechar Ticket")
              .setStyle(ButtonStyle.Danger)
          );

          await ticketChannel.send({
            content: `🎫 **Atendimento de ${ticketType}**\nOlá <@${interaction.user.id}>, este canal é privado entre você e os administradores do servidor. Envie sua mensagem abaixo e aguarde o atendimento.`,
            components: [topRow],
          });

          await interaction.reply({
            content: `✅ Seu ticket privado foi aberto: <#${ticketChannel.id}>`,
            ephemeral: true,
          });
          return;
        }

        if (customId === "btn_close_ticket_modal") {
          const modal = new ModalBuilder()
            .setCustomId("modal_close_ticket")
            .setTitle("Fechar Ticket");

          const reasonInput = new TextInputBuilder()
            .setCustomId("ticket_close_reason")
            .setLabel("Motivo do fechamento do ticket")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

          modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput)
          );

          await interaction.showModal(modal);
          return;
        }

        if (customId === "btn_open_my_violations") {
          const ch = await getOrCreateUserViolationChannel(
            guild,
            interaction.user
          );
          if (ch) {
            await interaction.reply({
              content: `⚠️ Seu canal privado de violações: <#${ch.id}>`,
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: "❌ Não foi possível acessar seu canal de violações.",
              ephemeral: true,
            });
          }
          return;
        }

        if (customId === "btn_open_plaquinha_priv") {
          const userSelect =
            new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
              new UserSelectMenuBuilder()
                .setCustomId("select_user_plaquinha_priv")
                .setPlaceholder("Selecione a pessoa")
                .setMinValues(1)
                .setMaxValues(1)
            );

          await interaction.reply({
            content:
              "🔒 Escolha com quem você deseja criar um canal de plaquinha privada:",
            components: [userSelect],
            ephemeral: true,
          });
          return;
        }

        if (customId.startsWith("view_plaq_")) {
          const imgId = customId.replace("view_plaq_", "");
          const stored = storedPlaquinhaImages.get(imgId);

          if (!stored) {
            await interaction.reply({
              content: "❌ Imagem indisponível.",
              ephemeral: true,
            });
            return;
          }

          if (
            interaction.user.id !== stored.allowedUserId &&
            interaction.user.id !== stored.senderId
          ) {
            await interaction.reply({
              content: "🔒 Esta imagem foi enviada apenas para a outra pessoa.",
              ephemeral: true,
            });
            return;
          }

          await interaction.reply({
            content: `📸 **Plaquinha enviada por ${stored.senderTag}:**\n${stored.url}`,
            ephemeral: true,
          });
          return;
        }

        if (customId === "btn_open_gf_private") {
          const userSelect =
            new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
              new UserSelectMenuBuilder()
                .setCustomId("select_user_gf_private")
                .setPlaceholder("Selecione a pessoa")
                .setMinValues(1)
                .setMaxValues(1)
            );

          await interaction.reply({
            content:
              "💌 Selecione a pessoa para criar o canal de voz privado:",
            components: [userSelect],
            ephemeral: true,
          });
          return;
        }

        if (customId.startsWith("accept_dupla_")) {
          const reqId = customId.replace("accept_dupla_", "");
          const reqData = pendingDuplaRequests.get(reqId);

          if (!reqData) {
            await interaction.reply({
              content: "❌ Este pedido já foi concluído.",
              ephemeral: true,
            });
            return;
          }

          if (interaction.user.id !== reqData.targetId) {
            await interaction.reply({
              content: "❌ Somente a pessoa convidada pode aceitar este pedido.",
              ephemeral: true,
            });
            return;
          }

          const requesterMember = await guild.members
            .fetch(reqData.requesterId)
            .catch(() => null);
          const targetMember = await guild.members
            .fetch(reqData.targetId)
            .catch(() => null);

          if (!requesterMember || !targetMember) {
            await interaction.reply({
              content: "❌ Membro não encontrado no servidor.",
              ephemeral: true,
            });
            return;
          }

          const requesterName =
            requesterMember.user.globalName || requesterMember.user.username;
          const targetName =
            targetMember.user.globalName || targetMember.user.username;

          const requesterRoleName =
            reqData.requesterType === "filho"
              ? `🍼 Filho(a) de ${targetName}`
              : `👑 Papai/Mamãe de ${targetName}`;

          const targetRoleName =
            reqData.requesterType === "filho"
              ? `👑 Papai/Mamãe de ${requesterName}`
              : `🍼 Filho(a) de ${requesterName}`;

          const roleForRequester = await guild.roles
            .create({
              name: requesterRoleName,
              color: 0xf472b6,
            })
            .catch(() => null);

          const roleForTarget = await guild.roles
            .create({
              name: targetRoleName,
              color: 0x60a5fa,
            })
            .catch(() => null);

          if (roleForRequester) {
            await requesterMember.roles.add(roleForRequester).catch(() => {});
          }
          if (roleForTarget) {
            await targetMember.roles.add(roleForTarget).catch(() => {});
          }

          pendingDuplaRequests.delete(reqId);

          await interaction.reply({
            content: `💞 **Dupla de Tags Confirmada!**\n- <@${requesterMember.id}> recebeu **${requesterRoleName}**\n- <@${targetMember.id}> recebeu **${targetRoleName}**`,
          });

          setTimeout(() => {
            interaction.channel?.delete("Dupla de tags concluída").catch(() => {});
          }, 8000);
          return;
        }

        if (customId === "btn_check_time_rewards") {
          const key = `${guild.id}:${interaction.user.id}`;
          const stats = userTimeRewards.get(key) || {
            joinedAt: Date.now(),
            messages: 1,
            rewardedLevel: 0,
          };

          const member = await guild.members
            .fetch(interaction.user.id)
            .catch(() => null);

          let roleName = "🍁 Membro Ativo";
          if (stats.messages >= 25) {
            roleName = "🍁 Lenda do Servidor";
          } else if (stats.messages >= 10) {
            roleName = "🍁 Veterano Dogs House";
          }

          let rewardRole = guild.roles.cache.find((r) => r.name === roleName);
          if (!rewardRole) {
            rewardRole = await guild.roles
              .create({
                name: roleName,
                color: 0xd97706,
              })
              .catch(() => undefined);
          }

          if (member && rewardRole) {
            await member.roles.add(rewardRole).catch(() => {});
          }

          await interaction.reply({
            content: `🍁 <@${interaction.user.id}> recebeu a tag **${roleName}** pelo tempo e participação no servidor!`,
          });
          return;
        }
      }

      // ==================== STRING SELECT MENUS ====================
      if (interaction.isStringSelectMenu()) {
        if (interaction.customId === "select_dupla_role") {
          const chosen = interaction.values[0] as "filho" | "papai";
          pendingDuplaRoleChoice.set(
            `${guild.id}:${interaction.user.id}`,
            chosen
          );

          const userSelect =
            new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
              new UserSelectMenuBuilder()
                .setCustomId("select_dupla_partner")
                .setPlaceholder(
                  chosen === "filho"
                    ? "Selecione quem será seu Papai / Mamãe..."
                    : "Selecione quem será seu Filhinho(a)..."
                )
                .setMinValues(1)
                .setMaxValues(1)
            );

          await interaction.reply({
            content: `Você escolheu **${
              chosen === "filho" ? "Filhinho(a) 🍼" : "Papai / Mamãe 👑"
            }**. Agora selecione a outra pessoa abaixo:`,
            components: [userSelect],
            ephemeral: true,
          });
          return;
        }
      }

      // ==================== USER SELECT MENUS ====================
      if (interaction.isUserSelectMenu()) {
        const selectedUserId = interaction.values[0];
        const targetUser = await client.users
          .fetch(selectedUserId)
          .catch(() => null);

        if (!targetUser) {
          await interaction.reply({
            content: "❌ Usuário não encontrado.",
            ephemeral: true,
          });
          return;
        }

        if (interaction.customId === "select_user_plaquinha_priv") {
          const privCat = await getOrCreatePrivateContainerCategory(guild);

          const ch = (await guild.channels.create({
            name: `🔒・plaquinha-${interaction.user.username.slice(0, 8)}-${targetUser.username.slice(0, 8)}`,
            type: ChannelType.GuildText,
            parent: privCat?.id,
            permissionOverwrites: [
              {
                id: guild.id,
                deny: [PermissionFlagsBits.ViewChannel],
              },
              {
                id: interaction.user.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.AttachFiles,
                  PermissionFlagsBits.ReadMessageHistory,
                ],
              },
              {
                id: targetUser.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.AttachFiles,
                  PermissionFlagsBits.ReadMessageHistory,
                ],
              },
            ],
          })) as TextChannel;

          privatePlaquinhaChannels.set(ch.id, {
            ownerId: interaction.user.id,
            targetId: targetUser.id,
          });

          await ch.send(
            `🔒 **Plaquinha Privada — <@${interaction.user.id}> & <@${targetUser.id}>**\nEnvie sua foto aqui. Ela será armazenada e ficará visível apenas pelo botão **Visualizar**.`
          );

          await interaction.reply({
            content: `✅ Canal privado criado: <#${ch.id}>`,
            ephemeral: true,
          });
          return;
        }

        if (interaction.customId === "select_user_gf_private") {
          const privCat = await getOrCreatePrivateContainerCategory(guild);

          const voiceCh = await guild.channels.create({
            name: `💌・gf-${interaction.user.username.slice(0, 8)}-${targetUser.username.slice(0, 8)}`,
            type: ChannelType.GuildVoice,
            parent: privCat?.id,
            permissionOverwrites: [
              {
                id: guild.id,
                deny: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.Connect,
                ],
              },
              {
                id: interaction.user.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.Connect,
                  PermissionFlagsBits.Speak,
                ],
              },
              {
                id: targetUser.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.Connect,
                  PermissionFlagsBits.Speak,
                ],
              },
            ],
          });

          await interaction.reply({
            content: `💌 Call privada criada: <#${voiceCh.id}>`,
            ephemeral: true,
          });
          return;
        }

        if (interaction.customId === "select_dupla_partner") {
          const requesterType =
            pendingDuplaRoleChoice.get(
              `${guild.id}:${interaction.user.id}`
            ) || "filho";

          const privCat = await getOrCreatePrivateContainerCategory(guild);

          const privCh = (await guild.channels.create({
            name: `💞・pedido-${interaction.user.username.slice(0, 8)}`,
            type: ChannelType.GuildText,
            parent: privCat?.id,
            permissionOverwrites: [
              {
                id: guild.id,
                deny: [PermissionFlagsBits.ViewChannel],
              },
              {
                id: interaction.user.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ReadMessageHistory,
                ],
              },
              {
                id: targetUser.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ReadMessageHistory,
                ],
              },
            ],
          })) as TextChannel;

          const reqId = `${Date.now()}-${interaction.user.id}`;
          pendingDuplaRequests.set(reqId, {
            guildId: guild.id,
            requesterId: interaction.user.id,
            targetId: targetUser.id,
            requesterType,
            channelId: privCh.id,
          });

          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`accept_dupla_${reqId}`)
              .setLabel("Aceitar")
              .setStyle(ButtonStyle.Success)
          );

          const desc =
            requesterType === "filho"
              ? `<@${interaction.user.id}> selecionou **Filhinho(a)** e convidou <@${targetUser.id}> para ser **Papai/Mamãe**.`
              : `<@${interaction.user.id}> selecionou **Papai/Mamãe** e convidou <@${targetUser.id}> para ser **Filhinho(a)**.`;

          await privCh.send({
            content: `💞 **Solicitação de Dupla de Tags**\n${desc}\n\n<@${targetUser.id}>, clique em **Aceitar** abaixo para confirmar e receberem os cargos:`,
            components: [row],
          });

          await interaction.reply({
            content: `✅ Pedido enviado em <#${privCh.id}>`,
            ephemeral: true,
          });
          return;
        }
      }

      // ==================== MODAL SUBMIT ====================
      if (interaction.isModalSubmit()) {
        if (interaction.customId === "modal_close_ticket") {
          const ticketInfo = openTickets.get(interaction.channelId || "");
          const motivo =
            interaction.fields.getTextInputValue("ticket_close_reason") ||
            "Atendimento finalizado";

          await interaction.reply({
            content: `🔒 Ticket encerrado. O registro foi enviado no privado.`,
          });

          if (ticketInfo) {
            const creatorUser = await client.users
              .fetch(ticketInfo.creatorId)
              .catch(() => null);
            if (creatorUser) {
              await creatorUser
                .send(
                  `📋 **Ticket Fechado — ${guild.name}**\n- **Setor:** ${ticketInfo.type}\n- **Motivo:** ${motivo}\n- **Data:** ${new Date().toLocaleString("pt-BR")}`
                )
                .catch(() => {});
            }
            openTickets.delete(interaction.channelId || "");
          }

          setTimeout(() => {
            interaction.channel?.delete("Ticket fechado").catch(() => {});
          }, 2500);
          return;
        }
      }
    });

    // Eventos de Mensagem
    client.on("messageCreate", async (message) => {
      if (message.author.bot || !message.guild) return;

      const guild = message.guild;
      const userKey = `${guild.id}:${message.author.id}`;

      // 1. Plaquinha Privada: armazena imagem e exibe botão "Visualizar"
      const privPlaq = privatePlaquinhaChannels.get(message.channel.id);
      if (privPlaq && message.attachments.size > 0) {
        const firstAtt = message.attachments.first();
        if (firstAtt) {
          const imgId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const allowedUserId =
            message.author.id === privPlaq.ownerId
              ? privPlaq.targetId
              : privPlaq.ownerId;

          storedPlaquinhaImages.set(imgId, {
            url: firstAtt.url,
            senderId: message.author.id,
            allowedUserId,
            senderTag: message.author.globalName || message.author.username,
          });

          await message.delete().catch(() => {});

          const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`view_plaq_${imgId}`)
              .setLabel("Visualizar")
              .setStyle(ButtonStyle.Primary)
          );

          if ("send" in message.channel) {
            await message.channel.send({
              content: `🔒 **${message.author.globalName || message.author.username}** enviou uma imagem para <@${allowedUserId}>:`,
              components: [btnRow],
            });
          }
          return;
        }
      }

      // 2. Tag Rosa (/gay): atualiza mensagem automaticamente com "Nome gay 🏳️‍🌈"
      if (gayTaggedUsers.has(userKey) && "send" in message.channel) {
        const baseName =
          message.author.globalName || message.author.username;
        const gayDisplayName = `${baseName} gay 🏳️‍🌈`;
        const contentCopy = message.content || "";
        const filesCopy = Array.from(message.attachments.values()).map(
          (a) => a.url
        );

        await message.delete().catch(() => {});

        try {
          if ("fetchWebhooks" in message.channel) {
            const hooks = await message.channel.fetchWebhooks();
            let hook = hooks.find((h) => h.name === "DogsHouseGayHook");
            if (!hook) {
              hook = await message.channel.createWebhook({
                name: "DogsHouseGayHook",
              });
            }
            await hook.send({
              content: contentCopy || " ",
              username: gayDisplayName,
              avatarURL: message.author.displayAvatarURL(),
              files: filesCopy,
            });
          } else {
            await message.channel.send({
              content: `**${gayDisplayName}:** ${contentCopy}`,
              files: filesCopy,
            });
          }
        } catch {
          await message.channel
            .send({
              content: `**${gayDisplayName}:** ${contentCopy}`,
              files: filesCopy,
            })
            .catch(() => {});
        }
      }

      // 3. Contador editável em 📊・status
      try {
        const statusCh = guild.channels.cache.find(
          (ch) =>
            ch.isTextBased() &&
            !ch.isVoiceBased() &&
            ch.name.toLowerCase().includes("status")
        ) as TextChannel | undefined;

        if (statusCh) {
          const prev = userMessageStats.get(userKey);
          const newCount = (prev?.count || 0) + 1;
          const displayName =
            message.author.globalName || message.author.username;
          const preview = (message.content || "(anexo)").slice(0, 50);
          const statusLine = `📊 **${displayName}** (<@${message.author.id}>) — **${newCount}** mensagem(ns) · Última: *"${preview}"*`;

          if (prev?.statusMessageId) {
            const existingMsg = await statusCh.messages
              .fetch(prev.statusMessageId)
              .catch(() => null);
            if (existingMsg) {
              await existingMsg.edit(statusLine).catch(() => {});
              userMessageStats.set(userKey, {
                count: newCount,
                statusMessageId: existingMsg.id,
              });
            } else {
              const sent = await statusCh.send(statusLine);
              userMessageStats.set(userKey, {
                count: newCount,
                statusMessageId: sent.id,
              });
            }
          } else {
            const sent = await statusCh.send(statusLine);
            userMessageStats.set(userKey, {
              count: newCount,
              statusMessageId: sent.id,
            });
          }
        }
      } catch {
        // Ignora erro
      }

      // 4. Recompensas por tempo/participação em 🍁・invite-rewards
      try {
        const currentReward = userTimeRewards.get(userKey) || {
          joinedAt: Date.now(),
          messages: 0,
          rewardedLevel: 0,
        };
        currentReward.messages += 1;

        let newLevel = currentReward.rewardedLevel;
        let roleToGive = "";

        if (currentReward.messages >= 5 && currentReward.rewardedLevel < 1) {
          newLevel = 1;
          roleToGive = "🍁 Membro Ativo";
        } else if (
          currentReward.messages >= 15 &&
          currentReward.rewardedLevel < 2
        ) {
          newLevel = 2;
          roleToGive = "🍁 Veterano Dogs House";
        } else if (
          currentReward.messages >= 30 &&
          currentReward.rewardedLevel < 3
        ) {
          newLevel = 3;
          roleToGive = "🍁 Lenda do Servidor";
        }

        if (roleToGive && newLevel > currentReward.rewardedLevel) {
          currentReward.rewardedLevel = newLevel;
          userTimeRewards.set(userKey, currentReward);

          let role = guild.roles.cache.find((r) => r.name === roleToGive);
          if (!role) {
            role = await guild.roles
              .create({
                name: roleToGive,
                color: 0xd97706,
              })
              .catch(() => undefined);
          }
          if (role && message.member) {
            await message.member.roles.add(role).catch(() => {});
          }

          const rewardsCh = guild.channels.cache.find(
            (ch) =>
              ch.isTextBased() &&
              !ch.isVoiceBased() &&
              ch.name.toLowerCase().includes("invite-rewards")
          ) as TextChannel | undefined;

          if (rewardsCh) {
            await rewardsCh.send(
              `🍁 <@${message.author.id}> recebeu o cargo **${roleToGive}** pelo tempo de participação no servidor!`
            );
          }
        } else {
          userTimeRewards.set(userKey, currentReward);
        }
      } catch {
        // Ignora erro
      }
    });
  };

  const intentConfigs = [
    [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildMessages,
    ],
    [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildMessages,
    ],
  ];

  for (const intents of intentConfigs) {
    try {
      botError = "";
      discordClient = new Client({ intents });
      setupHandlers(discordClient);
      await discordClient.login(token);
      break;
    } catch (err: any) {
      if (discordClient) {
        await discordClient.destroy().catch(() => {});
      }
      botError = err?.message || String(err);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.set("trust proxy", true);
  app.use(express.json({ limit: "15mb" }));

  initDiscordBot();

  app.get("/api/status", (_req, res) => {
    const guildsConnected =
      discordClient && botReady
        ? discordClient.guilds.cache.map((g) => ({
            id: g.id,
            name: g.name,
            icon: g.iconURL(),
            memberCount: g.memberCount,
            channelCount: g.channels.cache.size,
          }))
        : [];

    res.json({
      botReady,
      botTag,
      botId,
      botError,
      loginUrl: DISCORD_LOGIN_AND_AUTH_URL,
      guildsConnected,
      logs: serverLogs.slice(0, 60),
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
