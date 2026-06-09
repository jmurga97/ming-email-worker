import { createRouter } from "@/app/create-router";

import sendEmailRoute from "./routes/send-email";

const router = createRouter().route("/", sendEmailRoute);

export default router;
