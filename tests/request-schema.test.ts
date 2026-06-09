import { describe, expect, test } from "bun:test";

import { sendEmailRequestSchema } from "@/modules/email/schemas/send-email.schema";

import { createContactPayload, createOtpPayload } from "./fixtures";

describe("sendEmailRequestSchema", () => {
  test("accepts OTP and contact-form requests", () => {
    expect(sendEmailRequestSchema.parse(createOtpPayload()).template).toBe("otp");
    expect(sendEmailRequestSchema.parse(createContactPayload()).template).toBe("contact-form");
  });

  test("rejects contact recipients supplied by a caller", () => {
    const payload = {
      ...createContactPayload(),
      to: "attacker-controlled@example.com",
    };

    expect(sendEmailRequestSchema.safeParse(payload).success).toBeFalse();
  });

  test("requires replyTo to match the validated form email", () => {
    const payload = {
      ...createContactPayload(),
      replyTo: "different@example.com",
    };

    expect(sendEmailRequestSchema.safeParse(payload).success).toBeFalse();
  });

  test("rejects arbitrary subject and HTML fields", () => {
    const payload = {
      ...createOtpPayload(),
      subject: "Injected subject",
      html: "<strong>Injected</strong>",
    };

    expect(sendEmailRequestSchema.safeParse(payload).success).toBeFalse();
  });

  test("bounds metadata values", () => {
    const payload = {
      ...createOtpPayload(),
      metadata: {
        requestId: "x".repeat(121),
      },
    };

    expect(sendEmailRequestSchema.safeParse(payload).success).toBeFalse();
  });
});
