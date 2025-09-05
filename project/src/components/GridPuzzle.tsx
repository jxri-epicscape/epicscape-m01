import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { Card } from '../types';

interface GridPuzzleProps {
  card: Card;
  onComplete: (cardId: string) => void;
  onHintUsed?: () => void;
  playerName?: string;
}

export function GridPuzzle({ card, onComplete, onHintUsed, playerName }: GridPuzzleProps) {
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showHintPrompt, setShowHintPrompt] = useState(false);
  const [showBigHintPrompt, setShowBigHintPrompt] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showBigHint, setShowBigHint] = useState(false);
  
  const gridSize = card.gridSize || 6;
  const tiles = card.tiles || [];

  const handleTileClick = (tileId: number) => {
    setSelectedTiles(prev => {
      const newSelection = [...prev];
      const index = newSelection.indexOf(tileId);
      
      if (index === -1) {
        newSelection.push(tileId);
      } else {
        newSelection.splice(index, 1);
      }
      
      if (newSelection.length === gridSize) {
        const solution = newSelection.join('');
        if (solution === (card.solution || '612453')) {
          setShowSuccess(true);
          setTimeout(() => onComplete(card.id), 1);
        } else {
          setError(card.wrongAnswerText || 'Try again');
          if (!showHint && !showBigHint) {
            setShowHintPrompt(true);
          } else if (showHint && !showBigHint) {
            setShowBigHintPrompt(true);
          }
          return [];
        }
      }
      
      return newSelection;
    });
  };

  const handleHintResponse = (wantsHint: boolean) => {
    setShowHintPrompt(false);
    if (wantsHint) {
      setShowHint(true);
      if (onHintUsed) onHintUsed();
    }
  };

  const handleBigHintResponse = (wantsBigHint: boolean) => {
    setShowBigHintPrompt(false);
    if (wantsBigHint) {
      setShowBigHint(true);
      if (onHintUsed) onHintUsed();
    }
  };

  const getGridCols = () => {
    return gridSize <= 4 ? 'grid-cols-2' : 'grid-cols-3';
  };

  return (
    <div className="space-y-6">
      {card.title && (
        <h2 className="text-2xl text-white font-light">
          {card.title}
        </h2>
      )}

      <div className={`grid ${getGridCols()} gap-4`}>
        {tiles.map((tile) => (
          <div
            key={tile.id}
            onClick={() => handleTileClick(tile.id)}
            className={`
              aspect-square rounded-lg overflow-hidden cursor-pointer
              transform transition-all duration-300
              ${selectedTiles.includes(tile.id) ? 'ring-4 ring-white/80 scale-95' : 'hover:scale-105'}
            `}
          >
            <img
              src={tile.image}
              alt={`Grid tile ${tile.id + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {showHintPrompt && (
        <div className="space-y-4">
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30 space-y-3">
            <p className="text-yellow-300 text-center leading-relaxed">
              {card.wrongAnswerText + (playerName ? `, ${playerName}?` : '?')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleHintResponse(true)}
              className="flex-1 bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale flex items-center justify-center"
            >
              <Check className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleHintResponse(false)}
              className="flex-1 bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {showBigHintPrompt && (
        <div className="space-y-4">
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30 space-y-3">
            <p className="text-yellow-300 text-center leading-relaxed">
              {card.wrongAnswerText2 + (playerName ? `, ${playerName}?` : '?')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleBigHintResponse(true)}
              className="flex-1 bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale flex items-center justify-center"
            >
              <Check className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleBigHintResponse(false)}
              className="flex-1 bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {showHint && (
        <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
          <p className="text-yellow-300 text-center leading-relaxed">
            {card.hintText}
          </p>
        </div>
      )}

      {showBigHint && (
        <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
          <p className="text-yellow-300 text-center leading-relaxed">
            {card.bigHintText}
          </p>
        </div>
      )}

      {showSuccess ? (
        <div className="space-y-4">
          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
            <p className="text-lg text-green-400 text-center leading-relaxed">
              {card.successText || "Excellent work! You've solved the puzzle!"}
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
      ) : card.question && (
        <p className="text-white/80 text-center leading-relaxed">
          {card.question}
        </p>
      )}
    </div>
  );
}