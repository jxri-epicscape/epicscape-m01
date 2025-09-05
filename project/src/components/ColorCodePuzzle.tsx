import React, { useState, useRef } from 'react';
import { Check, X, Send, GripVertical } from 'lucide-react';
import type { Card, LetterStrip } from '../types';

interface ColorCodePuzzleProps {
  card: Card;
  onComplete: (cardId: string) => void;
  onHintUsed?: () => void;
  playerName?: string;
}

export function ColorCodePuzzle({ card, onComplete, onHintUsed, playerName }: ColorCodePuzzleProps) {
  const [orderedLetterStrips, setOrderedLetterStrips] = useState<LetterStrip[]>(() => {
    // Shuffle the letter strips initially
    if (!card.letterStrips) return [];
    const shuffled = [...card.letterStrips];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [touchedItemCurrentIndex, setTouchedItemCurrentIndex] = useState<number | null>(null);
  const [touchStartClientY, setTouchStartClientY] = useState<number>(0);
  const [answer, setAnswer] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showBigHint, setShowBigHint] = useState(false);
  const [showHintPrompt, setShowHintPrompt] = useState(false);
  const [showBigHintPrompt, setShowBigHintPrompt] = useState(false);
  
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const lastSwapRef = useRef<number>(0);

  const getColorClass = (color: string): string => {
    const colorMap: Record<string, string> = {
      pink: 'bg-pink-400',
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      gray: 'bg-gray-500',
      yellow: 'bg-yellow-400',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      cyan: 'bg-cyan-400',
      indigo: 'bg-indigo-500',
    };
    return colorMap[color.toLowerCase()] || 'bg-gray-400';
  };

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedItemIndex === null) return;

    setOrderedLetterStrips(prev => {
      const newOrder = [...prev];
      const [draggedItem] = newOrder.splice(draggedItemIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);
      return newOrder;
    });

    setDraggedItemIndex(null);
  };

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0];
    setTouchStartClientY(touch.clientY);
    setTouchedItemCurrentIndex(index);
    
    const element = itemRefs.current.get(index);
    if (element) {
      element.style.transform = 'scale(1.05)';
      element.style.zIndex = '10';
    }
  };

  const handleTouchMove = (e: React.TouchEvent, currentIndex: number) => {
    if (touchedItemCurrentIndex === null) return;
    e.preventDefault();

    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartClientY;
    
    const element = itemRefs.current.get(currentIndex);
    if (element) {
      element.style.transform = `translateY(${deltaY}px) scale(1.05)`;
    }

    // Check for swaps with other items
    const itemElements = Array.from(itemRefs.current.entries());
    for (const [itemIndex, itemElement] of itemElements) {
      if (itemIndex === currentIndex) continue;
      
      const rect = itemElement.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;

      if (Math.abs(touch.clientY - centerY) < rect.height / 2) {
        const now = Date.now();
        if (now - lastSwapRef.current > 150) {
          setOrderedLetterStrips(prev => {
            const newOrder = [...prev];
            const touchedIndex = prev.findIndex((_, i) => i === touchedItemCurrentIndex);
            const targetIndex = prev.findIndex((_, i) => i === itemIndex);
            
            if (touchedIndex !== -1 && targetIndex !== -1) {
              const [moved] = newOrder.splice(touchedIndex, 1);
              newOrder.splice(targetIndex, 0, moved);
            }
            
            return newOrder;
          });
          
          setTouchStartClientY(touch.clientY);
          lastSwapRef.current = now;
        }
        break;
      }
    }
  };

  const handleTouchEnd = (index: number) => {
    const element = itemRefs.current.get(index);
    if (element) {
      element.style.transform = '';
      element.style.zIndex = '';
    }
    setTouchedItemCurrentIndex(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formedWord = orderedLetterStrips.map(strip => strip.letter).join('').toLowerCase();
    const normalizedAnswer = answer.toLowerCase().trim();
    const correctAnswer = card.codeAnswer?.toLowerCase().trim();
    const alternateAnswers = card.alternateAnswers?.map(a => a.toLowerCase().trim()) || [];
    
    const isCorrect = (normalizedAnswer === correctAnswer || alternateAnswers.includes(normalizedAnswer)) &&
                     (formedWord === correctAnswer || alternateAnswers.includes(formedWord));
    
    if (isCorrect) {
      setShowSuccess(true);
      setTimeout(() => {
        onComplete(card.id);
      }, 1);
    } else {
      setAnswer('');
      if (!showHint && !showBigHint) {
        setShowHintPrompt(true);
      } else if (showHint && !showBigHint) {
        setShowBigHintPrompt(true);
      }
    }
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

  if (!card.colorSequence || !card.letterStrips) {
    return (
      <div className="text-center text-white/80">
        Missing puzzle configuration. Please check the card setup.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {card.title && (
        <h2 className="text-2xl text-white font-light text-center">
          {card.title}
        </h2>
      )}

      {/* Main Puzzle Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side - Color Sequence (Nested Boxes) */}
        <div className="space-y-3">
          <h3 className="text-white/80 text-center font-medium">Color Order</h3>
          <div className="relative w-full h-64 mx-auto">
            {card.colorSequence.map((color, index) => {
              const size = 200 - (index * 30);
              const offset = index * 15;
              return (
                <div
                  key={index}
                  className={`absolute ${getColorClass(color)} rounded-lg border-2 border-gray-800`}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    top: `${offset}px`,
                    left: `50%`,
                    transform: 'translateX(-50%)',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Right Side - Draggable Letter Strips */}
        <div className="space-y-3">
          <h3 className="text-white/80 text-center font-medium">Letter Strips</h3>
          <div className="space-y-2">
            {orderedLetterStrips.map((strip, index) => (
              <div
                key={`${strip.color}-${strip.letter}-${index}`}
                ref={el => el && itemRefs.current.set(index, el)}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={(e) => handleTouchMove(e, index)}
                onTouchEnd={() => handleTouchEnd(index)}
                className={`
                  ${getColorClass(strip.color)} 
                  h-12 rounded-lg cursor-move touch-manipulation
                  flex items-center justify-between px-4
                  hover:scale-105 transition-transform duration-200
                  border-2 border-gray-800
                  ${draggedItemIndex === index ? 'opacity-75' : ''}
                `}
                style={{ touchAction: 'none' }}
              >
                <GripVertical className="w-5 h-5 text-gray-800" />
                <span className="text-2xl font-bold text-gray-800">
                  {strip.letter}
                </span>
                <div className="w-5" /> {/* Spacer for balance */}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-white/80">
        <p className="mb-2">Arrange the letter strips to match the color order, then type the word</p>
        {card.question && (
          <p className="text-white/90 font-medium">{card.question}</p>
        )}
      </div>

      {/* Current Word Display */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <p className="text-white/80 text-sm text-center mb-2">Current word formed:</p>
        <p className="text-white text-xl font-bold text-center tracking-wider">
          {orderedLetterStrips.map(strip => strip.letter).join('')}
        </p>
      </div>

      {/* Hint Prompts */}
      {showHintPrompt && (
        <div className="space-y-4">
          <div className="bg-yellow-300/30 backdrop-blur-sm rounded-xl p-6 border border-yellow-300/60">
            <p className="text-yellow-300 text-center leading-relaxed">
              {card.wrongAnswerText + (playerName ? `, ${playerName}?` : '?')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleHintResponse(true)}
              className="flex-1 bg-yellow-500 text-white rounded-lg px-4 py-2 hover:bg-yellow-600 transition-colors flex items-center justify-center"
            >
              <Check className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleHintResponse(false)}
              className="flex-1 bg-white/20 text-white rounded-lg px-4 py-2 hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {showBigHintPrompt && (
        <div className="space-y-4">
          <div className="bg-yellow-300/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-300/30">
            <p className="text-yellow-300 text-center leading-relaxed">
              {card.wrongAnswerText2 + (playerName ? `, ${playerName}?` : '?')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleBigHintResponse(true)}
              className="flex-1 bg-yellow-500 text-white rounded-lg px-4 py-2 hover:bg-yellow-600 transition-colors flex items-center justify-center"
            >
              <Check className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleBigHintResponse(false)}
              className="flex-1 bg-white/20 text-white rounded-lg px-4 py-2 hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Hint Display */}
      {showHint && (
        <div className="bg-yellow-300/30 backdrop-blur-sm rounded-xl p-6 border border-yellow-300/60">
          <p className="text-yellow-300 text-center leading-relaxed">
            {card.hintText || ''}
          </p>
        </div>
      )}

      {showBigHint && (
        <div className="bg-yellow-300/30 backdrop-blur-sm rounded-xl p-6 border border-yellow-300/60">
          <p className="text-yellow-300 text-center leading-relaxed">
            {card.bigHintText || ''}
          </p>
        </div>
      )}

      {/* Success Display */}
      {showSuccess ? (
        <div className="space-y-6">
          <div className="bg-green-500/30 backdrop-blur-sm rounded-xl p-6 border border-green-500/60">
            <p className="text-lg text-green-400 text-center leading-relaxed">
              {card.successText || 'Excellent! You\'ve solved the color puzzle!'}
            </p>
          </div>

          {card.pinCodeViesti && (
            <div className="bg-blue-500/30 backdrop-blur-sm rounded-xl p-6 border border-blue-500/60">
              <p className="text-lg text-blue-300 text-center leading-relaxed">
                {card.pinCodeViesti}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Answer Input */
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={card.haamuvastaus || 'Type the word you formed'}
            className="w-full bg-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-white/80 placeholder:text-white/70"
          />
          <button
            type="submit"
            className="w-full bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      )}
    </div>
  );
}