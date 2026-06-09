import { notFoundHandler, onErrorHandler } from "@/config/handlers";

import { createRouter } from "./create-router";
import { registerRoutes } from "./routes";

export function createApp() {
  const app = createRouter();

  registerRoutes(app);

  app.notFound(notFoundHandler);
  app.onError(onErrorHandler);

  return app;
}
