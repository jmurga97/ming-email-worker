import { describe, expect, test } from "bun:test";

import { parseRuntimeConfig } from "@/config/runtime";
import { resolveEmailPolicy } from "@/modules/email/services/email-policy.service";
import { PolicyError } from "@/shared/errors/policy-error";

import { createBindings, createContactPayload, createOtpPayload } from "./fixtures";

describe("resolveEmailPolicy", () => {
  test("keeps the OTP recipient variable", () => {
    const config = parseRuntimeConfig(createBindings());
    const policy = resolveEmailPolicy(config, createOtpPayload());

    expect(policy.to).toBe("admin@example.com");
    expect(policy.subject).toBe("Tu codigo de acceso a RoncalPhoto");
    expect(policy.replyTo).toBeUndefined();
  });

  test("uses the configured contact recipient and caller email as replyTo", () => {
    const config = parseRuntimeConfig(createBindings());
    const policy = resolveEmailPolicy(config, createContactPayload());

    expect(policy.to).toBe("studio@example.com");
    expect(policy.replyTo).toBe("person@example.com");
  });

  test("rejects unknown products", () => {
    const config = parseRuntimeConfig(createBindings());
    const payload = {
      ...createOtpPayload(),
      product: "unknown",
    };

    expect(() => resolveEmailPolicy(config, payload)).toThrow(PolicyError);
  });

  test("rejects sender profiles not allowed for a product", () => {
    const config = parseRuntimeConfig(createBindings());
    const payload = {
      ...createOtpPayload(),
      fromProfile: "unknown-profile",
    };

    expect(() => resolveEmailPolicy(config, payload)).toThrow(
      "Sender profile is not allowed for this product",
    );
  });
});
