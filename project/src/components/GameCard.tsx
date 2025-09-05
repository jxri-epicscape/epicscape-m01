import React, { useState } from 'react';
import { Lock, CheckCircle2, Anchor, BookOpen, Puzzle, Clapperboard, Film, Popcorn, Heart, Star, Zap, Crown, Shield, Gem, Flame, Music, Camera, Gamepad2, Trophy, Target, Compass, Map, Key, Eye, Brain, Lightbulb, Rocket, Diamond, Sparkles, ScrollText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '../types';

interface GameCardProps {
  card: Card;
  onClick: () => void;
  isActive: boolean;
  index: number;
  isUnlocked: boolean;
  isCompleted: boolean;
}

const iconMap: Record<string, React.ComponentType> = {
  instruction: BookOpen,
  puzzle: Film,
  final: Popcorn,
  // Additional icon options
  anchor: Anchor,
  heart: Heart,
  star: Star,
  zap: Zap,
  crown: Crown,
  shield: Shield,
  gem: Gem,
  flame: Flame,
  music: Music,
  camera: Camera,
  gamepad: Gamepad2,
  trophy: Trophy,
  target: Target,
  compass: Compass,
  map: Map,
  key: Key,
  eye: Eye,
  brain: Brain,
  lightbulb: Lightbulb,
  rocket: Rocket,
  diamond: Diamond,
  sparkles: Sparkles,
  film: Film,
  popcorn: Popcorn,
  book: BookOpen,
  clapperboard: Clapperboard,
  scrolltext: ScrollText
};

export function GameCard({ 
  card, 
  onClick, 
  isActive, 
  index, 
  isUnlocked, 
  isCompleted,
}: GameCardProps) {
  // Use displayIcon if provided, otherwise fall back to card type
  const iconKey = card.displayIcon || card.type;
  const Icon = iconMap[iconKey];

  const shouldShowCompletion = isCompleted;

  return (
    <>
      <motion.div
        onClick={isUnlocked && card.type !== 'info' ? onClick : undefined}
        className={`
          relative rounded-3xl p-4
          ${card.isFinalPuzzle ? 'col-span-2' : ''}
          ${card.isFinalPuzzle ? 'h-32' : 'aspect-square'}
          bg-white/10 backdrop-blur-sm
          border border-white/20
          ${isUnlocked && card.type !== 'info' ? 'hover:bg-white/15 cursor-pointer' : 'cursor-default'}
          ${card.type === 'info' ? 'bg-white/20 border-white/40' : ''}
          shadow-lg hover:shadow-xl transition-all duration-300
        `}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '200px',
          zIndex: isActive ? 10 : 1,
        }}
      >
        <div className="h-full flex flex-col items-center justify-center gap-2">
          {card.type === 'info' ? (
            <div className="text-center px-2">
              <div className="text-white/90 text-sm leading-tight font-medium">
                {card.introText || card.question || card.title}
              </div>
            </div>
          ) : card.logo ? (
            <div className="relative w-20 h-20 group">
              <img 
                src={card.logo} 
                alt={card.title}
                className="relative w-full h-full object-contain rounded-xl filter drop-shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                style={{
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                }}
              />
              <div 
                className="absolute inset-0 rounded-xl opacity-0"
                style={{
                  pointerEvents: 'none',
                }}
              />
            </div>
          ) : Icon && (
            <Icon 
              className="w-8 h-8 text-white/60 mb-1"
              strokeWidth={1.5}
            />
          )}
          {card.type !== 'info' && (
            <span className="text-lg text-white font-light tracking-wide text-center">
            {card.title}
          </span>
          )}

          {shouldShowCompletion && card.type !== 'info' && (
            <CheckCircle2
              className="absolute bottom-3 right-3 w-6 h-6 text-green-400"
              strokeWidth={1.5}
            />
          )}
        </div>
      </motion.div>
    </>
  );
}