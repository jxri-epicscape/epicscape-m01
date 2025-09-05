/*
  # Remove hints_used column

  1. Changes
    - Drop hints_used column from player_starts table
*/

ALTER TABLE player_starts DROP COLUMN IF EXISTS hints_used;