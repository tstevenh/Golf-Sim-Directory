-- Create correction_reports table
CREATE TABLE IF NOT EXISTS correction_reports (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  reported_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,

  -- What needs correction
  field TEXT NOT NULL,
  current_value TEXT,
  suggested_value TEXT NOT NULL,
  notes TEXT,

  -- Review status
  status "CorrectionStatus" NOT NULL DEFAULT 'pending',
  reviewed_by_id TEXT,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_correction_reports_venue_id ON correction_reports(venue_id);
CREATE INDEX IF NOT EXISTS idx_correction_reports_status ON correction_reports(status);
CREATE INDEX IF NOT EXISTS idx_correction_reports_reported_by_id ON correction_reports(reported_by_id);
