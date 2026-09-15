import { createApp } from "./app";
import { startPoller } from "./features/documents/worker/poller";
import { logger } from "./lib/logger";

const PORT = Number(process.env.PORT) || 4000;

const app = createApp();
app.listen(PORT, () => {
  logger.info({ port: PORT }, "server started");
  startPoller();
});
