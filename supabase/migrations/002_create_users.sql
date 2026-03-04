CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Helper function to avoid RLS recursion when checking business_id
CREATE OR REPLACE FUNCTION auth_user_business_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT business_id FROM users WHERE id = auth.uid()
$$;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can read team members"
  ON users FOR SELECT
  USING (business_id = auth_user_business_id());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- RLS for businesses (needs users table to exist first)
CREATE POLICY "Users can read own business"
  ON businesses FOR SELECT
  USING (id = auth_user_business_id());

CREATE POLICY "Owners can update business"
  ON businesses FOR UPDATE
  USING (id = auth_user_business_id());

CREATE POLICY "Anyone can insert business (during onboarding)"
  ON businesses FOR INSERT
  WITH CHECK (true);
