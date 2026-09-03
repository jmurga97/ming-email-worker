import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import { z } from "zod";

import { additionalFieldsSchema } from "./contact-form-email";
import { emailStyles } from "./styles";

import type { RenderedEmail, TemplateBranding } from "../types";

export const quoteRequestEmailDataSchema = z
  .object({
    email: z.email().trim(),
    fields: additionalFieldsSchema.optional(),
    items: z
      .array(
        z
          .object({
            quantity: z.number().int().positive().max(9999).optional(),
            title: z.string().trim().min(1).max(240),
          })
          .strict(),
      )
      .min(1)
      .max(100),
    name: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(1).max(80).optional(),
  })
  .strict();

export interface QuoteRequestEmailProps extends z.infer<typeof quoteRequestEmailDataSchema> {
  branding: TemplateBranding;
}

const copy = {
  en: {
    email: "Email",
    heading: "New quote request",
    intro: "A new quote request was submitted.",
    items: "Requested items",
    name: "Name",
    phone: "Phone",
    preview: "New quote request",
    quantity: "Quantity",
  },
  es: {
    email: "Email",
    heading: "Nueva solicitud de cotizacion",
    intro: "Se ha recibido una nueva solicitud de cotizacion.",
    items: "Equipos solicitados",
    name: "Nombre",
    phone: "Telefono",
    preview: "Nueva solicitud de cotizacion",
    quantity: "Cantidad",
  },
} as const;

export function QuoteRequestEmail({
  branding,
  email,
  fields,
  items,
  name,
  phone,
}: QuoteRequestEmailProps) {
  const content = copy[branding.locale];

  return (
    <Html lang={branding.locale}>
      <Head />
      <Preview>{content.preview}</Preview>
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          <Section style={emailStyles.card}>
            <Text style={emailStyles.eyebrow}>{branding.name} / Quote</Text>
            <Heading style={emailStyles.heading}>{content.heading}</Heading>
            <Text style={emailStyles.copy}>{content.intro}</Text>
            <Text style={emailStyles.label}>{content.name}</Text>
            <Text style={emailStyles.value}>{name}</Text>
            <Text style={emailStyles.label}>{content.email}</Text>
            <Text style={emailStyles.value}>{email}</Text>
            {phone ? (
              <>
                <Text style={emailStyles.label}>{content.phone}</Text>
                <Text style={emailStyles.value}>{phone}</Text>
              </>
            ) : null}
            {fields?.map((field) => (
              <Section key={`${field.label}:${field.value}`} style={emailStyles.row}>
                <Text style={emailStyles.label}>{field.label}</Text>
                <Text style={emailStyles.value}>{field.value}</Text>
              </Section>
            ))}
            <Hr style={emailStyles.divider} />
            <Text style={emailStyles.label}>{content.items}</Text>
            {items.map((item) => (
              <Section key={`${item.title}:${item.quantity ?? ""}`} style={emailStyles.row}>
                <Text style={emailStyles.value}>{item.title}</Text>
                {item.quantity ? (
                  <Text style={emailStyles.value}>
                    {content.quantity}: {item.quantity}
                  </Text>
                ) : null}
              </Section>
            ))}
          </Section>
          <Text style={emailStyles.footer}>{branding.name}</Text>
        </Container>
      </Body>
    </Html>
  );
}

export async function renderQuoteRequestEmail(
  props: QuoteRequestEmailProps,
): Promise<RenderedEmail> {
  const email = <QuoteRequestEmail {...props} />;
  const [html, text] = await Promise.all([render(email), render(email, { plainText: true })]);
  return { html, text };
}

QuoteRequestEmail.PreviewProps = {
  branding: { locale: "es", name: "ACM Venezuela" },
  email: "persona@example.com",
  items: [{ quantity: 2, title: "Equipo medico" }],
  name: "Persona",
  phone: "+58 000 0000000",
} satisfies QuoteRequestEmailProps;

export default QuoteRequestEmail;
