-- Migration 001: Bond Workflow Tables
-- Auto-runs at Flask startup via services/migrations.py

CREATE TABLE IF NOT EXISTS bond_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  deal_type TEXT NOT NULL DEFAULT 'Development' CHECK (deal_type IN ('Development', 'M_A')),
  current_phase TEXT DEFAULT 'phase_1',
  overall_readiness_score NUMERIC(5,2) DEFAULT 0,
  ai_evaluation_summary JSONB DEFAULT '{}',
  toggled_off_modules TEXT[] DEFAULT '{}',
  pooled_deal_ids UUID[] DEFAULT '{}',
  tranche_structure JSONB DEFAULT '{}',
  call_put_optionality TEXT,
  master_trustee_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bond_workflows_deal_id ON bond_workflows(deal_id);
CREATE INDEX IF NOT EXISTS idx_bond_workflows_phase ON bond_workflows(current_phase);

CREATE TABLE IF NOT EXISTS bond_workflow_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES bond_workflows(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  module TEXT NOT NULL,
  item_key TEXT NOT NULL,
  description TEXT NOT NULL,
  required BOOLEAN DEFAULT true,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  uploaded_doc_url TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_bwc_workflow_id ON bond_workflow_checklists(workflow_id);
CREATE INDEX IF NOT EXISTS idx_bwc_module ON bond_workflow_checklists(module);

CREATE TABLE IF NOT EXISTS external_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_type TEXT NOT NULL CHECK (party_type IN (
    'surety','trustee','bond_desk','investor','rating_agency','legal','other'
  )),
  name TEXT NOT NULL,
  contact_info JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','pending')),
  workflow_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ext_rel_party_type ON external_relationships(party_type);

ALTER TABLE bond_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE bond_workflow_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_relationships ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bond_workflows' AND policyname = 'auth_full_access_bond_workflows'
  ) THEN
    CREATE POLICY auth_full_access_bond_workflows ON bond_workflows FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bond_workflow_checklists' AND policyname = 'auth_full_access_bond_workflow_checklists'
  ) THEN
    CREATE POLICY auth_full_access_bond_workflow_checklists ON bond_workflow_checklists FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'external_relationships' AND policyname = 'auth_full_access_external_relationships'
  ) THEN
    CREATE POLICY auth_full_access_external_relationships ON external_relationships FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

INSERT INTO external_relationships (party_type, name, contact_info, status) VALUES
  ('trustee', 'U.S. Bank Corporate Trust', '{"hq":"Minneapolis, MN","tier":"preferred","base_fee_min":15000,"base_fee_max":35000}', 'active'),
  ('trustee', 'BNY Mellon Corporate Trust', '{"hq":"New York, NY","tier":"tier1","base_fee_min":20000,"base_fee_max":50000}', 'active'),
  ('trustee', 'Wells Fargo Corporate Trust', '{"hq":"Charlotte, NC","tier":"tier1","base_fee_min":12000,"base_fee_max":28000}', 'active'),
  ('trustee', 'Wilmington Trust', '{"hq":"Wilmington, DE","tier":"specialty","base_fee_min":10000,"base_fee_max":25000}', 'active'),
  ('surety', 'Hylant Group', '{"specialty":"surety_bonds","partnership":"NEST_preferred"}', 'active'),
  ('surety', 'Berkshire Hathaway Specialty Insurance', '{"specialty":"large_bonds","min_face":50000000}', 'active'),
  ('surety', 'Travelers Surety', '{"specialty":"performance_payment","min_face":1000000}', 'active')
ON CONFLICT DO NOTHING;
