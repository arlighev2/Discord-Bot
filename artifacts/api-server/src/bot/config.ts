export const OWNER_ID = "1491457883219693720";
export const OWNER_ROLE_ID  = "1450662192365047827";
export const CO_OWNER_ROLE_ID = "1520870585977147434";
export const BUILD_TICKET_ROLE_ID = "1518626190813040752";
export const GIVEAWAY_ROLE_ID = "1520289562637635624";
export const TICKET_LOG_CHANNEL_ID = "1520978728975597671";
export const TRANSCRIPT_CHANNEL_ID = "1450662194063867939";
export const GENERAL_TICKET_ROLE_ID = "1475730171058323623";
export const SKELLY_TICKET_ROLE_ID = "1520650191139504235";
export const STAFF_APP_RESPONSES_CHANNEL_ID = "1520891416094707732";
export const LEVELUP_CHANNEL_ID = "1475718052636262531";
export const SPAM_LOG_CHANNEL_ID = "1520978728975597671";
export const MOD_LOG_CHANNEL_ID = "1518635057135489024";

export const PAYMENT_PARTNER_IGN = "brqydn";
export const PAYMENT_PARTNER_CUT = 0.15;

export const MOD_ROLE_IDS = [
  "1450662192365047822",
  "1450662192365047823",
  "1450662192365047824",
  "1450662192365047825",
];

export const STAFF_ROLE_IDS = [
  "1520248946637930516",
];

export const BOT_COLOR = 0x5865f2;
export const SUCCESS_COLOR = 0x57f287;
export const ERROR_COLOR = 0xed4245;
export const WARNING_COLOR = 0xfee75c;
export const GOLD_COLOR = 0xf1c40f;

export interface TicketCategory {
  id: string;
  label: string;
  description: string;
  color: number;
  channelPrefix: string;
  discordCategoryName: string;
  isFarm?: boolean;
}

export const REGULAR_CATEGORIES: TicketCategory[] = [
  {
    id: "support",
    label: "Reports & Support",
    description:
      "For users who need help with server features, commands, roles, bots, or general issues. This ticket should be used when you encounter technical problems or require help from staff members. This also serves to document rule violations together with suspicious activities and harassment incidents and scam attempts and all other types of unacceptable behavior. Please provide clear evidence (screenshots, usernames, timestamps) when possible.",
    color: 0x5865f2,
    channelPrefix: "support",
    discordCategoryName: "Support Tickets",
  },
  {
    id: "giveaway",
    label: "Giveaway",
    description:
      "For giveaway-related questions, issues with entering or claiming prizes, or any concerns about a giveaway. Please include the Giveaway ID if applicable.",
    color: 0xf47bff,
    channelPrefix: "giveaway",
    discordCategoryName: "Giveaway Support Tickets",
  },
  {
    id: "skellys",
    label: "Buy/Sell Skellys",
    description:
      "For purchasing or selling Skelly Spawners. You can view current prices in <#1518633695404101773> before opening a ticket.",
    color: 0x5865f2,
    channelPrefix: "skelly",
    discordCategoryName: "Skelly Tickets",
  },
  {
    id: "builder-application",
    label: "Builder Application",
    description:
      "Want to become a builder on V3 Sanctuary? Open this ticket and a staff member will review your application. Please be ready to share your builds or portfolio.",
    color: 0xe67e22,
    channelPrefix: "builder-app",
    discordCategoryName: "Support Tickets",
  },
  {
    id: "schematic-application",
    label: "Schematic Application",
    description:
      "Want to become a Schematic Poster on V3 Sanctuary? Open this ticket and a staff member will review your submission. Please be ready to share your schematics.",
    color: 0x9b59b6,
    channelPrefix: "schematic-app",
    discordCategoryName: "Support Tickets",
  },
];

export const SKELLY_CATEGORY: TicketCategory = {
  id: "skellys",
  label: "Buy/Sell Skellys",
  description:
    "For purchase questions, payment issues, donation inquiries, reward claims, buying/selling Skelly Spawners, or anything not covered under Support or Reports.",
  color: 0x5865f2,
  channelPrefix: "skelly",
  discordCategoryName: "Skelly Tickets",
};

export const FARM_CATEGORY: TicketCategory = {
  id: "buy-farms",
  label: "Buy Farms",
  description:
    "Buy Farms – For users interested in purchasing a farm. Use this ticket for farm availability, pricing, purchase inquiries, or any questions related to buying a farm.",
  color: SUCCESS_COLOR,
  channelPrefix: "build",
  discordCategoryName: "Build Tickets",
  isFarm: true,
};

export const BUILDER_CATEGORY: TicketCategory = REGULAR_CATEGORIES.find((c) => c.id === "builder-application")!;

export const ALL_CATEGORIES: TicketCategory[] = [...REGULAR_CATEGORIES, SKELLY_CATEGORY, FARM_CATEGORY];
