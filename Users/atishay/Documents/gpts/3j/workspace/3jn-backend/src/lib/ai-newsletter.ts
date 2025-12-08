// backend/src/lib/ai-newsletter.ts
import { NewsletterRequest } from "../types/newsletter";

/**
 * In production, this calls your AI worker (OpenAI / Vertex / internal endpoint)
 * using the prompts we defined earlier.
 */
export async function generateNewsletterHtml(
  input: NewsletterRequest
): Promise<{ subject: string; preview: string; html: string }> {
  // TODO: replace this stub with real AI call
  const subject =
    input.subject ?? `[3JN Fund] ${input.topic || "Platform update"}`;
  const preview = input.message.slice(0, 120);

  const html = `
  <html>
    <body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; padding:24px; border-radius:8px;">
              <tr>
                <td align="left">
                  <h1 style="color:#0C1425; margin-bottom:8px;">3JN Fund</h1>
                  <p style="color:#555; font-size:14px;">${input.topic}</p>
                  <hr style="border:none; border-bottom:1px solid #eee; margin:16px 0;" />
                  <p style="color:#111; font-size:15px; line-height:1.5;">${input.message}</p>
                  ${
                    input.ctaUrl
                      ? `<p style="margin-top:24px;">
                    <a href="${input.ctaUrl}" 
                       style="display:inline-block; padding:10px 18px; background:#F39C12; color:#fff; text-decoration:none; border-radius:4px; font-weight:bold;">
                      ${input.ctaLabel ?? "En savoir plus"}
                    </a>
                  </p>`
                      : ""
                  }
                  <hr style="border:none; border-bottom:1px solid #eee; margin:24px 0;" />
                  <p style="font-size:12px; color:#999;">
                    Vous recevez ce message car vous avez un compte sur 3JN Fund.<br />
                    You are receiving this email because you have an account on 3JN Fund.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;

  return { subject, preview, html };
}
