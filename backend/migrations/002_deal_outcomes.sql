-- Migration 002: Deal Outcomes — Self-Learning Loop
-- NEST Advisors / Arden Edge Capital
-- After a deal closes, outcomes are stored here so the system improves
-- future structure recommendations via Claude-generated learning signals.

CREATE TABLE IF NOT EXISTS deal_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  workflow_id UUID REFERENCES bond_workflows(id) ON DELETE SET NULL,

  -- Final agency ratings
  moodys_rating TEXT,
  sp_rating TEXT,
  fitch_rating TEXT,

  -- Bond economics achieved at close
  spread_bps_achieved NUMERIC(7,2),
  coupon_pct_achieved NUMERIC(6,4),
  total_principal_usd NUMERIC(15,2),

  -- Timeline (days_to_close computed automatically)
  intake_date DATE,
  close_date DATE,
  days_to_close INTEGER GENERATED ALWAYS AS (close_date - intake_date) STORED,

  -- Outcome flags
  surety_success BOOLEAN DEFAULT false,
  lc_required BOOLEAN DEFAULT false,
  green_bond BOOLEAN DEFAULT false,
  green_cert_body TEXT,
  series_count INTEGER DEFAULT 1,

  -- Structure achieved at close
  ltv_pct NUMERIC(6,3),
  dscr_achieved NUMERIC(6,3),
  ltc_pct NUMERIC(6,3),

  -- Self-learning signals: [{factor, weight, outcome, recommendation}]
  learning_signals JSONB DEFAULT '[]',

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deal_outcomes_deal_id    ON deal_outcomes(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_outcomes_close_date ON deal_outcomes(close_date);
CREATE INDEX IF NOT EXISTS idx_deal_outcomes_moodys     ON deal_outcomes(moodys_rating);
CREATE INDEX IF NOT EXISTS idx_deal_outcomes_sp         ON deal_outcomes(sp_rating);
CREATE INDEX IF NOT EXISTS idx_deal_outcomes_green      ON deal_outcomes(green_bond) WHERE green_bond = true;
CREATE INDEX IF NOT EXISTS idx_deal_outcomes_surety     ON deal_outcomes(surety_success) WHERE surety_success = true;

-- Aggregate view: average outcomes by Moody's rating bucket
CREATE OR REPLACE VIEW outcome_stats AS
SELECT
  moodys_rating,
  COUNT(*)                                                         AS deal_count,
  ROUND(AVG(spread_bps_achieved), 1)                              AS avg_spread_bps,
  ROUND(AVG(days_to_close), 0)                                    AS avg_days_to_close,
  ROUND(AVG(dscr_achieved), 3)                                    AS avg_dscr,
  ROUND(AVG(ltv_pct), 2)                                          AS avg_ltv,
  ROUND(AVG(ltc_pct), 2)                                          AS avg_ltc,
  ROUND(AVG(coupon_pct_achieved), 4)                              AS avg_coupon_pct,
  ROUND(AVG(total_principal_usd), 0)                              AS avg_principal_usd,
  SUM(CASE WHEN surety_success THEN 1 ELSE 0 END)                 AS surety_success_count,
  SUM(CASE WHEN lc_required    THEN 1 ELSE 0 END)                 AS lc_required_count,
  SUM(CASE WHEN green_bond     THEN 1 ELSE 0 END)                 AS green_bond_count,
  ROUND(100.0 * SUM(CASE WHEN surety_success THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 1) AS surety_success_rate_pct
FROM deal_outcomes
WHERE moodys_rating IS NOT NULL
GROUP BY moodys_rating
ORDER BY moodys_rating;

ALTER TABLE deal_outcomes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'deal_outcomes'
      AND policyname = 'auth_full_access_deal_outcomes'
  ) THEN
    CREATE POLICY auth_full_access_deal_outcomes
      ON deal_outcomes FOR ALL TO authenticated
      USING (true) WITH CHECK (true);
  END IF;
END $$;
