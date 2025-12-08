// backend/src/lib/email.ts
export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: SendEmailPayload): Promise<void> {
  // TODO: integrate with your provider (SendGrid, MailerSend, Mailjet, SES, etc.)
  console.log("Sending email", payload.subject, "to", payload.to);
}
