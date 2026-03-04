"use client";

import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Copy, Users, MousePointerClick, Handshake } from "lucide-react";

interface Referral {
  id: string;
  referrer_name: string;
  referrer_email: string | null;
  referrer_phone: string | null;
  referral_code: string;
  referral_link: string;
  clicks: number;
  signups: number;
  conversions: number;
  reward_status: string;
  reward_value: number | null;
  created_at: string;
}

export default function ReferralsPage() {
  const { business } = useBusiness();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // New referral form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    loadReferrals();
  }, []);

  async function loadReferrals() {
    const supabase = createClient();
    const { data } = await supabase
      .from("referrals")
      .select("*")
      .order("created_at", { ascending: false });
    setReferrals(data || []);
    setLoading(false);
  }

  async function handleCreateReferral() {
    if (!business || !name) return;
    setSaving(true);

    const code = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 8) + Math.random().toString(36).slice(2, 6);

    const link = `${window.location.origin}/ref/${code}`;

    const supabase = createClient();
    const { error } = await supabase.from("referrals").insert({
      business_id: business.id,
      referrer_name: name,
      referrer_email: email || null,
      referrer_phone: phone || null,
      referral_code: code,
      referral_link: link,
      reward_type: "discount",
      reward_value: 25,
    });

    if (error) {
      toast.error("Failed to create referral: " + error.message);
    } else {
      toast.success("Referral link created!");
      setDialogOpen(false);
      setName("");
      setEmail("");
      setPhone("");
      loadReferrals();
    }
    setSaving(false);
  }

  function copyLink(link: string) {
    navigator.clipboard.writeText(link);
    toast.success("Link copied!");
  }

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
          <h1 className="text-2xl font-bold">Referrals</h1>
          <p className="text-sm text-muted-foreground">
            Track referral links and reward your advocates
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> New Referral
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Referral Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Referrer Name</Label>
                <Input
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email (optional)</Label>
                <Input
                  type="email"
                  placeholder="john@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone (optional)</Label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCreateReferral}
                disabled={saving || !name}
                className="w-full"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : null}
                Create Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {referrals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Users className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              No referral links yet. Create one for a happy customer to start tracking referrals.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {referrals.map((ref) => (
            <Card key={ref.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{ref.referrer_name}</CardTitle>
                  <Badge
                    variant={
                      ref.reward_status === "paid"
                        ? "default"
                        : ref.reward_status === "earned"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {ref.reward_status}
                    {ref.reward_value ? ` ($${ref.reward_value})` : ""}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-0.5 rounded">
                    {ref.referral_code}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => copyLink(ref.referral_link)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <MousePointerClick className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xl font-bold">{ref.clicks}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Clicks</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xl font-bold">{ref.signups}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Signups</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <Handshake className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xl font-bold">{ref.conversions}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Converted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
