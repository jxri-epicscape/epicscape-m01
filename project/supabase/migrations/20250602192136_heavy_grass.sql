/*
  # Update player_starts table structure

  1. Changes
    - Make start_date and start_time nullable
    - Add start_timestamp and end_timestamp columns
    - Add duration_minutes column
    - Add hints_used column

  2. Security
    - Update policies to allow proper access
*/

-- Make start_date and start_time nullable
ALTER TABLE player_starts ALTER COLUMN start_date DROP NOT NULL;
ALTER TABLE player_starts ALTER COLUMN start_time DROP NOT NULL;

-- Add new timestamp columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_starts' AND column_name = 'start_timestamp'
  ) THEN
    ALTER TABLE player_starts ADD COLUMN start_timestamp timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_starts' AND column_name = 'end_timestamp'
  ) THEN
    ALTER TABLE player_starts ADD COLUMN end_timestamp timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_starts' AND column_name = 'duration_minutes'
  ) THEN
    ALTER TABLE player_starts ADD COLUMN duration_minutes numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_starts' AND column_name = 'hints_used'
  ) THEN
    ALTER TABLE player_starts ADD COLUMN hints_used numeric;
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous insert" ON player_starts;
DROP POLICY IF EXISTS "Allow authenticated read own data" ON player_starts;
DROP POLICY IF EXISTS "Allow updating player stats" ON player_starts;
DROP POLICY IF EXISTS "dev_update_all" ON player_starts;

-- Recreate policies with proper access
CREATE POLICY "Allow anonymous insert"
ON player_starts
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow authenticated read own data"
ON player_starts
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow updating player stats"
ON player_starts
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "dev_update_all"
ON player_starts
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);