-- NEST Platform: Engine Runs logging table for self-learning feedback loops
-- Every DSCR/Surety/CDO/SHAP/CDS run is logged here for model improvement

CREATE TABLE IF NOT EXISTS engine_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engine        TEXT NOT NULL CHECK (engine IN ('dscr','surety','cdo','shap','cds','shadow_rating','bond_workflow')),
  deal_id       UUID REFERENCES deals(id) ON DELETE SET NULL,
  deal_name     TEXT,
  inputs        JSONB NOT NULL DEFAULT '{}',
  outputs       JSONB NOT NULL DEFAULT '{}',
  shap_values   JSONB,
  grade         TEXT,
  session_id    TEXT NOT NULL,
  user_feedback TEXT CHECK (user_feedback IN ('accurate','too_conservative','too_aggressive')),
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_engine_runs_engine ON engine_runs(engine);
CREATE INDEX IF NOT EXISTS idx_engine_runs_deal_id ON engine_runs(deal_id);
CREATE INDEX IF NOT EXISTS idx_engine_runs_timestamp ON engine_runs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_engine_runs_session ON engine_runs(session_id);

-- RLS: anon users can insert (feedback logging) and read their own session's runs
ALTER TABLE engine_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "engine_runs_insert_anon"
  ON engine_runs FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "engine_runs_select_own_session"
  ON engine_runs FOR SELECT
  TO anon
  USING (true);  -- All runs are viewable in demo mode

CREATE POLICY IF NOT EXISTS "engine_runs_all_authenticated"
  ON engine_runs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "engine_runs_all_service_role"
  ON engine_runs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Analytics view: feedback accuracy by engine
CREATE OR REPLACE VIEW engine_feedback_stats AS
SELECT
  engine,
  COUNT(*) as total_runs,
  COUNT(user_feedback) as feedback_count,
  SUM(CASE WHEN user_feedback = 'accurate' THEN 1 ELSE 0 END)::FLOAT
    / NULLIF(COUNT(user_feedback), 0) * 100 AS accuracy_pct,
  AVG(CASE WHEN outputs->>'dscr' IS NOT NULL THEN (outputs->>'dscr')::FLOAT END) AS avg_dscr,
  AVG(CASE WHEN shap_values->>'dscr' IS NOT NULL THEN (shap_values->>'dscr')::FLOAT END) AS avg_shap_dscr,
  MAX(timestamp) AS last_run
FROM engine_runs
GROUP BY engine;

-- SHAP drift detection view: average SHAP values over time (weekly buckets)
CREATE OR REPLACE VIEW shap_drift AS
SELECT
  date_trunc('week', timestamp) AS week,
  AVG((shap_values->>'dscr')::FLOAT) AS avg_shap_dscr,
  AVG((shap_values->>'ltv')::FLOAT) AS avg_shap_ltv,
  AVG((shap_values->>'icr')::FLOAT) AS avg_shap_icr,
  COUNT(*) AS run_count
FROM engine_runs
WHERE shap_values IS NOT NULL
  AND engine = 'shap'
GROUP BY 1
ORDER BY 1 DESC;
