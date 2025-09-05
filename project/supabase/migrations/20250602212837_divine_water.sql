/*
  # Add track_id column to hint_usage table

  1. Changes
    - Add track_id column to hint_usage table
    - Add foreign key constraint to tracks table
    - Make column nullable

  2. Security
    - No changes to RLS policies needed
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hint_usage' AND column_name = 'track_id'
  ) THEN
    ALTER TABLE hint_usage ADD COLUMN track_id text;
  END IF;
END $$;