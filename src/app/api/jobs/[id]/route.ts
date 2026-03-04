import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ApiError,
  HttpStatus,
  tryCatch,
} from "@/error-handler";

/**
 * GET /api/jobs/[id]
 * Retrieve a single job by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return tryCatch(request, async (req) => {
    const { id } = await params;
    const supabase = await createClient();

    // Validate UUID format
    if (!id || id.trim() === "") {
      throw ApiError.badRequest("Job ID is required");
    }

    const { data, error } = await supabase
      .from("jobs")
      .select("*, job_photos(id, photo_url, photo_type, sort_order, caption)")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching job:", error);

      if (error.code === "PGRST116") {
        // Row not found
        throw ApiError.notFound("Job", id);
      }

      throw ApiError.internal("Failed to fetch job");
    }

    if (!data) {
      throw ApiError.notFound("Job", id);
    }

    return NextResponse.json(data);
  });
}

/**
 * PATCH /api/jobs/[id]
 * Update an existing job
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return tryCatch(request, async (req) => {
    const { id } = await params;
    const supabase = await createClient();

    // Validate ID
    if (!id || id.trim() === "") {
      throw ApiError.badRequest("Job ID is required");
    }

    // Parse request body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      throw ApiError.badRequest("Invalid JSON in request body");
    }

    // Check for empty body
    if (!body || Object.keys(body).length === 0) {
      throw ApiError.badRequest("Request body cannot be empty");
    }

    // Build update data with timestamp
    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    // Remove id from update if present (can't change primary key)
    delete updateData.id;
    delete updateData.created_at;

    const { data, error } = await supabase
      .from("jobs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating job:", error);

      // Handle specific error cases
      if (error.code === "PGRST116") {
        throw ApiError.notFound("Job", id);
      }
      if (error.code === "23503") {
        throw ApiError.badRequest("Invalid reference: referenced record does not exist");
      }
      if (error.code === "23505") {
        throw ApiError.conflict("A job with this information already exists");
      }

      throw ApiError.internal("Failed to update job");
    }

    if (!data) {
      throw ApiError.notFound("Job", id);
    }

    return NextResponse.json(data);
  });
}

/**
 * DELETE /api/jobs/[id]
 * Delete a job
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return tryCatch(request, async (req) => {
    const { id } = await params;
    const supabase = await createClient();

    // Validate ID
    if (!id || id.trim() === "") {
      throw ApiError.badRequest("Job ID is required");
    }

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting job:", error);

      // Handle specific error cases
      if (error.code === "PGRST116") {
        throw ApiError.notFound("Job", id);
      }
      if (error.code === "23503") {
        throw ApiError.badRequest(
          "Cannot delete: job is referenced by other records"
        );
      }

      throw ApiError.internal("Failed to delete job");
    }

    return NextResponse.json({ 
      success: true, 
      message: `Job ${id} deleted successfully` 
    });
  });
}
