import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Send, Check, X } from 'lucide-react';
import type { Card } from '../types';

interface RoseGridPuzzleProps {
  card: Card;
  onComplete: (cardId: string) => void;
  successText: string;
  wrongAnswerText: string;
  wrongAnswerText2: string;
  question: string;
  haamuvastaus: string;
  title?: string;
  hintText?: string;
  bigHintText?: string;
  pinCodeViesti?: string;
  onHintUsed?: () => void;
  playerName?: string;
}

export function RoseGridPuzzle({
  onComplete,
  successText,
  wrongAnswerText,
  wrongAnswerText2,
  question,
  haamuvastaus,
  title,
  hintText,
  bigHintText,
  pinCodeViesti,
  onHintUsed,
  card,
  playerName
}: RoseGridPuzzleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showHintPrompt, setShowHintPrompt] = useState(false);
  const [showBigHintPrompt, setShowBigHintPrompt] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showBigHint, setShowBigHint] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const gridSize = 5;
  const cellSize = 50;
  const canvasSize = gridSize * cellSize;

const grid = [
  ["+1", "0", "0", "0", "+1"],
  ["-1", "-1", "0", "-1", "+1"],
  ["+2", "+1", "0", "+1", "+3"],
  ["+3", "+1", "-1", "+1", "+2"],
  ["+2", "+3", "+1", "+2", "+3"],
];


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    ctx.scale(dpr, dpr);

    // Reset shadow properties to prevent blurry grid lines
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvasSize);
      ctx.stroke();
    }
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvasSize, i * cellSize);
      ctx.stroke();
    }

    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        ctx.fillStyle = '#E5E7EB';
        ctx.fillText(cell, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
      });
    });
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    lastPos.current = { x, y };
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPos.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.strokeStyle = '#e8760c';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(255, 255, 255, 1)';
    ctx.shadowBlur = 4;
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // Reset shadow properties to prevent blurry grid lines
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvasSize, i * cellSize);
      ctx.stroke();
    }
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        ctx.fillStyle = '#E5E7EB';
        ctx.fillText(cell, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
      });
    });
  };

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const trimmedAnswer = answer.toLowerCase().trim();
  const validAnswers = ['4'];

  if (validAnswers.includes(trimmedAnswer)) {
    setAnswer('');
    setSuccess(true);
    setTimeout(() => { onComplete(card.id); }, 1);
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

  return (
    <div className="space-y-6 max-w-[300px] mx-auto">
      <div className="relative bg-gray-900 rounded-lg p-4 flex justify-center items-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-lg touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={clearCanvas}
          className="flex-1 bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale flex items-center justify-center gap-2"
        >
          <Eraser className="w-5 h-5" />
        </button>
      </div>

      {success ? (
        <div className="space-y-6">
          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
            <p className="text-lg text-green-400 text-center leading-relaxed">
              {successText}
            </p>
          </div>

          {pinCodeViesti && (
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
              <p className="text-lg text-blue-300 text-center leading-relaxed">
                {pinCodeViesti}
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <p className="text-white/80 text-center leading-relaxed">{question}</p>

          {showHintPrompt && (
            <div className="space-y-4">
              <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30">
                <p className="text-yellow-300 text-center leading-relaxed">
                  {wrongAnswerText + (playerName ? `, ${playerName}?` : '?')}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleHintResponse(true)} className="flex-1 bg-yellow-500 text-white rounded-lg px-4 py-2 hover:bg-yellow-600 transition-colors flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </button>
                <button onClick={() => handleHintResponse(false)} className="flex-1 bg-white/20 text-white rounded-lg px-4 py-2 hover:bg-white/30 transition-colors flex items-center justify-center">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {showBigHintPrompt && (
            <div className="space-y-4">
              <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30">
                <p className="text-yellow-300 text-center leading-relaxed">
                  {wrongAnswerText2 + (playerName ? `, ${playerName}?` : '?')}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleBigHintResponse(true)} className="flex-1 bg-yellow-500 text-white rounded-lg px-4 py-2 hover:bg-yellow-600 transition-colors flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </button>
                <button onClick={() => handleBigHintResponse(false)} className="flex-1 bg-white/20 text-white rounded-lg px-4 py-2 hover:bg-white/30 transition-colors flex items-center justify-center">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {showHint && (
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30">
              <p className="text-yellow-300 text-center leading-relaxed">
                {hintText}
              </p>
            </div>
          )}

          {showBigHint && (
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30">
              <p className="text-yellow-300 text-center leading-relaxed">
                {bigHintText}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={haamuvastaus}
              className="w-full bg-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-white/80"
            />
            <button type="submit" className="w-full bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale flex items-center justify-center gap-2">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}