import React, { useState } from 'react';
import { Book, Lock, ScrollText } from 'lucide-react';
import type { JournalEntry } from '../types';

interface JournalProps {
  entries: JournalEntry[];
  onUpdateNotes: (cardId: string, notes: string) => void;
  onClose: () => void;
  playerName: string;
}

export function Journal({ entries, onUpdateNotes, playerName }: JournalProps) {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Book className="w-6 h-6 text-white" />
          <h2 className="text-2xl text-white font-light">
            {playerName ? `${playerName}'s Journal` : 'Journal'}
          </h2>
        </div>

        {entries.length === 0 ? (
          <p className="text-white/60 text-center py-8">
            {playerName 
              ? `${playerName}, complete puzzles to add them to your journal!`
              : 'No entries yet. Complete puzzles to add them to your journal!'}
          </p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.cardId}
                className="p-4 bg-white/10 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white/80 font-medium">{entry.cardTitle}</span>
                </div>
                
                {(entry.pinCode || entry.receivedPinCode || entry.pinCodeMessage) && (
                  <div className="flex flex-col gap-1.5">
                    {entry.pinCode && (
                      <div className="flex items-center gap-2 text-sm">
                        <Lock className="w-4 h-4 text-white/60" />
                        <span className="font-mono text-white/70 tracking-widest">
                          Unlocked with: {entry.pinCode}
                        </span>
                      </div>
                    )}
                    {entry.pinCodeMessage && (
                      <div className="flex items-center gap-2 text-sm">
                        <ScrollText className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300">
                          {entry.pinCodeMessage}
                        </span>
                      </div>
                    )}
                    {entry.receivedPinCode && (
                      <div className="flex items-center gap-2 text-sm">
                        <Lock className="w-4 h-4 text-green-400" />
                        <span className="font-mono text-green-400 tracking-widest">
                          Revealed PIN: {entry.receivedPinCode}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {editingCardId === entry.cardId ? (
                  <textarea
                    value={entry.notes}
                    onChange={(e) => onUpdateNotes(entry.cardId, e.target.value)}
                    onBlur={() => setEditingCardId(null)}
                    autoFocus
                    placeholder={`${playerName}, add your notes here...`}
                    className="w-full bg-white/30 text-white placeholder:text-white/70 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-white/70 min-h-[100px]"
                  />
                ) : (
                  <div
                    onClick={() => setEditingCardId(entry.cardId)}
                    className="cursor-text"
                  >
                    {entry.notes ? (
                      <p className="text-white/70 whitespace-pre-wrap">{entry.notes}</p>
                    ) : (
                      <p className="text-white/70 italic">
                        {playerName ? `${playerName}, click to add notes...` : 'Click to add notes...'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}