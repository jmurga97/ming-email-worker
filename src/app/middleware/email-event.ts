import { createMiddleware } from "hono/factory";

import { BAD_GATEWAY, FORBIDDEN, TOO_MANY_REQUESTS } from "@/config/status-codes";
import { toEmailServiceError } from "@/shared/errors/email-service-error";
import { PolicyError } from "@/shared/errors/policy-error";
import { errorResponse } from "@/shared/http/responses";
import { logEmailEvent } from "@/shared/lib/logger";

import type { AppBindings } from "@/config/types";
import type { EmailLogContext } from "@/shared/lib/logger";

function logIssueAndRespond(
  logContext: EmailLogContext,
  errorCode: string,
  message: string,
  status: number,
  outcome: "error" | "rejected" = "error",
) {
  logEmailEvent({ ...logContext, outcome, errorCode });

  return errorResponse(errorCode, message, status);
}

export const emailEventMiddleware = createMiddleware<AppBindings>(async (context, next) => {
  try {
    await next();
  } catch (error) {
    const logContext = context.get("emailLogContext");

    if (!logContext) {
      throw error;
    }

    if (error instanceof PolicyError) {
      return logIssueAndRespond(logContext, error.code, error.message, FORBIDDEN, "rejected");
    }

    const emailError = toEmailServiceError(error);
    const status = emailError.code === "EMAIL_RATE_LIMITED" ? TOO_MANY_REQUESTS : BAD_GATEWAY;

    return logIssueAndRespond(logContext, emailError.code, emailError.message, status);
  }

  return context.res;
});
