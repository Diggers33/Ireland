-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS schedule_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER schedule_data_updated
  BEFORE UPDATE ON schedule_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS: allow all (personal app, no auth needed)
ALTER TABLE schedule_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON schedule_data
  FOR ALL USING (true) WITH CHECK (true);

-- Enable real-time sync
ALTER PUBLICATION supabase_realtime ADD TABLE schedule_data;
