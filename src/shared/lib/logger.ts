export interface EmailLogContext {
  product: string;
  template: string;
}

interface EmailLogEvent extends EmailLogContext {
  errorCode: string;
  outcome: "rejected" | "error";
}

export function logEmailEvent(event: EmailLogEvent): void {
  console.log(
    JSON.stringify({
      event: "transactional_email",
      ...event,
    }),
  );
}
