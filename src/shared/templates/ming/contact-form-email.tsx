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

import { emailStyles } from "./styles";

import type { RenderedEmail, TemplateBranding } from "../types";

export const contactFormEmailDataSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.email().trim(),
    message: z.string().trim().min(1).max(5000),
  })
  .strict();

export interface ContactFormEmailProps {
  branding: TemplateBranding;
  email: z.infer<typeof contactFormEmailDataSchema>["email"];
  message: z.infer<typeof contactFormEmailDataSchema>["message"];
  name: z.infer<typeof contactFormEmailDataSchema>["name"];
}

const copy = {
  en: {
    preview: "New contact form submission",
    heading: "New contact",
    intro: "A new message was submitted through the contact form.",
    name: "Name",
    email: "Email",
    message: "Message",
  },
  es: {
    preview: "Nuevo mensaje del formulario de contacto",
    heading: "Nuevo contacto",
    intro: "Se ha recibido un nuevo mensaje desde el formulario de contacto.",
    name: "Nombre",
    email: "Email",
    message: "Mensaje",
  },
} as const;

export function ContactFormEmail({ branding, email, message, name }: ContactFormEmailProps) {
  const content = copy[branding.locale];

  return (
    <Html lang={branding.locale}>
      <Head />
      <Preview>{content.preview}</Preview>
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          <Section style={emailStyles.card}>
            <Text style={emailStyles.eyebrow}>{branding.name} / Contact</Text>
            <Heading style={emailStyles.heading}>{content.heading}</Heading>
            <Text style={emailStyles.copy}>{content.intro}</Text>
            <Text style={emailStyles.label}>{content.name}</Text>
            <Text style={emailStyles.value}>{name}</Text>
            <Text style={emailStyles.label}>{content.email}</Text>
            <Text style={emailStyles.value}>{email}</Text>
            <Hr style={emailStyles.divider} />
            <Text style={emailStyles.label}>{content.message}</Text>
            <Text style={emailStyles.value}>{message}</Text>
          </Section>
          <Text style={emailStyles.footer}>{branding.name}</Text>
        </Container>
      </Body>
    </Html>
  );
}

export async function renderContactFormEmail(props: ContactFormEmailProps): Promise<RenderedEmail> {
  const email = <ContactFormEmail {...props} />;
  const [html, text] = await Promise.all([render(email), render(email, { plainText: true })]);

  return { html, text };
}

ContactFormEmail.PreviewProps = {
  branding: {
    name: "RoncalPhoto",
    locale: "es",
  },
  email: "persona@example.com",
  message: "Me gustaria recibir informacion sobre una sesion.",
  name: "Persona",
} satisfies ContactFormEmailProps;

export default ContactFormEmail;
