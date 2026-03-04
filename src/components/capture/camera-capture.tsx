"use client";

import { useState } from "react";
import Image from "next/image";
import { useCamera, type CapturedPhoto } from "@/hooks/use-camera";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PHOTO_TYPES } from "@/lib/constants";

type PhotoType = (typeof PHOTO_TYPES)[number];

interface CameraCaptureProps {
  photos: CapturedPhoto[];
  onPhotosChange: (photos: CapturedPhoto[]) => void;
}

export function CameraCapture({ photos, onPhotosChange }: CameraCaptureProps) {
  const { capturePhoto, selectPhotos } = useCamera();
  const [activeType, setActiveType] = useState<PhotoType>("before");

  async function handleCapture() {
    const photo = await capturePhoto();
    if (photo) {
      onPhotosChange([...photos, { ...photo, type: activeType }]);
    }
  }

  async function handleSelect() {
    const selected = await selectPhotos();
    const typed = selected.map((p) => ({ ...p, type: activeType }));
    onPhotosChange([...photos, ...typed]);
  }

  function removePhoto(index: number) {
    const updated = [...photos];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    onPhotosChange(updated);
  }

  function cycleType(index: number) {
    const types: PhotoType[] = ["before", "during", "after"];
    const current = types.indexOf(photos[index].type);
    const next = types[(current + 1) % types.length];
    const updated = [...photos];
    updated[index] = { ...updated[index], type: next };
    onPhotosChange(updated);
  }

  const typeColors: Record<PhotoType, string> = {
    before: "bg-amber-500",
    during: "bg-blue-500",
    after: "bg-green-500",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Photos</h3>
        <div className="flex gap-1">
          {(["before", "during", "after"] as PhotoType[]).map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                "text-xs px-2 py-1 rounded-full capitalize transition-colors",
                activeType === type
                  ? `${typeColors[type]} text-white`
                  : "bg-muted text-muted-foreground"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <Image
              src={photo.preview}
              alt={`Job photo ${i + 1}`}
              fill
              className="object-cover"
            />
            <button
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"
            >
              <X className="w-3 h-3 text-white" />
            </button>
            <button onClick={() => cycleType(i)} className="absolute bottom-1 left-1">
              <Badge className={cn("text-[10px] capitalize", typeColors[photo.type])}>
                {photo.type}
              </Badge>
            </button>
          </div>
        ))}

        {/* Add buttons */}
        <button
          onClick={handleCapture}
          className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors"
        >
          <Camera className="w-5 h-5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Camera</span>
        </button>
        <button
          onClick={handleSelect}
          className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors"
        >
          <ImageIcon className="w-5 h-5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Gallery</span>
        </button>
      </div>

      {photos.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Tap Camera to snap a photo or Gallery to select from your phone
        </p>
      )}
    </div>
  );
}
