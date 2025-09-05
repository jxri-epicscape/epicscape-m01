/*
  # Update hint_usage table structure
  
  1. Changes
    - Remove track_id column
    - Add cards_title column
    - Ensure data integrity during migration
  
  2. Security
    - Recreate anonymous access policies
*/

-- First add the new column as nullable
ALTER TABLE hint_usage 
  DROP COLUMN IF EXISTS track_id,
  ADD COLUMN cards_title text;

-- Set a default value for existing rows
UPDATE hint_usage
SET cards_title = 'legacy_hint'
WHERE cards_title IS NULL;

-- Now make the column NOT NULL
ALTER TABLE hint_usage
  ALTER COLUMN cards_title SET NOT NULL;

-- Recreate policies
DROP POLICY IF EXISTS "Allow anonymous insert hint usage" ON hint_usage;
DROP POLICY IF EXISTS "Allow anonymous select hint usage" ON hint_usage;

CREATE POLICY "Allow anonymous insert hint usage"
  ON hint_usage
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous select hint usage"
  ON hint_usage
  FOR SELECT
  TO anon
  USING (true);