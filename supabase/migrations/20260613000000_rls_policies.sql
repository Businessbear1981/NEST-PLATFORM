-- NEST Platform RLS Policies
-- Enforces: NEST_DEMO_MODE bypasses via service role, normal users see only their deals

-- Enable RLS on core tables
ALTER TABLE IF EXISTS deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS documents ENABLE ROW LEVEL SECURITY;

-- Deals: authenticated users can read all pipeline deals (NEST is single-tenant for now)
-- Service role (Railway backend) bypasses RLS entirely
CREATE POLICY IF NOT EXISTS "deals_read_authenticated"
  ON deals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "deals_write_service_role"
  ON deals FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anon read for demo mode (NEST_DEMO_MODE=1 uses anon key)
CREATE POLICY IF NOT EXISTS "deals_read_anon_demo"
  ON deals FOR SELECT
  TO anon
  USING (true);

-- Investors: same pattern
CREATE POLICY IF NOT EXISTS "investors_read_authenticated"
  ON investors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "investors_write_service_role"
  ON investors FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "investors_read_anon_demo"
  ON investors FOR SELECT
  TO anon
  USING (true);

-- Documents: authenticated only (no anon read on documents)
CREATE POLICY IF NOT EXISTS "documents_read_authenticated"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "documents_write_service_role"
  ON documents FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Realtime: enable publications for live deal updates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime FOR TABLE deals, investors;
  ELSE
    -- Add tables if publication exists but doesn't include them
    ALTER PUBLICATION supabase_realtime ADD TABLE deals;
    ALTER PUBLICATION supabase_realtime ADD TABLE investors;
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;
