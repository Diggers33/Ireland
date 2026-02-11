# Ireland Schedule 2025

Tournament & rental booking schedule tracker with Gantt timeline.

## Setup

### 1. Create Supabase table

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE schedule_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public read/write (simple personal app)
ALTER TABLE schedule_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON schedule_data
  FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE schedule_data;
```

### 2. Set environment variables

In Vercel project settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Deploy

```bash
git push
```

Vercel auto-deploys on push. Data syncs across all devices in real-time.

## Local Development

```bash
npm install
npm run dev
```

Without Supabase env vars, falls back to localStorage (single device only).
