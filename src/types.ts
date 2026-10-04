export interface ChannelItem {
  id: string;
  name: string;
  prefix: "├" | "└";
  type: "text" | "voice";
  category: string;
}

export interface ServerTemplate {
  id: string;
  bannerHeader: string[];
  name: string;
  description: string;
  channels: ChannelItem[];
}

export interface DiscordGuild {
  id: string;
  name: string;
  role: "Dono (Owner)" | "Administrador";
  memberCount: number;
  oldChannels: ChannelItem[];
}

export interface ChatMessage {
  id: string;
  author: string;
  role: "owner" | "bot" | "member";
  timestamp: string;
  content: string;
  isCommand?: boolean;
  commandText?: string;
  imagePreview?: string;
  moderationResult?: {
    blocked: boolean;
    category: string;
    confidence: number;
    reason: string;
    actionTaken: string;
  };
}

export interface ExecutionStep {
  id: string;
  timestamp: string;
  action: "delete" | "create" | "system";
  detail: string;
}
