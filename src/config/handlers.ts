import { HTTPException } from "hono/http-exception";

import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } from "@/config/status-codes";
import { errorResponse } from "@/shared/http/responses";

import type { AppBindings } from "@/config/types";
import type { OpenAPIHonoOptions } from "@hono/zod-openapi";
import type { ErrorHandler, NotFoundHandler } from "hono";
import type { ZodError } from "zod";

function formatValidationMessage(error: ZodError) {
  const issue = error.issues[0];

  if (!issue) {
    return "Invalid request";
  }

  const path = issue.path.join(".");

  return path ? `${path}: ${issue.message}` : issue.message;
}

export const defaultValidationHook: OpenAPIHonoOptions<AppBindings>["defaultHook"] = (result) => {
  if (result.success) {
    return undefined;
  }

  return errorResponse("INVALID_BODY", formatValidationMessage(result.error), BAD_REQUEST);
};

export const notFoundHandler: NotFoundHandler<AppBindings> = () =>
  errorResponse("NOT_FOUND", "Not found", NOT_FOUND);

export const onErrorHandler: ErrorHandler<AppBindings> = (error, context) => {
  if (context.get("emailLogContext")) {
    throw error;
  }

  if (
    error instanceof HTTPException &&
    error.status === BAD_REQUEST &&
    error.message === "Malformed JSON in request body"
  ) {
    return errorResponse("INVALID_JSON", error.message, BAD_REQUEST);
  }

  console.error(
    JSON.stringify({
      event: "email_worker_unhandled_error",
      errorCode: "INTERNAL_SERVER_ERROR",
    }),
  );

  return errorResponse("INTERNAL_SERVER_ERROR", "Internal server error", INTERNAL_SERVER_ERROR);
};
