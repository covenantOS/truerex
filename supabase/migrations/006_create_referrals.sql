-- Referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) NOT NULL,

  referrer_name TEXT NOT NULL,
  referrer_email TEXT,
  referrer_phone TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  referral_link TEXT NOT NULL,

  clicks INT DEFAULT 0,
  signups INT DEFAULT 0,
  conversions INT DEFAULT 0,

  reward_type TEXT,
  reward_value DECIMAL(10,2),
  reward_status TEXT DEFAULT 'pending', -- pending, earned, paid
  reward_paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business referrals"
  ON referrals FOR SELECT
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert referrals for their business"
  ON referrals FOR INSERT
  WITH CHECK (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their business referrals"
  ON referrals FOR UPDATE
  USING (business_id = (SELECT business_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_business ON referrals(business_id);
