import React, { useState } from 'react';
import { DiceModel } from './DiceModel';
import type { Card } from '../types';
import { Send } from 'lucide-react';

interface ThreeDProps {
  card: Card;
  onComplete: (cardId: string) => void;
  playerName: string;
}

export function ThreeD({ card, onComplete, playerName }: ThreeDProps) {
  const [playerAnswer, setPlayerAnswer] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    const submittedAnswer = playerAnswer.trim();

    if (submittedAnswer === '5') {
      setIsSuccess(true);
      setError('');
      vibrate([100, 50, 100]);

      setTimeout(() => {
        onComplete(card.id);
      }, 1);
    } else {
      setIsSuccess(false);
      setError(card.wrongAnswerText || 'Try again!');
      vibrate(200);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl text-white font-light">
          {card.title}</h2>
        <p className="text-white/80">{card.question}</p>
        <div className="rounded-lg overflow-hidden bg-gray-800/50">
          <DiceModel diceFaces={card.diceFaces} />
        </div>
      </div>

      <form onSubmit={handleSubmitAnswer} className="space-y-4">
        {!isSuccess && (
          <input
            type="text"
            value={playerAnswer}
            onChange={(e) => setPlayerAnswer(e.target.value)}
            placeholder="Sum of"
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-white/70"
          />
        )}
        
        {isSuccess ? (
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
          <>
            {error && (
              <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
                <p className="text-yellow-300 text-center leading-relaxed text-sm">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </>
        )}
      </form>
    </div>
  );
}