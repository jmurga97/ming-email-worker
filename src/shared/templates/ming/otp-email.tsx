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

export const otpEmailDataSchema = z
  .object({
    otp: z.string().trim().min(1).max(32),
    expiresIn: z.string().trim().min(1).max(100),
  })
  .strict();

export interface OtpEmailProps {
  branding: TemplateBranding;
  expiresIn: z.infer<typeof otpEmailDataSchema>["expiresIn"];
  otp: z.infer<typeof otpEmailDataSchema>["otp"];
}

const copy = {
  en: {
    preview: "Your access code",
    heading: "Access code",
    intro: "Use this code to continue. Do not share it with anyone.",
    codeLabel: "One-time password",
    expires: "Expires in",
    note: "If you did not request this code, you can ignore this email.",
  },
  es: {
    preview: "Tu codigo de acceso",
    heading: "Codigo de acceso",
    intro: "Usa este codigo para continuar. No lo compartas con nadie.",
    codeLabel: "Codigo de un solo uso",
    expires: "Expira en",
    note: "Si no has solicitado este codigo, puedes ignorar este email.",
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
              <Text style={emailStyles.codeLabel}>{content.codeLabel}</Text>
              <Text style={emailStyles.code}>{otp}</Text>
            </Section>
            <Section style={emailStyles.row}>
              <Text style={emailStyles.label}>{content.expires}</Text>
              <Text style={emailStyles.accentValue}>{expiresIn}</Text>
            </Section>
            <Hr style={emailStyles.divider} />
            <Text style={emailStyles.value}>{content.note}</Text>
          </Section>
          <Text style={emailStyles.footer}>[ {branding.name} ] Security</Text>
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

OtpEmail.PreviewProps = {
  branding: {
    name: "RoncalPhoto",
    locale: "es",
  },
  expiresIn: "5 minutos",
  otp: "123456",
} satisfies OtpEmailProps;

export default OtpEmail;
