import React, { useState } from 'react';

interface PinInputProps {
  onSubmit: (pin: string) => void;
}

export function PinInput({ onSubmit }: PinInputProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }
    onSubmit(pin);
  };

  return (
    <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-8 relative">
      <div className="space-y-6">
        <h2 className="text-2xl text-white font-light">Enter PIN Code</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={pin}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              if (value.length <= 4) {
                setPin(value);
                setError('');
              }
            }}
            placeholder="Enter 4-digit PIN"
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl tracking-widest"
            maxLength={4}
          />
          
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          
          <button
            type="submit"
            className="w-full bg-purple-500 text-white rounded-lg px-4 py-2 hover:bg-purple-600 transition-colors"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}