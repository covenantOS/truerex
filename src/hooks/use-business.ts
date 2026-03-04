"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

export function useBusiness() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*, businesses(*)")
        .eq("id", authUser.id)
        .single();

      if (profile) {
        setUser(profile);
        setBusiness(profile.businesses as Business);
      }
      setLoading(false);
    }
    load();
  }, []);

  return { business, user, loading };
}
