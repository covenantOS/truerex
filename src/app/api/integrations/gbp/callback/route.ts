import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  exchangeGBPCode,
  listGBPAccounts,
  listGBPLocations,
} from "@/lib/integrations/gbp";

/**
 * GET: OAuth callback from Google — exchanges code for tokens and saves to business
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=gbp_denied`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=no_code`
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login`
    );
  }

  // Get user's business
  const { data: profile } = await supabase
    .from("users")
    .select("business_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=no_business`
    );
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/gbp/callback`;
    const tokens = await exchangeGBPCode(code, redirectUri);

    // Try to auto-detect account and location
    let accountId = "";
    let locationId = "";

    try {
      const accounts = await listGBPAccounts(tokens.access_token);
      if (accounts.accounts?.length > 0) {
        accountId = accounts.accounts[0].name;

        const locations = await listGBPLocations(tokens.access_token, accountId);
        if (locations.locations?.length > 0) {
          locationId = locations.locations[0].name;
        }
      }
    } catch {
      // Non-fatal — user can set up manually
    }

    // Save tokens to business
    await supabase
      .from("businesses")
      .update({
        gbp_access_token: tokens.access_token,
        gbp_refresh_token: tokens.refresh_token,
        gbp_account_id: accountId || null,
        gbp_location_id: locationId || null,
      })
      .eq("id", profile.business_id);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?success=gbp_connected`
    );
  } catch (err) {
    console.error("GBP OAuth error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=gbp_failed`
    );
  }
}
