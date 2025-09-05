import React, { useState } from 'react';
import { DiceModel } from './DiceModel';
import type { Card } from '../types';

interface MultimediaDemoProps {
  card: Card;
  onComplete: (cardId: string) => void;
}

export function MultimediaDemo({ card, onComplete }: MultimediaDemoProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleComplete = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onComplete(card.id);
    }, 1);
  };

  return (
    <div className="space-y-8">
      {/* Video Section */}
      <div className="space-y-4">
        <h3 className="text-white/80 font-medium">Video Example</h3>
        <div className="aspect-video rounded-lg overflow-hidden bg-gray-800/50">
          <video
            controls
            className="w-full h-full"
            src="https://res.cloudinary.com/dpifzngt4/video/upload/v1746181224/sample_video.mp4"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Audio Section */}
      <div className="space-y-4">
        <h3 className="text-white/80 font-medium">Audio Example</h3>
        <div className="rounded-lg bg-gray-800/50 p-4">
          <audio
            controls
            className="w-full"
            src="https://res.cloudinary.com/dpifzngt4/video/upload/v1746181224/sample_audio.mp3"
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      </div>

      {/* GIF Section */}
      <div className="space-y-4">
        <h3 className="text-white/80 font-medium">GIF Example</h3>
        <div className="rounded-lg overflow-hidden bg-gray-800/50">
          <img
            src="https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif"
            alt="Sample GIF"
            className="w-full"
          />
        </div>
      </div>

      {/* 3D Model Section */}
      <div className="space-y-4">
        <h3 className="text-white/80 font-medium">3D Model Example</h3>
        <div className="rounded-lg overflow-hidden bg-gray-800/50">
          <DiceModel />
        </div>
      </div>

      <button
        onClick={handleComplete}
        className="w-full bg-purple-500 text-white rounded-lg px-4 py-2 hover:bg-purple-600 transition-colors"
      >
        Complete Demo
      </button>

      {showSuccess && (
        <p className="text-green-400 text-center">
          {card.successText || "Great! You've experienced all the multimedia features!"}
        </p>
      )}
    </div>
  );
}