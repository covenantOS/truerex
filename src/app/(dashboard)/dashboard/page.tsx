"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  BookOpen,
  Share2,
  Megaphone,
  Users,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { SERVICE_TYPE_LABELS } from "@/lib/constants";

interface Stats {
  totalJobs: number;
  completedJobs: number;
  gbpPosts: number;
  reviewsRequested: number;
  totalReviews: number;
  contentPosts: number;
  campaigns: number;
  referrals: number;
}

interface RecentJob {
  id: string;
  title: string | null;
  address: string;
  city: string | null;
  service_type: string;
  status: string;
  ai_story_approved: boolean;
  gbp_posted: boolean;
  review_requested: boolean;
  created_at: string;
}

interface RecentReview {
  id: string;
  reviewer_name: string | null;
  rating: number | null;
  source: string;
  response_status: string;
  created_at: string;
}

export default function DashboardPage() {
  const { business, loading: bizLoading } = useBusiness();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business) return;

    async function loadAll() {
      const supabase = createClient();

      const [
        { count: totalJobs },
        { count: completedJobs },
        { count: gbpPosts },
        { count: reviewsRequested },
        { count: totalReviews },
        { count: contentPosts },
        { count: campaigns },
        { count: referrals },
        { data: jobs },
        { data: reviews },
      ] = await Promise.all([
        supabase.from("jobs").select("*", { count: "exact", head: true }).eq("business_id", business!.id),
        supabase.from("jobs").select("*", { count: "exact", head: true }).eq("business_id", business!.id).eq("status", "completed"),
        supabase.from("jobs").select("*", { count: "exact", head: true }).eq("business_id", business!.id).eq("gbp_posted", true),
        supabase.from("jobs").select("*", { count: "exact", head: true }).eq("business_id", business!.id).eq("review_requested", true),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase.from("content_posts").select("*", { count: "exact", head: true }),
        supabase.from("neighborhood_campaigns").select("*", { count: "exact", head: true }),
        supabase.from("referrals").select("*", { count: "exact", head: true }),
        supabase.from("jobs").select("id, title, address, city, service_type, status, ai_story_approved, gbp_posted, review_requested, created_at").eq("business_id", business!.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("reviews").select("id, reviewer_name, rating, source, response_status, created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        totalJobs: totalJobs || 0,
        completedJobs: completedJobs || 0,
        gbpPosts: gbpPosts || 0,
        reviewsRequested: reviewsRequested || 0,
        totalReviews: totalReviews || 0,
        contentPosts: contentPosts || 0,
        campaigns: campaigns || 0,
        referrals: referrals || 0,
      });
      setRecentJobs(jobs || []);
      setRecentReviews(reviews || []);
      setLoading(false);
    }

    loadAll();
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
    { label: "Reviews", value: stats?.totalReviews || 0, icon: Star, color: "text-yellow-600 bg-yellow-50" },
    { label: "Content", value: stats?.contentPosts || 0, icon: Share2, color: "text-purple-600 bg-purple-50" },
    { label: "Campaigns", value: stats?.campaigns || 0, icon: Megaphone, color: "text-pink-600 bg-pink-50" },
    { label: "Referrals", value: stats?.referrals || 0, icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { label: "Review Reqs", value: stats?.reviewsRequested || 0, icon: MessageSquare, color: "text-teal-600 bg-teal-50" },
  ];

  const quickSetup = [
    { condition: !business?.gbp_account_id, icon: Globe, label: "Connect Google Business Profile", desc: "Auto-post jobs and manage reviews", href: "/settings/integrations" },
    { condition: !business?.wp_site_url, icon: BookOpen, label: "Connect WordPress Site", desc: "Auto-generate blog posts and case studies", href: "/settings/integrations" },
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
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
                <div className="flex-1 min-w-0">
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

      {/* Two columns: Recent Jobs + Recent Reviews */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Jobs</CardTitle>
              <Link href="/jobs">
                <Button size="sm" variant="ghost" className="gap-1 text-xs">
                  View All <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No jobs yet. Capture your first job to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <div className="flex items-center gap-3 py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {job.title || job.address}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{SERVICE_TYPE_LABELS[job.service_type] || job.service_type}</span>
                          {job.city && <span>&middot; {job.city}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {job.gbp_posted && <Badge variant="outline" className="text-[9px] px-1.5">GBP</Badge>}
                        {job.review_requested && <Badge variant="outline" className="text-[9px] px-1.5">Review</Badge>}
                        <Badge variant={job.status === "completed" ? "default" : "secondary"} className="text-[9px]">
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Reviews</CardTitle>
              <Link href="/reviews">
                <Button size="sm" variant="ghost" className="gap-1 text-xs">
                  View All <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No reviews yet. Connect your GBP to start syncing.
              </p>
            ) : (
              <div className="space-y-3">
                {recentReviews.map((review) => (
                  <div key={review.id} className="flex items-center gap-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {review.reviewer_name || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < (review.rating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1.5">
                          {review.source}
                        </Badge>
                      </div>
                    </div>
                    <Badge
                      variant={
                        review.response_status === "posted"
                          ? "default"
                          : review.response_status === "drafted"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-[9px] shrink-0"
                    >
                      {review.response_status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
