import app from "./app";
import { logger } from "./lib/logger";
import { createBotClient } from "./bot/bot.js";

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

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  if (process.env["BOT_ENABLED"] === "1") {
    logger.info("Starting Discord bot...");
    createBotClient();
  } else {
    logger.info("Discord bot disabled (BOT_ENABLED not set). Set BOT_ENABLED=1 to enable.");
  }
});
