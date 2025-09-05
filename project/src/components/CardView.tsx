import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, Settings, Book, Waypoints, Layers2, Send, Check, Lock, X, Lightbulb, ScrollText } from 'lucide-react';
import type { Card } from '../types';
import { StripPuzzle } from './StripPuzzle';
import { FoodGridPuzzle } from './FoodGridPuzzle';
import { JigsawPuzzle } from './JigsawPuzzle';
import { LeverPuzzle } from './LeverPuzzle';
import { MultimediaDemo } from './MultimediaDemo';
import { DiceModel } from './DiceModel';
import { ThreeD } from './ThreeD';
import { RoseGridPuzzle } from './RoseGridPuzzle';
import { GridPuzzle } from './GridPuzzle';
import { SplitScreenPuzzle } from './SplitScreenPuzzle';
import { ColorCodePuzzle } from './ColorCodePuzzle';
import { ARStatuePuzzle } from './ARStatuePuzzle';
import { trackHintUsage } from '../lib/hint-service';

interface CardViewProps {
  card: Card;
  onComplete: (cardId: string) => void;
  onClose: () => void;
  onSetPlayerName: (name: string) => void;
  playerName: string;
  onHintUsed: () => void;
  onStopwatchPause?: () => void;
  playerId?: string;
  isCardCompletedPersistently?: boolean;
  onSuccessMessageVisibilityChange?: (isVisible: boolean) => void;
  onShowEndGrid?: () => void;
}

// Icon mapping for the parser - only original icons
const iconMap: Record<string, React.ComponentType<any>> = {
  lock: Lock,
  arrowleft: ArrowLeft,
  arrowright: ArrowRight,
  send: Send,
  check: Check,
  x: X,
  layers2: Layers2,
  mappin: MapPin, 
  settings: Settings,
  book: Book,
  waypoints: Waypoints,
};

export function CardView({
  card,
  onComplete,
  onClose,
  onSetPlayerName,
  playerName,
  onHintUsed,
  onStopwatchPause,
  playerId,
  isCardCompletedPersistently = false,
  onSuccessMessageVisibilityChange,
  onShowEndGrid,
}: CardViewProps) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [showTemporarySuccess, setShowTemporarySuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showBigHint, setShowBigHint] = useState(false);
  const [showHintPrompt, setShowHintPrompt] = useState(false);
  const [showBigHintPrompt, setShowBigHintPrompt] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  // Refs to store timeout IDs
  const timeoutsRef = useRef<number[]>([]);

  // Cleanup function to clear all timeouts
  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeoutId => window.clearTimeout(timeoutId));
    timeoutsRef.current = [];
  }, []);

  // Cleanup on unmount or when card changes
  useEffect(() => {
    return () => clearTimeouts();
  }, [card.id, clearTimeouts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any existing timeouts before setting new ones
    clearTimeouts();

    if (card.type === 'instruction' && card.instructionPages && currentPage === card.instructionPages.length - 1) {
      const trimmedName = answer.trim();
      const nameRegex = /^[\p{L}\p{N}\s-]{2,20}$/u;

      if (!trimmedName) {
        setError('Please enter your name');
        return;
      }

      if (!nameRegex.test(trimmedName)) {
        setError('Name must be 2-20 characters long and contain only letters, numbers, and spaces');
        return;
      }

      onSetPlayerName(trimmedName);
      setShowTemporarySuccess(true);
      onSuccessMessageVisibilityChange?.(true);
      const timeout = window.setTimeout(() => {
        setShowTemporarySuccess(false);
        onSuccessMessageVisibilityChange?.(false);
        onComplete(card.id);
      }, 1);
      timeoutsRef.current.push(timeout);
      return;
    }

    const normalizedAnswer = answer.toLowerCase().trim();
    const correctAnswer = card.codeAnswer?.toLowerCase().trim();
    const alternateAnswers = card.alternateAnswers?.map(a => a.toLowerCase().trim()) || [];

    const isCorrect = normalizedAnswer === correctAnswer || alternateAnswers.includes(normalizedAnswer);

    if (isCorrect) {
      setShowTemporarySuccess(true);
      onSuccessMessageVisibilityChange?.(true);
      
      if (onStopwatchPause && card.triggersEndGrid) {
        onStopwatchPause();
      }
      
      const timeout = window.setTimeout(() => {
        setShowTemporarySuccess(false);
        onSuccessMessageVisibilityChange?.(false);
        onComplete(card.id);
      }, 10000);
      timeoutsRef.current.push(timeout);
    } else {
      setAnswer('');
      if (!showHint && !showBigHint) {
        setShowHintPrompt(true);
      } else if (showHint && !showBigHint) {
        setShowBigHintPrompt(true);
      }
    }
  };

  const handleHintResponse = async (wantsHint: boolean) => {
    setShowHintPrompt(false);
    if (wantsHint) {
      setShowHint(true);
      onHintUsed();
      
      if (playerId) {
        await trackHintUsage({
          playerId,
          hintType: 'small',
          puzzleId: card.id,
          cardsTitle: card.title
        });
      }
    }
  };

  const handleBigHintResponse = async (wantsBigHint: boolean) => {
    setShowBigHintPrompt(false);
    if (wantsBigHint) {
      setShowBigHint(true);
      onHintUsed();
      
      if (playerId) {
        await trackHintUsage({
          playerId,
          hintType: 'big',
          puzzleId: card.id,
          cardsTitle: card.title
        });
      }
    }
  };

  const parseContent = (content: string) => {
    // Split content by icon tags using regex to capture the icon names
    const iconRegex = /\[([^\]]+)\]/g;
    const parts = content.split(iconRegex);
    
    return parts.map((part, index) => {
      // Even indices are text, odd indices are icon names
      if (index % 2 === 0) {
        // This is text - handle newlines by splitting and adding <br /> elements
        const lines = part.split('\n');
        return lines.map((line, lineIndex) => (
          <React.Fragment key={`${index}-${lineIndex}`}>
            {line}
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        ));
      } else {
        // This is an icon name
        const IconComponent = iconMap[part.toLowerCase()];
        if (IconComponent) {
          return (
            <IconComponent 
              key={index} 
              className="inline-block w-4 h-4 mx-1 mb-1" 
            />
          );
        } else {
          // If icon not found, return the original text in brackets
          return `[${part}]`;
        }
      }
    });
  };

  // Handle close with cleanup
  const handleClose = () => {
    clearTimeouts();
    onSuccessMessageVisibilityChange?.(false);
    onClose();
  };

  const handleChildPuzzleComplete = (cardId: string) => {
    setShowTemporarySuccess(true);
    onSuccessMessageVisibilityChange?.(true);
    
    const timeout = window.setTimeout(() => {
      setShowTemporarySuccess(false);
      onSuccessMessageVisibilityChange?.(false);
      onComplete(cardId);
    }, 10000);
    timeoutsRef.current.push(timeout);
  };

  // Determine what success state to show
  const shouldShowSuccess = showTemporarySuccess || isCardCompletedPersistently;
  const shouldShowCloseButton = isCardCompletedPersistently || (!shouldShowSuccess && !showInstructions);

  if (card.instructionPages && showInstructions) {
    return (
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-8 relative z-50">
        {shouldShowCloseButton && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        <div className="space-y-6">
          <h2 className="text-2xl text-white font-light">{card.instructionPages[currentPage].title}</h2>
          
          {card.instructionPages[currentPage].image && (
            <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
              <img 
                src={card.instructionPages[currentPage].image} 
                alt={card.instructionPages[currentPage].title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          <p className="text-white/80 whitespace-pre-line">
            {parseContent(card.instructionPages[currentPage].content)}
          </p>

          <div className="flex flex-col gap-4">
            {card.type === 'instruction' && currentPage === card.instructionPages.length - 1 && !playerName && !shouldShowSuccess && (
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your name"
                  className="w-full bg-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-white/70"
                  maxLength={20}
                />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale"
                >
                  Start Epic Scape
                </button>
              </form>
            )}

            {(card.type === 'instruction' && currentPage === card.instructionPages.length - 1 && (playerName || shouldShowSuccess)) && (
              <button
                onClick={handleClose}
                className="w-full bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale"
              >
                Return to Epic Scape
              </button>
            )}

            {card.type !== 'instruction' && currentPage === card.instructionPages.length - 1 && (
              <button
                onClick={() => setShowInstructions(false)}
                className="w-full bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale"
              >
                Start Puzzle
              </button>
            )}

            <div className="flex justify-between items-center">
              {currentPage > 0 && (
                <button 
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              )}

              {currentPage < card.instructionPages.length - 1 && (
                <button 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="text-white/60 hover:text-white transition-colors ml-auto"
                >
                  <ArrowRight size={20} />
                </button>
              )}
            </div>

            {/* Back to endings button for final puzzle */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-8 relative z-50">
      {/* 10-second progress bar for success delay */}
      {shouldShowSuccess && (
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 10, ease: "linear" }}
          className="absolute top-0 left-0 h-1 bg-green-400 rounded-t-xl z-10"
        />
      )}
      
      {shouldShowCloseButton && (
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-50"
        >
          <X className="w-6 h-6" />
        </button>
      )}
      {card.subtype === 'ar' ? (
        <ARStatuePuzzle 
          card={card} 
          onComplete={handleChildPuzzleComplete}
        />
      ) : card.subtype === 'splitscreen' ? (
        <SplitScreenPuzzle 
          card={card} 
          onComplete={handleChildPuzzleComplete}
          onHintUsed={onHintUsed}
          playerName={playerName}
        />
      ) : card.subtype === 'colorcode' ? (
        <ColorCodePuzzle 
          card={card} 
          onComplete={handleChildPuzzleComplete}
          onHintUsed={onHintUsed}
          playerName={playerName}
        />
      ) : card.subtype === 'grid' ? (
        <GridPuzzle 
          card={card} 
          onComplete={handleChildPuzzleComplete} 
        />
      ) : card.subtype === 'rearrange' ? (
        <StripPuzzle 
          card={card} 
          onComplete={handleChildPuzzleComplete} 
          playerName={playerName} 
        />
      ) : card.subtype === 'foodgrid' ? (
        <FoodGridPuzzle 
          card={card} 
          onComplete={handleChildPuzzleComplete} 
        />
      ) : card.subtype === 'rosegrid' ? (
        <RoseGridPuzzle 
          onComplete={handleChildPuzzleComplete}
          successText={card.successText || ''}
          wrongAnswerText={card.wrongAnswerText || ''}
          wrongAnswerText2={card.wrongAnswerText2 || ''}
          question={card.question || ''}
          haamuvastaus={card.haamuvastaus || ''}
          hintText={card.hintText || ''}
          bigHintText={card.bigHintText || ''}
          pinCodeViesti={card.pinCodeViesti || ''}
          onHintUsed={onHintUsed}
          playerName={playerName}
          card={card}
        />
      ) : card.subtype === '3d' ? (
        <ThreeD
          card={card}
          onComplete={handleChildPuzzleComplete}
          playerName={playerName}
        />
      ) : card.subtype === 'jigsaw' ? (
        <JigsawPuzzle 
          card={card} 
          onComplete={handleChildPuzzleComplete} 
        />
      ) : card.subtype === 'lever' ? (
        <LeverPuzzle 
          card={card} 
          onComplete={handleChildPuzzleComplete} 
        />
      ) : card.subtype === 'multimedia' ? (
        <MultimediaDemo 
          card={card} 
          onComplete={handleChildPuzzleComplete} 
        />
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl text-white font-light">{card.title}</h2>

          {card.image && (
            <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
              <img 
                src={card.image} 
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          {card.introText && <p className="text-white/80 whitespace-pre-line">{parseContent(card.introText)}</p>}
          {card.question && <p className="text-white/80 whitespace-pre-line">{parseContent(card.question)}</p>}

          {showHint && (
            <div className="bg-yellow-300/30 backdrop-blur-sm rounded-xl p-6 border border-yellow-300/60">
              <p className="text-yellow-300 text-center leading-relaxed">
                {parseContent(card.hintText || '')}
              </p>
            </div>
          )}

          {showBigHint && (
            <div className="bg-yellow-300/30 backdrop-blur-sm rounded-xl p-6 border border-yellow-300/60">
              <p className="text-yellow-300 text-center leading-relaxed">
                {parseContent(card.bigHintText || '')}
              </p>
            </div>
          )}

          {showHintPrompt && (
            <div className="space-y-4">
              <div className="bg-yellow-300/30 backdrop-blur-sm rounded-xl p-6 border border-yellow-300/60">
                <p className="text-yellow-300 text-center leading-relaxed">
                  {parseContent((card.wrongAnswerText || '') + ', ' + playerName + '?')}
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
                  className="flex-1 bg-white/20 text-white rounded-lg px-4 py-2 hover:bg-white/20 transition-colors flex items-center justify-center"
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
                  {parseContent((card.wrongAnswerText2 || '') + ', ' + playerName + '?')}
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
                  className="flex-1 bg-white/20 text-white rounded-lg px-4 py-2 hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
          
          {shouldShowSuccess ? (
            <div className="space-y-6">
              <div className="bg-green-500/30 backdrop-blur-sm rounded-xl p-6 border border-green-500/60">
                <p className="text-lg text-green-400 text-center leading-relaxed">
                  {parseContent(card.successText || '')}
                </p>
              </div>

              {card.pinCodeViesti && (
                <>
                  {card.pinCodeViesti.startsWith('Clue: ') ? (
                    // Display clue with lightbulb icon
                    <div className="bg-yellow-400/30 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/60">
                      <div className="flex items-center gap-3">
                        <Lightbulb className="w-6 h-6 text-yellow-300 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-yellow-300 font-medium text-sm mb-1">Clue found</p>
                          <p className="text-yellow-200 leading-relaxed">
                            {parseContent(card.pinCodeViesti.substring(6))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Display regular PIN code message
                    <div className="bg-blue-500/30 backdrop-blur-sm rounded-xl p-6 border border-blue-500/60">
                      <p className="text-lg text-blue-300 text-center leading-relaxed">
                        {parseContent(card.pinCodeViesti)}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Back to endings button for final puzzle */}
              {card.isFinalPuzzle && onShowEndGrid && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  onClick={onShowEndGrid}
                  className="w-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-purple-300/30 hover:from-purple-500/30 hover:to-blue-500/30 transform button-hover-scale flex items-center justify-center gap-2"
                >
                  Back to endings
                </motion.button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={card.haamuvastaus}
                className="w-full bg-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-white/80 placeholder:text-white/70"
              />

              {error && <p className="text-red-400 text-sm">{error}</p>}
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