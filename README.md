# ming-email-worker

Internal multi-product transactional email service for Cloudflare Workers.

The worker exposes one HTTP contract to trusted backend consumers through Cloudflare service
bindings:

```text
Product backend -> service binding -> ming-email-worker -> Cloudflare Email Service
```

It is not a browser-facing API. `workers_dev` is disabled, no Cloudflare route is configured, and
the worker does not include CORS middleware.

## Responsibilities

- validate the internal request contract with Zod;
- enforce product, template, sender-profile, and recipient policy;
- render controlled React Email templates to HTML and plain text;
- send through the Cloudflare `send_email` binding;
- return stable JSON envelopes and provider error codes;
- log delivery outcomes without logging email addresses or message content.

The product backend remains responsible for browser CORS, Turnstile, rate limiting, honeypots,
payload limits, and business validation.

## API

The only route is:

```text
POST /send
```

Every response uses one of these envelopes:

```json
{
  "success": true,
  "data": {
    "messageId": "provider-message-id"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "STABLE_ERROR_CODE",
    "message": "Safe error message"
  }
}
```

Unknown routes return `404`. The legacy `POST /send/otp` route does not exist.

### OTP

OTP recipients may vary, but the sender, subject, branding, and content structure are controlled
by server configuration and the registered template.

```json
{
  "product": "roncalphoto",
  "template": "otp",
  "fromProfile": "roncalphoto-default",
  "to": "admin@example.com",
  "data": {
    "otp": "123456",
    "expiresIn": "5 minutos"
  },
  "metadata": {
    "requestId": "request-123",
    "source": "auth"
  }
}
```

### Contact form

The recipient is always read from product configuration. A caller cannot provide or override
`to`, `subject`, `from`, HTML, or plain text. `replyTo` must match `data.email`.

```json
{
  "product": "roncalphoto",
  "template": "contact-form",
  "fromProfile": "roncalphoto-default",
  "replyTo": "person@example.com",
  "data": {
    "name": "Person",
    "email": "person@example.com",
    "message": "I would like more information."
  },
  "metadata": {
    "requestId": "request-456",
    "source": "contact-form"
  }
}
```

## Runtime configuration

Configuration is supplied through Wrangler variables containing JSON and parsed with Zod on every
request. Invalid or internally inconsistent configuration prevents delivery.

| Variable          | Purpose                                                                        |
| ----------------- | ------------------------------------------------------------------------------ |
| `ALLOWED_SENDERS` | JSON array of addresses the application permits                                |
| `SENDER_PROFILES` | JSON object mapping profile IDs to verified addresses and display names        |
| `PRODUCTS`        | JSON object containing branding, permissions, subjects, and contact recipients |
| `NODE_ENV`        | `development`, `test`, or `production`                                         |
| `LOG_LEVEL`       | `debug`, `info`, `warn`, or `error`                                            |
| `SEND_EMAIL`      | Cloudflare Email Service binding                                               |

Example:

```json
{
  "ALLOWED_SENDERS": ["noreply@mail.murga.ing"],
  "SENDER_PROFILES": {
    "roncalphoto-default": {
      "email": "noreply@mail.murga.ing",
      "name": "RoncalPhoto"
    }
  },
  "PRODUCTS": {
    "roncalphoto": {
      "branding": {
        "name": "RoncalPhoto",
        "locale": "es"
      },
      "allowedTemplates": ["otp", "contact-form"],
      "allowedFromProfiles": ["roncalphoto-default"],
      "subjects": {
        "otp": "Tu codigo de acceso a RoncalPhoto",
        "contactForm": "Nuevo contacto desde RoncalPhoto"
      },
      "contactRecipient": "studio@example.com"
    }
  }
}
```

Each profile address must also appear in `ALLOWED_SENDERS`. Each allowed profile referenced by a
product must exist. A product enabling `contact-form` must configure `contactRecipient`.

The same addresses must be listed in `allowed_sender_addresses` for the `SEND_EMAIL` binding in
`wrangler.toml`. That binding restriction is a second enforcement layer, not a replacement for
application policy.

## Local development

Requirements:

- Bun 1.3.6 or compatible;
- a Cloudflare account with Email Service access;
- a verified sender domain;
- Wrangler credentials when using the remote email binding.

Install dependencies and create local variables:

```bash
bun install
cp .dev.vars.example .dev.vars
bun run dev
```

The checked-in `.dev.vars.example` contains non-secret sample configuration. Do not commit
`.dev.vars`.

The development command uses the remote `SEND_EMAIL` binding. Sending requires the configured
domain and address to be onboarded in Cloudflare Email Service with the required SPF, DKIM, DMARC,
and bounce configuration.

## Service-binding consumer

Configure the consuming worker:

```toml
[[services]]
binding = "EMAIL_WORKER"
service = "ming-email-worker"
```

Call the internal service:

```ts
const response = await env.EMAIL_WORKER.fetch("https://email-worker.internal/send", {
  method: "POST",
  headers: {
    "content-type": "application/json",
  },
  body: JSON.stringify(payload),
});
```

Infrastructure topology is the authentication boundary in this version. Do not expose the worker
with a public route. If public HTTP access is introduced later, add explicit consumer
authentication and abuse controls before enabling it.

## Error codes

| Code                              | HTTP status | Meaning                                  |
| --------------------------------- | ----------- | ---------------------------------------- |
| `INVALID_BODY`                    | `400`       | Request validation failed                |
| `INVALID_JSON`                    | `400`       | Body is not valid JSON                   |
| `PRODUCT_NOT_ALLOWED`             | `403`       | Product is not configured                |
| `TEMPLATE_NOT_ALLOWED`            | `403`       | Product cannot use the template          |
| `SENDER_PROFILE_NOT_ALLOWED`      | `403`       | Product cannot use the profile           |
| `SENDER_NOT_ALLOWED`              | `403`       | Profile address is outside the allowlist |
| `INVALID_RUNTIME_CONFIG`          | `500`       | Runtime policy configuration is invalid  |
| `EMAIL_SENDER_NOT_VERIFIED`       | `502`       | Cloudflare rejected an unverified sender |
| `EMAIL_SENDER_DOMAIN_UNAVAILABLE` | `502`       | Sender domain is unavailable             |
| `EMAIL_RATE_LIMITED`              | `429`       | Provider rate limit was exceeded         |
| `EMAIL_TOO_MANY_RECIPIENTS`       | `502`       | Provider recipient limit was exceeded    |
| `EMAIL_SEND_FAILED`               | `502`       | Unknown provider delivery failure        |

## Logging

Structured logs include:

- product;
- template;
- optional request ID;
- outcome;
- message ID on success;
- stable error code on failure.

Logs never include OTP values, contact messages, recipient addresses, or reply-to addresses.

## Commands

```bash
bun run dev
bun run email:dev
bun run build
bun run deploy
bun run cf-typegen
bun run check
bun test
bun run lint
bun run lint:fix
bun run format
```

`bun run email:dev` opens the React Email preview using the same registered components that the
worker renders in production. Templates, their Zod data schemas, and their HTML/text renderers are
owned and deployed by this repository; product repositories consume only `POST /send`.

`bun run deploy` does not provision verified domains or consumer service bindings. Configure those
resources before production deployment.

## Project structure

```text
src/
├── app/                    # Hono bootstrap and top-level route registration
├── config/                 # Bindings, runtime policy, handlers, and status codes
├── modules/email/
│   ├── routes/             # POST /send
│   ├── schemas/            # Discriminated request contract
│   ├── services/           # Policy resolution and delivery
│   └── templates/          # Closed React Email registry
├── shared/                 # Errors, response helpers, logging, and OpenAPI helpers
└── index.ts                # Cloudflare Worker entrypoint
tests/                      # Bun unit and route tests
```
