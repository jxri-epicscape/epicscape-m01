import React, { useState, useEffect, useCallback } from 'react';
import { GameGrid } from './components/GameGrid';
import { CardView } from './components/CardView';
import { Journal } from './components/Journal';
import { WaypointsModal } from './components/WaypointsModal';
import { SettingsModal } from './components/SettingsModal';
import { EndGrid } from './components/EndGrid';
import { Book, Settings, Waypoints, ScrollText } from 'lucide-react';
import type { Card, GameState, JournalEntry, Language } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import { loadCardsByLanguage } from './utils/languageLoader';
import { saveRating } from './lib/rating-service';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [gameGridAnimated, setGameGridAnimated] = useState(false);
  const [showEndGrid, setShowEndGrid] = useState(false);
  const [isSuccessMessageActive, setIsSuccessMessageActive] = useState(false);
  const [totalPuzzlesCount, setTotalPuzzlesCount] = useState(0);
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('gameState');
    if (saved) {
      const parsedState = JSON.parse(saved);
      return {
        ...parsedState,
        cards: [], // Will be loaded asynchronously
        completedCards: new Set(parsedState.completedCards || []),
        unlockedCards: new Set(parsedState.unlockedCards || []),
        journalEntries: parsedState.journalEntries || [],
        playerName: parsedState.playerName || '',
        playerId: parsedState.playerId || null,
        hintsUsed: parsedState.hintsUsed || 0,
        stopwatchState: parsedState.stopwatchState || 'stopped',
        stopwatchTime: parsedState.stopwatchTime || 0,
        theme: parsedState.theme || 'default',
        language: 'en',
      };
    }
    return {
      cards: [],
      activeCardId: null,
      completedCards: new Set(),
      unlockedCards: new Set(['instruction', 'm01_p_1', 'm01_p_2', 'm01_p_3', 'm01_p_4', 'final_m01']),
      journalEntries: [],
      currentLevel: 1,
      playerName: '',
      playerId: null,
      currentPage: 0,
      hintsUsed: 0,
      stopwatchState: 'stopped',
      stopwatchTime: 0,
      theme: 'default',
      language: 'en',
    };
  });

  const [showJournal, setShowJournal] = useState(false);
  const [showStopwatch, setShowStopwatch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const { cardsLevel1 } = await loadCardsByLanguage('en');
        
        // Set the cards in game state
        setGameState(prev => ({
          ...prev,
          cards: cardsLevel1,
          language: 'en',
        }));
        
        // Calculate total puzzles count
        const calculatedTotal = cardsLevel1.filter(card => card.type === 'puzzle' || card.type === 'final').length;
        setTotalPuzzlesCount(calculatedTotal);
        
        const totalAssets = cardsLevel1.length;
        let loadedAssets = 0;

        const preloadImage = (src: string) => {
          return new Promise((resolve) => {
            if (!src) {
              resolve(null);
              return;
            }
            const img = new Image();
            img.onload = () => {
              loadedAssets++;
              setLoadingProgress(Math.floor((loadedAssets / totalAssets) * 100));
              resolve(null);
            };
            img.onerror = () => {
              loadedAssets++;
              setLoadingProgress(Math.floor((loadedAssets / totalAssets) * 100));
              resolve(null);
            };
            img.src = src;
          });
        };

        const imagePromises = cardsLevel1.map(card => {
          const promises = [];
          if (card.logo) promises.push(preloadImage(card.logo));
          if (card.imageSrc) promises.push(preloadImage(card.imageSrc));
          if (card.instructionPages) {
            card.instructionPages.forEach(page => {
              if (page.image) promises.push(preloadImage(page.image));
            });
          }
          return Promise.all(promises);
        });

        await Promise.all(imagePromises.flat());

        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading assets:', error);
        setIsLoading(false);
      }
    };

    loadAssets();
  }, []);

  const handleButtonClick = (buttonType: 'journal' | 'stopwatch' | 'settings') => {
    // Don't allow navigation if success message is active
    if (isSuccessMessageActive) return;

    switch (buttonType) {
      case 'journal':
        setShowJournal(!showJournal);
        setShowStopwatch(false);
        setShowSettings(false);
        break;
      case 'stopwatch':
        setShowStopwatch(!showStopwatch);
        setShowJournal(false);
        setShowSettings(false);
        break;
      case 'settings':
        setShowSettings(!showSettings);
        setShowJournal(false);
        setShowStopwatch(false);
        break;
    }
  };

  useEffect(() => {
    let interval: number | null = null;

    if (gameState.stopwatchState === 'running') {
      interval = window.setInterval(() => {
        setGameState(prev => ({
          ...prev,
          stopwatchTime: prev.stopwatchTime + 1000,
        }));
      }, 1000);
    }

    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [gameState.stopwatchState]);

  useEffect(() => {
    const stateToSave = {
      ...gameState,
      completedCards: Array.from(gameState.completedCards),
      unlockedCards: Array.from(gameState.unlockedCards),
    };
    localStorage.setItem('gameState', JSON.stringify(stateToSave));
  }, [gameState]);

  const handleCardClick = (card: Card) => {
    // Info cards are not clickable
    if (card.type === 'info') {
      return;
    }
    
    if (
      card.id === 'instruction' ||
      (card.id === 'final_m01' && gameState.playerName) ||
      card.type === 'puzzle' ||
      gameState.unlockedCards.has(card.id)
    ) {
      setGameState(prev => ({
        ...prev,
        activeCardId: card.id,
        stopwatchState: 'running',
      }));
    }
  };

  const handlePinSubmit = (cardId: string, pin: string) => {
    const card = gameState.cards.find(c => c.id === cardId);
    if (card && card.pinCode === pin) {
      setGameState(prev => {
        const newUnlockedCards = new Set([...prev.unlockedCards, cardId]);
        const newJournalEntries = [...prev.journalEntries];

        const existingEntryIndex = newJournalEntries.findIndex(entry => entry.cardId === cardId);
        if (existingEntryIndex === -1) {
          newJournalEntries.push({
            cardId,
            cardTitle: card.title,
            notes: '',
            pinCode: pin,
            type: card.type,
          });
        } else {
          newJournalEntries[existingEntryIndex] = {
            ...newJournalEntries[existingEntryIndex],
            pinCode: pin,
          };
        }

        return {
          ...prev,
          unlockedCards: newUnlockedCards,
          journalEntries: newJournalEntries,
        };
      });
    }
  };

  const handleCardComplete = async (cardId: string) => {
    const completedCard = gameState.cards.find(c => c.id === cardId);
    if (!completedCard) return;

    // If this is the final card, update the playtime in Supabase
    if (cardId === 'final_m01' && gameState.playerId) {
      const playtimeMinutes = Math.floor(gameState.stopwatchTime / 60000);
      try {
        const { error } = await supabase
          .from('player_starts')
          .update({ playtime_minutes: playtimeMinutes })
          .eq('id', gameState.playerId);

        if (error) {
          console.error('Error updating playtime:', error);
        }
      } catch (err) {
        console.error('Error updating playtime:', err);
      }
    }

    setGameState(prev => {
      const newCompletedCards = new Set(prev.completedCards).add(cardId);
      const newJournalEntries = [...prev.journalEntries];
      
      // Find existing entry or create new one
      const existingEntryIndex = newJournalEntries.findIndex(entry => entry.cardId === cardId);
      
      if (existingEntryIndex === -1) {
        // Create new entry
        const newEntry: JournalEntry = {
          cardId,
          cardTitle: completedCard.title,
          notes: '',
          type: completedCard.type,
        };

        // Store pinCodeViesti message if it exists
        if (completedCard.pinCodeViesti) {
          newEntry.pinCodeMessage = completedCard.pinCodeViesti;
        }

        newJournalEntries.push(newEntry);
      } else {
        // Update existing entry
        const existingEntry = newJournalEntries[existingEntryIndex];
        
        // Store pinCodeViesti message if it exists
        if (completedCard.pinCodeViesti) {
          existingEntry.pinCodeMessage = completedCard.pinCodeViesti;
        }
      }

      return {
        ...prev,
        cards: prev.cards.map(card => 
          card.id === cardId ? { ...card, isCompleted: true } : card
        ),
        completedCards: newCompletedCards,
        journalEntries: newJournalEntries,
        activeCardId: null,
      };
    });

    if (completedCard.triggersEndGrid) {
      setShowEndGrid(true);
    }
  };

  const handleUpdateNotes = (cardId: string, notes: string) => {
    setGameState(prev => ({
      ...prev,
      journalEntries: prev.journalEntries.map(entry =>
        entry.cardId === cardId ? { ...entry, notes } : entry
      ),
    }));
  };

  const handleSetPlayerName = async (name: string) => {
    const now = new Date();
    const instructionCard = gameState.cards.find(card => card.id === 'instruction');
    const trackID = instructionCard?.trackID ?? 'unknown';
    
    try {
      const { data, error } = await supabase
        .from('player_starts')
        .insert([{
          trackID: trackID,
          player_name: name,
          start_date: now.toISOString().split('T')[0],
          start_time: now.toTimeString().split(' ')[0],
          playtime_minutes: 0
        }])
        .select();

      if (error) {
        console.error('Error saving player data:', error);
      } else if (data && data[0]) {
        setGameState(prev => ({
          ...prev,
          playerName: name,
          playerId: data[0].id
        }));
      }
    } catch (err) {
      console.error('Error saving player data:', err);
    }
  };

  const handleHintUsed = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
    }));
  }, []);

  const handleStopwatchStart = () => {
    setGameState(prev => ({
      ...prev,
      stopwatchState: 'running',
    }));
  };

  const handleStopwatchPause = () => {
    setGameState(prev => ({
      ...prev,
      stopwatchState: 'paused',
    }));
  };

  const handleStopwatchReset = () => {
    setGameState(prev => ({
      ...prev,
      stopwatchState: 'stopped',
      stopwatchTime: 0,
    }));
  };

  const handleThemeChange = (theme: 'default' | 'blue-green' | 'grayscale') => {
    setGameState(prev => ({
      ...prev,
      theme: theme,
    }));
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!gameState.playerId) {
      console.error('No player ID available for rating submission');
      return false;
    }

    const instructionCard = gameState.cards.find(card => card.id === 'instruction');
    const trackID = instructionCard?.trackID ?? 'unknown';

    try {
      const success = await saveRating({
        playerId: gameState.playerId,
        rating: rating,
        trackID: trackID
      });

      if (success) {
        console.log('Rating submitted successfully');
        return true;
      } else {
        console.error('Failed to submit rating');
        return false;
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      return false;
    }
  };

  const handleSuccessMessageVisibilityChange = (isVisible: boolean) => {
    setIsSuccessMessageActive(isVisible);
  };

  const getProcessedCards = useCallback(() => {
    return gameState.cards.map(card => {
      if (card.type === 'info' && card.dynamicInfoContent) {
        // Find the most specific message that matches current progress
        let bestMatch = card.dynamicInfoContent[0]; // Default to first entry
        let maxMatchedCards = -1;

        for (const content of card.dynamicInfoContent) {
          const allRequired = content.requiredCompletedCards.every(cardId => 
            gameState.completedCards.has(cardId)
          );
          
          if (allRequired && content.requiredCompletedCards.length > maxMatchedCards) {
            bestMatch = content;
            maxMatchedCards = content.requiredCompletedCards.length;
          }
        }

        return {
          ...card,
          introText: bestMatch.text
        };
      }
      return card;
    });
  }, [gameState.cards, gameState.completedCards]);

  const activeCard = gameState.cards.find(card => card.id === gameState.activeCardId);
  const isCardCompletedPersistently = activeCard ? gameState.completedCards.has(activeCard.id) : false;

  // Get instruction card for end messages
  const instructionCard = gameState.cards.find(card => card.id === 'instruction');

  // Black movie theme - cinematic dark gradient
  const backgroundGradient = 'from-black via-gray-900 to-gray-800';

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="flex flex-col items-center gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 300 300"
              className="w-14 h-14 text-white fill-current"
            >
              <g transform="translate(0,300) scale(0.1,-0.1)" stroke="none">
                <path d="M1325 2913 c-71 -8 -226 -48 -293 -74 -175 -70 -291 -146 -428 -283 -190 -190 -295 -387 -345 -648 -35 -185 -21 -418 38 -603 100 -319 335 -590 638 -736 115 -55 161 -72 283 -101 84 -21 114 -22 795 -25 l707 -4 0 657 c0 543 -3 675 -16 763 -17 117 -65 274 -115 373 -177 355 -523 610 -913 673 -82 13 -273 18 -351 8z m356 -148 c385 -67 718 -350 847 -720 44 -125 56 -202 55 -370 0 -178 -19 -275 -83 -427 -97 -234 -306 -450 -544 -562 -429 -202 -943 -104 -1268 242 -124 132 -214 293 -263 472 -39 141 -46 347 -16 493 92 449 441 795 881 872 103 18 290 18 391 0z"/>
              </g>
            </svg>

            <h1
              className="text-4xl text-white uppercase font-light tracking-[0.2em]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Epic Scape
            </h1>
          </motion.div>

          <div className="w-64 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.5 }}
              className="h-2 bg-white rounded-full"
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-white/80 text-sm"
          >
            Loading game assets... {loadingProgress}%
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundGradient}`}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8 px-4 pb-24"
        style={{ perspective: '200px', perspectiveOrigin: 'center' }}
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}   
          transition={{ duration: 1.0, delay: gameGridAnimated ? 0 : 0.4 }}
          onAnimationComplete={() => setGameGridAnimated(true)}
          className="flex flex-col items-center justify-center mb-6 gap-2"
        >
          <div className="flex flex-row-reverse items-center justify-center gap-2">
            <h1
              className="text-3xl text-white text-center tracking-wide"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 200 }}
            >
              EPIC SCAPE 
            </h1>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 300 300"
              className="w-10 h-10 text-white fill-current"
            >
              <g transform="translate(0,300) scale(0.1,-0.1)" stroke="none">
                <path d="M1325 2913 c-71 -8 -226 -48 -293 -74 -175 -70 -291 -146 -428 -283 -190 -190 -295 -387 -345 -648 -35 -185 -21 -418 38 -603 100 -319 335 -590 638 -736 115 -55 161 -72 283 -101 84 -21 114 -22 795 -25 l707 -4 0 657 c0 543 -3 675 -16 763 -17 117 -65 274 -115 373 -177 355 -523 610 -913 673 -82 13 -273 18 -351 8z m356 -148 c385 -67 718 -350 847 -720 44 -125 56 -202 55 -370 0 -178 -19 -275 -83 -427 -97 -234 -306 -450 -544 -562 -429 -202 -943 -104 -1268 242 -124 132 -214 293 -263 472 -39 141 -46 347 -16 493 92 449 441 795 881 872 103 18 290 18 391 0z"/>
              </g>
            </svg>
          </div>
          
         <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1399.83 377.03"
  className="w-48 h-auto mx-auto fill-white/90"
>
  <path d="M1031.12,170.55c0,42.29,13.41,77.14,53.91,77.14s53.9-34.85,53.9-77.14-13.4-77.13-53.9-77.13-53.91,34.85-53.91,77.13M1208,70.19c11.32-.89,21.15-1.19,40.21-1.19,20.85,0,42,.59,44.37,1.19V271.8h-29.78V98.18H1238.7c-10.43,0-20.55.3-30.68,0ZM999.86,170.55c.89-62.23,24.71-104.83,85.17-104.83s84.28,42.6,85.18,104.83c-.9,62.24-24.72,104.84-85.18,104.84s-84.28-42.6-85.17-104.84m-135.5,22.34c-16.08,1.79-31.87,3-47.66,5.07-18.46,2.37-34.24,11-34.24,27.4,0,17.26,15.78,25.6,34.24,25.31,26.52,0,48.85-19.66,48.85-48.55v-8.93Zm3.87,78.91c-.9-6.25-1.78-13.1-2.08-19.65l-1.5-.59c-13.4,16.38-31,24.41-52.71,24.71-34.55,0-59.26-18.46-60.45-50.63-.9-32.16,26.2-47,63.13-51.51l48.25-5.67V164c0-25.62-11-38.12-37.52-38.12-18.76,0-37.23,8-39.91,28.59l-.3,2.38-28.3-1.19c2.39-33.95,29.2-53.61,68.8-53.61,45,0,67.31,16.38,67.31,59.56V271.8Zm-157,0H683V105.33h28.3Zm-141.76,0V106.23c2.39-.6,23.53-1.2,44.38-1.2,19.07,0,28.88.3,40.2,1.2v28c-10.12.3-20.25,0-30.67,0h-25V271.8Zm-74.14-78.91c-16.08,1.79-31.87,3-47.65,5.07-18.46,2.37-34.25,11-34.25,27.4,0,17.26,15.79,25.6,34.25,25.31,26.5,0,48.83-19.66,48.83-48.55v-8.93Zm3.86,78.91c-.88-6.25-1.78-13.1-2.08-19.65l-1.48-.59c-13.4,16.38-31,24.41-52.72,24.71-34.54,0-59.26-18.46-60.46-50.63-.88-32.16,26.22-47,63.15-51.51l48.24-5.67V164c0-25.62-11-38.12-37.53-38.12-18.76,0-37.23,8-39.91,28.59l-.3,2.38-28.28-1.19c2.38-33.95,29.18-53.61,68.79-53.61,45,0,67.3,16.38,67.3,59.56V271.8Zm-265-141.45c14.89-18.47,32.46-28.88,58.66-28.88,34.25,0,53.61,23.51,53.91,60.44V271.8H317.89l-.3-99.16c0-25.91-7.15-44.37-32.76-44.37-32.17,0-44.08,22-44.08,56V271.8H212.17V172.64c0-24.13-8-44.37-31.58-44.37-34,0-45.56,17-45.56,52.41V271.8H106.44V105.63H135v19.65l1.49.9c11.9-17.86,28.88-25,54.2-24.71,21.45.28,33.65,12.5,43.48,28.88"/>
</svg>

        </motion.div>

        {showEndGrid ? (
          <EndGrid
            onClose={() => setShowEndGrid(false)}
            onComplete={() => {}}
            playerName={gameState.playerName}
            playerId={gameState.playerId}
            onRatingSubmit={handleRatingSubmit}
            completionMessage={instructionCard?.endCompletionMessage}
            feedbackMessage={instructionCard?.endFeedbackMessage}
            feedbackEmail={instructionCard?.endFeedbackEmail}
            time={gameState.stopwatchTime}
            solvedPuzzles={Math.max(0, gameState.completedCards.size - 1)}
            hintsUsed={gameState.hintsUsed}
            trackName={instructionCard?.trackID}
          />
        ) : showJournal ? (
          <Journal
            entries={gameState.journalEntries}
            onUpdateNotes={handleUpdateNotes}
            onClose={() => setShowJournal(false)}
            playerName={gameState.playerName}
          />
        ) : showStopwatch ? (
          <WaypointsModal
            time={gameState.stopwatchTime}
            state={gameState.stopwatchState}
            hintsUsed={gameState.hintsUsed}
            solvedPuzzles={Math.max(0, gameState.completedCards.size - 1)}
            totalPuzzles={totalPuzzlesCount}
            onStart={handleStopwatchStart}
            onPause={handleStopwatchPause}
            onReset={handleStopwatchReset}
            onClose={() => setShowStopwatch(false)}
          />
        ) : showSettings ? (
          <SettingsModal
            onClose={() => setShowSettings(false)}
          />
        ) : activeCard ? (
          <CardView
            card={activeCard}
            onComplete={handleCardComplete}
            onClose={() => {
              setGameState(prev => ({ ...prev, activeCardId: null }));
            }}
            onSetPlayerName={handleSetPlayerName}
            playerName={gameState.playerName}
            onHintUsed={handleHintUsed}
            onStopwatchPause={handleStopwatchPause}
            playerId={gameState.playerId}
            isCardCompletedPersistently={isCardCompletedPersistently}
            onSuccessMessageVisibilityChange={handleSuccessMessageVisibilityChange}
            onShowEndGrid={() => setShowEndGrid(true)}
          />
        ) : (
          <motion.div
            initial={gameGridAnimated ? false : { opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: gameGridAnimated ? 0 : 0.4 }}
            onAnimationComplete={() => {
              if (!gameGridAnimated) setGameGridAnimated(true);
            }}
          >
            <GameGrid
              cards={getProcessedCards()}
              onCardClick={handleCardClick}
              activeCardId={gameState.activeCardId}
              unlockedCards={gameState.unlockedCards}
              completedCards={gameState.completedCards}
            />
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.6 }}
          className="fixed bottom-8 left-0 right-0 flex justify-center gap-4"
        >
          <button 
            onClick={() => handleButtonClick('journal')} 
            disabled={isSuccessMessageActive}
            className={`w-12 h-12 rounded-full bg-gray-400/30 hover:bg-white/30 transition-colors flex items-center justify-center ${
              isSuccessMessageActive ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Book className="w-6 h-6 text-white" />
          </button>
          <button 
            onClick={() => handleButtonClick('stopwatch')} 
            disabled={isSuccessMessageActive}
            className={`w-12 h-12 rounded-full bg-gray-400/30 hover:bg-white/30 transition-colors flex items-center justify-center ${
              isSuccessMessageActive ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Waypoints className="w-6 h-6 text-white" />
          </button>
          <button 
            onClick={() => handleButtonClick('settings')} 
            disabled={isSuccessMessageActive}
            className={`w-12 h-12 rounded-full bg-gray-400/30 hover:bg-white/30 transition-colors flex items-center justify-center ${
              isSuccessMessageActive ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Settings className="w-6 h-6 text-white" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default App;