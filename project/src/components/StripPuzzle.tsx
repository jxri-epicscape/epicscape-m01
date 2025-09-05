import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GripVertical, MoveVertical, Send } from 'lucide-react';
import { Card } from '../types';

interface StripPuzzleProps {
  card: Card;
  onComplete: (cardId: string) => void;
  playerName: string;
}

type StripValue = string | { color: string } | { value: string };

export function StripPuzzle({ card, onComplete, playerName }: StripPuzzleProps) {
  const [strips, setStrips] = useState<{ id: number; numbers: StripValue[] }[]>(() => card.strips || []);
  const [draggedStrip, setDraggedStrip] = useState<number | null>(null);
  const [touchedStrip, setTouchedStrip] = useState<number | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [playerAnswer, setPlayerAnswer] = useState('');
  const [error, setError] = useState('');
  const [showLocalSuccess, setShowLocalSuccess] = useState(false);

  const touchPosRef = useRef<{ startY: number; currentY: number }>({ startY: 0, currentY: 0 });
  const stripRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const lastSwapRef = useRef<number>(0);

  useEffect(() => {
    if (!card.strips || card.strips.length === 0) {
      console.error('No strips data found in card!');
    }
  }, [card.strips]);

  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const handleSubmitAnswer = () => {
    const submittedAnswer = playerAnswer.toUpperCase().trim();

    if (submittedAnswer === '13370') {
      setShowLocalSuccess(true);
      setError('');
      vibrate([100, 50, 100]);
      setTimeout(() => {
        onComplete(card.id);
      }, 1);
    } else {
      setError(card.wrongAnswerText || 'Try again!');
      vibrate(200);
    }
  };

  const handleDragStart = (stripId: number) => {
    setDraggedStrip(stripId);
    setIsMoving(true);
    vibrate(50);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent, stripId: number) => {
    const touch = e.touches[0];
    touchPosRef.current = { startY: touch.clientY, currentY: touch.clientY };
    setTouchedStrip(stripId);
    setIsMoving(true);
    vibrate(50);
  };

  const handleTouchMove = (e: React.TouchEvent, stripId: number) => {
    if (!touchedStrip) return;
    e.preventDefault();

    const touch = e.touches[0];
    touchPosRef.current.currentY = touch.clientY;
    const deltaY = touchPosRef.current.currentY - touchPosRef.current.startY;
    const touchedElement = stripRefs.current.get(stripId);

    if (touchedElement) {
      touchedElement.style.transform = `translateY(${deltaY}px)`;
      touchedElement.style.boxShadow = '0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -2px rgba(0, 0, 0, 0.06)';
    }

    const stripElements = Array.from(stripRefs.current.entries());
    for (const [id, element] of stripElements) {
      if (id === stripId) continue;
      const rect = element.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;

      if (Math.abs(touch.clientY - centerY) < rect.height / 2) {
        const touchedIdx = strips.findIndex(s => s.id === stripId);
        const targetIdx = strips.findIndex(s => s.id === id);

        if (touchedIdx !== targetIdx) {
          const now = Date.now();
          if (now - lastSwapRef.current > 150) {
            setStrips(prev => {
              const newStrips = [...prev];
              const [moved] = newStrips.splice(touchedIdx, 1);
              newStrips.splice(targetIdx, 0, moved);
              return newStrips;
            });
            touchPosRef.current.startY = touch.clientY;
            lastSwapRef.current = now;
            vibrate([40, 60, 40]);
          }
          break;
        }
      }
    }
  };

  const handleTouchEnd = (stripId: number) => {
    const element = stripRefs.current.get(stripId);
    if (element) {
      element.style.transform = '';
      element.style.boxShadow = '';
    }
    setTouchedStrip(null);
    setIsMoving(false);
    vibrate(30);
  };

  const handleDrop = useCallback((targetStripId: number) => {
    if (draggedStrip === null) return;

    setStrips(prevStrips => {
      const newStrips = [...prevStrips];
      const draggedIndex = newStrips.findIndex(strip => strip.id === draggedStrip);
      const targetIndex = newStrips.findIndex(strip => strip.id === targetStripId);

      const [draggedItem] = newStrips.splice(draggedIndex, 1);
      newStrips.splice(targetIndex, 0, draggedItem);

      return newStrips;
    });

    setDraggedStrip(null);
    setIsMoving(false);
    vibrate([40, 60, 40]);
  }, [draggedStrip]);

  const getStripBgColor = (strip: { numbers: StripValue[] }) => {
    const colorObj = strip.numbers.find(n => typeof n === 'object' && 'color' in n) as { color?: string } | undefined;
    if (!colorObj?.color) return 'bg-gray-600';
    switch (colorObj.color) {
      case 'orange': return 'bg-orange-500';
      case 'teal': return 'bg-pink-400';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {card.title && (
        <h2 className="text-2xl text-white font-light">{card.title}</h2>
      )}

      {strips.map((strip) => (
        <div
          key={strip.id}
          ref={el => el && stripRefs.current.set(strip.id, el)}
          draggable
          onDragStart={() => handleDragStart(strip.id)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(strip.id)}
          onTouchStart={(e) => handleTouchStart(e, strip.id)}
          onTouchMove={(e) => handleTouchMove(e, strip.id)}
          onTouchEnd={() => handleTouchEnd(strip.id)}
          className={`flex items-center p-2 rounded-lg cursor-move touch-manipulation transition-all duration-200 ${draggedStrip === strip.id || touchedStrip === strip.id ? 'opacity-75' : ''} ${touchedStrip === strip.id ? 'z-10' : ''} ${getStripBgColor(strip)}`}
          style={{ willChange: 'transform', touchAction: 'none' }}
        >
          <div className="flex items-center gap-2 mr-2 text-white transition-colors group">
            <GripVertical size={20} className="group-hover:scale-110 transition-transform" />
            <MoveVertical size={16} className={`transition-all duration-200 ${isMoving ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`} />
          </div>

          <div className="text-white font-semibold text-sm sm:text-base break-words whitespace-normal">
            {strip.numbers
              .map((n) => typeof n === 'string' ? n : ('value' in n ? n.value : ''))
              .filter(Boolean)
              .join(' ')}
          </div>
        </div>
      ))}

      <div className="text-center space-y-4 mb-8">
        {card.question && (
          <p className="text-white/80 mb-4 whitespace-pre-line">{card.question}</p>
        )}
      </div>

      {showLocalSuccess ? (
        <div className="space-y-4">
          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
            <p className="text-lg text-green-400 text-center leading-relaxed">
              {card.successText || 'Well done! You solved the puzzle like a pro!'}
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
        <>
          <input
            type="text"
            value={playerAnswer}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              if (value.length <= 5) {
                setPlayerAnswer(value);
              }
            }}
            placeholder="Enter 5-digit code"
            className="w-full bg-white/10 text-white rounded-lg px-4 py-2 backdrop-blur-md ring-1 ring-white/20 placeholder:text-white/70 focus:outline-none focus:ring-1 focus:ring-white/60"
            maxLength={5}
          />

          {error && (
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
              <p className="text-yellow-300 text-center leading-relaxed text">
                {error}
              </p>
            </div>
          )}

          <button
            onClick={handleSubmitAnswer}
            className="w-full bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
