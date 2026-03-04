/**
 * Google Business Profile API client
 * Handles OAuth flow, token refresh, posting updates, and photo uploads.
 *
 * GBP API requires:
 * 1. Google Cloud project with Business Profile API enabled
 * 2. OAuth 2.0 consent screen approved
 * 3. Business must be verified on Google
 */

const GBP_API_BASE = "https://mybusinessbusinessinformation.googleapis.com/v1";
const GBP_POSTS_BASE = "https://mybusiness.googleapis.com/v4";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";

interface GBPTokens {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

interface GBPPost {
  summary: string;
  mediaItems?: { mediaFormat: string; sourceUrl: string }[];
  callToAction?: { actionType: string; url: string };
  topicType?: string;
}

/**
 * Build the OAuth authorization URL for GBP connection
 */
export function getGBPAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_BUSINESS_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/business.manage",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeGBPCode(
  code: string,
  redirectUri: string
): Promise<GBPTokens> {
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_BUSINESS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_BUSINESS_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GBP token exchange failed: ${err}`);
  }

  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Refresh an expired access token
 */
export async function refreshGBPToken(refreshToken: string): Promise<GBPTokens> {
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_BUSINESS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_BUSINESS_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GBP token refresh failed: ${err}`);
  }

  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: refreshToken,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Get the authenticated user's GBP accounts
 */
export async function listGBPAccounts(accessToken: string) {
  const res = await fetch(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) throw new Error(`Failed to list GBP accounts: ${res.status}`);
  return res.json();
}

/**
 * Get locations for a GBP account
 */
export async function listGBPLocations(accessToken: string, accountId: string) {
  const res = await fetch(
    `${GBP_API_BASE}/${accountId}/locations?readMask=name,title,storefrontAddress`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) throw new Error(`Failed to list GBP locations: ${res.status}`);
  return res.json();
}

/**
 * Create a local post on GBP
 */
export async function createGBPPost(
  accessToken: string,
  locationName: string,
  post: GBPPost
) {
  const res = await fetch(
    `${GBP_POSTS_BASE}/${locationName}/localPosts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        languageCode: "en",
        summary: post.summary,
        media: post.mediaItems?.map((m) => ({
          mediaFormat: m.mediaFormat,
          sourceUrl: m.sourceUrl,
        })),
        callToAction: post.callToAction,
        topicType: post.topicType || "STANDARD",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create GBP post: ${err}`);
  }

  return res.json();
}

/**
 * Upload a photo to a GBP location's media
 */
export async function uploadGBPPhoto(
  accessToken: string,
  locationName: string,
  photoUrl: string,
  category: string = "ADDITIONAL"
) {
  const res = await fetch(
    `${GBP_API_BASE}/${locationName}/media`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mediaFormat: "PHOTO",
        sourceUrl: photoUrl,
        locationAssociation: { category },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to upload GBP photo: ${err}`);
  }

  return res.json();
}

/**
 * List reviews for a GBP location
 */
export async function listGBPReviews(
  accessToken: string,
  locationName: string,
  pageSize = 50,
  pageToken?: string
) {
  const params = new URLSearchParams({ pageSize: pageSize.toString() });
  if (pageToken) params.set("pageToken", pageToken);

  const res = await fetch(
    `${GBP_POSTS_BASE}/${locationName}/reviews?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) throw new Error(`Failed to list GBP reviews: ${res.status}`);
  return res.json();
}

/**
 * Reply to a GBP review
 */
export async function replyToGBPReview(
  accessToken: string,
  reviewName: string,
  comment: string
) {
  const res = await fetch(
    `${GBP_POSTS_BASE}/${reviewName}/reply`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to reply to GBP review: ${err}`);
  }

  return res.json();
}
