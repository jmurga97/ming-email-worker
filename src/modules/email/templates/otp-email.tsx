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

import { emailStyles } from "./styles";

import type { RenderedEmail, TemplateBranding } from "./types";

interface OtpEmailProps {
  branding: TemplateBranding;
  expiresIn: string;
  otp: string;
}

const copy = {
  en: {
    preview: "Your access code",
    heading: "Access code",
    intro: "Use this code to continue. Do not share it with anyone.",
    expires: "Expires in",
    note: "If you did not request this code, you can ignore this email.",
  },
  es: {
    preview: "Tu codigo de acceso",
    heading: "Codigo de acceso",
    intro: "Usa este codigo para continuar. No lo compartas con nadie.",
    expires: "Expira en",
    note: "Si no solicitaste este codigo, puedes ignorar este email.",
  },
} as const;

export function OtpEmail({ branding, expiresIn, otp }: OtpEmailProps) {
  const content = copy[branding.locale];

  return (
    <Html lang={branding.locale}>
      <Head />
      <Preview>
        {content.preview}: {otp}
      </Preview>
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          <Section style={emailStyles.card}>
            <Text style={emailStyles.eyebrow}>{branding.name} / Auth</Text>
            <Heading style={emailStyles.heading}>{content.heading}</Heading>
            <Text style={emailStyles.copy}>{content.intro}</Text>
            <Section style={emailStyles.codeBox}>
              <Text style={emailStyles.code}>{otp}</Text>
            </Section>
            <Text style={emailStyles.label}>{content.expires}</Text>
            <Text style={emailStyles.accentValue}>{expiresIn}</Text>
            <Hr style={emailStyles.divider} />
            <Text style={emailStyles.value}>{content.note}</Text>
          </Section>
          <Text style={emailStyles.footer}>{branding.name}</Text>
        </Container>
      </Body>
    </Html>
  );
}

export async function renderOtpEmail(props: OtpEmailProps): Promise<RenderedEmail> {
  const email = <OtpEmail {...props} />;
  const [html, text] = await Promise.all([render(email), render(email, { plainText: true })]);

  return { html, text };
}
