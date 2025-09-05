/*
  # Fix player tracking system

  1. Changes
    - Add policy for updating playtime
    - Ensure playtime_minutes column exists
    - Add index on player_name for faster lookups
*/

-- Ensure playtime_minutes column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_starts' AND column_name = 'playtime_minutes'
  ) THEN
    ALTER TABLE player_starts ADD COLUMN playtime_minutes integer DEFAULT 0;
  END IF;
END $$;

-- Add index on player_name
CREATE INDEX IF NOT EXISTS idx_player_starts_player_name ON player_starts(player_name);

-- Add policy for updating playtime
CREATE POLICY "Allow playtime updates"
ON player_starts
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);