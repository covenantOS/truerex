"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SERVICE_TYPES, SERVICE_TYPE_LABELS, VOICE_TONES, VOICE_TONE_LABELS } from "@/lib/constants";
import { toast } from "sonner";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Step 1 - Business basics
  const [businessName, setBusinessName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Step 2 - Voice profile
  const [voiceTone, setVoiceTone] = useState("friendly-professional");
  const [voiceSample, setVoiceSample] = useState("");
  const [brandKeywords, setBrandKeywords] = useState("");

  async function handleComplete() {
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }

    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Create business
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .insert({
        name: businessName,
        slug: slug + "-" + Date.now().toString(36),
        service_type: serviceType,
        phone,
        city,
        state,
        voice_tone: voiceTone,
        voice_samples: voiceSample ? [voiceSample] : [],
        brand_keywords: brandKeywords
          ? brandKeywords.split(",").map((k: string) => k.trim())
          : [],
      })
      .select()
      .single();

    if (bizError) {
      toast.error("Failed to create business: " + bizError.message);
      setLoading(false);
      return;
    }

    // Create user profile
    const { error: userError } = await supabase.from("users").insert({
      id: user.id,
      business_id: business!.id,
      full_name: user.user_metadata.full_name || user.email || "Owner",
      email: user.email!,
      role: "owner",
    });

    if (userError) {
      toast.error("Failed to create profile: " + userError.message);
      setLoading(false);
      return;
    }

    toast.success("You're all set! Let's capture your first job.");
    router.push("/capture");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Set Up Your Business</CardTitle>
          <CardDescription>
            Step {step} of 2 — {step === 1 ? "Business details" : "Your voice & style"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bizName">Business Name</Label>
                <Input
                  id="bizName"
                  placeholder="Smith's Plumbing"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your trade" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {SERVICE_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Austin"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="TX"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                  />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!businessName || !serviceType}
              >
                Next
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Communication Style</Label>
                <p className="text-sm text-muted-foreground">
                  How do you talk to customers? This shapes how AI writes for you.
                </p>
                <Select value={voiceTone} onValueChange={setVoiceTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICE_TONES.map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {VOICE_TONE_LABELS[tone]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sample">Example Response (optional)</Label>
                <p className="text-sm text-muted-foreground">
                  Paste a review response or message you&apos;ve written. This teaches AI your voice.
                </p>
                <Textarea
                  id="sample"
                  placeholder="e.g. Hey thanks for the kind words! We had a blast working on your kitchen remodel. That tile backsplash came out fire 🔥 Hit us up anytime you need something done!"
                  rows={4}
                  value={voiceSample}
                  onChange={(e) => setVoiceSample(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">Brand Words (optional)</Label>
                <p className="text-sm text-muted-foreground">
                  Words/phrases you like to use, comma-separated.
                </p>
                <Input
                  id="keywords"
                  placeholder="top-notch, family-owned, no shortcuts"
                  value={brandKeywords}
                  onChange={(e) => setBrandKeywords(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  {loading ? "Setting up..." : "Launch TrueRex Local"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
