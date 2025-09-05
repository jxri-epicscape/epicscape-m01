import React, { useState, useEffect } from 'react';
import { Card } from '../types';
import {
  Icon10000, Icon20000, Icon30000, Icon40000,
  Icon1800, Icon1900, Icon2000, Icon2100,
  Icon210, Icon220, Icon230, Icon240,
  Icon1045M, Icon1046M, Icon1047M, Icon1048M
} from './NumberIcons';

interface LeverPuzzleProps {
  card: Card;
  onComplete: (cardId: string) => void;
}

export function LeverPuzzle({ card, onComplete }: LeverPuzzleProps) {
  const [leverPositions, setLeverPositions] = useState<number[]>([0, 0, 0, 0]);
  const [showSuccess, setShowSuccess] = useState(false);

  // correct combination
  const correctCombination = [1, 2, 2, 3];

 const leverThemes = [
  {
    name: 'm² of space',
    icons: [
      { Icon: Icon10000 },
      { Icon: Icon20000 }, // ✅
      { Icon: Icon30000 },
      { Icon: Icon40000 },
    ]
  },
  {
    name: 'Members',
    icons: [
      { Icon: Icon1800 },
      { Icon: Icon1900 },
      { Icon: Icon2000 }, // ✅
     { Icon: Icon2100 },
    ]
  },
  {
    name: 'Startups',
    icons: [
      { Icon: Icon210 },
      { Icon: Icon220 },
      { Icon: Icon230 }, // ✅
      { Icon: Icon240 },
    ]
  },
  {
    name: '€ Raised',
    icons: [
      { Icon: Icon1045M },
      { Icon: Icon1046M },
      { Icon: Icon1047M }, 
      { Icon: Icon1048M }, // ✅
    ]
  }
];

  const handleLeverClick = (leverIndex: number) => {
    if (showSuccess) return;
    
    setLeverPositions(prev => {
      const newPositions = [...prev];
      newPositions[leverIndex] = (newPositions[leverIndex] + 1) % 4;
      return newPositions;
    });
  };

  useEffect(() => {
    const isCorrect = leverPositions.every((pos, index) => pos === correctCombination[index]);
    
    if (isCorrect && !showSuccess) {
      setShowSuccess(true);
      setTimeout(() => {
        onComplete(card.id);
      }, 1);
    }
  }, [leverPositions, card.id, onComplete, showSuccess]);

  return (
    <div className="space-y-8">
      {/* Display current selection */}
      <div className="grid grid-cols-4 gap-3 bg-gray-800/50 p-4 rounded-lg">
        {leverThemes.map((theme, idx) => {
          const { Icon } = theme.icons[leverPositions[idx]];
          return (
            <div key={idx} className="flex items-center justify-center">
              <Icon className="w-8 h-8 text-white" />
            </div>
          );
        })}
      </div>

      {/* Levers */}
      <div className="grid grid-cols-4 gap-3">
        {leverThemes.map((theme, leverIndex) => (
          <div key={leverIndex} className="space-y-2">
            <div className="text-white/60 text-sm text-center mb-2">{theme.name}</div>
            <div className="relative">
              <button
                onClick={() => handleLeverClick(leverIndex)}
                disabled={showSuccess}
                className={`w-full h-32 bg-gray-700/50 rounded-lg relative overflow-hidden group transition-colors
                  ${showSuccess ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-600/50'}`}
              >
                {theme.icons.map((iconData, positionIndex) => {
                  const { Icon } = iconData;
                  const isActive = positionIndex === leverPositions[leverIndex];
                  return (
                    <div 
                      key={positionIndex}
                      className={`absolute inset-x-0 h-1/4 flex items-center justify-center transition-opacity duration-200
  ${isActive ? 'opacity-100' : 'opacity-50'}
  ${positionIndex === 0 ? 'top-0' : positionIndex === 1 ? 'top-1/4' : positionIndex === 2 ? 'top-2/4' : 'top-3/4'}`}
>
  <Icon className="w-6 h-6 text-white" />
</div>
                  );
                })}
                {/* Lever indicator */}
                <div 
                  className="absolute left-0 w-2 bg-white/80 rounded-r transform transition-transform duration-200 ease-in-out"
                  style={{ 
                    height: 'calc(100% / 4)',
                    top: 0,
                    transform: `translateY(${leverPositions[leverIndex] * 100}%)`
                  }}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!showSuccess && card.question && (
        <p className="text-white/80 text-center">
          {card.question}
        </p>
      )}

      {showSuccess && (
        <div className="space-y-4">
          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
            <p className="text-lg text-green-400 text-center leading-relaxed">
              {card.successText || "Excellent work! You've solved the lever puzzle!"}
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
      )}
    </div>
  );
}