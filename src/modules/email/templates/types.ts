import type { ProductConfig } from "@/config/runtime";

export interface RenderedEmail {
  html: string;
  text: string;
}

export type TemplateBranding = ProductConfig["branding"];
