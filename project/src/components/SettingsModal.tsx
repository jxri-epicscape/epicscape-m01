import React, { useState } from 'react';
import { Settings, Instagram, Globe, MessageSquare, Send, ArrowLeft, Trash2 } from 'lucide-react';

// Function to reset all game data and cache
function resetAll() {
  // Clear game state from localStorage
  localStorage.removeItem('gameState');
  
  // Clear any other Epic Scape related localStorage items
  Object.keys(localStorage)
    .filter(k => k.startsWith('epicscape:'))
    .forEach(k => localStorage.removeItem(k));
  
  // Clear IndexedDB databases
  if (indexedDB.databases) {
    indexedDB.databases().then(dbs => 
      dbs.forEach(db => {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      })
    );
  }
  
  // Clear browser caches
  if (caches && caches.keys) {
    caches.keys().then(keys => 
      keys.forEach(k => caches.delete(k))
    );
  }
  
  // Reload the page to apply changes
  location.reload();
}

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    sender: '',
    topic: '',
    message: '',
  });
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('https://formspree.io/f/xgvkvqvd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedbackForm,
          _subject: `Message ${feedbackForm.topic}`,
        }),
      });
      setFeedbackSent(true);
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSent(false);
        setFeedbackForm({ sender: '', topic: '', message: '' });
      }, 2000);
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  const handleBackToSettings = () => {
    setShowFeedback(false);
    setFeedbackSent(false);
    setFeedbackForm({ sender: '', topic: '', message: '' });
  };

  return (
    <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <div className="space-y-6">
        {showFeedback ? (
          // Feedback Form View
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToSettings}
                className="text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl text-white font-light">Send Feedback</h2>
            </div>

            {feedbackSent ? (
              <div className="text-center py-8">
                <h3 className="text-2xl text-white mb-2">Thank You!</h3>
                <p className="text-white/80">Your message has been sent.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Your Email</label>
                  <input
                    type="email"
                    required
                    value={feedbackForm.sender}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, sender: e.target.value }))}
                    className="w-full bg-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-white/80 placeholder:text-white/50"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Topic</label>
                  <input
                    type="text"
                    required
                    value={feedbackForm.topic}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full bg-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-white/80 placeholder:text-white/50"
                    placeholder="Bug report, suggestion, etc."
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Tell us what's on your mind
                  </label>
                  <textarea
                    required
                    value={feedbackForm.message}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, message: e.target.value.slice(0, 500) }))}
                    maxLength={500}
                    rows={4}
                    className="w-full bg-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-white/80 placeholder:text-white/50 resize-none"
                    placeholder="Your feedback helps us improve Epic Scape..."
                  />
                  <div className="text-right text-white/60 text-xs mt-1">
                    {feedbackForm.message.length}/500
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        ) : (
          // Main Settings View
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-white" />
              <h2 className="text-2xl text-white font-light">Settings</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-white/90 mb-3 font-medium">Connect & Support</h3>
                <div className="space-y-3">
                  
                
                  
                  <a
                    href="https://www.epicscape.game"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                  >
                    <Globe size={20} />
                    <span>Visit Epic Scape website</span>
                  </a>

                  <a
                    href="https://instagram.com/epicscape"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                  >
                    <Instagram size={20} />
                    <span>Follow Epic Scape Instagram</span>
                  </a>

                  <button
                    onClick={() => setShowFeedback(true)}
                    className="flex items-center gap-3 text-white/80 hover:text-white transition-colors w-full text-left p-2 rounded-lg hover:bg-white/10"
                  >
                    <MessageSquare size={20} />
                    <span>Need help? Got ideas? Send us an email</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-white/90 mb-3 font-medium">Data Management</h3>
                <div className="space-y-3">
                  <button
                    onClick={resetAll}
                    className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors w-full text-left p-2 rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 size={20} />
                    <span>Clear Game Data & Cache</span>
                  </button>
                  <p className="text-white/60 text-xs ml-8">
                    This will reset all progress and clear cached data. The page will reload automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}