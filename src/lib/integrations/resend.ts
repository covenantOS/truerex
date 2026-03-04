/**
 * Resend API client for email
 * Supports custom domains per business for branded sending.
 */

const RESEND_API_BASE = "https://api.resend.com";

interface EmailOptions {
  from: string; // "TrueRex Local <noreply@truerex.com>" or custom domain
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

interface EmailResult {
  id: string;
}

async function resendFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(`${RESEND_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error ${res.status}: ${err}`);
  }

  return res;
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const res = await resendFetch("/emails", {
    method: "POST",
    body: JSON.stringify(options),
  });

  return res.json();
}

/**
 * Send a review request email
 */
export async function sendReviewRequestEmail(params: {
  to: string;
  customerName: string;
  businessName: string;
  fromDomain?: string;
  reviewLink: string;
}) {
  const from = params.fromDomain
    ? `${params.businessName} <reviews@${params.fromDomain}>`
    : `${params.businessName} via TrueRex Local <reviews@truerex.com>`;

  return sendEmail({
    from,
    to: params.to,
    subject: `How was your experience with ${params.businessName}?`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="font-size: 20px; margin-bottom: 16px;">Hey ${params.customerName}!</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #333;">
          Thanks for choosing ${params.businessName}. We'd love to hear how everything went.
        </p>
        <p style="font-size: 16px; line-height: 1.5; color: #333;">
          It only takes 30 seconds and helps us a ton:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${params.reviewLink}" style="background-color: #2563eb; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
            Leave a Quick Review
          </a>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 24px;">
          — The ${params.businessName} team
        </p>
      </div>
    `,
    text: `Hey ${params.customerName}! Thanks for choosing ${params.businessName}. We'd love to hear how everything went. Leave a quick review: ${params.reviewLink}`,
    tags: [
      { name: "type", value: "review_request" },
    ],
  });
}

/**
 * Send a neighborhood campaign email
 */
export async function sendNeighborhoodEmail(params: {
  to: string;
  recipientName?: string;
  businessName: string;
  fromDomain?: string;
  subject: string;
  body: string;
}) {
  const from = params.fromDomain
    ? `${params.businessName} <hello@${params.fromDomain}>`
    : `${params.businessName} via TrueRex Local <hello@truerex.com>`;

  return sendEmail({
    from,
    to: params.to,
    subject: params.subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        ${params.recipientName ? `<p style="font-size: 16px;">Hi ${params.recipientName},</p>` : ""}
        <div style="font-size: 16px; line-height: 1.6; color: #333;">
          ${params.body.replace(/\n/g, "<br>")}
        </div>
        <p style="font-size: 12px; color: #999; margin-top: 32px; border-top: 1px solid #eee; padding-top: 12px;">
          You received this because we're working in your neighborhood.
          <a href="{{{unsubscribe}}}" style="color: #999;">Unsubscribe</a>
        </p>
      </div>
    `,
    text: params.body,
    tags: [
      { name: "type", value: "neighborhood" },
    ],
  });
}

/**
 * Verify a custom domain for a business
 */
export async function addDomain(domain: string) {
  const res = await resendFetch("/domains", {
    method: "POST",
    body: JSON.stringify({ name: domain }),
  });

  return res.json();
}

/**
 * Check domain verification status
 */
export async function getDomainStatus(domainId: string) {
  const res = await resendFetch(`/domains/${domainId}`);
  return res.json();
}
