"use client";

import { useState } from "react";
import { useBusiness } from "@/hooks/use-business";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ExternalLink, Check, X } from "lucide-react";

export default function IntegrationsPage() {
  const { business, loading: bizLoading } = useBusiness();
  const [connecting, setConnecting] = useState<string | null>(null);

  // WP form state
  const [wpUrl, setWpUrl] = useState("");
  const [wpUser, setWpUser] = useState("");
  const [wpPassword, setWpPassword] = useState("");
  const [wpSaving, setWpSaving] = useState(false);

  async function connectGBP() {
    setConnecting("gbp");
    try {
      const res = await fetch("/api/integrations/gbp");
      const { authUrl } = await res.json();
      window.location.href = authUrl;
    } catch {
      toast.error("Failed to start GBP connection");
      setConnecting(null);
    }
  }

  async function saveWordPress() {
    if (!business) return;
    setWpSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("businesses")
      .update({
        wp_site_url: wpUrl || null,
        wp_username: wpUser || null,
        wp_app_password: wpPassword || null,
      })
      .eq("id", business.id);

    if (error) {
      toast.error("Failed to save WordPress settings");
    } else {
      toast.success("WordPress settings saved");
    }
    setWpSaving(false);
  }

  if (bizLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Integrations</h1>

      {/* Google Business Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Google Business Profile</CardTitle>
              <CardDescription>
                Auto-post job stories and respond to reviews
              </CardDescription>
            </div>
            {business?.gbp_location_id ? (
              <Badge className="gap-1">
                <Check className="w-3 h-3" /> Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <X className="w-3 h-3" /> Not Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {business?.gbp_location_id ? (
            <p className="text-sm text-muted-foreground">
              Connected to location: {business.gbp_location_id}
            </p>
          ) : (
            <Button
              onClick={connectGBP}
              disabled={connecting === "gbp"}
              className="gap-2"
            >
              {connecting === "gbp" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Connect Google Business Profile
            </Button>
          )}
        </CardContent>
      </Card>

      {/* WordPress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">WordPress</CardTitle>
              <CardDescription>
                Auto-publish blog posts and case studies
              </CardDescription>
            </div>
            {business?.wp_site_url ? (
              <Badge className="gap-1">
                <Check className="w-3 h-3" /> Configured
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <X className="w-3 h-3" /> Not Configured
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">WordPress Site URL</Label>
            <Input
              placeholder="https://yoursite.com"
              value={wpUrl || business?.wp_site_url || ""}
              onChange={(e) => setWpUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Username</Label>
            <Input
              placeholder="admin"
              value={wpUser || business?.wp_username || ""}
              onChange={(e) => setWpUser(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Application Password</Label>
            <Input
              type="password"
              placeholder="xxxx xxxx xxxx xxxx"
              value={wpPassword}
              onChange={(e) => setWpPassword(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              Generate in WordPress &rarr; Users &rarr; Profile &rarr; Application Passwords
            </p>
          </div>
          <Button
            onClick={saveWordPress}
            disabled={wpSaving}
            size="sm"
          >
            {wpSaving ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : null}
            Save WordPress Settings
          </Button>
        </CardContent>
      </Card>

      {/* Blooio */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Blooio (SMS/iMessage/RCS)</CardTitle>
              <CardDescription>
                Send review requests and neighborhood texts
              </CardDescription>
            </div>
            {business?.blooio_number ? (
              <Badge className="gap-1">
                <Check className="w-3 h-3" /> {business.blooio_number}
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <X className="w-3 h-3" /> Not Provisioned
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {business?.blooio_number
              ? "Phone number is active and ready to send messages."
              : "A dedicated phone number will be auto-provisioned when your Blooio API key is configured."}
          </p>
        </CardContent>
      </Card>

      {/* Resend */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Resend (Email)</CardTitle>
              <CardDescription>
                Send review request emails and campaign emails
              </CardDescription>
            </div>
            {business?.resend_domain ? (
              <Badge className="gap-1">
                <Check className="w-3 h-3" /> {business.resend_domain}
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <X className="w-3 h-3" /> Default Domain
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {business?.resend_domain
              ? `Sending from custom domain: ${business.resend_domain}`
              : "Emails sent from truerex.com. Add a custom domain in Resend for branded sending."}
          </p>
        </CardContent>
      </Card>

      {/* Make/Zapier */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Make / Zapier</CardTitle>
          <CardDescription>
            Connect to HCP, GHL, ServiceTitan, Jobber, and more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Webhook endpoints for CRM integration. Set up your Make/Zapier
            scenarios to trigger on job events.
          </p>
          <div className="mt-3 p-3 bg-muted rounded-lg font-mono text-xs break-all">
            POST {process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.vercel.app"}/api/webhooks/make
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
