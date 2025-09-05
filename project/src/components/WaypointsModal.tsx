import React from 'react';
import { Waypoints, Play, Pause, Map, ChevronDown, ChevronUp, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WaypointsModalProps {
  time: number;
  state: 'stopped' | 'running' | 'paused';
  hintsUsed: number;
  solvedPuzzles: number;
  totalPuzzles: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onClose: () => void;
}

export function WaypointsModal({
  time,
  state,
  hintsUsed,
  solvedPuzzles,
  totalPuzzles,
  onStart,
  onPause,
}: WaypointsModalProps) {
  const [isMapExpanded, setIsMapExpanded] = React.useState(false);

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

  return (
    <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-8 relative">
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-white mb-4">
          <Waypoints className="w-6 h-6" />
          <h2 className="text-2xl font-light text-white">Progress</h2>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="text-center">
            <div className="text-white text-base font-semibold mb-2">Play Time</div>
            <div className="flex items-center justify-between bg-white/10 rounded-lg py-2 px-3 border border-white/20">
              <div className="text-3xl font-semibold text-white/80 tracking-widest">
                {formatTime(time)}
              </div>
              {state === 'running' ? (
                <button
                  onClick={onPause}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale flex items-center justify-center"
                >
                  <Pause className="w-5 h-5 text-white" />
                </button>
              ) : (
                <button
                  onClick={onStart}
                  className="w-10 h-10 rounded-full bg-slate-400 hover:bg-slate-300 transition-colors flex items-center justify-center"
                >
                  <Play className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-white text-base font-semibold mb-2">Puzzles Solved</div>
              <div className="text-2xl font-bold text-white bg-white/10 rounded-lg py-2 px-3 border border-white/20">
                {solvedPuzzles} / {totalPuzzles}
              </div>
            </div>

            <div className="text-center">
              <div className="text-white text-base font-semibold mb-2">Hints Used</div>
              <div className="text-2xl font-bold text-white bg-white/10 rounded-lg py-2 px-3 border border-white/20">
                {hintsUsed}
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="space-y-3">
          <button
            onClick={() => setIsMapExpanded(!isMapExpanded)}
            className="w-full flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/15 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Game Map</span>
            </div>
            {isMapExpanded ? (
              <ChevronUp className="w-5 h-5 text-white/60" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/60" />
            )}
          </button>

          <AnimatePresence>
            {isMapExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-amber-600/50 shadow-lg">
                    <img
                      src="https://ik.imagekit.io/epicscape/ES+Krasis/mapNotInUse.jpg?updatedAt=1757061420178"
                      alt="Game Map"
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-white pointer-events-none" />

                    {/* Corner decorations */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-amber-600/70" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-amber-600/70" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-amber-600/70" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-amber-600/70" />

                    {/* Compass */}
                    <div className="absolute top-6 right-6 flex flex-col items-center z-10">
                      <ArrowUp className="w-4 h-4 text-white/30" />
                      <span className="text-white/30 text-xs font-light mt-1">N</span>
                    </div>
                  </div>

                  <p className="text-white/60 text-sm text-center mt-3">
                    Your journey through the Epic Scape world
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}