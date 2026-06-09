import { notFoundHandler, onErrorHandler } from "@/config/handlers";

import { createRouter } from "./create-router";
import { emailEventMiddleware } from "./middleware/email-event";
import { registerRoutes } from "./routes";

export function createApp() {
  const app = createRouter();

  app.use("/send", emailEventMiddleware);
  registerRoutes(app);

  app.notFound(notFoundHandler);
  app.onError(onErrorHandler);

  return app;
}
