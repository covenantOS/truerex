import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGBPAuthUrl } from "@/lib/integrations/gbp";

/**
 * GET: Start GBP OAuth flow — returns the auth URL
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/gbp/callback`;
  const state = user.id; // Simple state, enhance with CSRF in production

  const authUrl = getGBPAuthUrl(redirectUri, state);
  return NextResponse.json({ authUrl });
}
