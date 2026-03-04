"use client";

import { useState, useCallback } from "react";

interface Coords {
  lat: number;
  lng: number;
}

export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = useCallback((): Promise<Coords | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError("Geolocation not supported");
        resolve(null);
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const c = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoords(c);
          setLoading(false);
          resolve(c);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  return { coords, loading, error, getCurrentPosition };
}
