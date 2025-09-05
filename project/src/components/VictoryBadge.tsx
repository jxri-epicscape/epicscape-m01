import React, { useRef } from 'react';
import { Download, Share2, Trophy, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';

interface VictoryBadgeProps {
  playerName: string;
  trackName: string;
  date: string;
  time: number;
  solvedPuzzles: number;
  hintsUsed: number;
}

export function VictoryBadge({ 
  playerName, 
  trackName, 
  date, 
  time, 
  solvedPuzzles, 
  hintsUsed 
}: VictoryBadgeProps) {
  const badgeRef = useRef<HTMLDivElement>(null);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleSaveAndShare = async () => {
    if (!badgeRef.current) return;

    try {
      // Create a temporary container with white background for better image quality
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      tempContainer.style.padding = '40px';
      tempContainer.style.borderRadius = '20px';
      tempContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      
      // Clone the badge content
      const clonedBadge = badgeRef.current.cloneNode(true) as HTMLElement;
      tempContainer.appendChild(clonedBadge);
      document.body.appendChild(tempContainer);

      // Generate the image
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: null,
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        width: tempContainer.offsetWidth,
        height: tempContainer.offsetHeight,
      });

      // Clean up
      document.body.removeChild(tempContainer);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `epic-scape-victory-${playerName.replace(/\s+/g, '-').toLowerCase()}-${date}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');

      // Try to share if Web Share API is available
      if (navigator.share && navigator.canShare) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `epic-scape-victory-${playerName}.png`, { type: 'image/png' });
            try {
              await navigator.share({
                title: `${playerName} completed Epic Scape!`,
                text: `I just completed the ${trackName} X Epic Scape in ${formatTime(time)}! 🎉 #EpicScape`,
                files: [file]
              });
            } catch (err) {
              console.log('Share cancelled or failed');
            }
          }
        }, 'image/png');
      }
    } catch (error) {
      console.error('Error generating victory badge:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.8, type: "spring", bounce: 0.3 }}
      className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20"
    >
      <div className="text-center space-y-4">
        <h3 className="text-white/90 text-lg font-medium mb-4">Victory Achieved!</h3>
        
        {/* The badge content that will be captured */}
        <div 
          ref={badgeRef}
          className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/30 space-y-4"
        >
          {/* Epic Scape Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 300 300"
              className="w-8 h-8 text-white fill-current"
            >
              <g transform="translate(0,300) scale(0.1,-0.1)" stroke="none">
                <path d="M1325 2913 c-71 -8 -226 -48 -293 -74 -175 -70 -291 -146 -428 -283 -190 -190 -295 -387 -345 -648 -35 -185 -21 -418 38 -603 100 -319 335 -590 638 -736 115 -55 161 -72 283 -101 84 -21 114 -22 795 -25 l707 -4 0 657 c0 543 -3 675 -16 763 -17 117 -65 274 -115 373 -177 355 -523 610 -913 673 -82 13 -273 18 -351 8z m356 -148 c385 -67 718 -350 847 -720 44 -125 56 -202 55 -370 0 -178 -19 -275 -83 -427 -97 -234 -306 -450 -544 -562 -429 -202 -943 -104 -1268 242 -124 132 -214 293 -263 472 -39 141 -46 347 -16 493 92 449 441 795 881 872 103 18 290 18 391 0z"/>
              </g>
            </svg>
            <h2 className="text-2xl text-white font-light tracking-wide font-[Montserrat] uppercase">
              Epic Scape
            </h2>
          </div>

          {/* Trophy Icon */}
          <div className="flex justify-center">
            <Trophy className="w-12 h-12 text-yellow-400" />
          </div>

          {/* Player Achievement */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <User className="w-5 h-5 text-white/80" />
              <span className="text-xl text-white font-semibold">{playerName}</span>
            </div>
            <p className="text-white/90 text-lg">
              Made an epic escape!
            </p>
            <p className="text-yellow-300 text-xl font-bold">
              {trackName} x Epic Scape
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-white/90 text-sm">Time</div>
              <div className="text-white font-semibold">{formatTime(time)}</div>
            </div>
            <div>
              <div className="text-white/90 text-sm">Puzzles</div>
              <div className="text-white font-semibold">{solvedPuzzles}</div>
            </div>
            <div>
              <div className="text-white/90 text-sm">Hints</div>
              <div className="text-white font-semibold">{hintsUsed}</div>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/20">
            <Calendar className="w-4 h-4 text-white/70" />
            <span className="text-white/70 text-sm">{date}</span>
          </div>

          {/* Social Media Hashtag */}
          <div className="text-center">
            <span className="text-white/60 text-sm">#epicscape @epicscape</span>
          </div>
        </div>

        {/* Save & Share Button */}
        <motion.button
          onClick={handleSaveAndShare}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl px-6 py-3 font-semibold flex items-center justify-center gap-2 hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg"
        >
          <Download className="w-5 h-5" />
          Save & Share Victory
        </motion.button>

        <p className="text-white/60 text-xs leading-relaxed">
          📸 Share your victory and tag @epicscape!<br />
          Want to be featured? Tag us for a chance to appear on our page! 🌟
        </p>
      </div>
    </motion.div>
  );
}