-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) NOT NULL,
  job_id UUID REFERENCES jobs(id),

  source TEXT NOT NULL,                -- google, yelp, facebook
  external_id TEXT,
  reviewer_name TEXT,
  rating INT,
  review_text TEXT,
  review_date TIMESTAMPTZ,

  -- Response
  response_text TEXT,
  ai_draft_response TEXT,
  response_status TEXT DEFAULT 'pending', -- pending, drafted, approved, posted
  responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business reviews"
  ON reviews FOR SELECT
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert reviews for their business"
  ON reviews FOR INSERT
  WITH CHECK (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their business reviews"
  ON reviews FOR UPDATE
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_reviews_business ON reviews(business_id, created_at DESC);
CREATE INDEX idx_reviews_status ON reviews(business_id, response_status);

-- Review requests table
CREATE TABLE review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) NOT NULL,
  job_id UUID REFERENCES jobs(id) NOT NULL,

  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,

  method TEXT NOT NULL,                -- sms, email, both
  status TEXT DEFAULT 'pending',       -- pending, sent, delivered, clicked, reviewed, feedback

  -- Gating
  initial_sentiment TEXT,              -- positive, negative
  redirected_to TEXT,                  -- google_review, feedback_form

  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  blooio_message_id TEXT,
  resend_message_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business review requests"
  ON review_requests FOR SELECT
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert review requests for their business"
  ON review_requests FOR INSERT
  WITH CHECK (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their business review requests"
  ON review_requests FOR UPDATE
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_review_requests_job ON review_requests(job_id);
CREATE INDEX idx_review_requests_status ON review_requests(business_id, status);
