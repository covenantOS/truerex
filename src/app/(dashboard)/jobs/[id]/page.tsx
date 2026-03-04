"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  created_at: string;
  job_photos: JobPhoto[];
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editedStory, setEditedStory] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

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
        <div>
          <h1 className="text-2xl font-bold">
            {job.title || SERVICE_TYPE_LABELS[job.service_type] || "Job"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date(job.created_at).toLocaleDateString()}
          </p>
        </div>
        <Badge className="ml-auto" variant={job.status === "completed" ? "default" : "secondary"}>
          {job.status}
        </Badge>
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
                    <Badge
                      className="absolute top-1 left-1 text-[10px]"
                      variant="secondary"
                    >
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
              : "Generate a GBP post from the job notes"}
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
                    <Button
                      size="sm"
                      onClick={handleApprove}
                      disabled={saving}
                      className="gap-1"
                    >
                      {saving ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
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
                  {generating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
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
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generating ? "Generating..." : "Generate Story"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Content Pipeline Status */}
      {job.ai_story_approved && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content Pipeline</CardTitle>
            <CardDescription>Where this story has been published</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Google Business Profile</span>
                <Badge variant={job.status === "completed" ? "outline" : "secondary"}>
                  Ready
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>WordPress Blog</span>
                <Badge variant="secondary">Phase 5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Social Media</span>
                <Badge variant="secondary">Phase 8</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Review Request</span>
                <Badge variant="secondary">Phase 4</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Neighborhood Campaign</span>
                <Badge variant="secondary">Phase 7</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
