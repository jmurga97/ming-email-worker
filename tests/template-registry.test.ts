import { describe, expect, test } from "bun:test";

import { parseRuntimeConfig } from "@/config/runtime";
import { renderRegisteredTemplate } from "@/modules/email/templates/registry";

import { createBindings, createContactPayload, createOtpPayload } from "./fixtures";

describe("template registry", () => {
  test("renders controlled OTP HTML and plain text", async () => {
    const config = parseRuntimeConfig(createBindings());
    const product = config.products.roncalphoto;

    expect(product).toBeDefined();

    const rendered = await renderRegisteredTemplate(createOtpPayload(), product);

    expect(rendered.html).toContain("RoncalPhoto");
    expect(rendered.html).toContain("123456");
    expect(rendered.text).toContain("123456");
  });

  test("renders contact-form content", async () => {
    const config = parseRuntimeConfig(createBindings());
    const product = config.products.roncalphoto;

    expect(product).toBeDefined();

    const rendered = await renderRegisteredTemplate(createContactPayload(), product);

    expect(rendered.html).toContain("Person");
    expect(rendered.text).toContain("I would like more information.");
  });
});
