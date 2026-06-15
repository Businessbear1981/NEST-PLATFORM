-- Migration 003: Model Weights — OPBA Self-Learning Weight Storage
-- NEST / Arden Edge Capital
-- Persists EMA-updated scoring weights so they survive Railway restarts.

CREATE TABLE IF NOT EXISTS model_weights (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default OPBA v1 weights
INSERT INTO model_weights (key, value)
VALUES ('opba_v1', '{"dscr": 0.40, "leverage": 0.30, "liquidity": 0.30, "version": 1, "updates": 0}')
ON CONFLICT (key) DO NOTHING;

-- RLS: allow authenticated reads/writes
ALTER TABLE model_weights ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'model_weights' AND policyname = 'auth_model_weights'
  ) THEN
    CREATE POLICY auth_model_weights ON model_weights FOR ALL TO authenticated
      USING (true) WITH CHECK (true);
  END IF;
END $$;
