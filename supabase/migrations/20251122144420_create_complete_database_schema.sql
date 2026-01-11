/*
  # Create complete database schema with RLS

  1. New Tables
    - `groups`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamptz)
    - `participants`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key to groups)
      - `name` (text)
      - `created_at` (timestamptz)
    - `expenses`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key to groups)
      - `name` (text)
      - `amount` (numeric)
      - `currency` (text, default 'PLN')
      - `paid_by` (uuid, foreign key to participants)
      - `participants` (uuid array)
      - `archived` (boolean, default false)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Allow public access for reading and writing (no auth required for this app)

  3. Important Notes
    - This is a public expense tracking app without authentication
    - Users can access any group via URL
    - RLS policies allow anonymous access to all data
*/

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create expenses table
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

-- Create policies for groups (allow all operations for anonymous users)
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

-- Create policies for participants (allow all operations for anonymous users)
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

-- Create policies for expenses (allow all operations for anonymous users)
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_group_id ON participants(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
