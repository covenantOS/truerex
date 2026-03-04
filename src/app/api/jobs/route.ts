import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ApiError,
  HttpStatus,
  tryCatch,
  validateRequired,
} from "@/error-handler";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

/**
 * GET /api/jobs
 * Retrieve jobs with optional filtering
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
      .from("jobs")
      .select("*, job_photos(id, photo_url, photo_type, sort_order)")
      .order("created_at", { ascending: false })
      .limit(limit);

    // Apply status filter if provided
    if (status) {
      const validStatuses = ["pending", "in_progress", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        throw ApiError.badRequest(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }
      query = query.eq("status", status);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching jobs:", error);
      throw ApiError.internal("Failed to fetch jobs");
    }

    return NextResponse.json(data || []);
  });
}

/**
 * POST /api/jobs
 * Create a new job
 */
export async function POST(request: NextRequest) {
  return tryCatch(request, async (req) => {
    const supabase = await createClient();

    // Parse request body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      throw ApiError.badRequest("Invalid JSON in request body");
    }

    // Validate required fields for job creation
    const requiredFields = ["business_id", "customer_name", "address", "city", "state"];
    validateRequired(body, requiredFields);

    // Build insert data
    const insertData = {
      business_id: body.business_id,
      customer_name: body.customer_name,
      address: body.address,
      city: body.city,
      state: body.state,
      service_type: body.service_type,
      zip_code: body.zip_code,
      scheduled_date: body.scheduled_date,
      status: body.status || "pending",
      raw_notes: body.raw_notes,
      price: body.price,
    };

    const { data, error } = await supabase
      .from("jobs")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creating job:", error);

      // Handle specific error cases
      if (error.code === "23503") {
        // Foreign key violation
        throw ApiError.badRequest("Invalid business_id: referenced business does not exist");
      }
      if (error.code === "23505") {
        // Unique constraint violation
        throw ApiError.conflict("A job with this information already exists");
      }

      throw ApiError.internal("Failed to create job");
    }

    if (!data) {
      throw ApiError.internal("Failed to create job: no data returned");
    }

    return NextResponse.json(data, { status: HttpStatus.CREATED });
  });
}
