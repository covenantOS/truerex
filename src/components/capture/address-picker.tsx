"use client";

import { useState } from "react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, Locate, Loader2 } from "lucide-react";

interface AddressPickerProps {
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lng: number | null;
  onAddressChange: (fields: {
    address: string;
    city: string;
    state: string;
    zip: string;
    lat: number | null;
    lng: number | null;
  }) => void;
}

export function AddressPicker({
  address,
  city,
  state,
  zip,
  lat,
  lng,
  onAddressChange,
}: AddressPickerProps) {
  const { loading: geoLoading, getCurrentPosition } = useGeolocation();
  const [reverseLoading, setReverseLoading] = useState(false);

  async function handleAutoLocate() {
    const coords = await getCurrentPosition();
    if (!coords) return;

    onAddressChange({ address, city, state, zip, lat: coords.lat, lng: coords.lng });

    // Try reverse geocoding with Google Maps (if API key available)
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      setReverseLoading(true);
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${apiKey}`
        );
        const data = await res.json();
        if (data.results?.[0]) {
          const result = data.results[0];
          const components = result.address_components || [];

          const streetNumber =
            components.find((c: { types: string[] }) => c.types.includes("street_number"))
              ?.long_name || "";
          const route =
            components.find((c: { types: string[] }) => c.types.includes("route"))?.long_name ||
            "";
          const cityComp =
            components.find((c: { types: string[] }) => c.types.includes("locality"))?.long_name ||
            "";
          const stateComp =
            components.find((c: { types: string[] }) =>
              c.types.includes("administrative_area_level_1")
            )?.short_name || "";
          const zipComp =
            components.find((c: { types: string[] }) => c.types.includes("postal_code"))
              ?.long_name || "";

          onAddressChange({
            address: `${streetNumber} ${route}`.trim(),
            city: cityComp,
            state: stateComp,
            zip: zipComp,
            lat: coords.lat,
            lng: coords.lng,
          });
        }
      } catch {
        // Geocoding failed, but we still have coords
      }
      setReverseLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm flex items-center gap-1">
          <MapPin className="w-4 h-4" /> Job Location
        </h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAutoLocate}
          disabled={geoLoading || reverseLoading}
          className="gap-1"
        >
          {geoLoading || reverseLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Locate className="w-3 h-3" />
          )}
          Auto-detect
        </Button>
      </div>

      {lat && lng && (
        <p className="text-xs text-green-600">
          GPS: {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      )}

      <div className="space-y-2">
        <Input
          placeholder="Street address"
          value={address}
          onChange={(e) =>
            onAddressChange({ address: e.target.value, city, state, zip, lat, lng })
          }
        />
        <div className="grid grid-cols-5 gap-2">
          <Input
            placeholder="City"
            className="col-span-2"
            value={city}
            onChange={(e) =>
              onAddressChange({ address, city: e.target.value, state, zip, lat, lng })
            }
          />
          <Input
            placeholder="ST"
            maxLength={2}
            value={state}
            onChange={(e) =>
              onAddressChange({
                address,
                city,
                state: e.target.value.toUpperCase(),
                zip,
                lat,
                lng,
              })
            }
          />
          <Input
            placeholder="ZIP"
            className="col-span-2"
            value={zip}
            onChange={(e) =>
              onAddressChange({ address, city, state, zip: e.target.value, lat, lng })
            }
          />
        </div>
      </div>
    </div>
  );
}
