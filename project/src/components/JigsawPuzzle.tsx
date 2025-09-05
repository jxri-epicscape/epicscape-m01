import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import type { Card } from '../types';

interface JigsawPuzzleProps {
  card: Card;
  onComplete: (cardId: string) => void;
}

interface PiecePosition {
  x: number;
  y: number;
  correctX: number;
  correctY: number;
}

export function JigsawPuzzle({ card, onComplete }: JigsawPuzzleProps) {
  const [pieces, setPieces] = useState<PiecePosition[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isJigsawVisuallyComplete, setIsJigsawVisuallyComplete] = useState(false);
  const [playerCodeAnswer, setPlayerCodeAnswer] = useState('');
  const [codeError, setCodeError] = useState('');
  const [showCodeSuccess, setShowCodeSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pieceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const STORAGE_KEY = `jigsaw_puzzle_${card.id}`;

  useEffect(() => {
    if (!card.imageSrc) return;

    const img = new Image();
    img.src = card.imageSrc;

    img.onload = () => {
      const containerWidth = 300;
      const containerHeight = 225;
      const cols = 3;
      const rows = 3;
      const pieceWidth = containerWidth / cols;
      const pieceHeight = containerHeight / rows;

      // Try to load saved state from localStorage
      const savedState = localStorage.getItem(STORAGE_KEY);
      let newPieces: PiecePosition[] = [];

      if (savedState) {
        try {
          const savedPieces = JSON.parse(savedState);
          
          // Validate saved state
          const expectedPieceCount = rows * cols;
          const isValidSavedState = Array.isArray(savedPieces) && 
            savedPieces.length === expectedPieceCount &&
            savedPieces.every(piece => 
              piece && 
              typeof piece.x === 'number' && 
              typeof piece.y === 'number' &&
              !isNaN(piece.x) && 
              !isNaN(piece.y)
            );

          if (isValidSavedState) {
            // Reconstruct pieces with saved positions
            for (let row = 0; row < rows; row++) {
              for (let col = 0; col < cols; col++) {
                const pieceIndex = row * cols + col;
                const savedPiece = savedPieces[pieceIndex];
                newPieces.push({
                  x: savedPiece.x,
                  y: savedPiece.y,
                  correctX: col * pieceWidth,
                  correctY: row * pieceHeight
                });
              }
            }
          } else {
            // Invalid saved state, generate random positions
            throw new Error('Invalid saved state format');
          }
        } catch (error) {
          console.error('Error loading saved jigsaw state:', error);
          // Fall back to random generation
          newPieces = [];
        }
      }

      if (newPieces.length === 0) {
        // Generate random positions if no saved state
        const usedPositions: { x: number; y: number }[] = [];

        const getRandomPosition = () => {
          let attempts = 0;
          let position;
          
          do {
            position = {
              x: Math.random() * (containerWidth - pieceWidth),
              y: Math.random() * (containerHeight - pieceHeight)
            };
            
            const isFarEnough = usedPositions.every(pos => 
              Math.abs(pos.x - position.x) > pieceWidth / 2 ||
              Math.abs(pos.y - position.y) > pieceHeight / 2
            );
            
            if (isFarEnough || attempts > 50) {
              usedPositions.push(position);
              return position;
            }
            
            attempts++;
          } while (true);
        };

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const position = getRandomPosition();
            newPieces.push({
              x: position.x,
              y: position.y,
              correctX: col * pieceWidth,
              correctY: row * pieceHeight
            });
          }
        }
      }

      setPieces(newPieces);
      setInitialLoad(false);
    };
  }, [card.imageSrc]);

  // Save pieces state to localStorage whenever pieces change
  useEffect(() => {
    if (!initialLoad && pieces.length > 0) {
      const piecesToSave = pieces.map(piece => ({
        x: piece.x,
        y: piece.y
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(piecesToSave));
    }
  }, [pieces, initialLoad, STORAGE_KEY]);

  useEffect(() => {
    if (!initialLoad) {
      const allInPlace = pieces.every(piece => 
        Math.abs(piece.x - piece.correctX) < 20 &&
        Math.abs(piece.y - piece.correctY) < 20
      );
      
      if (allInPlace && !isJigsawVisuallyComplete) {
        setIsJigsawVisuallyComplete(true);
      } else if (!allInPlace && isJigsawVisuallyComplete) {
        setIsJigsawVisuallyComplete(false);
        setShowCodeSuccess(false);
        setCodeError('');
      }
    }
  }, [pieces, initialLoad, isJigsawVisuallyComplete]);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const normalizedAnswer = playerCodeAnswer.toLowerCase().trim();
    
    // Special check for "too smart" players trying 0917 in the final puzzle
    if (card.id === 'final_m01' && normalizedAnswer === '0917') {
      setCodeError(card.alternateWrongAnswerText || 'Nice try, but that\'s not the right formula!');
      setPlayerCodeAnswer('');
      return;
    }
    
    const correctAnswer = card.codeAnswer?.toLowerCase().trim();
    const alternateAnswers = card.alternateAnswers?.map(a => a.toLowerCase().trim()) || [];
    
    const isCorrect = normalizedAnswer === correctAnswer || alternateAnswers.includes(normalizedAnswer);
    
    if (isCorrect) {
      setShowCodeSuccess(true);
      setTimeout(() => {
        onComplete(card.id);
      }, 1);
    } else {
      setCodeError(card.wrongAnswerText || 'Incorrect code. Try again!');
      setPlayerCodeAnswer('');
    }
  };
  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    if (!containerRef.current) return;
    
    const piece = pieceRefs.current[index];
    if (!piece) return;

    const rect = piece.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setSelectedPiece(index);
    piece.setPointerCapture(e.pointerId);
    piece.style.zIndex = '20';
    piece.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (selectedPiece === null || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const pieceWidth = 100;
    const pieceHeight = 75;

    let x = e.clientX - container.left - dragOffset.current.x;
    let y = e.clientY - container.top - dragOffset.current.y;

    // Constrain to container bounds
    x = Math.max(0, Math.min(x, container.width - pieceWidth));
    y = Math.max(0, Math.min(y, container.height - pieceHeight));

    setPieces(prev => {
      const newPieces = [...prev];
      newPieces[selectedPiece] = {
        ...newPieces[selectedPiece],
        x,
        y
      };
      return newPieces;
    });
  };

  const handlePointerUp = (index: number) => {
    if (selectedPiece === null) return;

    const piece = pieceRefs.current[index];
    if (piece) {
      piece.style.zIndex = '1';
      piece.style.cursor = 'grab';
    }

    setSelectedPiece(null);
  };

  if (!card.imageSrc) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl text-white font-light text-left mb-6">The Secret Recipe</h2>
      <div 
        ref={containerRef}
        className="relative w-[300px] h-[225px] mx-auto bg-gray-800/50 rounded-lg overflow-hidden"
      >
        {pieces.map((piece, index) => {
          const style: React.CSSProperties = {
            width: '100px',
            height: '75px',
            position: 'absolute',
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            backgroundImage: `url(${card.imageSrc})`,
            backgroundPosition: `-${piece.correctX}px -${piece.correctY}px`,
            backgroundSize: '300px 225px',
            cursor: 'grab',
            zIndex: selectedPiece === index ? 20 : 1,
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            touchAction: 'none',
            userSelect: 'none'
          };

          return (
            <div
              key={index}
              ref={el => pieceRefs.current[index] = el}
              style={style}
              className="select-none opacity-90 hover:opacity-100 transition-opacity"
              onPointerDown={(e) => handlePointerDown(index, e)}
              onPointerMove={handlePointerMove}
              onPointerUp={() => handlePointerUp(index)}
              onPointerCancel={() => handlePointerUp(index)}
            />
          );
        })}
      </div>

      {showCodeSuccess ? (
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
      ) : (
        <div className="space-y-4">
          {card.question && (
            <p className="text-white/80 text-center">
              {card.question}
            </p>
          )}

          {!isJigsawVisuallyComplete && (
            <p className="text-white/60 text-center text-sm">
              Assemble the jigsaw puzzle first, then enter the code.
            </p>
          )}

          {isJigsawVisuallyComplete && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <input
                type="text"
                value={playerCodeAnswer}
                onChange={(e) => {
                  setPlayerCodeAnswer(e.target.value);
                  setCodeError('');
                }}
                placeholder={card.haamuvastaus || ''}
                className="w-full bg-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-white/80 placeholder:text-white/70"
              />

              {codeError && (
                <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
                  <p className="text-yellow-300 text-center leading-relaxed text-sm">
                    {codeError}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}