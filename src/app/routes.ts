import emailRoutes from "@/modules/email/routes";

import type { App } from "@/config/types";

export function registerRoutes(app: App) {
  app.route("/", emailRoutes);
}
