import app from "./app";
import { logger } from "./lib/logger";
import { createBotClient } from "./bot/bot.js";
import type { Client } from "discord.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// ── Process-level safety net ───────────────────────────────────────────────────
// Catch anything the bot's async code throws without taking the whole server down.
process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception — server staying alive");
});
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection — server staying alive");
});

// ── Discord bot auto-restart ───────────────────────────────────────────────────
let _activeClient: Client | null = null;
let _restartTimer: ReturnType<typeof setTimeout> | null = null;
const MAX_RESTART_DELAY_MS = 60_000;
const BASE_RESTART_DELAY_MS = 5_000;

function scheduleRestart(reason: string, attempt: number) {
  if (_restartTimer) return;
  const delay = Math.min(BASE_RESTART_DELAY_MS * attempt, MAX_RESTART_DELAY_MS);
  logger.warn({ reason, delay, attempt }, "Bot will restart automatically");
  _restartTimer = setTimeout(() => {
    _restartTimer = null;
    launchBot(attempt + 1);
  }, delay);
}

function launchBot(attempt = 1) {
  if (_activeClient) {
    try { _activeClient.destroy(); } catch {}
    _activeClient = null;
  }

  if (attempt === 1) {
    logger.info("Starting Discord bot");
  } else {
    logger.info({ attempt }, "Restarting Discord bot");
  }

  let client: Client | null;
  try {
    client = createBotClient();
  } catch (err) {
    logger.error({ err, attempt }, "Bot threw on startup");
    scheduleRestart("startup error", attempt);
    return;
  }

  if (!client) return; // No token set — nothing to restart

  _activeClient = client;

  // Catch WebSocket-level errors that discord.js surfaces as events
  client.on("error", (err) => {
    logger.error({ err }, "Bot WebSocket error — scheduling restart");
    scheduleRestart("WebSocket error", attempt);
  });

  // Session invalidated (bad token, rate-limit ban, etc.)
  client.on("invalidated", () => {
    logger.error("Bot session invalidated — scheduling restart");
    scheduleRestart("session invalidated", attempt);
  });

  // Shard disconnected — codes 1000/1001 are normal closes discord.js resumes
  // automatically; anything else needs a full recreate.
  client.on("shardDisconnect", (event, shardId) => {
    if (event.code !== 1000 && event.code !== 1001) {
      logger.warn({ code: event.code, shardId }, "Shard disconnected — scheduling restart");
      scheduleRestart(`shard disconnect code ${event.code}`, attempt);
    }
  });
}

// ── Start server ───────────────────────────────────────────────────────────────
app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  if (process.env["BOT_ENABLED"] === "1") {
    launchBot();
  } else {
    logger.info("Discord bot disabled (BOT_ENABLED not set). Set BOT_ENABLED=1 to enable.");
  }
});
