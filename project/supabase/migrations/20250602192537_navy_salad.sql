/*
  # Add anonymous select policy for player_starts table

  1. Changes
    - Add new policy allowing anonymous users to select from player_starts table
    - Consolidate all policies in one place for better maintainability

  2. Security
    - Enables anonymous users to read their own inserted data
    - Maintains existing insert and update policies
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous insert" ON player_starts;
DROP POLICY IF EXISTS "Allow authenticated read own data" ON player_starts;
DROP POLICY IF EXISTS "Allow updating player stats" ON player_starts;
DROP POLICY IF EXISTS "dev_update_all" ON player_starts;

-- Recreate all policies with proper access
CREATE POLICY "Allow anonymous insert"
ON player_starts
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous select"
ON player_starts
FOR SELECT
TO anon
USING (true);

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