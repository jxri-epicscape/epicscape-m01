DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_starts' AND column_name = 'hints_used'
  ) THEN
    ALTER TABLE player_starts ADD COLUMN hints_used integer;
  END IF;
END $$;