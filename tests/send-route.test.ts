import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

import { createApp } from "@/app/create-app";

import { createBindings, createContactPayload, createOtpPayload } from "./fixtures";

import type { CapturedEmail } from "./fixtures";

const app = createApp();
const originalConsoleLog = console.log;
let captured: CapturedEmail[];

beforeEach(() => {
  captured = [];
  console.log = mock(() => undefined);
});

afterEach(() => {
  console.log = originalConsoleLog;
});

async function postSend(payload: unknown, env = createBindings()) {
  return app.request(
    "/send",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    env,
  );
}

describe("POST /send", () => {
  test("sends OTP through the configured profile", async () => {
    const env = createBindings((message) => {
      captured.push(message);
      return Promise.resolve({ messageId: "otp-message" });
    });

    const response = await postSend(createOtpPayload(), env);

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body).toEqual({
      success: true,
      data: { messageId: "otp-message" },
    });
    expect(captured[0]?.to).toBe("admin@example.com");
    expect(captured[0]?.from.email).toBe("noreply@mail.murga.ing");
    expect(captured[0]?.replyTo).toBeUndefined();
  });

  test("sends contact email only to the configured recipient", async () => {
    const env = createBindings((message) => {
      captured.push(message);
      return Promise.resolve({ messageId: "contact-message" });
    });

    const response = await postSend(createContactPayload(), env);

    expect(response.status).toBe(200);
    expect(captured[0]?.to).toBe("studio@example.com");
    expect(captured[0]?.replyTo?.email).toBe("person@example.com");
  });

  test("returns a validation envelope for malformed payloads", async () => {
    const response = await postSend({
      ...createOtpPayload(),
      to: "not-an-email",
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      success: false,
      error: { code: "INVALID_BODY" },
    });
  });

  test("returns a policy rejection envelope", async () => {
    const response = await postSend({
      ...createOtpPayload(),
      product: "unknown",
    });

    expect(response.status).toBe(403);
    const body = await response.json();

    expect(body).toEqual({
      success: false,
      error: {
        code: "PRODUCT_NOT_ALLOWED",
        message: "Product is not configured",
      },
    });
  });

  test("maps provider rate limits to 429", async () => {
    const env = createBindings(() => {
      const error = new Error("Rate limit exceeded");
      Object.assign(error, { code: "E_RATE_LIMIT_EXCEEDED" });

      return Promise.reject(error);
    });

    const response = await postSend(createOtpPayload(), env);

    expect(response.status).toBe(429);
    expect(await response.json()).toMatchObject({
      success: false,
      error: { code: "EMAIL_RATE_LIMITED" },
    });
  });

  test("does not expose any other route", async () => {
    const response = await app.request("/", {}, createBindings());

    expect(response.status).toBe(404);
  });
});
