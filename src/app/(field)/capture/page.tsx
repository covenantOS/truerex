"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { CameraCapture } from "@/components/capture/camera-capture";
import { SpeechInput } from "@/components/capture/speech-input";
import { AddressPicker } from "@/components/capture/address-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SERVICE_TYPES, SERVICE_TYPE_LABELS } from "@/lib/constants";
import { compressImage } from "@/lib/photos/compress";
import { toast } from "sonner";
import { Loader2, Send, Save } from "lucide-react";
import type { CapturedPhoto } from "@/hooks/use-camera";

export default function CapturePage() {
  const { business, user, loading: bizLoading } = useBusiness();
  const router = useRouter();

  // Job data
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [notes, setNotes] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Address
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);

  function handleAddressChange(fields: {
    address: string;
    city: string;
    state: string;
    zip: string;
    lat: number | null;
    lng: number | null;
  }) {
    setAddress(fields.address);
    setCity(fields.city);
    setState(fields.state);
    setZip(fields.zip);
    setLat(fields.lat);
    setLng(fields.lng);
  }

  async function uploadPhotos(jobId: string, businessId: string) {
    const supabase = createClient();
    const uploaded = [];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const compressed = await compressImage(photo.file);
      const ext = photo.file.name.split(".").pop() || "jpg";
      const path = `${businessId}/${jobId}/${Date.now()}-${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("job-photos")
        .upload(path, compressed);

      if (uploadError) {
        console.error("Upload failed:", uploadError);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("job-photos").getPublicUrl(path);

      uploaded.push({
        job_id: jobId,
        business_id: businessId,
        storage_path: path,
        photo_url: publicUrl,
        photo_type: photo.type,
        sort_order: i,
        original_lat: lat,
        original_lng: lng,
        geo_tagged: !!(lat && lng),
      });
    }

    if (uploaded.length > 0) {
      await supabase.from("job_photos").insert(uploaded);
    }
  }

  async function handleSave(status: "draft" | "completed") {
    if (!business || !user) {
      toast.error("Business not loaded");
      return;
    }
    if (!address) {
      toast.error("Address is required");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      // Create job
      const { data: job, error } = await supabase
        .from("jobs")
        .insert({
          business_id: business.id,
          created_by: user.id,
          service_type: serviceType || business.service_type,
          customer_name: customerName || null,
          customer_email: customerEmail || null,
          customer_phone: customerPhone || null,
          address,
          city,
          state,
          zip,
          lat,
          lng,
          raw_notes: notes || null,
          status,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload photos
      if (photos.length > 0) {
        await uploadPhotos(job.id, business.id);
      }

      toast.success(
        status === "completed"
          ? "Job saved! AI will generate content."
          : "Draft saved."
      );

      // Reset form
      setPhotos([]);
      setNotes("");
      setServiceType("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setAddress("");
      setCity("");
      setState("");
      setZip("");
      setLat(null);
      setLng(null);

      router.push(`/jobs`);
    } catch (err) {
      toast.error("Failed to save job");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (bizLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Capture Job</h1>
        <p className="text-sm text-muted-foreground">
          Document your work — photos, story, location
        </p>
      </div>

      {/* Photos */}
      <CameraCapture photos={photos} onPhotosChange={setPhotos} />

      <Separator />

      {/* Speech/text input */}
      <SpeechInput value={notes} onChange={setNotes} />

      <Separator />

      {/* Address */}
      <AddressPicker
        address={address}
        city={city}
        state={state}
        zip={zip}
        lat={lat}
        lng={lng}
        onAddressChange={handleAddressChange}
      />

      <Separator />

      {/* Service & Customer */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Details</h3>

        <div className="space-y-2">
          <Label className="text-xs">Service Type</Label>
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger>
              <SelectValue placeholder={SERVICE_TYPE_LABELS[business?.service_type || ""] || "Select service"} />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {SERVICE_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Customer Name (optional)</Label>
          <Input
            placeholder="Jane Smith"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs">Phone</Label>
            <Input
              type="tel"
              placeholder="(555) 123-4567"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              placeholder="jane@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => handleSave("draft")}
          disabled={saving || !address}
        >
          <Save className="w-4 h-4" />
          Save Draft
        </Button>
        <Button
          className="flex-1 gap-2"
          onClick={() => handleSave("completed")}
          disabled={saving || !address}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Complete Job
        </Button>
      </div>
    </div>
  );
}
