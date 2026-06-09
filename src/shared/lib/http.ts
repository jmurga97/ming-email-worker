import { z } from "@hono/zod-openapi";

import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "@/config/status-codes";

import type { OK } from "@/config/status-codes";
import type { AppBindings } from "@/config/types";
import type { Context } from "hono";
import type { ZodType } from "zod";

export const errorDetailsSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export const errorResponseSchema = z
  .object({
    success: z.literal(false),
    error: errorDetailsSchema,
  })
  .openapi("EmailWorkerErrorResponse");

export function createSuccessResponseSchema<DataSchema extends ZodType>(dataSchema: DataSchema) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
  });
}

export function createErrorResponse(description: string) {
  return {
    description,
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  } as const;
}

export const validationErrorResponses = {
  [BAD_REQUEST]: createErrorResponse("Invalid request"),
  [INTERNAL_SERVER_ERROR]: createErrorResponse("Internal server error"),
} as const;

export function jsonSuccess<Data, Status extends typeof OK>(
  c: Context<AppBindings>,
  data: Data,
  status: Status,
) {
  return c.json(
    {
      success: true as const,
      data,
    },
    status,
  );
}
