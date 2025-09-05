/*
  # Create player_starts table

  1. New Tables
    - `player_starts`
      - `id` (uuid, primary key)
      - `trackID` (text)
      - `player_name` (text)
      - `start_date` (date)
      - `start_time` (time)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `player_starts` table
    - Add policy for authenticated users to read their own data
    - Add policy for anonymous users to insert data
*/

CREATE TABLE IF NOT EXISTS player_starts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trackID text NOT NULL,
  player_name text NOT NULL,
  start_date date NOT NULL,
  start_time time NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE player_starts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert"
  ON player_starts
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read own data"
  ON player_starts
  FOR SELECT
  TO authenticated
  USING (true);