/*
  # Drop update policies from player_starts table
  
  1. Changes
    - Drop "Allow updating player stats" policy
    - Drop "dev_update_all" policy
  
  2. Security Impact
    - Removes ability to update records in player_starts table
    - Maintains existing insert and select policies
*/

-- Drop the update policies
DROP POLICY IF EXISTS "Allow updating player stats" ON player_starts;
DROP POLICY IF EXISTS "dev_update_all" ON player_starts;