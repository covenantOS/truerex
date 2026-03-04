CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  service_type TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  website_url TEXT,
  logo_url TEXT,

  -- Voice profile for AI
  voice_samples JSONB DEFAULT '[]',
  voice_tone TEXT DEFAULT 'friendly-professional',
  brand_keywords TEXT[],
  avoid_keywords TEXT[],

  -- Integration configs
  blooio_number TEXT,
  resend_domain TEXT,
  gbp_account_id TEXT,
  gbp_location_id TEXT,
  gbp_access_token TEXT,
  gbp_refresh_token TEXT,
  wp_site_url TEXT,
  wp_username TEXT,
  wp_app_password TEXT,

  -- Settings
  review_request_delay_hours INT DEFAULT 2,
  review_request_method TEXT DEFAULT 'both',
  auto_respond_reviews BOOLEAN DEFAULT false,
  auto_post_gbp BOOLEAN DEFAULT true,
  auto_post_blog BOOLEAN DEFAULT false,
  referral_reward_type TEXT DEFAULT 'discount',
  referral_reward_value DECIMAL(10,2) DEFAULT 25.00,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
