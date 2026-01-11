/*
  # Add currency column to expenses table

  1. Changes
    - Add `currency` column to `expenses` table with default value 'PLN'
    - Update existing rows to have 'PLN' as currency
  
  2. Notes
    - This column stores the currency code (PLN, EUR, USD, GBP, CHF)
    - Default value is PLN to maintain backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'currency'
  ) THEN
    ALTER TABLE expenses ADD COLUMN currency text DEFAULT 'PLN' NOT NULL;
  END IF;
END $$;

UPDATE expenses SET currency = 'PLN' WHERE currency IS NULL;
