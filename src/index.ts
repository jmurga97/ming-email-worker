import { createApp } from "@/app/create-app";

import type { AppBindings } from "@/config/types";

const app = createApp();

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<AppBindings["Bindings"]>;
