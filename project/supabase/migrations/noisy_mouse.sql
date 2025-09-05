/*
  # Add trackID column to ratings table

  1. Changes
    - Add trackID column to ratings table
    - Make it nullable for backward compatibility
    - Update RLS policies to allow trackID in inserts

  2. Security
    - Maintain existing RLS policies
    - Allow anonymous users to insert ratings with trackID
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ratings' AND column_name = 'trackid'
  ) THEN
    ALTER TABLE ratings ADD COLUMN trackID text;
  END IF;
END $$;

-- Recreate policies to ensure trackID can be inserted
DROP POLICY IF EXISTS "Allow anonymous insert ratings" ON ratings;
DROP POLICY IF EXISTS "Allow anonymous select ratings" ON ratings;

CREATE POLICY "Allow anonymous insert ratings"
  ON ratings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous select ratings"
  ON ratings
  FOR SELECT
  TO anon
  USING (true);