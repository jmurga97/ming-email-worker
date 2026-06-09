import { createRouter } from "@/app/create-router";
import { parseRuntimeConfig } from "@/config/runtime";
import {
  BAD_GATEWAY,
  BAD_REQUEST,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  OK,
  TOO_MANY_REQUESTS,
} from "@/config/status-codes";
import {
  sendEmailQuerySchema,
  sendEmailRequestSchema,
  sendEmailResponseSchema,
} from "@/modules/email/schemas/send-email.schema";
import { sendTransactionalEmail } from "@/modules/email/services/send-email.service";
import { createErrorResponse, jsonSuccess } from "@/shared/lib/http";
import { createApiRoute } from "@/shared/lib/openapi";

const route = createApiRoute({
  method: "post",
  path: "/send",
  tags: ["Email"],
  request: {
    query: sendEmailQuerySchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: sendEmailRequestSchema,
        },
      },
    },
  },
  errorResponses: {
    [BAD_REQUEST]: createErrorResponse("Invalid email payload"),
    [FORBIDDEN]: createErrorResponse("Email policy rejected the request"),
    [TOO_MANY_REQUESTS]: createErrorResponse("Email provider rate limit exceeded"),
    [INTERNAL_SERVER_ERROR]: createErrorResponse("Internal configuration error"),
    [BAD_GATEWAY]: createErrorResponse("Failed to send email"),
  },
  responses: {
    [OK]: {
      description: "Send a transactional email",
      content: {
        "application/json": {
          schema: sendEmailResponseSchema,
        },
      },
    },
  },
});

export default createRouter().openapi(route, async (context) => {
  const { productId } = context.req.valid("query");
  const payload = context.req.valid("json");

  context.set("emailLogContext", {
    product: productId,
    template: payload.template,
  });

  const config = parseRuntimeConfig(context.env);
  const result = await sendTransactionalEmail(context.env, config, productId, payload);

  return jsonSuccess(context, { messageId: result.messageId }, OK);
});
