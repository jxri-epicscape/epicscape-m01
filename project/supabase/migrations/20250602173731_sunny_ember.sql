/*
  # Add hints_used column to player_starts table

  1. Changes
    - Add `hints_used` column to `player_starts` table
    - Add `playtime_minutes` column to `player_starts` table (if not exists)

  2. Notes
    - Both columns are nullable to maintain backward compatibility
    - Using DO block to safely add columns if they don't exist
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_starts' AND column_name = 'hints_used'
  ) THEN
    ALTER TABLE player_starts ADD COLUMN hints_used integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_starts' AND column_name = 'playtime_minutes'
  ) THEN
    ALTER TABLE player_starts ADD COLUMN playtime_minutes integer;
  END IF;
END $$;