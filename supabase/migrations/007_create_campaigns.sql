-- Neighborhood campaigns
CREATE TABLE neighborhood_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) NOT NULL,
  job_id UUID REFERENCES jobs(id) NOT NULL,

  campaign_type TEXT NOT NULL,         -- pre_job, post_job
  radius_miles DECIMAL(4,2) DEFAULT 0.5,

  message_template TEXT,
  discount_code TEXT,
  discount_value TEXT,

  contacts_found INT DEFAULT 0,
  messages_sent INT DEFAULT 0,
  messages_delivered INT DEFAULT 0,
  replies INT DEFAULT 0,
  conversions INT DEFAULT 0,
  mailers_sent INT DEFAULT 0,

  status TEXT DEFAULT 'draft',         -- draft, sending, sent, completed
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE neighborhood_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business campaigns"
  ON neighborhood_campaigns FOR SELECT
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert campaigns for their business"
  ON neighborhood_campaigns FOR INSERT
  WITH CHECK (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their business campaigns"
  ON neighborhood_campaigns FOR UPDATE
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_campaigns_job ON neighborhood_campaigns(job_id);
CREATE INDEX idx_campaigns_business ON neighborhood_campaigns(business_id, status);

-- Neighborhood contacts
CREATE TABLE neighborhood_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES neighborhood_campaigns(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) NOT NULL,

  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip TEXT,
  owner_name TEXT,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  distance_miles DECIMAL(4,2),

  phone TEXT,
  email TEXT,

  contacted_via TEXT,                  -- sms, email, mailer
  message_status TEXT DEFAULT 'pending',
  responded BOOLEAN DEFAULT false,
  converted BOOLEAN DEFAULT false,

  lob_mailer_id TEXT,
  blooio_message_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE neighborhood_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business contacts"
  ON neighborhood_contacts FOR SELECT
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert contacts for their business"
  ON neighborhood_contacts FOR INSERT
  WITH CHECK (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their business contacts"
  ON neighborhood_contacts FOR UPDATE
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_contacts_campaign ON neighborhood_contacts(campaign_id);
