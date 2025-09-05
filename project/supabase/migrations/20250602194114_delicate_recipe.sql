/*
  # Revert start_date and start_time to NOT NULL

  1. Changes
    - Make start_date and start_time columns NOT NULL again
    - Keep existing timestamp columns for duration calculations
    - Ensure all policies remain intact

  2. Security
    - No changes to existing policies
*/

-- Make start_date and start_time NOT NULL again
ALTER TABLE player_starts ALTER COLUMN start_date SET NOT NULL;
ALTER TABLE player_starts ALTER COLUMN start_time SET NOT NULL;