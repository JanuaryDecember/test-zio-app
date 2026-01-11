/*
  # Create expense splitting application schema

  1. New Tables
    - `groups`
      - `id` (uuid, primary key) - unique identifier for sharing
      - `name` (text) - group name
      - `created_at` (timestamptz) - creation timestamp
    
    - `participants`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key) - references groups
      - `name` (text) - participant name
      - `created_at` (timestamptz)
    
    - `expenses`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key) - references groups
      - `name` (text) - expense description
      - `amount` (numeric) - expense amount
      - `paid_by` (uuid, foreign key) - references participants (who paid)
      - `participants` (uuid[]) - array of participant ids who share this expense
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Public access policies (no auth required for MVP)
    - Read and write permissions for all users
  
  3. Indexes
    - Index on group_id for faster queries
*/

CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  paid_by uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  participants uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_participants_group ON participants(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group ON expenses(group_id);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Groups are publicly accessible"
  ON groups FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create groups"
  ON groups FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Participants are publicly accessible"
  ON participants FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add participants"
  ON participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Expenses are publicly accessible"
  ON expenses FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add expenses"
  ON expenses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update expenses"
  ON expenses FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete expenses"
  ON expenses FOR DELETE
  USING (true);