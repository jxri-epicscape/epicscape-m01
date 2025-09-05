import { supabase } from './supabase';

export interface RatingSubmission {
  playerId: string;
  rating: number;
  trackID: string;
}

export async function saveRating({ playerId, rating, trackID }: RatingSubmission) {
  try {
    // Validate rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const { error } = await supabase
      .from('ratings')
      .insert([{
        player_id: playerId,
        trackID: trackID,
        rating: rating
      }]);

    if (error) {
      console.error('Error saving rating:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error saving rating:', err);
    return false;
  }
}