import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST: Inbound webhook from Make/Zapier
 * Accepts job events from external CRMs (HCP, GHL, ServiceTitan, Jobber)
 */
export async function POST(request: NextRequest) {
  // Verify webhook secret
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const body = await request.json();
  const { event, business_id, data } = body;

  if (!event || !business_id) {
    return NextResponse.json(
      { error: "Missing event or business_id" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  switch (event) {
    case "job.created":
    case "job.completed": {
      // Create or update a job from external CRM
      const { data: job, error } = await supabase
        .from("jobs")
        .upsert({
          business_id,
          service_type: data.service_type,
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          raw_notes: data.notes,
          status: event === "job.completed" ? "completed" : "active",
          completed_at:
            event === "job.completed" ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, job_id: job.id });
    }

    case "review.received": {
      // Import a review from external source
      const { error } = await supabase.from("reviews").insert({
        business_id,
        source: data.source || "external",
        reviewer_name: data.reviewer_name,
        rating: data.rating,
        review_text: data.review_text,
        review_date: data.review_date || new Date().toISOString(),
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json(
        { error: `Unknown event: ${event}` },
        { status: 400 }
      );
  }
}
