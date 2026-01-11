/*
  # Ensure database tables exist

  Verify and create tables if they don't exist
*/

-- Create groups table if not exists
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create participants table if not exists
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create expenses table if not exists
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'PLN' NOT NULL,
  paid_by uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  participants uuid[] NOT NULL DEFAULT '{}',
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_currency CHECK (currency IN ('PLN', 'EUR', 'USD', 'GBP', 'CHF'))
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to groups" ON groups;
DROP POLICY IF EXISTS "Allow public insert access to groups" ON groups;
DROP POLICY IF EXISTS "Allow public update access to groups" ON groups;
DROP POLICY IF EXISTS "Allow public delete access to groups" ON groups;

DROP POLICY IF EXISTS "Allow public read access to participants" ON participants;
DROP POLICY IF EXISTS "Allow public insert access to participants" ON participants;
DROP POLICY IF EXISTS "Allow public update access to participants" ON participants;
DROP POLICY IF EXISTS "Allow public delete access to participants" ON participants;

DROP POLICY IF EXISTS "Allow public read access to expenses" ON expenses;
DROP POLICY IF EXISTS "Allow public insert access to expenses" ON expenses;
DROP POLICY IF EXISTS "Allow public update access to expenses" ON expenses;
DROP POLICY IF EXISTS "Allow public delete access to expenses" ON expenses;

-- Create policies for groups
CREATE POLICY "Allow public read access to groups"
  ON groups FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to groups"
  ON groups FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access to groups"
  ON groups FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to groups"
  ON groups FOR DELETE
  TO anon
  USING (true);

-- Create policies for participants
CREATE POLICY "Allow public read access to participants"
  ON participants FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to participants"
  ON participants FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access to participants"
  ON participants FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to participants"
  ON participants FOR DELETE
  TO anon
  USING (true);

-- Create policies for expenses
CREATE POLICY "Allow public read access to expenses"
  ON expenses FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to expenses"
  ON expenses FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access to expenses"
  ON expenses FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to expenses"
  ON expenses FOR DELETE
  TO anon
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_participants_group_id ON participants(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);