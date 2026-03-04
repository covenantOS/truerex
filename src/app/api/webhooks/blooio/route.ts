import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST: Incoming SMS/iMessage webhook from Blooio
 * Handles: review request replies, neighborhood campaign replies
 */
export async function POST(request: NextRequest) {
  const body = await request.text();

  // TODO: Verify webhook signature when Blooio docs specify the format
  // const signature = request.headers.get("x-blooio-signature") || "";
  // if (!verifyBlooioWebhook(body, signature)) {
  //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  // }

  const payload = JSON.parse(body);
  const { from, to, body: messageBody } = payload;

  if (!from || !messageBody) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Find business by Blooio number
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("blooio_number", to)
    .single();

  if (!business) {
    console.log("No business found for Blooio number:", to);
    return NextResponse.json({ ok: true });
  }

  // Check if this is a reply to a review request
  const { data: reviewRequest } = await supabase
    .from("review_requests")
    .select("*")
    .eq("business_id", business.id)
    .eq("customer_phone", from)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (reviewRequest) {
    // Handle opt-out
    if (messageBody.toUpperCase().trim() === "STOP") {
      await supabase
        .from("review_requests")
        .update({ status: "feedback" })
        .eq("id", reviewRequest.id);
      return NextResponse.json({ ok: true });
    }

    // Update status
    await supabase
      .from("review_requests")
      .update({ status: "feedback" })
      .eq("id", reviewRequest.id);

    return NextResponse.json({ ok: true });
  }

  // Check if this is a reply to a neighborhood campaign
  const { data: contact } = await supabase
    .from("neighborhood_contacts")
    .select("*")
    .eq("business_id", business.id)
    .eq("phone", from)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (contact) {
    await supabase
      .from("neighborhood_contacts")
      .update({ responded: true, message_status: "replied" })
      .eq("id", contact.id);

    // Increment campaign replies
    if (contact.campaign_id) {
      await supabase.rpc("increment_campaign_replies", {
        campaign_id: contact.campaign_id,
      });
    }

    return NextResponse.json({ ok: true });
  }

  // Unmatched message — log for later
  console.log(`Unmatched incoming SMS from ${from} to ${to}: ${messageBody}`);

  return NextResponse.json({ ok: true });
}
