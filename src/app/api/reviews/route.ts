import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ApiError,
  tryCatch,
} from "@/error-handler";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

/**
 * GET /api/reviews
 * Retrieve reviews with optional filtering
 */
export async function GET(request: NextRequest) {
  return tryCatch(request, async (req) => {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    // Parse and validate query parameters
    const status = searchParams.get("status");
    let limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT));

    // Validate and cap the limit
    if (isNaN(limit) || limit < 1) {
      limit = DEFAULT_LIMIT;
    }
    if (limit > MAX_LIMIT) {
      limit = MAX_LIMIT;
    }

    // Build query
    let query = supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    // Apply status filter if provided
    if (status) {
      const validStatuses = ["pending", "drafted", "sent", "failed"];
      if (!validStatuses.includes(status)) {
        throw ApiError.badRequest(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }
      query = query.eq("response_status", status);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching reviews:", error);
      throw ApiError.internal("Failed to fetch reviews");
    }

    return NextResponse.json(data || []);
  });
}
