"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Camera } from "lucide-react";

interface Photo {
  id: string;
  photo_url: string;
  photo_type: string;
  caption: string | null;
  job_id: string;
  created_at: string;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("job_photos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      setPhotos(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Photo Gallery</h1>
        <p className="text-sm text-muted-foreground">
          Before/during/after photos from all your jobs
        </p>
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
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.photo_url}
                alt={photo.caption || photo.photo_type}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform"
              />
              <Badge
                className="absolute top-2 left-2 text-[10px]"
                variant="secondary"
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
          ))}
        </div>
      )}
    </div>
  );
}
