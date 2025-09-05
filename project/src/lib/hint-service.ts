import { supabase } from './supabase';

export interface HintUsage {
  playerId: string;
  hintType: 'small' | 'big';
  puzzleId: string;
  cardsTitle: string;
}

export async function trackHintUsage({ playerId, hintType, puzzleId, cardsTitle }: HintUsage) {
  try {
    const { error } = await supabase
      .from('hint_usage')
      .insert([{
        player_id: playerId,
        hint_type: hintType,
        puzzle_id: puzzleId,
        cards_title: cardsTitle
      }]);

    if (error) {
      console.error('Error tracking hint usage:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error tracking hint usage:', err);
    return false;
  }
}