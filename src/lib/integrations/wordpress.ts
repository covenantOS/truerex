/**
 * WordPress REST API client
 * Handles blog post creation with schema markup.
 * Uses Application Passwords (wp_username + wp_app_password).
 */

interface WPCredentials {
  siteUrl: string;
  username: string;
  appPassword: string;
}

interface WPPostOptions {
  title: string;
  content: string;
  status?: "publish" | "draft" | "pending";
  categories?: number[];
  tags?: number[];
  featured_media?: number;
  meta?: Record<string, string>;
}

interface WPPostResult {
  id: number;
  link: string;
  status: string;
}

function wpAuth(creds: WPCredentials): string {
  return `Basic ${Buffer.from(`${creds.username}:${creds.appPassword}`).toString("base64")}`;
}

async function wpFetch(
  creds: WPCredentials,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${creds.siteUrl.replace(/\/$/, "")}/wp-json/wp/v2${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: wpAuth(creds),
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WordPress API error ${res.status}: ${err}`);
  }

  return res;
}

/**
 * Test WordPress connection
 */
export async function testConnection(creds: WPCredentials): Promise<boolean> {
  try {
    const res = await wpFetch(creds, "/users/me");
    const user = await res.json();
    return !!user.id;
  } catch {
    return false;
  }
}

/**
 * Create a blog post
 */
export async function createPost(
  creds: WPCredentials,
  options: WPPostOptions
): Promise<WPPostResult> {
  const res = await wpFetch(creds, "/posts", {
    method: "POST",
    body: JSON.stringify({
      title: options.title,
      content: options.content,
      status: options.status || "draft",
      categories: options.categories,
      tags: options.tags,
      featured_media: options.featured_media,
      meta: options.meta,
    }),
  });

  return res.json();
}

/**
 * Upload a media file (photo) to WordPress
 */
export async function uploadMedia(
  creds: WPCredentials,
  imageUrl: string,
  filename: string,
  altText?: string
): Promise<{ id: number; source_url: string }> {
  // Download the image first
  const imageRes = await fetch(imageUrl);
  const imageBuffer = await imageRes.arrayBuffer();
  const contentType = imageRes.headers.get("content-type") || "image/jpeg";

  const url = `${creds.siteUrl.replace(/\/$/, "")}/wp-json/wp/v2/media`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: wpAuth(creds),
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": contentType,
    },
    body: imageBuffer,
  });

  if (!res.ok) {
    throw new Error(`WP media upload failed: ${res.status}`);
  }

  const media = await res.json();

  // Update alt text if provided
  if (altText) {
    await wpFetch(creds, `/media/${media.id}`, {
      method: "POST",
      body: JSON.stringify({ alt_text: altText }),
    });
  }

  return { id: media.id, source_url: media.source_url };
}

/**
 * Find or create a category by name
 */
export async function findOrCreateCategory(
  creds: WPCredentials,
  name: string
): Promise<number> {
  // Search existing
  const searchRes = await wpFetch(
    creds,
    `/categories?search=${encodeURIComponent(name)}`
  );
  const existing = await searchRes.json();

  if (existing.length > 0) {
    return existing[0].id;
  }

  // Create new
  const createRes = await wpFetch(creds, "/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

  const created = await createRes.json();
  return created.id;
}

/**
 * Generate LocalBusiness + Service schema markup JSON-LD
 */
export function generateSchemaMarkup(params: {
  businessName: string;
  serviceType: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  website?: string;
  description: string;
  imageUrl?: string;
}): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: params.serviceType,
    provider: {
      "@type": "LocalBusiness",
      name: params.businessName,
      telephone: params.phone,
      url: params.website,
      address: {
        "@type": "PostalAddress",
        streetAddress: params.address,
        addressLocality: params.city,
        addressRegion: params.state,
        postalCode: params.zip,
      },
    },
    areaServed: {
      "@type": "City",
      name: params.city,
    },
    description: params.description,
    ...(params.imageUrl ? { image: params.imageUrl } : {}),
  };

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}
