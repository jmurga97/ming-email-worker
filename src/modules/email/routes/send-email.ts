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
  sendEmailRequestSchema,
  sendEmailResponseSchema,
} from "@/modules/email/schemas/send-email.schema";
import { sendTransactionalEmail } from "@/modules/email/services/send-email.service";
import { toEmailServiceError } from "@/shared/errors/email-service-error";
import { PolicyError } from "@/shared/errors/policy-error";
import { errorResponse } from "@/shared/http/responses";
import { createErrorResponse, jsonSuccess } from "@/shared/lib/http";
import { logEmailEvent } from "@/shared/lib/logger";
import { createApiRoute } from "@/shared/lib/openapi";

const route = createApiRoute({
  method: "post",
  path: "/send",
  tags: ["Email"],
  request: {
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
  const payload = context.req.valid("json");
  const logContext = {
    product: payload.product,
    template: payload.template,
    ...(payload.metadata?.requestId ? { requestId: payload.metadata.requestId } : {}),
  };

  let config;

  try {
    config = parseRuntimeConfig(context.env);
  } catch {
    logEmailEvent({
      ...logContext,
      outcome: "error",
      errorCode: "INVALID_RUNTIME_CONFIG",
    });

    return errorResponse(
      "INVALID_RUNTIME_CONFIG",
      "Email worker configuration is invalid",
      INTERNAL_SERVER_ERROR,
    );
  }

  try {
    const result = await sendTransactionalEmail(context.env, config, payload);

    logEmailEvent({
      ...logContext,
      outcome: "success",
      messageId: result.messageId,
    });

    return jsonSuccess(context, { messageId: result.messageId }, OK);
  } catch (error) {
    if (error instanceof PolicyError) {
      logEmailEvent({
        ...logContext,
        outcome: "rejected",
        errorCode: error.code,
      });

      return errorResponse(error.code, error.message, FORBIDDEN);
    }

    const emailError = toEmailServiceError(error);
    const status = emailError.code === "EMAIL_RATE_LIMITED" ? TOO_MANY_REQUESTS : BAD_GATEWAY;

    logEmailEvent({
      ...logContext,
      outcome: "error",
      errorCode: emailError.code,
    });

    return errorResponse(emailError.code, emailError.message, status);
  }
});
