export interface DiscordUser {
  id: string;
  username: string;
  discriminator?: string;
  avatar: string;
  bot?: boolean;
  role?: string;
  roleColor?: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  customStatus?: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  image?: string;
  thumbnail?: string;
}

export interface DiscordMessage {
  id: string;
  author: DiscordUser;
  content: string;
  timestamp: string;
  channelId: string;
  replyTo?: {
    id: string;
    authorName: string;
    content: string;
  };
  embeds?: DiscordEmbed[];
  reactions?: { emoji: string; count: number; users: string[] }[];
  isJordan?: boolean;
  mythometerScore?: number; // 0 to 100 absurdity rating
  jargonDetected?: string[];
  formationPitchDetected?: boolean;
}

export interface DiscordChannel {
  id: string;
  name: string;
  topic: string;
  type: 'text' | 'voice';
  unread?: boolean;
}

export interface BotStatusResponse {
  isConnected: boolean;
  botUsername?: string;
  botId?: string;
  avatarUrl?: string;
  ping?: number;
  guildsCount?: number;
  lastMessageAt?: string;
  lastInteraction?: string;
  error?: string | null;
}
