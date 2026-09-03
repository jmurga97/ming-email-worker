import {
  Body,
  Button,
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

export const userInviteEmailDataSchema = z
  .object({
    userName: z.string().trim().min(1).max(120),
    restaurantName: z.string().trim().min(1).max(120),
    panelUrl: z.url(),
  })
  .strict();

export interface UserInviteEmailProps {
  branding: TemplateBranding;
  data: z.infer<typeof userInviteEmailDataSchema>;
}

const copy = {
  en: {
    access: "Team access",
    button: "Open QMenut panel",
    footer: "QMenut team access",
    heading: "You have access to QMenut",
    invited: (restaurantName: string) =>
      `You have been added to ${restaurantName}'s restaurant panel.`,
    note: "To sign in, request a one-time code with your email. QMenut does not use a password for this access.",
    preview: "Your QMenut panel access",
    welcome: (userName: string) => `Hello ${userName},`,
  },
  es: {
    access: "Acceso de equipo",
    button: "Abrir panel de QMenut",
    footer: "Acceso de equipo QMenut",
    heading: "Ya tienes acceso a QMenut",
    invited: (restaurantName: string) =>
      `Te han añadido al panel del restaurante ${restaurantName}.`,
    note: "Para entrar, solicita un código de un solo uso con tu correo. En QMenut no necesitas contraseña.",
    preview: "Tu acceso al panel de QMenut",
    welcome: (userName: string) => `Hola ${userName},`,
  },
} as const;

const buttonStyle = {
  backgroundColor: "#d71921",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: 700,
  padding: "12px 18px",
  textDecoration: "none",
} as const;

export function UserInviteEmail({ branding, data }: UserInviteEmailProps) {
  const content = copy[branding.locale];

  return (
    <Html lang={branding.locale}>
      <Head />
      <Preview>{content.preview}</Preview>
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          <Section style={emailStyles.card}>
            <Text style={emailStyles.eyebrow}>
              {branding.name} / {content.access}
            </Text>
            <Heading style={emailStyles.heading}>{content.heading}</Heading>
            <Text style={emailStyles.copy}>{content.welcome(data.userName)}</Text>
            <Text style={emailStyles.copy}>{content.invited(data.restaurantName)}</Text>
            <Button href={data.panelUrl} style={buttonStyle}>
              {content.button}
            </Button>
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

export async function renderUserInviteEmail(props: UserInviteEmailProps): Promise<RenderedEmail> {
  const email = <UserInviteEmail {...props} />;
  const [html, text] = await Promise.all([render(email), render(email, { plainText: true })]);

  return { html, text };
}

UserInviteEmail.PreviewProps = {
  branding: { name: "QMenut", locale: "es" },
  data: {
    panelUrl: "https://admin.qmenut.app/login",
    restaurantName: "Casa QMenut",
    userName: "María",
  },
} satisfies UserInviteEmailProps;

export default UserInviteEmail;
