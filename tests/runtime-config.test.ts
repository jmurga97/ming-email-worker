import { describe, expect, test } from "bun:test";

import { parseRuntimeConfig } from "@/config/runtime";

import { createBindings, products, senderProfiles } from "./fixtures";

describe("parseRuntimeConfig", () => {
  test("parses valid JSON runtime configuration", () => {
    const config = parseRuntimeConfig(createBindings());

    expect(config.products.roncalphoto?.branding.name).toBe("RoncalPhoto");
    expect(config.senderProfiles["roncalphoto-default"]?.email).toBe("noreply@mail.murga.ing");
  });

  test("rejects malformed JSON", () => {
    const env = createBindings();
    env.PRODUCTS = "{";

    expect(() => parseRuntimeConfig(env)).toThrow("PRODUCTS must contain valid JSON");
  });

  test("rejects sender profiles outside the allowlist", () => {
    const env = createBindings();
    env.ALLOWED_SENDERS = JSON.stringify(["other@example.com"]);

    expect(() => parseRuntimeConfig(env)).toThrow();
  });

  test("requires a fixed recipient when contact-form is enabled", () => {
    const env = createBindings();
    const invalidProducts = {
      ...products,
      roncalphoto: {
        ...products.roncalphoto,
        contactRecipient: undefined,
      },
    };
    env.PRODUCTS = JSON.stringify(invalidProducts);
    env.SENDER_PROFILES = JSON.stringify(senderProfiles);

    expect(() => parseRuntimeConfig(env)).toThrow();
  });
});
