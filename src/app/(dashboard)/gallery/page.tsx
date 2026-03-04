"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Camera, ArrowLeftRight, Grid3X3, Layers } from "lucide-react";
import Link from "next/link";

interface Photo {
  id: string;
  photo_url: string;
  photo_type: string;
  caption: string | null;
  job_id: string;
  sort_order: number;
  created_at: string;
}

interface JobPhotoPair {
  jobId: string;
  before: Photo | null;
  after: Photo | null;
  all: Photo[];
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "compare">("grid");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("job_photos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      setPhotos(data || []);
      setLoading(false);
    }
    load();
  }, []);

  // Group photos by job for before/after comparison
  const jobPairs: JobPhotoPair[] = [];
  const jobMap = new Map<string, Photo[]>();
  photos.forEach((p) => {
    const existing = jobMap.get(p.job_id) || [];
    existing.push(p);
    jobMap.set(p.job_id, existing);
  });
  jobMap.forEach((jobPhotos, jobId) => {
    const before = jobPhotos.find((p) => p.photo_type === "before") || null;
    const after = jobPhotos.find((p) => p.photo_type === "after") || null;
    if (before || after) {
      jobPairs.push({ jobId, before, after, all: jobPhotos });
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Photo Gallery</h1>
          <p className="text-sm text-muted-foreground">
            Before/during/after photos from all your jobs
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={view === "grid" ? "default" : "outline"}
            onClick={() => setView("grid")}
            className="gap-1"
          >
            <Grid3X3 className="w-3 h-3" /> Grid
          </Button>
          <Button
            size="sm"
            variant={view === "compare" ? "default" : "outline"}
            onClick={() => setView("compare")}
            className="gap-1"
          >
            <Layers className="w-3 h-3" /> Compare
          </Button>
        </div>
      </div>

      {photos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Camera className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              No photos yet. Capture your first job to start building your portfolio.
            </p>
          </CardContent>
        </Card>
      ) : view === "compare" ? (
        /* Before/After Comparison View */
        <div className="space-y-6">
          {jobPairs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No before/after pairs found. Tag photos as &ldquo;before&rdquo; and &ldquo;after&rdquo; when capturing jobs.
                </p>
              </CardContent>
            </Card>
          ) : (
            jobPairs.map((pair) => (
              <Link key={pair.jobId} href={`/jobs/${pair.jobId}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-2 gap-0 relative">
                      {/* Before */}
                      <div className="relative aspect-[4/3] bg-muted">
                        {pair.before ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={pair.before.photo_url}
                              alt="Before"
                              className="object-cover w-full h-full"
                            />
                            <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[10px]">
                              Before
                            </Badge>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No before photo
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
                        <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                      </div>

                      {/* After */}
                      <div className="relative aspect-[4/3] bg-muted">
                        {pair.after ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={pair.after.photo_url}
                              alt="After"
                              className="object-cover w-full h-full"
                            />
                            <Badge className="absolute top-2 right-2 bg-green-500 text-white text-[10px]">
                              After
                            </Badge>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No after photo
                          </div>
                        )}
                      </div>
                    </div>
                    {(pair.before?.caption || pair.after?.caption) && (
                      <div className="px-4 py-2 border-t">
                        <p className="text-xs text-muted-foreground truncate">
                          {pair.after?.caption || pair.before?.caption}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <Link key={photo.id} href={`/jobs/${photo.job_id}`}>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.photo_url}
                  alt={photo.caption || photo.photo_type}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                />
                <Badge
                  className={`absolute top-2 left-2 text-[10px] ${
                    photo.photo_type === "before"
                      ? "bg-red-500 text-white"
                      : photo.photo_type === "after"
                        ? "bg-green-500 text-white"
                        : ""
                  }`}
                  variant={photo.photo_type === "during" ? "secondary" : "default"}
                >
                  {photo.photo_type}
                </Badge>
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-white text-xs line-clamp-2">
                      {photo.caption}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
