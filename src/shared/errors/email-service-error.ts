export type EmailServiceErrorCode =
  | "EMAIL_SENDER_NOT_VERIFIED"
  | "EMAIL_SENDER_DOMAIN_UNAVAILABLE"
  | "EMAIL_RATE_LIMITED"
  | "EMAIL_TOO_MANY_RECIPIENTS"
  | "EMAIL_SEND_FAILED";

export interface EmailServiceError {
  code: EmailServiceErrorCode;
  message: string;
}

const errorCodeMap: Record<string, EmailServiceError> = {
  E_SENDER_NOT_VERIFIED: {
    code: "EMAIL_SENDER_NOT_VERIFIED",
    message: "The configured sender is not verified",
  },
  E_SENDER_DOMAIN_NOT_AVAILABLE: {
    code: "EMAIL_SENDER_DOMAIN_UNAVAILABLE",
    message: "The configured sender domain is unavailable",
  },
  E_RATE_LIMIT_EXCEEDED: {
    code: "EMAIL_RATE_LIMITED",
    message: "The email service rate limit was exceeded",
  },
  E_TOO_MANY_RECIPIENTS: {
    code: "EMAIL_TOO_MANY_RECIPIENTS",
    message: "The email has too many recipients",
  },
};

function readProviderCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = error.code;

    if (typeof code === "string") {
      return code;
    }
  }

  if (error instanceof Error) {
    return Object.keys(errorCodeMap).find((code) => error.message.includes(code));
  }

  return undefined;
}

export function toEmailServiceError(error: unknown): EmailServiceError {
  const providerCode = readProviderCode(error);

  if (providerCode && errorCodeMap[providerCode]) {
    return errorCodeMap[providerCode];
  }

  return {
    code: "EMAIL_SEND_FAILED",
    message: "Failed to send email",
  };
}
