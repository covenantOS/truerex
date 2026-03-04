"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SERVICE_TYPE_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import {
  Loader2,
  Sparkles,
  RefreshCw,
  Check,
  MapPin,
  User,
  Phone,
  Mail,
  Camera,
  ArrowLeft,
  Globe,
  BookOpen,
  Share2,
  Star,
  Megaphone,
  Send,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface JobPhoto {
  id: string;
  photo_url: string;
  photo_type: string;
  sort_order: number;
  caption: string | null;
}

interface Job {
  id: string;
  title: string | null;
  service_type: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  raw_notes: string | null;
  ai_story: string | null;
  ai_story_approved: boolean;
  status: string;
  gbp_posted: boolean;
  blog_posted: boolean;
  review_requested: boolean;
  neighborhood_campaign_sent: boolean;
  created_at: string;
  job_photos: JobPhoto[];
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { business } = useBusiness();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editedStory, setEditedStory] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/jobs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data);
        setEditedStory(data.ai_story || "");
      } else {
        toast.error("Failed to load job");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleGenerate(regenerate = false) {
    setGenerating(true);
    try {
      const res = await fetch(`/api/jobs/${id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Generation failed");
        return;
      }

      const { story } = await res.json();
      setJob((prev) => (prev ? { ...prev, ai_story: story, ai_story_approved: false } : prev));
      setEditedStory(story);
      toast.success(regenerate ? "New version generated!" : "Story generated!");
    } catch {
      toast.error("Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function handleApprove() {
    setSaving(true);
    const supabase = createClient();
    const storyToSave = editing ? editedStory : job?.ai_story;

    const { error } = await supabase
      .from("jobs")
      .update({
        ai_story: storyToSave,
        ai_story_approved: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to save");
    } else {
      setJob((prev) =>
        prev ? { ...prev, ai_story: storyToSave || null, ai_story_approved: true } : prev
      );
      setEditing(false);
      toast.success("Story approved! Ready for publishing.");
    }
    setSaving(false);
  }

  async function handleMarkComplete() {
    const supabase = createClient();
    const { error } = await supabase
      .from("jobs")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update");
    } else {
      setJob((prev) => (prev ? { ...prev, status: "completed" } : prev));
      toast.success("Job marked as completed!");
    }
  }

  async function handlePostToGBP() {
    if (!business || !job) return;
    setActionLoading("gbp");

    const supabase = createClient();
    // Save to content_posts
    const { error } = await supabase.from("content_posts").insert({
      business_id: business.id,
      job_id: job.id,
      platform: "gbp",
      content_type: "post",
      title: job.title,
      body: job.ai_story || "",
      status: "published",
      published_at: new Date().toISOString(),
    });

    if (!error) {
      await supabase
        .from("jobs")
        .update({ gbp_posted: true })
        .eq("id", id);
      setJob((prev) => (prev ? { ...prev, gbp_posted: true } : prev));
      toast.success("Posted to GBP!");
    } else {
      toast.error("Failed: " + error.message);
    }
    setActionLoading(null);
  }

  async function handleGenerateBlog() {
    if (!business || !job) return;
    setActionLoading("blog");

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "blog_post",
          business_id: business.id,
          job_id: job.id,
        }),
      });

      if (!res.ok) throw new Error("Blog generation failed");
      const result = await res.json();

      const supabase = createClient();
      await supabase.from("content_posts").insert({
        business_id: business.id,
        job_id: job.id,
        platform: "wordpress",
        content_type: "blog",
        title: result.title,
        body: result.body,
        status: "draft",
      });

      await supabase
        .from("jobs")
        .update({ blog_posted: true })
        .eq("id", id);

      setJob((prev) => (prev ? { ...prev, blog_posted: true } : prev));
      toast.success("Blog post generated and saved as draft!");
    } catch {
      toast.error("Blog generation failed");
    }
    setActionLoading(null);
  }

  async function handleRequestReview() {
    if (!job) return;
    setActionLoading("review");

    try {
      const res = await fetch("/api/reviews/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: job.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to send review request");
        setActionLoading(null);
        return;
      }

      setJob((prev) => (prev ? { ...prev, review_requested: true } : prev));
      toast.success("Review request sent!");
    } catch {
      toast.error("Failed to send");
    }
    setActionLoading(null);
  }

  async function handleCreateCampaign() {
    if (!business || !job) return;
    setActionLoading("campaign");

    const supabase = createClient();
    const { error } = await supabase.from("neighborhood_campaigns").insert({
      business_id: business.id,
      job_id: job.id,
      campaign_type: "post_job",
      radius_miles: 0.5,
      status: "draft",
    });

    if (!error) {
      await supabase
        .from("jobs")
        .update({ neighborhood_campaign_sent: true })
        .eq("id", id);
      setJob((prev) => (prev ? { ...prev, neighborhood_campaign_sent: true } : prev));
      toast.success("Neighborhood campaign created! Go to Campaigns to configure.");
    } else {
      toast.error("Failed: " + error.message);
    }
    setActionLoading(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!job) {
    return <p className="text-muted-foreground">Job not found</p>;
  }

  const location = [job.address, job.city, job.state, job.zip]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {job.title || SERVICE_TYPE_LABELS[job.service_type] || "Job"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date(job.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {job.status !== "completed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkComplete}
              className="gap-1"
            >
              <CheckCircle2 className="w-3 h-3" />
              Mark Complete
            </Button>
          )}
          <Badge variant={job.status === "completed" ? "default" : "secondary"}>
            {job.status}
          </Badge>
        </div>
      </div>

      {/* Job Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{location}</span>
          </div>
          {job.customer_name && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{job.customer_name}</span>
            </div>
          )}
          {job.customer_phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{job.customer_phone}</span>
            </div>
          )}
          {job.customer_email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{job.customer_email}</span>
            </div>
          )}
          {job.raw_notes && (
            <>
              <Separator className="my-2" />
              <p className="text-muted-foreground text-xs uppercase font-medium">
                Technician Notes
              </p>
              <p className="whitespace-pre-wrap">{job.raw_notes}</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Photos */}
      {job.job_photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Photos ({job.job_photos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {job.job_photos
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || photo.photo_type}
                      className="object-cover w-full h-full"
                    />
                    <Badge className="absolute top-1 left-1 text-[10px]" variant="secondary">
                      {photo.photo_type}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Story */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI-Generated Story
          </CardTitle>
          <CardDescription>
            {job.ai_story
              ? job.ai_story_approved
                ? "Approved and ready for publishing"
                : "Review the story, edit if needed, then approve"
              : "Generate a story from the job notes"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {job.ai_story ? (
            <>
              {editing ? (
                <Textarea
                  value={editedStory}
                  onChange={(e) => setEditedStory(e.target.value)}
                  rows={6}
                  className="text-sm"
                />
              ) : (
                <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                  {job.ai_story}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {!job.ai_story_approved && (
                  <>
                    <Button size="sm" onClick={handleApprove} disabled={saving} className="gap-1">
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(!editing);
                        if (!editing) setEditedStory(job.ai_story || "");
                      }}
                    >
                      {editing ? "Cancel Edit" : "Edit"}
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerate(true)}
                  disabled={generating}
                  className="gap-1"
                >
                  {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Regenerate
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={() => handleGenerate(false)}
              disabled={generating || !job.raw_notes}
              className="gap-2"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Generating..." : "Generate Story"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Content Pipeline Actions */}
      {job.ai_story_approved && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content Pipeline</CardTitle>
            <CardDescription>Publish this story across your channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* GBP */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Google Business Profile</span>
                </div>
                {job.gbp_posted ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Posted
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePostToGBP}
                    disabled={actionLoading === "gbp"}
                    className="gap-1"
                  >
                    {actionLoading === "gbp" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    Post
                  </Button>
                )}
              </div>

              <Separator />

              {/* Blog */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">WordPress Blog</span>
                </div>
                {job.blog_posted ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Draft Saved
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateBlog}
                    disabled={actionLoading === "blog"}
                    className="gap-1"
                  >
                    {actionLoading === "blog" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Generate Blog
                  </Button>
                )}
              </div>

              <Separator />

              {/* Review Request */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Review Request</span>
                    {!job.customer_phone && !job.customer_email && (
                      <p className="text-xs text-muted-foreground">No customer contact info</p>
                    )}
                  </div>
                </div>
                {job.review_requested ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Sent
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRequestReview}
                    disabled={actionLoading === "review" || (!job.customer_phone && !job.customer_email)}
                    className="gap-1"
                  >
                    {actionLoading === "review" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    Send Request
                  </Button>
                )}
              </div>

              <Separator />

              {/* Neighborhood Campaign */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Megaphone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Neighborhood Campaign</span>
                </div>
                {job.neighborhood_campaign_sent ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Created
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCreateCampaign}
                    disabled={actionLoading === "campaign"}
                    className="gap-1"
                  >
                    {actionLoading === "campaign" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Megaphone className="w-3 h-3" />}
                    Create
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
