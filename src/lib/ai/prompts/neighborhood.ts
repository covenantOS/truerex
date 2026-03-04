import type { ChatMessage } from "../openrouter";

type CampaignType = "pre_job" | "post_job";
type Channel = "sms" | "email" | "mailer";

interface BusinessInfo {
  business_name: string;
  service_type: string;
  phone?: string;
  voice_tone: string;
}

interface CampaignData {
  campaign_type: CampaignType;
  channel: Channel;
  service_type: string;
  job_address: string; // Street name only for privacy
  job_city: string;
  neighborhood?: string;
  discount_code?: string;
  discount_value?: string; // "10% off" or "$50 off"
  owner_name?: string; // Neighbor's name from ATTOM data
}

const CHANNEL_CONSTRAINTS: Record<Channel, string> = {
  sms: `SMS/iMessage RULES:
- MAX 160 characters (must fit one SMS segment)
- No links longer than 30 chars (use short link)
- Casual, conversational — nobody reads formal texts
- Must include opt-out: "Reply STOP to opt out"`,

  email: `EMAIL RULES:
- Subject line: 40 chars max, curiosity-driven
- Body: 60-100 words
- Return JSON: {"subject": "...", "body": "..."}
- Include unsubscribe note at bottom`,

  mailer: `PHYSICAL MAILER RULES:
- Headline: 8 words max, attention-grabbing
- Body: 50-80 words
- Must include business name, phone, and discount code
- Return JSON: {"headline": "...", "body": "...", "cta": "..."}
- Think postcard: visual, scannable, one clear action`,
};

export function buildNeighborhoodPrompt(
  biz: BusinessInfo,
  campaign: CampaignData
): ChatMessage[] {
  const typeContext =
    campaign.campaign_type === "pre_job"
      ? `PRE-JOB OUTREACH: You're letting neighbors know the business will be working on their street soon. Create urgency and convenience — "we're already going to be in the area."

ANGLE: Convenience + discount. They save because you're already nearby.`
      : `POST-JOB OUTREACH: The job is done. Neighbors may have seen the truck. Now hit them with social proof — "we just helped your neighbor."

ANGLE: Social proof + limited-time offer. Their neighbor trusted you. Build on that.`;

  const personalization = campaign.owner_name
    ? `Address them as "${campaign.owner_name}" — personalization matters.`
    : `No name available — use "Hi neighbor" or similar.`;

  const discountBlock =
    campaign.discount_code && campaign.discount_value
      ? `DISCOUNT: ${campaign.discount_value} with code "${campaign.discount_code}"`
      : "No specific discount — use general offer language.";

  const system: ChatMessage = {
    role: "system",
    content: `You write neighborhood outreach messages for ${biz.business_name} (${biz.service_type}). These go to homeowners near a job site.

VOICE: ${biz.voice_tone} — but adapted for cold outreach (friendly, not pushy)
BUSINESS PHONE: ${biz.phone || "[phone]"}

${typeContext}

${CHANNEL_CONSTRAINTS[campaign.channel]}

KEY RULES:
1. ${personalization}
2. Reference the STREET or NEIGHBORHOOD — never give exact job address
3. Don't sound like spam. Sound like a local business being friendly.
4. ${discountBlock}
5. One clear CTA — call, text, or click
6. NO hard sell. NO "don't miss out!" NO "limited time only!!!"`,
  };

  const streetName = campaign.job_address.replace(/^\d+\s*/, "").split(",")[0];

  const user: ChatMessage = {
    role: "user",
    content: `Write a ${campaign.channel} message for a ${campaign.campaign_type.replace("_", "-")} ${campaign.service_type} campaign:

AREA: ${campaign.neighborhood || streetName}, ${campaign.job_city}
${campaign.owner_name ? `RECIPIENT: ${campaign.owner_name}` : ""}

Write it now. No preamble.`,
  };

  return [system, user];
}
