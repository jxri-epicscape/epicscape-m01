/*
  # Remove timestamp and duration columns
  
  1. Changes
    - Remove start_timestamp column
    - Remove end_timestamp column
    - Remove duration_minutes column
  
  2. Keep
    - id
    - start_date
    - trackID
    - player_name 
    - start_time
    - created_at
*/

ALTER TABLE player_starts 
  DROP COLUMN IF EXISTS start_timestamp,
  DROP COLUMN IF EXISTS end_timestamp,
  DROP COLUMN IF EXISTS duration_minutes;