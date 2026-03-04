"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, MapPin, MessageSquare, Mail, Send } from "lucide-react";

interface Campaign {
  id: string;
  campaign_type: string;
  radius_miles: number;
  status: string;
  contacts_found: number;
  messages_sent: number;
  replies: number;
  conversions: number;
  mailers_sent: number;
  discount_value: string | null;
  created_at: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/campaigns");
        if (res.ok) setCampaigns(await res.json());
      } catch {
        // API not wired yet
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Neighborhood Campaigns</h1>
        <p className="text-sm text-muted-foreground">
          Auto-target homeowners near your job sites with SMS, email, and physical mailers
        </p>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <MapPin className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              No campaigns yet. When you complete a job, neighborhood campaigns
              are automatically created based on the job address.
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Pre-job texts
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> Post-job emails
              </span>
              <span className="flex items-center gap-1">
                <Send className="w-3 h-3" /> Physical mailers
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {campaign.campaign_type === "pre_job"
                      ? "Pre-Job Outreach"
                      : "Post-Job Follow-Up"}
                  </CardTitle>
                  <Badge
                    variant={
                      campaign.status === "sent"
                        ? "default"
                        : campaign.status === "sending"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {campaign.status}
                  </Badge>
                </div>
                <CardDescription>
                  {campaign.radius_miles} mile radius &middot;{" "}
                  {new Date(campaign.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{campaign.contacts_found}</p>
                    <p className="text-xs text-muted-foreground">Found</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{campaign.messages_sent}</p>
                    <p className="text-xs text-muted-foreground">Sent</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{campaign.replies}</p>
                    <p className="text-xs text-muted-foreground">Replies</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{campaign.conversions}</p>
                    <p className="text-xs text-muted-foreground">Converted</p>
                  </div>
                </div>
                {campaign.mailers_sent > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {campaign.mailers_sent} physical mailers sent
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
