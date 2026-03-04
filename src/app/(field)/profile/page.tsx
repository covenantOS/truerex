"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SERVICE_TYPE_LABELS, VOICE_TONE_LABELS } from "@/lib/constants";
import { LogOut, Settings, Building2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { business, user, loading } = useBusiness();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-bold">Profile</h1>

      {user && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{user.full_name}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>{user.email}</p>
            <p className="capitalize">{user.role}</p>
          </CardContent>
        </Card>
      )}

      {business && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {business.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>{SERVICE_TYPE_LABELS[business.service_type] || business.service_type}</p>
            {business.city && (
              <p>
                {business.city}, {business.state}
              </p>
            )}
            <p>Voice: {VOICE_TONE_LABELS[business.voice_tone] || business.voice_tone}</p>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="space-y-2">
        <Link href="/dashboard/settings">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Settings className="w-4 h-4" /> Settings & Integrations
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
