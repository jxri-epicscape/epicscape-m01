import React, { useState } from 'react';
import { Star, Award, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { VictoryBadge } from './VictoryBadge';

interface EndGridProps {
  onClose: () => void;
  onComplete?: () => void;
  playerName?: string;
  playerId?: string;
  onRatingSubmit?: (rating: number) => void;
  completionMessage?: string;
  feedbackMessage?: string;
  feedbackEmail?: string;
  time: number;
  solvedPuzzles: number;
  hintsUsed: number;
  trackName?: string;
}

export function EndGrid({ 
  onClose, 
  onComplete, 
  playerName, 
  playerId, 
  onRatingSubmit,
  completionMessage,
  feedbackMessage,
  feedbackEmail,
  time,
  solvedPuzzles,
  hintsUsed,
  trackName
}: EndGridProps) {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':');
  };

  const handleClose = () => {
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleRatingSubmit = async () => {
    if (selectedRating > 0 && playerId && onRatingSubmit) {
      const success = await onRatingSubmit(selectedRating);
      if (success !== false) {
        setRatingSubmitted(true);
      }
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isActive = starNumber <= (hoverRating || selectedRating);
      
      return (
        <button
          key={starNumber}
          onClick={() => handleRatingClick(starNumber)}
          onMouseEnter={() => setHoverRating(starNumber)}
          onMouseLeave={() => setHoverRating(0)}
          className="transition-all duration-200 hover:scale-110"
          disabled={ratingSubmitted}
        >
          <Star
            className={`w-8 h-8 transition-colors duration-200 ${
              isActive 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-400 hover:text-yellow-300'
            }`}
          />
        </button>
      );
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ 
        duration: 1.2, 
        ease: "easeOut",
        type: "spring",
        bounce: 0.4
      }}
      className="text-center space-y-8 max-w-md mx-auto relative"
    >
      <motion.h2 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, type: "spring", bounce: 0.6 }}
        className="text-2xl text-white font-light"
      >
        Bravo, {playerName}!
      </motion.h2>
      
      <div className="space-y-6">
        {/* Main completion message */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ delay: 0.6, duration: 0.8, type: "spring", bounce: 0.3 }}
          className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20 relative overflow-hidden"
        >
          <motion.div
            animate={{ 
              background: [
                "linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                "linear-gradient(45deg, rgba(255,215,0,0.2), rgba(255,105,180,0.2))",
                "linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-xl"
          />
          <p className="text-white/90 leading-relaxed relative z-10">
            {completionMessage || 'You did it! Every puzzle cracked!'}
          </p>
          <p className="text-white/90 mt-2 relative z-10">
            You solved {solvedPuzzles} puzzles and used {hintsUsed} hints! That's no small feat. You're officially epic.
          </p>
        </motion.div>

        {/* Victory Badge Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.8, type: "spring", bounce: 0.3 }}
        >
          <VictoryBadge
            playerName={playerName || 'Player'}
            trackName={trackName || 'Unknown Track'}
            date={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            time={time}
            solvedPuzzles={solvedPuzzles}
            hintsUsed={hintsUsed}
          />
        </motion.div>

        {/* Feedback section */}
        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.8, type: "spring", bounce: 0.3 }}
          className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          <p className="text-white/90 mb-2">
            {feedbackMessage || "We'd love to hear what you thought!"}
          </p>
          {feedbackEmail && (
            <a 
              href={`mailto:${feedbackEmail}`}
              className="inline-block text-white/90 hover:text-purple-300 transition-colors"
            >
              {feedbackEmail}
            </a>
          )}
          <div className="mt-2">
  
          </div>
        </motion.div>

        {/* Credits section */}
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5, duration: 0.8, type: "spring", bounce: 0.3 }}
          className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          <div className="space-y-2 text-center">
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 300 300"
              className="w-8 h-8 mx-auto fill-white mb-2"
            >
              <g transform="translate(0,300) scale(0.1,-0.1)" stroke="none">
                <path d="M1325 2913 c-71 -8 -226 -48 -293 -74 -175 -70 -291 -146 -428 -283 -190 -190 -295 -387 -345 -648 -35 -185 -21 -418 38 -603 100 -319 335 -590 638 -736 115 -55 161 -72 283 -101 84 -21 114 -22 795 -25 l707 -4 0 657 c0 543 -3 675 -16 763 -17 117 -65 274 -115 373 -177 355 -523 610 -913 673 -82 13 -273 18 -351 8z m356 -148 c385 -67 718 -350 847 -720 44 -125 56 -202 55 -370 0 -178 -19 -275 -83 -427 -97 -234 -306 -450 -544 -562 -429 -202 -943 -104 -1268 242 -124 132 -214 293 -263 472 -39 141 -46 347 -16 493 92 449 441 795 881 872 103 18 290 18 391 0z"/>
              </g>
            </motion.svg>

            <p className="text-white/90 text-2xl font-extralight tracking-widest font-[Montserrat] uppercase">
              Epic Scape
            </p>
                      <a 
              href="https://www.epicscape.game" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block text-white/90 hover:text-purple-300 transition-colors"
            >
              www.epicscape.game
            </a>
          </div>
        </motion.div>

        {/* Star Rating Section - Only show if not submitted */}
        {playerId && !ratingSubmitted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8, duration: 0.8, type: "spring", bounce: 0.4 }}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <p className="text-white/90 mb-4">How was your Epic Scape experience?</p>
            <div className="flex justify-center gap-2 mb-4">
              {renderStars()}
            </div>
            {selectedRating > 0 && (
              <button
                onClick={handleRatingSubmit}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Submit Rating
              </button>
            )}
          </motion.div>
        )}

        {/* Thank you message - Only show after rating submitted */}
        {ratingSubmitted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <p className="text-white/90 leading-relaxed text-base">
              Thank you for rating your experience!
            </p>
          </motion.div>
        )}

        {/* Always visible Back to the game button */}
        <motion.button
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{
            scale: 1.00,
            y: 0,
            transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
          }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClose}
          className="w-full bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/40 flex items-center justify-center gap-2"
        >
          <ArrowLeft size={20} className="text-white" />
          Back to the game
        </motion.button>
      </div>
    </motion.div>
  );
}