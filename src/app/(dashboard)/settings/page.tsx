"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VOICE_TONES, VOICE_TONE_LABELS, SERVICE_TYPES, SERVICE_TYPE_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export default function SettingsPage() {
  const { business, loading: bizLoading } = useBusiness();
  const [saving, setSaving] = useState(false);

  // Local state mirrors business fields
  const [name, setName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [voiceTone, setVoiceTone] = useState("friendly-professional");
  const [voiceSample, setVoiceSample] = useState("");
  const [brandKeywords, setBrandKeywords] = useState("");
  const [avoidKeywords, setAvoidKeywords] = useState("");
  const [autoPostGbp, setAutoPostGbp] = useState(true);
  const [autoRespondReviews, setAutoRespondReviews] = useState(false);
  const [reviewDelay, setReviewDelay] = useState("2");

  // Initialize from business when it loads
  useEffect(() => {
    if (business) {
      setName(business.name);
      setServiceType(business.service_type);
      setPhone(business.phone || "");
      setEmail(business.email || "");
      setWebsiteUrl(business.website_url || "");
      setVoiceTone(business.voice_tone);
      setVoiceSample(
        Array.isArray(business.voice_samples)
          ? (business.voice_samples as string[]).join("\n---\n")
          : ""
      );
      setBrandKeywords(business.brand_keywords?.join(", ") || "");
      setAvoidKeywords(business.avoid_keywords?.join(", ") || "");
      setAutoPostGbp(business.auto_post_gbp);
      setAutoRespondReviews(business.auto_respond_reviews);
      setReviewDelay(business.review_request_delay_hours.toString());
    }
  }, [business]);

  async function handleSave() {
    if (!business) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("businesses")
      .update({
        name,
        service_type: serviceType,
        phone: phone || null,
        email: email || null,
        website_url: websiteUrl || null,
        voice_tone: voiceTone,
        voice_samples: voiceSample
          ? voiceSample.split("---").map((s) => s.trim())
          : [],
        brand_keywords: brandKeywords
          ? brandKeywords.split(",").map((k) => k.trim())
          : [],
        avoid_keywords: avoidKeywords
          ? avoidKeywords.split(",").map((k) => k.trim())
          : [],
        auto_post_gbp: autoPostGbp,
        auto_respond_reviews: autoRespondReviews,
        review_request_delay_hours: parseInt(reviewDelay),
      })
      .eq("id", business.id);

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Settings saved");
    }
    setSaving(false);
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
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle>Business Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Service Type</Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {SERVICE_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Website URL</Label>
            <Input
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yoursite.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Voice Profile */}
      <Card>
        <CardHeader>
          <CardTitle>AI Voice Profile</CardTitle>
          <CardDescription>
            This shapes how AI writes for you. The more you customize, the less generic it sounds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Communication Style</Label>
            <Select value={voiceTone} onValueChange={setVoiceTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VOICE_TONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {VOICE_TONE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Voice Samples</Label>
            <p className="text-xs text-muted-foreground">
              Paste 1-5 example review responses or messages you&apos;ve written. Separate with ---
            </p>
            <Textarea
              value={voiceSample}
              onChange={(e) => setVoiceSample(e.target.value)}
              rows={6}
              placeholder="Hey thanks so much! We really enjoyed this project..."
            />
          </div>
          <div className="space-y-2">
            <Label>Words/Phrases You Use</Label>
            <Input
              value={brandKeywords}
              onChange={(e) => setBrandKeywords(e.target.value)}
              placeholder="top-notch, family-owned, no shortcuts"
            />
          </div>
          <div className="space-y-2">
            <Label>Words/Phrases to AVOID</Label>
            <Input
              value={avoidKeywords}
              onChange={(e) => setAvoidKeywords(e.target.value)}
              placeholder="synergy, leverage, cutting-edge"
            />
          </div>
        </CardContent>
      </Card>

      {/* Automation */}
      <Card>
        <CardHeader>
          <CardTitle>Automation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Auto-post to GBP</p>
              <p className="text-xs text-muted-foreground">
                Automatically post job stories to Google Business Profile
              </p>
            </div>
            <Switch checked={autoPostGbp} onCheckedChange={setAutoPostGbp} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Auto-respond to reviews</p>
              <p className="text-xs text-muted-foreground">
                AI generates and posts review responses automatically
              </p>
            </div>
            <Switch
              checked={autoRespondReviews}
              onCheckedChange={setAutoRespondReviews}
            />
          </div>
          <div className="space-y-2">
            <Label>Review request delay (hours after job)</Label>
            <Input
              type="number"
              min="0"
              max="72"
              value={reviewDelay}
              onChange={(e) => setReviewDelay(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="gap-2">
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Save Settings
      </Button>
    </div>
  );
}
