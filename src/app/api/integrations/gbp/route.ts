import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGBPAuthUrl } from "@/lib/integrations/gbp";
import {
  ApiError,
  HttpStatus,
  tryCatch,
  requireAuth,
} from "@/error-handler";

/**
 * GET /api/integrations/gbp
 * Start GBP OAuth flow — returns the auth URL
 */
export async function GET(request: NextRequest) {
  return tryCatch(request, async (req) => {
    const supabase = await createClient();

    // Verify user is authenticated
    const userId = await requireAuth(supabase);

    // Validate environment configuration
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      console.error("NEXT_PUBLIC_APP_URL is not configured");
      throw ApiError.internal("Server configuration error");
    }

    const redirectUri = `${appUrl}/api/integrations/gbp/callback`;
    
    // Generate state with user ID for CSRF protection
    const state = Buffer.from(JSON.stringify({ 
      userId, 
      timestamp: Date.now() 
    })).toString("base64");

    try {
      const authUrl = getGBPAuthUrl(redirectUri, state);
      return NextResponse.json({ authUrl });
    } catch (err) {
      console.error("Error generating GBP auth URL:", err);
      throw ApiError.internal("Failed to generate authentication URL");
    }
  });
}
