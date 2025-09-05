import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Send } from 'lucide-react';
import type { Card } from '../types';

interface SplitScreenPuzzleProps {
  card: Card;
  onComplete: (cardId: string) => void;
  onHintUsed?: () => void;
  playerName?: string;
}

export function SplitScreenPuzzle({ card, onComplete, onHintUsed, playerName }: SplitScreenPuzzleProps) {
  const [dividerPosition, setDividerPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [answer, setAnswer] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showBigHint, setShowBigHint] = useState(false);
  const [showHintPrompt, setShowHintPrompt] = useState(false);
  const [showBigHintPrompt, setShowBigHintPrompt] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const getPositionFromEvent = (e: MouseEvent | TouchEvent): number => {
    if (!containerRef.current) return 0;
    
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    return Math.max(0, Math.min(100, (x / rect.width) * 100));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const percentage = getPositionFromEvent(e);
    setDividerPosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const percentage = getPositionFromEvent(e);
    setDividerPosition(percentage);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const normalizedAnswer = answer.toLowerCase().trim();
    const correctAnswer = card.codeAnswer?.toLowerCase().trim();
    const alternateAnswers = card.alternateAnswers?.map(a => a.toLowerCase().trim()) || [];
    
    const isCorrect = normalizedAnswer === correctAnswer || alternateAnswers.includes(normalizedAnswer);
    
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

  if (!card.beforeImage || !card.afterImage) {
    return (
      <div className="text-center text-white/80">
        Missing puzzle images. Please check the card configuration.
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

      {/* Split Screen Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-96 rounded-lg overflow-hidden cursor-col-resize select-none touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Before Image */}
        <div 
          className="absolute inset-0 transition-all duration-100 ease-out"
          style={{ clipPath: `inset(0 ${100 - dividerPosition}% 0 0)` }}
        >
          <img
            src={card.beforeImage}
            alt="Before"
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            Before
          </div>
        </div>

        {/* After Image */}
        <div 
          className="absolute inset-0 transition-all duration-100 ease-out"
          style={{ clipPath: `inset(0 0 0 ${dividerPosition}%)` }}
        >
          <img
            src={card.afterImage}
            alt="After"
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            After
          </div>
        </div>

        {/* Divider Line with White Glowing Blur */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white transition-all duration-100 ease-out"
          style={{ 
            left: `${dividerPosition}%`, 
            transform: 'translateX(-50%)',
            boxShadow: '0 0 15px 5px rgba(255, 255, 255, 0.7)'
          }}
        >
          {/* Divider Handle */}
          <div 
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white hover:scale-105 cursor-col-resize flex items-center justify-center transition-all duration-100 ${
              isDragging ? 'scale-110 shadow-xl' : ''
            }`}
          >
            <div className="w-1 h-5 bg-gray-600 transition-all duration-100" />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-white/80">
        <p className="mb-2">Drag the divider to explore the images and find the answer</p>
        {card.question && (
          <p className="text-white/90 font-medium">{card.question}</p>
        )}
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
              {card.successText || 'Excellent! You\'ve solved the puzzle!'}
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
            placeholder={card.haamuvastaus || 'Enter your answer'}
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