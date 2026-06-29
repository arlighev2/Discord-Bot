import fs from "fs";
import path from "path";

export interface TicketEntry {
  userId: string;
  username: string;
  categoryId: string;
  guildId: string;
  channelId: string;
  createdAt: string;
  ticketNumber: number;
  claimedBy?: string;
  claimedById?: string;
  joinedStaff?: string[];
}

export interface WarnEntry {
  userId: string;
  reason: string;
  moderatorId: string;
  moderatorTag: string;
  timestamp: string;
}

export interface StickerEntry {
  channelId: string;
  guildId: string;
  messageId: string;
  text: string;
  createdAt: string;
}

export interface GiveawayEntry {
  id: string;
  guildId: string;
  channelId: string;
  messageId: string;
  hostId: string;
  prize: string;
  description: string;
  winnersCount: number;
  endTime: string;
  entries: string[];
  ended: boolean;
  winners: string[];
  claimedBy: string[];
  claimExpiry: string | null;
  winMessages: Record<string, string>;
  type: "normal" | "simple" | "double";
}

export interface XpEntry {
  xp: number;
  lastMessage: number;
}

export interface ViolationEntry {
  count: number;
  expiresAt: string; // ISO timestamp — when this counter resets
}

export interface SpawnerData {
  buyPrice: string | null;
  sellPrice: string | null;
  stock: number;
}

interface BotData {
  tickets: Record<string, TicketEntry>;
  ticketCounter: number;
  farmDescription: string;
  farmList: string;
  skellyDescription: string;
  categoryMessages: Record<string, string>;
  ticketPanelTitle: string;
  ticketPanelDesc: string;
  giveaways: Record<string, GiveawayEntry>;
  stickers: Record<string, StickerEntry>;
  warns: Record<string, WarnEntry[]>;
  welcomeChannelId: string;
  xp: Record<string, XpEntry>;
  violations: Record<string, ViolationEntry>;
  spawners: Record<string, SpawnerData>;
}

const DATA_FILE = path.resolve(process.cwd(), "bot-data.json");
const TRANSCRIPT_DIR = path.resolve(process.cwd(), "bot-transcripts");
if (!fs.existsSync(TRANSCRIPT_DIR)) fs.mkdirSync(TRANSCRIPT_DIR, { recursive: true });

function defaultData(): BotData {
  return {
    tickets: {},
    ticketCounter: 0,
    xp: {},
    violations: {},
    farmDescription:
      "Buy Farms – For users interested in purchasing a farm. Use this ticket for farm availability, pricing, purchase inquiries, or any questions related to buying a farm.",
    farmList: "available farms:\n\n(No farms currently listed. Check back soon!)",
    skellyDescription:
      "Buy/Sell Skellys – For purchase questions, payment issues, donation inquiries, reward claims, or buying/selling Skelly Spawners.",
    categoryMessages: {},
    ticketPanelTitle: "1450662192365047822,1450662192365047823,1450662192365047824,1450662192365047824,1450662192365047825thSupport Tickets",
    ticketPanelDesc:
      "Need help or have a question? Click one of the buttons below to open a ticket. Our staff will assist you as soon as possible.",
    giveaways: {},
    stickers: {},
    warns: {},
    welcomeChannelId: "",
    spawners: {
      "Skeleton":   { buyPrice: "3.3m", sellPrice: "3.9m", stock: 209 },
      "Iron Golem": { buyPrice: "5.5m", sellPrice: "9m",   stock: 0   },
      "Blaze":      { buyPrice: "2m",   sellPrice: null,    stock: 0   },
      "Pig":        { buyPrice: "2m",   sellPrice: null,    stock: 0   },
      "Cow":        { buyPrice: "2m",   sellPrice: null,    stock: 0   },
      "Spider":     { buyPrice: "4m",   sellPrice: null,    stock: 0   },
      "Piglin":     { buyPrice: "5m",   sellPrice: null,    stock: 0   },
      "Creeper":    { buyPrice: "5m",   sellPrice: "8m",    stock: 0   },
    },
  };
}

function loadData(): BotData {
  if (!fs.existsSync(DATA_FILE)) return defaultData();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<BotData>;
    return { ...defaultData(), ...parsed };
  } catch (err) {
    console.error("[storage] Failed to parse bot-data.json - attempting backup restore:", err);
    const backup = DATA_FILE + ".bak";
    if (fs.existsSync(backup)) {
      try {
        const raw = fs.readFileSync(backup, "utf8");
        const parsed = JSON.parse(raw) as Partial<BotData>;
        console.error("[storage] Restored from backup successfully.");
        return { ...defaultData(), ...parsed };
      } catch {
        console.error("[storage] Backup also unreadable - starting with empty data.");
      }
    }
    return defaultData();
  }
}

function saveData(data: BotData): void {
  const json = JSON.stringify(data, null, 2);
  const tmp = DATA_FILE + ".tmp";
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(tmp, json, "utf8");
    fs.renameSync(tmp, DATA_FILE);
    // Keep a backup copy one write behind for safety
    try { fs.copyFileSync(DATA_FILE, DATA_FILE + ".bak"); } catch {}
  } catch (err) {
    console.error("[storage] Failed to save data:", err);
    // Fallback: write directly without atomic rename
    try { fs.writeFileSync(DATA_FILE, json, "utf8"); } catch {}
  }
}

let _data = loadData();

export const storage = {
  getData: () => _data,

  nextTicketNumber(): number {
    _data.ticketCounter = (_data.ticketCounter ?? 0) + 1;
    saveData(_data);
    return _data.ticketCounter;
  },

  addTicket(channelId: string, ticket: TicketEntry) {
    _data.tickets[channelId] = ticket;
    saveData(_data);
  },

  removeTicket(channelId: string) {
    delete _data.tickets[channelId];
    saveData(_data);
  },

  claimTicket(channelId: string, username: string, userId: string) {
    if (_data.tickets[channelId]) {
      _data.tickets[channelId]!.claimedBy = username;
      _data.tickets[channelId]!.claimedById = userId;
      saveData(_data);
    }
  },

  joinTicket(channelId: string, userId: string): boolean {
    const ticket = _data.tickets[channelId];
    if (!ticket) return false;
    if (!ticket.joinedStaff) ticket.joinedStaff = [];
    if (ticket.joinedStaff.includes(userId)) return false;
    ticket.joinedStaff.push(userId);
    saveData(_data);
    return true;
  },

  getTicket(channelId: string): TicketEntry | undefined {
    return _data.tickets[channelId];
  },

  saveTranscript(ticketNumber: number, content: string): string {
    const file = path.join(TRANSCRIPT_DIR, `ticket-${String(ticketNumber).padStart(4, "0")}.txt`);
    fs.writeFileSync(file, content, "utf8");
    return file;
  },

  readTranscript(ticketNumber: number): Buffer | null {
    const file = path.join(TRANSCRIPT_DIR, `ticket-${String(ticketNumber).padStart(4, "0")}.txt`);
    if (!fs.existsSync(file)) return null;
    return fs.readFileSync(file);
  },

  getTicketsByGuild(guildId: string): (TicketEntry & { channelId: string })[] {
    return Object.entries(_data.tickets)
      .filter(([, t]) => t.guildId === guildId)
      .map(([channelId, t]) => ({ ...t, channelId }));
  },

  hasOpenTicket(userId: string, categoryId: string, guildId: string): string | null {
    const entry = Object.entries(_data.tickets).find(
      ([, t]) => t.userId === userId && t.categoryId === categoryId && t.guildId === guildId,
    );
    return entry ? entry[0] : null;
  },

  updateSkellyDescription(desc: string) {
    _data.skellyDescription = desc ?? "";
    saveData(_data);
  },

  updateFarmDescription(desc: string) {
    _data.farmDescription = desc;
    saveData(_data);
  },

  updateFarmList(list: string) {
    _data.farmList = list;
    saveData(_data);
  },

  setCategoryMessage(categoryId: string, message: string) {
    _data.categoryMessages[categoryId] = message;
    saveData(_data);
  },

  getCategoryMessage(categoryId: string): string | undefined {
    return _data.categoryMessages[categoryId];
  },

  updatePanelText(title: string, desc: string) {
    _data.ticketPanelTitle = title;
    _data.ticketPanelDesc = desc;
    saveData(_data);
  },

  addGiveaway(giveaway: GiveawayEntry) {
    if (!_data.giveaways) _data.giveaways = {};
    _data.giveaways[giveaway.id] = giveaway;
    saveData(_data);
  },

  getGiveaway(id: string): GiveawayEntry | undefined {
    return _data.giveaways?.[id];
  },

  getActiveGiveaways(): GiveawayEntry[] {
    if (!_data.giveaways) return [];
    return Object.values(_data.giveaways).filter((g) => !g.ended);
  },

  enterGiveaway(id: string, userId: string): boolean {
    const gw = _data.giveaways?.[id];
    if (!gw || gw.ended) return false;
    if (gw.entries.includes(userId)) return false;
    gw.entries.push(userId);
    saveData(_data);
    return true;
  },

  leaveGiveaway(id: string, userId: string): boolean {
    const gw = _data.giveaways?.[id];
    if (!gw || gw.ended) return false;
    const idx = gw.entries.indexOf(userId);
    if (idx === -1) return false;
    gw.entries.splice(idx, 1);
    saveData(_data);
    return true;
  },

  endGiveaway(id: string, winners: string[]) {
    const gw = _data.giveaways?.[id];
    if (!gw) return;
    gw.ended = true;
    gw.winners = winners;
    saveData(_data);
  },

  setClaimExpiry(id: string, expiry: string) {
    const gw = _data.giveaways?.[id];
    if (!gw) return;
    gw.claimExpiry = expiry;
    saveData(_data);
  },

  addWinMessage(id: string, winnerId: string, messageId: string) {
    const gw = _data.giveaways?.[id];
    if (!gw) return;
    if (!gw.winMessages) gw.winMessages = {};
    gw.winMessages[winnerId] = messageId;
    saveData(_data);
  },

  claimGiveaway(id: string, userId: string): boolean {
    const gw = _data.giveaways?.[id];
    if (!gw) return false;
    if (!gw.winners.includes(userId)) return false;
    if (gw.claimedBy.includes(userId)) return false;
    if (gw.claimExpiry && new Date() > new Date(gw.claimExpiry)) return false;
    gw.claimedBy.push(userId);
    saveData(_data);
    return true;
  },

  updateGiveawayMessage(id: string, messageId: string) {
    const gw = _data.giveaways?.[id];
    if (!gw) return;
    gw.messageId = messageId;
    saveData(_data);
  },

  addSticker(sticker: StickerEntry) {
    if (!_data.stickers) _data.stickers = {};
    _data.stickers[sticker.messageId] = sticker;
    saveData(_data);
  },

  getSticker(messageId: string): StickerEntry | undefined {
    return _data.stickers?.[messageId];
  },

  getStickersForChannel(channelId: string): StickerEntry[] {
    if (!_data.stickers) return [];
    return Object.values(_data.stickers).filter((s) => s.channelId === channelId);
  },

  replaceStickerMessage(oldMessageId: string, newMessageId: string): boolean {
    const s = _data.stickers?.[oldMessageId];
    if (!s) return false;
    delete _data.stickers[oldMessageId];
    s.messageId = newMessageId;
    _data.stickers[newMessageId] = s;
    saveData(_data);
    return true;
  },

  updateStickerText(messageId: string, text: string): boolean {
    const s = _data.stickers?.[messageId];
    if (!s) return false;
    s.text = text;
    saveData(_data);
    return true;
  },

  deleteSticker(messageId: string): StickerEntry | undefined {
    const s = _data.stickers?.[messageId];
    if (!s) return undefined;
    delete _data.stickers[messageId];
    saveData(_data);
    return s;
  },

  addWarn(userId: string, warn: WarnEntry): number {
    if (!_data.warns) _data.warns = {};
    if (!_data.warns[userId]) _data.warns[userId] = [];
    _data.warns[userId]!.push(warn);
    saveData(_data);
    return _data.warns[userId]!.length;
  },

  getWarns(userId: string): WarnEntry[] {
    return _data.warns?.[userId] ?? [];
  },

  clearWarns(userId: string): void {
    if (_data.warns) delete _data.warns[userId];
    saveData(_data);
  },

  removeWarn(userId: string, idx: number): boolean {
    const warns = _data.warns?.[userId];
    if (!warns || idx < 0 || idx >= warns.length) return false;
    warns.splice(idx, 1);
    saveData(_data);
    return true;
  },

  setWelcomeChannelId(id: string): void {
    _data.welcomeChannelId = id;
    saveData(_data);
  },

  getWelcomeChannelId(): string {
    return _data.welcomeChannelId ?? "";
  },

  getXP(userId: string): XpEntry {
    if (!_data.xp) _data.xp = {};
    return _data.xp[userId] ?? { xp: 0, lastMessage: 0 };
  },

  addXP(userId: string, amount: number): void {
    if (!_data.xp) _data.xp = {};
    const entry = _data.xp[userId] ?? { xp: 0, lastMessage: 0 };
    entry.xp += amount;
    entry.lastMessage = Date.now();
    _data.xp[userId] = entry;
    saveData(_data);
  },

  setXpCooldown(userId: string): void {
    if (!_data.xp) _data.xp = {};
    const entry = _data.xp[userId] ?? { xp: 0, lastMessage: 0 };
    entry.lastMessage = Date.now();
    _data.xp[userId] = entry;
    saveData(_data);
  },

  getAllXP(): Record<string, XpEntry> {
    return _data.xp ?? {};
  },

  // ── Violations (progressive punishment, permanent — violations never expire) ──
  getViolationCount(userId: string): number {
    if (!_data.violations) _data.violations = {};
    const v = _data.violations[userId];
    if (!v) return 0;
    return v.count;
  },

  incrementViolation(userId: string, _windowMs: number): number {
    if (!_data.violations) _data.violations = {};
    const v = _data.violations[userId];
    if (!v) {
      _data.violations[userId] = { count: 1, expiresAt: "9999-12-31T00:00:00.000Z" };
    } else {
      v.count += 1;
    }
    saveData(_data);
    return _data.violations[userId]!.count;
  },

  clearViolation(userId: string): void {
    if (!_data.violations) return;
    delete _data.violations[userId];
    saveData(_data);
  },

  getSpawners(): Record<string, SpawnerData> {
    if (!_data.spawners) _data.spawners = defaultData().spawners;
    return _data.spawners;
  },

  updateSpawnerStock(name: string, delta: number): { key: string; data: SpawnerData } | null {
    if (!_data.spawners) _data.spawners = defaultData().spawners;
    const key = Object.keys(_data.spawners).find((k) => k.toLowerCase() === name.toLowerCase());
    if (!key) return null;
    _data.spawners[key].stock = Math.max(0, (_data.spawners[key].stock ?? 0) + delta);
    saveData(_data);
    return { key, data: _data.spawners[key] };
  },

  setSpawnerPrice(name: string, type: "buy" | "sell", price: string | null): { key: string; data: SpawnerData } | null {
    if (!_data.spawners) _data.spawners = defaultData().spawners;
    const key = Object.keys(_data.spawners).find((k) => k.toLowerCase() === name.toLowerCase());
    if (!key) return null;
    if (type === "buy") _data.spawners[key].buyPrice = price;
    else _data.spawners[key].sellPrice = price;
    saveData(_data);
    return { key, data: _data.spawners[key] };
  },

  addSpawnerType(name: string): boolean {
    if (!_data.spawners) _data.spawners = defaultData().spawners;
    const exists = Object.keys(_data.spawners).some((k) => k.toLowerCase() === name.toLowerCase());
    if (exists) return false;
    const properName = name.charAt(0).toUpperCase() + name.slice(1);
    _data.spawners[properName] = { buyPrice: null, sellPrice: null, stock: 0 };
    saveData(_data);
    return true;
  },
};
