"use client";

import { useEffect, useState } from "react";
import { useBusiness } from "@/hooks/use-business";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  MessageSquare,
  Mail,
  Send,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";

interface Campaign {
  id: string;
  campaign_type: string;
  radius_miles: number;
  status: string;
  contacts_found: number;
  messages_sent: number;
  messages_delivered: number;
  replies: number;
  conversions: number;
  mailers_sent: number;
  discount_code: string | null;
  discount_value: string | null;
  message_template: string | null;
  created_at: string;
  job_id: string;
}

interface Job {
  id: string;
  title: string | null;
  address: string;
  city: string | null;
  state: string | null;
  service_type: string;
}

export default function CampaignsPage() {
  const { business } = useBusiness();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [selectedJob, setSelectedJob] = useState("");
  const [campaignType, setCampaignType] = useState("post_job");
  const [radius, setRadius] = useState("0.5");
  const [discountCode, setDiscountCode] = useState("");
  const [discountValue, setDiscountValue] = useState("10% off");

  useEffect(() => {
    if (!business) return;
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  async function loadData() {
    const supabase = createClient();
    const [campaignsRes, jobsRes] = await Promise.all([
      supabase
        .from("neighborhood_campaigns")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("jobs")
        .select("id, title, address, city, state, service_type")
        .order("created_at", { ascending: false }),
    ]);

    setCampaigns(campaignsRes.data || []);
    setJobs(jobsRes.data || []);
    setLoading(false);
  }

  async function handleCreate() {
    if (!business || !selectedJob) return;
    setCreating(true);

    const supabase = createClient();
    const { error } = await supabase.from("neighborhood_campaigns").insert({
      business_id: business.id,
      job_id: selectedJob,
      campaign_type: campaignType,
      radius_miles: parseFloat(radius),
      discount_code: discountCode || null,
      discount_value: discountValue || null,
      status: "draft",
    });

    if (error) {
      toast.error("Failed to create campaign: " + error.message);
    } else {
      toast.success("Campaign created!");
      setDialogOpen(false);
      setSelectedJob("");
      setDiscountCode("");
      loadData();
    }
    setCreating(false);
  }

  async function handleUpdateStatus(id: string, status: string) {
    const supabase = createClient();
    const updates: Record<string, unknown> = { status };
    if (status === "sent") updates.sent_at = new Date().toISOString();

    const { error } = await supabase
      .from("neighborhood_campaigns")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success(`Campaign marked as ${status}`);
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    }
  }

  const totalContacts = campaigns.reduce((sum, c) => sum + c.contacts_found, 0);
  const totalSent = campaigns.reduce((sum, c) => sum + c.messages_sent, 0);
  const totalReplies = campaigns.reduce((sum, c) => sum + c.replies, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Neighborhood Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            Target homeowners near your job sites with SMS, email, and physical mailers
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Neighborhood Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Job</Label>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((j) => (
                      <SelectItem key={j.id} value={j.id}>
                        {j.title || j.address}
                        {j.city ? `, ${j.city}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <Select value={campaignType} onValueChange={setCampaignType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre_job">
                      Pre-Job (we&apos;re heading to your street)
                    </SelectItem>
                    <SelectItem value="post_job">
                      Post-Job (we just helped your neighbor)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Radius (miles)</Label>
                  <Input
                    type="number"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount</Label>
                  <Input
                    placeholder="10% off"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Discount Code (optional)</Label>
                <Input
                  placeholder="NEIGHBOR10"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={creating || !selectedJob}
                className="w-full"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                Create Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border p-4 text-center">
            <Target className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{totalContacts}</p>
            <p className="text-xs text-muted-foreground">Contacts</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <Send className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{totalSent}</p>
            <p className="text-xs text-muted-foreground">Sent</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <MessageSquare className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{totalReplies}</p>
            <p className="text-xs text-muted-foreground">Replies</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{totalConversions}</p>
            <p className="text-xs text-muted-foreground">Converted</p>
          </div>
        </div>
      )}

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <MapPin className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              No campaigns yet. Create one to start targeting homeowners near your job sites.
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
                  {campaign.discount_value && ` \u00B7 ${campaign.discount_value}`}
                  {campaign.discount_code && ` (${campaign.discount_code})`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
                  <p className="text-xs text-muted-foreground">
                    {campaign.mailers_sent} physical mailers sent
                  </p>
                )}

                {campaign.message_template && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Message Template
                    </p>
                    <p className="text-sm">{campaign.message_template}</p>
                  </div>
                )}

                {campaign.status === "draft" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(campaign.id, "sending")}
                      className="gap-1"
                    >
                      <Send className="w-3 h-3" /> Start Sending
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(campaign.id, "sent")}
                    >
                      Mark Sent
                    </Button>
                  </div>
                )}
                {campaign.status === "sending" && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(campaign.id, "sent")}
                  >
                    Mark Complete
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
