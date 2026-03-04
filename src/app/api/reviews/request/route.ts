import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendMessage } from "@/lib/integrations/blooio";
import { sendReviewRequestEmail } from "@/lib/integrations/resend";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { job_id } = body;

  if (!job_id) {
    return NextResponse.json({ error: "job_id required" }, { status: 400 });
  }

  // Get job + business info
  const { data: job } = await supabase
    .from("jobs")
    .select("*, businesses:business_id(*)")
    .eq("id", job_id)
    .single();

  if (!job || !job.customer_name) {
    return NextResponse.json(
      { error: "Job not found or no customer info" },
      { status: 404 }
    );
  }

  const business = job.businesses as Record<string, unknown>;
  const method = (business.review_request_method as string) || "both";
  const results: Record<string, unknown> = {};

  // Build review link (points to our gating page)
  const reviewLink = `${process.env.NEXT_PUBLIC_APP_URL}/r/${job.business_id}/${job.id}`;

  // Create review request record
  const { data: reviewRequest, error: insertError } = await supabase
    .from("review_requests")
    .insert({
      business_id: job.business_id,
      job_id: job.id,
      customer_name: job.customer_name,
      customer_phone: job.customer_phone,
      customer_email: job.customer_email,
      method,
      status: "pending",
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Send SMS if phone available
  if (
    (method === "sms" || method === "both") &&
    job.customer_phone &&
    business.blooio_number
  ) {
    try {
      const smsResult = await sendMessage({
        to: job.customer_phone,
        from: business.blooio_number as string,
        body: `Hey ${job.customer_name.split(" ")[0]}! Thanks for choosing ${business.name}. How'd everything go? We'd love a quick review: ${reviewLink} Reply STOP to opt out`,
      });

      results.sms = { sent: true, id: smsResult.id };

      await supabase
        .from("review_requests")
        .update({
          blooio_message_id: smsResult.id,
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", reviewRequest.id);
    } catch (err) {
      console.error("SMS send failed:", err);
      results.sms = { sent: false, error: String(err) };
    }
  }

  // Send email if email available
  if (
    (method === "email" || method === "both") &&
    job.customer_email
  ) {
    try {
      const emailResult = await sendReviewRequestEmail({
        to: job.customer_email,
        customerName: job.customer_name.split(" ")[0],
        businessName: business.name as string,
        fromDomain: business.resend_domain as string | undefined,
        reviewLink,
      });

      results.email = { sent: true, id: emailResult.id };

      await supabase
        .from("review_requests")
        .update({
          resend_message_id: emailResult.id,
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", reviewRequest.id);
    } catch (err) {
      console.error("Email send failed:", err);
      results.email = { sent: false, error: String(err) };
    }
  }

  // Update job
  await supabase
    .from("jobs")
    .update({
      review_requested: true,
      review_request_sent_at: new Date().toISOString(),
    })
    .eq("id", job_id);

  return NextResponse.json({
    success: true,
    review_request_id: reviewRequest.id,
    results,
  });
}
