"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Globe, BookOpen, Share2 } from "lucide-react";

interface ContentPost {
  id: string;
  platform: string;
  content_type: string;
  title: string | null;
  body: string;
  status: string;
  external_url: string | null;
  published_at: string | null;
  created_at: string;
}

const PLATFORM_ICONS: Record<string, typeof Globe> = {
  gbp: Globe,
  wordpress: BookOpen,
  facebook: Share2,
  instagram: Share2,
  nextdoor: Share2,
};

const PLATFORM_LABELS: Record<string, string> = {
  gbp: "Google Business Profile",
  wordpress: "WordPress Blog",
  facebook: "Facebook",
  instagram: "Instagram",
  nextdoor: "Nextdoor",
};

export default function ContentPage() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Content posts API will be wired when GBP/WP publishing is built
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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Content</h1>
        <p className="text-sm text-muted-foreground">
          AI-generated posts across all platforms — each unique, never duplicated
        </p>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Globe className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              No published content yet. Approve a job story to start the content pipeline.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> GBP Posts
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Blog Posts
              </span>
              <span className="flex items-center gap-1">
                <Share2 className="w-3 h-3" /> Social Media
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const Icon = PLATFORM_ICONS[post.platform] || Globe;
            return (
              <Card key={post.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <CardTitle className="text-base">
                        {post.title || PLATFORM_LABELS[post.platform] || post.platform}
                      </CardTitle>
                    </div>
                    <Badge
                      variant={
                        post.status === "published"
                          ? "default"
                          : post.status === "scheduled"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {post.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {PLATFORM_LABELS[post.platform]} &middot; {post.content_type}
                    {post.published_at &&
                      ` &middot; ${new Date(post.published_at).toLocaleDateString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-3">{post.body}</p>
                  {post.external_url && (
                    <a
                      href={post.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline mt-2 inline-block"
                    >
                      View live post
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
