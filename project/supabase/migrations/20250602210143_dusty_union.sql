/*
  # Add playtime tracking

  1. Changes
    - Add playtime_minutes column to player_starts table
    - Add policy for updating playtime

  2. Security
    - Enable RLS for playtime updates
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_starts' AND column_name = 'playtime_minutes'
  ) THEN
    ALTER TABLE player_starts ADD COLUMN playtime_minutes integer DEFAULT 0;
  END IF;
END $$;

-- Add policy for updating playtime
CREATE POLICY "Allow playtime updates"
ON player_starts
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);