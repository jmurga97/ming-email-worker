# AGENTS.md

## Project

Standalone internal transactional email worker built with Bun, Hono, Zod, React Email, and
Cloudflare Workers.

## Rules

- Use Bun exclusively.
- Keep TypeScript strict and avoid `any`.
- Run `bun run lint`, `bun run check`, `bun test`, and `bun run build` before merging.
- Keep `POST /send` as the only public contract.
- Never accept arbitrary subject, sender, recipient policy, HTML, or plain text from consumers.
- Add new email capabilities as closed registered templates with dedicated Zod data schemas.
- Keep browser CORS, CAPTCHA, rate limiting, honeypots, and public validation in product backends.
- Do not log OTP values, message bodies, or email addresses.
- Preserve module boundaries enforced by ESLint.
- Use Prettier for formatting and keep code readable over abstract.

## Architecture

```text
Product backend -> Cloudflare service binding -> ming-email-worker -> Email Service
```

The worker relies on private service-binding topology. Do not add a public route without adding
explicit consumer authentication and abuse protection.
