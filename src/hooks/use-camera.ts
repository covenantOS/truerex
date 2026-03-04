"use client";

import { useRef, useCallback } from "react";

export interface CapturedPhoto {
  file: File;
  preview: string;
  type: "before" | "during" | "after";
}

export function useCamera() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const capturePhoto = useCallback((): Promise<CapturedPhoto | null> => {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const preview = URL.createObjectURL(file);
        resolve({ file, preview, type: "during" });
      };

      input.click();
      inputRef.current = input;
    });
  }, []);

  const selectPhotos = useCallback((): Promise<CapturedPhoto[]> => {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.multiple = true;

      input.onchange = (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        const photos = files.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
          type: "during" as const,
        }));
        resolve(photos);
      };

      input.click();
    });
  }, []);

  return { capturePhoto, selectPhotos };
}
