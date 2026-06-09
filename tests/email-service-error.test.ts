import { describe, expect, test } from "bun:test";

import { toEmailServiceError } from "@/shared/errors/email-service-error";

import type { EmailServiceErrorCode } from "@/shared/errors/email-service-error";

describe("toEmailServiceError", () => {
  const cases: Array<[string, EmailServiceErrorCode]> = [
    ["E_SENDER_NOT_VERIFIED", "EMAIL_SENDER_NOT_VERIFIED"],
    ["E_SENDER_DOMAIN_NOT_AVAILABLE", "EMAIL_SENDER_DOMAIN_UNAVAILABLE"],
    ["E_RATE_LIMIT_EXCEEDED", "EMAIL_RATE_LIMITED"],
    ["E_TOO_MANY_RECIPIENTS", "EMAIL_TOO_MANY_RECIPIENTS"],
  ];

  test.each(cases)("maps provider error %s", (providerCode, serviceCode) => {
    expect(toEmailServiceError({ code: providerCode }).code).toBe(serviceCode);
  });

  test("maps unknown errors without exposing provider details", () => {
    const error = toEmailServiceError(new Error("Sensitive provider response"));

    expect(error).toEqual({
      code: "EMAIL_SEND_FAILED",
      message: "Failed to send email",
    });
  });
});
