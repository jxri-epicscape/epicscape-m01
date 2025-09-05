// GameGrid.tsx

import React from 'react';
import { GameCard } from './GameCard';
import type { Card } from '../types';

interface GameGridProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
  activeCardId: string | null;
  unlockedCards: Set<string>;
  completedCards?: Set<string>; // Made optional with default value
}

export function GameGrid({
  cards,
  onCardClick,
  activeCardId,
  unlockedCards,
  completedCards = new Set<string>(), // Added default value
}: GameGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 max-w-md mx-auto">
      {cards.map((card, index) => (
        <GameCard
          key={card.id}
          card={card}
          onClick={() => onCardClick(card)}
          isActive={card.id === activeCardId}
          index={index}
          isUnlocked={true}
          isCompleted={completedCards.has(card.id)}
        />
      ))}
    </div>
  );
}