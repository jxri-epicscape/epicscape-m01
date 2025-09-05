/*
  # Create hint usage tracking table

  1. New Tables
    - `hint_usage`
      - `id` (uuid, primary key)
      - `player_id` (uuid, references player_starts)
      - `hint_type` (text) - 'small' or 'big'
      - `puzzle_id` (text)
      - `used_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for anonymous insert
*/

CREATE TABLE IF NOT EXISTS hint_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES player_starts(id),
  hint_type text NOT NULL CHECK (hint_type IN ('small', 'big')),
  puzzle_id text NOT NULL,
  used_at timestamptz DEFAULT now()
);

ALTER TABLE hint_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert hint usage"
  ON hint_usage
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous select hint usage"
  ON hint_usage
  FOR SELECT
  TO anon
  USING (true);