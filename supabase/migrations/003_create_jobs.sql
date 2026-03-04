CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES users(id),

  title TEXT,
  service_type TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,

  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip TEXT,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),

  raw_notes TEXT,
  ai_story TEXT,
  ai_story_approved BOOLEAN DEFAULT false,

  status TEXT DEFAULT 'draft',
  completed_at TIMESTAMPTZ,

  review_requested BOOLEAN DEFAULT false,
  review_request_sent_at TIMESTAMPTZ,
  gbp_posted BOOLEAN DEFAULT false,
  gbp_post_id TEXT,
  blog_posted BOOLEAN DEFAULT false,
  blog_post_url TEXT,
  social_posted JSONB DEFAULT '{}',
  neighborhood_campaign_sent BOOLEAN DEFAULT false,
  mailer_sent BOOLEAN DEFAULT false,
  mailer_tracking_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_business ON jobs(business_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read business jobs"
  ON jobs FOR SELECT
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert business jobs"
  ON jobs FOR INSERT
  WITH CHECK (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update business jobs"
  ON jobs FOR UPDATE
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

-- Job photos
CREATE TABLE job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,

  storage_path TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT DEFAULT 'during',
  sort_order INT DEFAULT 0,

  original_lat DECIMAL(10,8),
  original_lng DECIMAL(11,8),
  geo_tagged BOOLEAN DEFAULT false,
  exif_data JSONB,

  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photos_job ON job_photos(job_id);

ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read business photos"
  ON job_photos FOR SELECT
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert business photos"
  ON job_photos FOR INSERT
  WITH CHECK (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete business photos"
  ON job_photos FOR DELETE
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));
