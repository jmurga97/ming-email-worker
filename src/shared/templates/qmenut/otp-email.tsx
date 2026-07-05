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

import { emailStyles } from "../ming/styles";

import type { RenderedEmail, TemplateBranding } from "../types";

export const qmenutOtpEmailDataSchema = z
  .object({
    otp: z.string().trim().min(1).max(32),
    expiresIn: z.string().trim().min(1).max(100),
  })
  .strict();

export interface QmenutOtpEmailProps {
  branding: TemplateBranding;
  expiresIn: z.infer<typeof qmenutOtpEmailDataSchema>["expiresIn"];
  otp: z.infer<typeof qmenutOtpEmailDataSchema>["otp"];
}

const copy = {
  en: {
    preview: "Your QMenut access code",
    heading: "Access code",
    intro: "Use this code to access your QMenut account. Do not share it with anyone.",
    codeLabel: "One-time password",
    expires: "Expires in",
    note: "If you did not request this code, you can ignore this email.",
    footer: "QMenut security",
  },
  es: {
    preview: "Tu codigo de acceso a QMenut",
    heading: "Codigo de acceso",
    intro: "Usa este codigo para acceder a tu cuenta de QMenut. No lo compartas con nadie.",
    codeLabel: "Codigo de un solo uso",
    expires: "Expira en",
    note: "Si no has solicitado este codigo, puedes ignorar este email.",
    footer: "Seguridad de QMenut",
  },
} as const;

export function QmenutOtpEmail({ branding, expiresIn, otp }: QmenutOtpEmailProps) {
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
          <Text style={emailStyles.footer}>
            [ {branding.name} ] {content.footer}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export async function renderQmenutOtpEmail(props: QmenutOtpEmailProps): Promise<RenderedEmail> {
  const email = <QmenutOtpEmail {...props} />;
  const [html, text] = await Promise.all([render(email), render(email, { plainText: true })]);

  return { html, text };
}

QmenutOtpEmail.PreviewProps = {
  branding: {
    name: "QMenut",
    locale: "es",
  },
  expiresIn: "5 minutos",
  otp: "123456",
} satisfies QmenutOtpEmailProps;

export default QmenutOtpEmail;
