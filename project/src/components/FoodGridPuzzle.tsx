import React, { useState } from 'react';
import { Carrot, Grape, Citrus, Salad, Pizza, Apple, Cookie, Banana, Egg } from 'lucide-react';
import type { Card } from '../types';

interface FoodGridPuzzleProps {
  card: Card;
  onComplete: (cardId: string) => void;
}

export function FoodGridPuzzle({ card, onComplete }: FoodGridPuzzleProps) {
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);
  const [error, setError] = useState('');

  const correctSequence = ['egg', 'salad', 'pizza', 'apple'];

  const icons = [
    { id: 'egg', Icon: Egg },
    { id: 'carrot', Icon: Carrot },
    { id: 'grape', Icon: Grape },
    { id: 'citrus', Icon: Citrus },
    { id: 'salad', Icon: Salad },
    { id: 'pizza', Icon: Pizza },
    { id: 'apple', Icon: Apple },
    { id: 'cookie', Icon: Cookie },
    { id: 'banana', Icon: Banana },
  ];

  const handleIconClick = (iconId: string) => {
    setSelectedIcons(prev => {
      if (prev.length >= 4) return prev;
      
      const newSelection = [...prev, iconId];
      
      if (newSelection.length === 4) {
        const isCorrect = newSelection.every(
          (id, index) => id === correctSequence[index]
        );

        if (isCorrect) {
          setError(card?.successText);
          setTimeout(() => {
            onComplete(card.id);
          }, 1);
        } else {
          setError(card?.wrongAnswerText);
          setTimeout(() => {
            setSelectedIcons([]);
            setError('');
          }, 3000);
        }
      }

      return newSelection;
    });
  };

  return (
    <div className="space-y-6 max-w-[300px] mx-auto">
      {card.title && (
        <h2 className="text-2xl text-white font-light">
          {card.title}
        </h2>
      )}

      <div className="flex justify-center gap-3">
        {Array.from({ length: 4 }).map((_, index) => {
          const selectedIcon = selectedIcons[index];
          const IconComponent = selectedIcon ? icons.find(i => i.id === selectedIcon)?.Icon : null;

          return (
            <div
              key={index}
              className={`
                w-12 h-12 rounded-lg
                ${IconComponent ? 'bg-gray-700' : 'bg-gray-700/30 border-2 border-dashed border-gray-500'}
                flex items-center justify-center
              `}
            >
              {IconComponent && (
                <IconComponent className="w-6 h-6 text-white\" strokeWidth={1.5} />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {icons.map(({ id, Icon }) => (
          <button
            key={id}
            onClick={() => handleIconClick(id)}
            disabled={selectedIcons.length >= 4}
            className={`
              aspect-square rounded-lg p-4
              bg-gray-700/50 hover:bg-gray-600/50
              transition-colors duration-200
              flex items-center justify-center
              disabled:opacity-50 disabled:cursor-not-allowed
              ${selectedIcons.includes(id) ? 'ring-2 ring-white/80' : ''}
            `}
          >
            <Icon 
              className="w-8 h-8 text-white" 
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>

      {card.question && (
        <p className="text-white/80 whitespace-pre-line">
          {card.question}
        </p>
      )}

      {error && (
        error === card?.successText ? (
          <div className="space-y-4">
            <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
              <p className="text-lg text-green-400 text-center leading-relaxed">
                {card.successText}
              </p>
            </div>

            {card.pinCodeViesti && (
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <p className="text-lg text-blue-300 text-center leading-relaxed">
                  {card.pinCodeViesti}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
            <p className="text-yellow-300 text-center leading-relaxed text-sm">
              {error}
            </p>
          </div>
        )
      )}
    </div>
  );
}