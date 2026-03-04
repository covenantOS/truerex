"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Star,
  MapPin,
  TrendingUp,
  Loader2,
  ArrowRight,
  Camera,
  Zap,
  MessageSquare,
  Globe,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  totalJobs: number;
  completedJobs: number;
  gbpPosts: number;
  reviewsRequested: number;
}

export default function DashboardPage() {
  const { business, loading: bizLoading } = useBusiness();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business) return;

    async function loadStats() {
      const supabase = createClient();

      const [
        { count: totalJobs },
        { count: completedJobs },
        { count: gbpPosts },
        { count: reviewsRequested },
      ] = await Promise.all([
        supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("business_id", business!.id),
        supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("business_id", business!.id)
          .eq("status", "completed"),
        supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("business_id", business!.id)
          .eq("gbp_posted", true),
        supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("business_id", business!.id)
          .eq("review_requested", true),
      ]);

      setStats({
        totalJobs: totalJobs || 0,
        completedJobs: completedJobs || 0,
        gbpPosts: gbpPosts || 0,
        reviewsRequested: reviewsRequested || 0,
      });
      setLoading(false);
    }

    loadStats();
  }, [business]);

  if (bizLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Jobs", value: stats?.totalJobs || 0, icon: ClipboardList, color: "text-blue-600 bg-blue-50" },
    { label: "Completed", value: stats?.completedJobs || 0, icon: TrendingUp, color: "text-green-600 bg-green-50" },
    { label: "GBP Posts", value: stats?.gbpPosts || 0, icon: MapPin, color: "text-orange-600 bg-orange-50" },
    { label: "Reviews Sent", value: stats?.reviewsRequested || 0, icon: Star, color: "text-yellow-600 bg-yellow-50" },
  ];

  const quickSetup = [
    { condition: !business?.gbp_account_id, icon: Globe, label: "Connect Google Business Profile", desc: "Auto-post jobs and manage reviews", href: "/settings/integrations" },
    { condition: !business?.wp_site_url, icon: Globe, label: "Connect WordPress Site", desc: "Auto-generate blog posts and case studies", href: "/settings/integrations" },
    { condition: !business?.blooio_number, icon: MessageSquare, label: "Set Up Review Requests", desc: "Auto-text customers for reviews via iMessage", href: "/settings/integrations" },
  ].filter((s) => s.condition);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back{business?.name ? `, ${business.name}` : ""}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s what&apos;s happening with your business
          </p>
        </div>
        <Link href="/capture">
          <Button className="gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-black font-bold shadow-sm">
            <Camera className="w-4 h-4" /> Capture Job
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
                <Icon className="w-[18px] h-[18px]" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick setup prompts */}
      {quickSetup.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Finish Setup
          </h2>
          <div className="space-y-2">
            {quickSetup.map(({ icon: Icon, label, desc, href }) => (
              <div
                key={label}
                className="flex items-center gap-4 bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-[#F5F5F5] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Link href={href}>
                  <Button size="sm" variant="outline" className="gap-1 shrink-0">
                    Connect <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/capture" className="group">
          <div className="bg-gradient-to-br from-[#000000] to-[#1A1A1A] rounded-xl p-6 text-white hover:shadow-lg transition-shadow">
            <Camera className="w-8 h-8 mb-3 opacity-80" />
            <h3 className="font-bold mb-1">Capture a Job</h3>
            <p className="text-sm text-white/60">Snap photos, tell the story, let AI do the rest</p>
            <ArrowRight className="w-4 h-4 mt-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link href="/reviews" className="group">
          <div className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
            <Star className="w-8 h-8 mb-3 text-yellow-500" />
            <h3 className="font-bold mb-1">Manage Reviews</h3>
            <p className="text-sm text-muted-foreground">Respond with AI, track review velocity</p>
            <ArrowRight className="w-4 h-4 mt-3 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link href="/campaigns" className="group">
          <div className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
            <Zap className="w-8 h-8 mb-3 text-[#FFD700]" />
            <h3 className="font-bold mb-1">Neighborhood Targeting</h3>
            <p className="text-sm text-muted-foreground">Text and mail neighbors near job sites</p>
            <ArrowRight className="w-4 h-4 mt-3 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  );
}
