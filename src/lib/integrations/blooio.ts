/**
 * Blooio API client for iMessage/RCS/SMS
 * Blooio auto-provisions a phone number for each business.
 * Handles sending messages and receiving webhooks.
 */

const BLOOIO_API_BASE = "https://api.blooio.com/v1";

interface BlooioSendOptions {
  to: string;
  body: string;
  from?: string; // Business's provisioned number
  mediaUrl?: string;
}

interface BlooioProvisionResult {
  phoneNumber: string;
  sid: string;
}

interface BlooioMessageResult {
  id: string;
  status: string;
  to: string;
  body: string;
}

async function blooioFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(`${BLOOIO_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.BLOOIO_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Blooio API error ${res.status}: ${err}`);
  }

  return res;
}

/**
 * Provision a new phone number for a business
 */
export async function provisionNumber(
  areaCode?: string
): Promise<BlooioProvisionResult> {
  const res = await blooioFetch("/phone-numbers", {
    method: "POST",
    body: JSON.stringify({
      areaCode: areaCode || "512", // Default Austin area code
      capabilities: ["sms", "mms", "voice"],
    }),
  });

  return res.json();
}

/**
 * Send an SMS/iMessage/RCS message
 */
export async function sendMessage(
  options: BlooioSendOptions
): Promise<BlooioMessageResult> {
  const res = await blooioFetch("/messages", {
    method: "POST",
    body: JSON.stringify({
      to: options.to,
      from: options.from,
      body: options.body,
      mediaUrl: options.mediaUrl,
    }),
  });

  return res.json();
}

/**
 * Get message delivery status
 */
export async function getMessageStatus(messageId: string) {
  const res = await blooioFetch(`/messages/${messageId}`);
  return res.json();
}

/**
 * Verify webhook signature from Blooio
 */
export function verifyBlooioWebhook(
  body: string,
  signature: string
): boolean {
  // Blooio uses HMAC-SHA256 signature verification
  // Implementation depends on their specific webhook format
  const secret = process.env.BLOOIO_WEBHOOK_SECRET;
  if (!secret) return false;

  // Basic verification — enhance based on Blooio docs
  try {
    const crypto = require("crypto");
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    return signature === expected;
  } catch {
    return false;
  }
}
