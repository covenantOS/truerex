"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SERVICE_TYPE_LABELS } from "@/lib/constants";
import { MapPin, Clock, Plus, Loader2 } from "lucide-react";
import type { Database } from "@/types/database";

type Job = Database["public"]["Tables"]["jobs"]["Row"];

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  active: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
};

export default function DashboardJobsPage() {
  const { business, loading: bizLoading } = useBusiness();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business) return;

    async function loadJobs() {
      const supabase = createClient();
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("business_id", business!.id)
        .order("created_at", { ascending: false });

      setJobs(data || []);
      setLoading(false);
    }

    loadJobs();
  }, [business]);

  if (bizLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <Link href="/capture">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Capture Job
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No jobs documented yet</p>
            <Link href="/capture">
              <Button>Capture Your First Job</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={statusColors[job.status]}
                          variant="secondary"
                        >
                          {job.status}
                        </Badge>
                        {job.service_type && (
                          <span className="text-xs text-muted-foreground">
                            {SERVICE_TYPE_LABELS[job.service_type]}
                          </span>
                        )}
                        {job.customer_name && (
                          <span className="text-xs text-muted-foreground">
                            &middot; {job.customer_name}
                          </span>
                        )}
                      </div>
                      <p className="font-medium">{job.title || job.address}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.city}, {job.state}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1 flex-wrap justify-end">
                      {job.gbp_posted && (
                        <Badge variant="outline" className="text-xs">
                          GBP
                        </Badge>
                      )}
                      {job.blog_posted && (
                        <Badge variant="outline" className="text-xs">
                          Blog
                        </Badge>
                      )}
                      {job.review_requested && (
                        <Badge variant="outline" className="text-xs">
                          Review
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
