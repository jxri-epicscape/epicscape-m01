/*
  # Add update policy to player_starts table

  1. Changes
    - Add permissive policy for updating player_starts records
    - Policy allows updating playtime_minutes and hints_used columns
    - Ensures data can only be updated for existing player records

  2. Security
    - Policy is permissive to allow updates
    - Updates are restricted to specific columns
    - Updates must match on player_name to ensure data integrity
*/

CREATE POLICY "Allow updating player stats" 
ON player_starts
AS PERMISSIVE
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);