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
import type { CSSProperties } from "react";

/**
 * Resumen quincenal de QMenut. El contrato acepta solo códigos de métricas/insights y
 * valores estructurados: las etiquetas y el formato los decide este template, nunca el
 * emisor. Sin HTML libre ni asunto configurable.
 */

export const analyticsDigestMetricCodeSchema = z.enum([
  "contact_actions",
  "dish_opens_per_load",
  "estimated_reward_cost",
  "loads",
  "loyalty_visits",
  "pwa_installs",
  "promotion_opens",
  "qr_load_share",
  "repeat_visit_rate",
  "rewards_validated",
  "standalone_share",
]);

export const analyticsDigestMetricFormatSchema = z.enum(["count", "currency", "percent"]);

export const analyticsDigestEmailDataSchema = z
  .object({
    restaurantName: z.string().trim().min(1).max(120),
    periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    metrics: z
      .array(
        z
          .object({
            code: analyticsDigestMetricCodeSchema,
            format: analyticsDigestMetricFormatSchema,
            value: z.number(),
            previousValue: z.number().nullable(),
          })
          .strict(),
      )
      .min(1)
      .max(16),
    insights: z
      .array(
        z
          .object({
            tone: z.enum(["attention", "positive"]),
            text: z.string().trim().min(1).max(280),
          })
          .strict(),
      )
      .max(6),
  })
  .strict();

const metricLabels: Record<z.infer<typeof analyticsDigestMetricCodeSchema>, string> = {
  contact_actions: "Acciones de contacto",
  dish_opens_per_load: "Aperturas de plato por carga",
  estimated_reward_cost: "Coste estimado de premios",
  loads: "Cargas de la carta",
  loyalty_visits: "Visitas fidelizadas",
  pwa_installs: "Instalaciones de la app",
  promotion_opens: "Aperturas de promociones",
  qr_load_share: "Cargas desde enlace QR",
  repeat_visit_rate: "Tasa de repetición",
  rewards_validated: "Premios validados",
  standalone_share: "Uso en app instalada",
};

function formatValue(
  value: number,
  format: z.infer<typeof analyticsDigestMetricFormatSchema>,
): string {
  switch (format) {
    case "count":
      return new Intl.NumberFormat("es-ES").format(Math.round(value));
    case "currency":
      return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
        value / 100,
      );
    case "percent":
      return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(value)}%`;
  }
}

function deltaIndicator(
  metric: z.infer<typeof analyticsDigestEmailDataSchema>["metrics"][number],
): string {
  if (metric.previousValue === null || metric.previousValue === metric.value) {
    return "";
  }

  return metric.value > metric.previousValue ? " ▲" : " ▼";
}

function previousLabel(
  previousValue: number | null,
  format: z.infer<typeof analyticsDigestMetricFormatSchema>,
): string {
  if (previousValue === null) {
    return "Sin dato previo";
  }

  return `Quincena anterior: ${formatValue(previousValue, format)}`;
}

const metricRowStyle: CSSProperties = {
  borderBottom: "1px solid #222222",
  padding: "12px 0",
};

const metricLabelStyle: CSSProperties = {
  ...emailStyles.label,
  margin: "0 0 4px",
};

const metricValueStyle: CSSProperties = {
  ...emailStyles.value,
  fontSize: "15px",
};

const insightStyle = (tone: "attention" | "positive"): CSSProperties => ({
  ...emailStyles.value,
  borderLeft: `2px solid ${tone === "positive" ? "#3fb26f" : emailStyles.accentValue.color}`,
  padding: "8px 0 8px 12px",
});

export interface QmenutAnalyticsDigestEmailProps {
  branding: TemplateBranding;
  data: z.infer<typeof analyticsDigestEmailDataSchema>;
}

export function QmenutAnalyticsDigestEmail({ branding, data }: QmenutAnalyticsDigestEmailProps) {
  const periodLabel = `${data.periodStart} → ${data.periodEnd}`;

  return (
    <Html lang="es">
      <Head />
      <Preview>Tu resumen quincenal de QMenut</Preview>
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          <Section style={emailStyles.card}>
            <Text style={emailStyles.eyebrow}>{branding.name} / Resumen quincenal</Text>
            <Heading style={emailStyles.heading}>{data.restaurantName}</Heading>
            <Text style={emailStyles.copy}>
              Datos del periodo {periodLabel}, comparados con la quincena anterior.
            </Text>
            {data.metrics.map((metric) => (
              <Section key={metric.code} style={metricRowStyle}>
                <Text style={metricLabelStyle}>{metricLabels[metric.code]}</Text>
                <Text style={{ ...metricValueStyle, whiteSpace: undefined }}>
                  {formatValue(metric.value, metric.format)}
                  {deltaIndicator(metric)}
                </Text>
                <Text style={{ ...emailStyles.label, margin: "4px 0 0" }}>
                  {previousLabel(metric.previousValue, metric.format)}
                </Text>
              </Section>
            ))}
            {data.insights.length > 0 ? (
              <>
                <Hr style={emailStyles.divider} />
                <Text style={emailStyles.label}>Lo que vemos</Text>
                {data.insights.map((insight) => (
                  <Text key={insight.text} style={insightStyle(insight.tone)}>
                    {insight.text}
                  </Text>
                ))}
              </>
            ) : null}
          </Section>
          <Text style={emailStyles.footer}>
            [ {branding.name} ] Visitas digitales de la carta, no personas únicas
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export async function renderQmenutAnalyticsDigestEmail(
  props: QmenutAnalyticsDigestEmailProps,
): Promise<RenderedEmail> {
  const email = <QmenutAnalyticsDigestEmail {...props} />;
  const [html, text] = await Promise.all([render(email), render(email, { plainText: true })]);

  return { html, text };
}

QmenutAnalyticsDigestEmail.PreviewProps = {
  branding: {
    name: "QMenut",
    locale: "es",
  },
  data: {
    insights: [
      {
        text: "Las aperturas de platos por carga subieron 3 p.p. respecto a la quincena anterior.",
        tone: "positive",
      },
    ],
    metrics: [
      { code: "loads", format: "count", previousValue: 812, value: 1043 },
      { code: "dish_opens_per_load", format: "percent", previousValue: 41.2, value: 44.7 },
      { code: "estimated_reward_cost", format: "currency", previousValue: null, value: 12540 },
    ],
    periodEnd: "2026-08-24",
    periodStart: "2026-08-10",
    restaurantName: "Taberna La Plaza",
  },
} satisfies QmenutAnalyticsDigestEmailProps;

export default QmenutAnalyticsDigestEmail;
