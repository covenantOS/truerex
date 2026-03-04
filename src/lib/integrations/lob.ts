/**
 * Lob.com API client for physical mailers (postcards)
 * Sends branded postcards to neighbors after job completion.
 */

const LOB_API_BASE = "https://api.lob.com/v1";

interface PostcardAddress {
  name: string;
  address_line1: string;
  address_city: string;
  address_state: string;
  address_zip: string;
}

interface PostcardOptions {
  to: PostcardAddress;
  from: PostcardAddress;
  front: string; // HTML template or URL
  back: string; // HTML template or URL
  size?: "4x6" | "6x9" | "6x11";
  metadata?: Record<string, string>;
}

interface PostcardResult {
  id: string;
  url: string;
  expected_delivery_date: string;
  tracking_number: string | null;
}

function lobAuth(): string {
  return `Basic ${Buffer.from(`${process.env.LOB_API_KEY}:`).toString("base64")}`;
}

async function lobFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(`${LOB_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: lobAuth(),
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Lob API error ${res.status}: ${err}`);
  }

  return res;
}

/**
 * Send a postcard to a neighbor
 */
export async function sendPostcard(
  options: PostcardOptions
): Promise<PostcardResult> {
  const res = await lobFetch("/postcards", {
    method: "POST",
    body: JSON.stringify({
      to: options.to,
      from: options.from,
      front: options.front,
      back: options.back,
      size: options.size || "6x9",
      metadata: options.metadata,
    }),
  });

  return res.json();
}

/**
 * Generate the front HTML for a neighborhood postcard
 */
export function generatePostcardFront(params: {
  businessName: string;
  headline: string;
  photoUrl?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
}): string {
  const hasBeforeAfter = params.beforePhotoUrl && params.afterPhotoUrl;

  return `
    <html>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif;">
      <div style="width: 6in; height: 4.25in; position: relative; overflow: hidden;">
        ${
          hasBeforeAfter
            ? `
          <div style="display: flex; height: 60%;">
            <div style="width: 50%; position: relative;">
              <img src="${params.beforePhotoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
              <div style="position: absolute; bottom: 4px; left: 4px; background: rgba(0,0,0,0.6); color: white; padding: 2px 8px; font-size: 11px; border-radius: 3px;">BEFORE</div>
            </div>
            <div style="width: 50%; position: relative;">
              <img src="${params.afterPhotoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
              <div style="position: absolute; bottom: 4px; left: 4px; background: rgba(0,0,0,0.6); color: white; padding: 2px 8px; font-size: 11px; border-radius: 3px;">AFTER</div>
            </div>
          </div>`
            : params.photoUrl
              ? `<img src="${params.photoUrl}" style="width: 100%; height: 60%; object-fit: cover;" />`
              : `<div style="width: 100%; height: 60%; background: #1e40af;"></div>`
        }
        <div style="padding: 16px 20px; text-align: center;">
          <h1 style="font-size: 22px; margin: 0 0 6px 0; color: #111;">${params.headline}</h1>
          <p style="font-size: 14px; color: #1e40af; margin: 0; font-weight: 600;">${params.businessName}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate the back HTML for a neighborhood postcard
 */
export function generatePostcardBack(params: {
  businessName: string;
  body: string;
  cta: string;
  phone?: string;
  website?: string;
  discountCode?: string;
}): string {
  return `
    <html>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif;">
      <div style="width: 6in; height: 4.25in; padding: 24px; box-sizing: border-box;">
        <div style="width: 55%;">
          <h2 style="font-size: 16px; color: #111; margin: 0 0 12px 0;">${params.businessName}</h2>
          <p style="font-size: 13px; line-height: 1.5; color: #333; margin: 0 0 16px 0;">${params.body}</p>
          ${
            params.discountCode
              ? `<div style="background: #fef3c7; border: 2px dashed #d97706; padding: 8px 12px; border-radius: 6px; text-align: center; margin-bottom: 12px;">
              <p style="font-size: 11px; color: #92400e; margin: 0;">USE CODE</p>
              <p style="font-size: 18px; font-weight: bold; color: #92400e; margin: 2px 0;">${params.discountCode}</p>
            </div>`
              : ""
          }
          <p style="font-size: 14px; font-weight: 600; color: #1e40af; margin: 0 0 8px 0;">${params.cta}</p>
          ${params.phone ? `<p style="font-size: 13px; color: #333; margin: 0;">📞 ${params.phone}</p>` : ""}
          ${params.website ? `<p style="font-size: 13px; color: #333; margin: 2px 0;">🌐 ${params.website}</p>` : ""}
        </div>
      </div>
    </body>
    </html>
  `;
}
