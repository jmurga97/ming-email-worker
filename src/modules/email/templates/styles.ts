import type { CSSProperties } from "react";

const palette = {
  background: "#f4f4f0",
  surface: "#ffffff",
  border: "#d9d9d2",
  text: "#161616",
  muted: "#686868",
  accent: "#b42318",
} as const;

export const emailStyles = {
  body: {
    margin: "0",
    backgroundColor: palette.background,
    color: palette.text,
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  card: {
    border: `1px solid ${palette.border}`,
    borderRadius: "12px",
    backgroundColor: palette.surface,
    padding: "28px",
  },
  eyebrow: {
    margin: "0 0 28px",
    color: palette.muted,
    fontSize: "12px",
    letterSpacing: "0.08em",
    lineHeight: "18px",
    textTransform: "uppercase",
  },
  heading: {
    margin: "0 0 12px",
    color: palette.text,
    fontSize: "26px",
    fontWeight: 600,
    lineHeight: "32px",
  },
  copy: {
    margin: "0 0 24px",
    color: palette.muted,
    fontSize: "15px",
    lineHeight: "23px",
  },
  codeBox: {
    margin: "0 0 24px",
    border: `1px solid ${palette.border}`,
    borderRadius: "8px",
    backgroundColor: palette.background,
    padding: "20px 16px",
    textAlign: "center",
  },
  code: {
    margin: "0",
    color: palette.text,
    fontFamily: "SFMono-Regular, Consolas, monospace",
    fontSize: "40px",
    fontWeight: 700,
    letterSpacing: "0.14em",
    lineHeight: "48px",
  },
  label: {
    margin: "20px 0 6px",
    color: palette.muted,
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  value: {
    margin: "0",
    color: palette.text,
    fontSize: "15px",
    lineHeight: "23px",
    whiteSpace: "pre-wrap",
  },
  accentValue: {
    margin: "0",
    color: palette.accent,
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: "21px",
  },
  divider: {
    margin: "24px 0",
    borderColor: palette.border,
  },
  footer: {
    margin: "18px 0 0",
    color: palette.muted,
    fontSize: "12px",
    lineHeight: "18px",
    textAlign: "center",
  },
} satisfies Record<string, CSSProperties>;
