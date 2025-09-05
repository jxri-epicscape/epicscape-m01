import { Language } from '../types';

export async function loadCardsByLanguage(language: Language) {
  try {
    // Load default English cards
    if (language === 'fi') {
      const { cardsLevel1, cardsLevel2 } = await import('../data/cards_fi');
      return { cardsLevel1, cardsLevel2 };
    } else {
      const { cardsLevel1, cardsLevel2 } = await import('../data/cards_en');
      return { cardsLevel1, cardsLevel2 };
    }
  } catch (error) {
    console.error('Error loading cards:', error);
    
    // Final fallback to English if there's an error
    const { cardsLevel1, cardsLevel2 } = await import('../data/cards_en');
    return { cardsLevel1, cardsLevel2 };
  }
}