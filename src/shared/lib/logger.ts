interface EmailLogEvent {
  errorCode?: string;
  messageId?: string;
  outcome: "success" | "rejected" | "error";
  product: string;
  requestId?: string;
  template: string;
}

export function logEmailEvent(event: EmailLogEvent): void {
  console.log(
    JSON.stringify({
      event: "transactional_email",
      ...event,
    }),
  );
}
