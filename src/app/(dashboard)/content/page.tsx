"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2,
  Globe,
  BookOpen,
  Share2,
  Sparkles,
  Check,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface ContentPost {
  id: string;
  platform: string;
  content_type: string;
  title: string | null;
  body: string;
  status: string;
  external_url: string | null;
  published_at: string | null;
  created_at: string;
  job_id: string | null;
}

interface Job {
  id: string;
  title: string | null;
  address: string;
  city: string | null;
  ai_story: string | null;
  ai_story_approved: boolean;
}

const PLATFORM_ICONS: Record<string, typeof Globe> = {
  gbp: Globe,
  wordpress: BookOpen,
  facebook: Share2,
  instagram: Share2,
  nextdoor: Share2,
};

const PLATFORM_LABELS: Record<string, string> = {
  gbp: "Google Business Profile",
  wordpress: "WordPress Blog",
  facebook: "Facebook",
  instagram: "Instagram",
  nextdoor: "Nextdoor",
};

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  scheduled: "bg-blue-100 text-blue-800",
  draft: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
};

export default function ContentPage() {
  const { business } = useBusiness();
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("gbp");
  const [previewContent, setPreviewContent] = useState<{
    title?: string;
    body: string;
    platform: string;
    jobId: string;
  } | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [savingPost, setSavingPost] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!business) return;
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  async function loadData() {
    const supabase = createClient();
    const [postsRes, jobsRes] = await Promise.all([
      supabase
        .from("content_posts")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("jobs")
        .select("id, title, address, city, ai_story, ai_story_approved")
        .eq("ai_story_approved", true)
        .order("created_at", { ascending: false }),
    ]);

    setPosts(postsRes.data || []);
    setJobs(jobsRes.data || []);
    if (jobsRes.data && jobsRes.data.length > 0 && !selectedJob) {
      setSelectedJob(jobsRes.data[0].id);
    }
    setLoading(false);
  }

  async function handleGenerate() {
    if (!business || !selectedJob) return;
    setGenerating(selectedPlatform);

    try {
      const job = jobs.find((j) => j.id === selectedJob);
      let result: { title?: string; body?: string; post?: string };

      if (selectedPlatform === "gbp") {
        if (!job?.ai_story) {
          toast.error("This job has no approved story yet");
          setGenerating(null);
          return;
        }
        result = { body: job.ai_story };
      } else if (selectedPlatform === "wordpress") {
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "blog_post",
            business_id: business.id,
            job_id: selectedJob,
          }),
        });
        if (!res.ok) throw new Error("Blog generation failed");
        result = await res.json();
      } else {
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "social_post",
            business_id: business.id,
            job_id: selectedJob,
            platform: selectedPlatform,
          }),
        });
        if (!res.ok) throw new Error("Social post generation failed");
        const data = await res.json();
        result = { body: data.post };
      }

      const body = result.body || result.post || "";
      setPreviewContent({
        title: result.title,
        body,
        platform: selectedPlatform,
        jobId: selectedJob,
      });
      setEditingBody(body);
      setEditingTitle(result.title || "");
      toast.success("Content generated!");
    } catch (err) {
      toast.error("Generation failed — check your OpenRouter API key");
      console.error(err);
    } finally {
      setGenerating(null);
    }
  }

  async function handleSavePost() {
    if (!business || !previewContent) return;
    setSavingPost(true);

    const supabase = createClient();
    const { error } = await supabase.from("content_posts").insert({
      business_id: business.id,
      job_id: previewContent.jobId,
      platform: previewContent.platform,
      content_type: previewContent.platform === "wordpress" ? "blog" : "post",
      title: editingTitle || null,
      body: editingBody,
      status: "draft",
    });

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Saved as draft!");
      setPreviewContent(null);
      loadData();
    }
    setSavingPost(false);
  }

  async function handlePublish(postId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("content_posts")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", postId);

    if (error) {
      toast.error("Failed to publish");
    } else {
      toast.success("Marked as published!");
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, status: "published", published_at: new Date().toISOString() }
            : p
        )
      );
    }
  }

  const filteredPosts =
    filter === "all" ? posts : posts.filter((p) => p.platform === filter);

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
        <h1 className="text-2xl font-bold">Content</h1>
        <p className="text-sm text-muted-foreground">
          AI-generated posts across all platforms — each unique, never duplicated
        </p>
      </div>

      {/* Generate New Content */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Content
          </CardTitle>
          <CardDescription>
            Pick a job with an approved story, choose a platform, and let AI write it
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No jobs with approved stories yet. Go to a job, generate a story, and approve it first.
            </p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Job</p>
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
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Platform</p>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gbp">Google Business Profile</SelectItem>
                      <SelectItem value="wordpress">WordPress Blog</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="nextdoor">Nextdoor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!!generating || !selectedJob}
                className="gap-2"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {generating ? "Generating..." : "Generate"}
              </Button>
            </>
          )}

          {/* Preview */}
          {previewContent && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Preview — {PLATFORM_LABELS[previewContent.platform]}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={!!generating}
                  className="gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </Button>
              </div>

              {(previewContent.platform === "wordpress" || previewContent.platform === "gbp") && (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  placeholder="Post title"
                  className="w-full text-sm font-medium bg-white border rounded-md px-3 py-2"
                />
              )}

              <Textarea
                value={editingBody}
                onChange={(e) => setEditingBody(e.target.value)}
                rows={6}
                className="text-sm"
              />

              <div className="flex gap-2">
                <Button size="sm" onClick={handleSavePost} disabled={savingPost} className="gap-1">
                  {savingPost ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Save as Draft
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPreviewContent(null)}>
                  Discard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      {posts.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {["all", "gbp", "wordpress", "facebook", "instagram", "nextdoor"].map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="text-xs"
            >
              {f === "all" ? "All" : PLATFORM_LABELS[f] || f}
              {f !== "all" && (
                <span className="ml-1 text-[10px] opacity-70">
                  ({posts.filter((p) => p.platform === f).length})
                </span>
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Posts List */}
      {filteredPosts.length === 0 && posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Globe className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              No content yet. Generate your first post above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const Icon = PLATFORM_ICONS[post.platform] || Globe;
            return (
              <Card key={post.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <CardTitle className="text-base">
                        {post.title || PLATFORM_LABELS[post.platform] || post.platform}
                      </CardTitle>
                    </div>
                    <Badge className={STATUS_COLORS[post.status] || ""} variant="secondary">
                      {post.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {PLATFORM_LABELS[post.platform]} &middot; {post.content_type}
                    {post.published_at && ` \u00B7 ${new Date(post.published_at).toLocaleDateString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm line-clamp-3 whitespace-pre-wrap">{post.body}</p>
                  <div className="flex gap-2">
                    {post.status === "draft" && (
                      <Button size="sm" onClick={() => handlePublish(post.id)} className="gap-1">
                        <Check className="w-3 h-3" />
                        Mark Published
                      </Button>
                    )}
                    {post.external_url && (
                      <a href={post.external_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="gap-1">
                          <ExternalLink className="w-3 h-3" />
                          View Live
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
