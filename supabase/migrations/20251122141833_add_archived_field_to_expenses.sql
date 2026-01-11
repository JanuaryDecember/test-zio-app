/*
  # Add archived field to expenses table

  1. Changes
    - Add `archived` boolean column to `expenses` table
    - Default value is false
    - Non-nullable field
  
  2. Notes
    - This allows tracking which expenses have been settled/archived
    - Expenses can be moved between active and archived states
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'archived'
  ) THEN
    ALTER TABLE expenses ADD COLUMN archived boolean DEFAULT false NOT NULL;
  END IF;
END $$;