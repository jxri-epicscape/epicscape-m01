import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PinInputScreenProps {
  correctPin: string;
  onSuccess: () => void;
  onUnlock: (cardId: string) => void;
  cardId: string;
  onClose: () => void;
}

export function PinInputScreen({ correctPin, onSuccess, onUnlock, cardId, onClose }: PinInputScreenProps) {
  const [enteredPin, setEnteredPin] = useState('');
  const [status, setStatus] = useState<'normal' | 'open' | 'error'>('normal');

  const handleButtonClick = (value: string) => {
    if (status !== 'normal') return;

    if (value === 'del') {
      setEnteredPin(prev => prev.slice(0, -1));
    } else if (enteredPin.length < 4) {
      setEnteredPin(prev => prev + value);
    }
  };

  useEffect(() => {
    if (enteredPin.length === 4) {
      if (enteredPin === correctPin) {
        setStatus('open');
        setTimeout(() => {
          onUnlock(cardId);
          onSuccess();
        }, 2000);
      } else {
        setStatus('error');
        setTimeout(() => {
          setEnteredPin('');
          setStatus('normal');
        }, 1000);
      }
    }
  }, [enteredPin, correctPin, onSuccess, onUnlock, cardId]);

  const displayText =
    status === 'open' ? 'OPEN' :
    status === 'error' ? 'ERRO' :
    enteredPin.padEnd(4, '_');

  const textColor =
    status === 'open' ? 'text-green-400' :
    status === 'error' ? 'text-red-400' :
    'text-white';

  return (
    <div className="max-w-xs mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 relative flex flex-col items-center gap-6">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className={`text-3xl font-mono text-center tracking-widest ${textColor}`}>
        {displayText.split('').join(' ')}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'del'].map((value, idx) => (
          <button
            key={idx}
            onClick={() => handleButtonClick(value)}
            className="w-16 h-16 flex items-center justify-center rounded-lg 
              bg-gray-700 hover:bg-gray-600 
              text-white text-2xl font-semibold transition"
          >
            {value === 'del' ? 'DEL' : value}
          </button>
        ))}
      </div>
    </div>
  );
}