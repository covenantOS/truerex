-- Content posts: unified table for GBP, blog, social posts
CREATE TABLE content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) NOT NULL,
  job_id UUID REFERENCES jobs(id),

  platform TEXT NOT NULL,              -- gbp, wordpress, facebook, instagram, nextdoor
  content_type TEXT NOT NULL,          -- post, blog, case_study

  title TEXT,
  body TEXT NOT NULL,
  media_urls TEXT[],

  -- Platform-specific
  external_id TEXT,                    -- Post ID from platform
  external_url TEXT,                   -- URL of published post
  schema_markup JSONB,                 -- For WP posts

  status TEXT DEFAULT 'draft',         -- draft, scheduled, published, failed
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  -- Content uniqueness hash (prevent duplicates)
  content_hash TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business content"
  ON content_posts FOR SELECT
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert content for their business"
  ON content_posts FOR INSERT
  WITH CHECK (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their business content"
  ON content_posts FOR UPDATE
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their business content"
  ON content_posts FOR DELETE
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

-- Index for dedup checking
CREATE INDEX idx_content_posts_hash ON content_posts(business_id, content_hash);
CREATE INDEX idx_content_posts_job ON content_posts(job_id, platform);
