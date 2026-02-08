import React, { useState, useEffect, useCallback } from 'react';
import { fetchSongsByLetter } from './services/geminiService';
import { Song } from './types';

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isKeySetupVisible, setIsKeySetupVisible] = useState<boolean>(false);

  // Initial check for API Key availability
  useEffect(() => {
    const checkKey = async () => {
      // If we have an env key, we're good to go
      if (process.env.API_KEY) {
        setIsKeySetupVisible(false);
        return;
      }

      // Otherwise, check if we're in an environment with a selectable key
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setIsKeySetupVisible(true);
        }
      } else {
        // No key and no selector - this is an error state
        setError("API Key Missing: Please ensure 'API_KEY' is set in your environment variables.");
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setIsKeySetupVisible(false);
      if (selectedLetter) loadSongs(selectedLetter);
    }
  };

  const loadSongs = useCallback(async (letter: string) => {
    if (!letter) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSongsByLetter(letter);
      setSongs(data);
      if (data.length === 0) {
        setError(`No iconic songs found starting with '${letter}'.`);
      }
    } catch (err: any) {
      console.error("Antakshari Master Error:", err);
      let msg = err.message || "Unknown error";
      
      if (msg.includes("API Key must be set") || msg.includes("INVALID_ARGUMENT")) {
        setIsKeySetupVisible(true);
      } else if (msg.includes("Requested entity was not found")) {
        setIsKeySetupVisible(true);
        setError("API session expired. Please reconnect your project key.");
      } else {
        setError(`Broadcast Interrupted: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLetter && !isKeySetupVisible && !error) {
      loadSongs(selectedLetter);
    }
  }, [selectedLetter, loadSongs, isKeySetupVisible, error]);

  if (isKeySetupVisible) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#e9d5a1] p-8 rounded-lg border-4 border-orange-950 shadow-[12px_12px_0px_0px_rgba(67,20,7,1)] max-w-md w-full text-center">
          <div className="text-7xl mb-6">🎙️</div>
          <h2 className="retro-title text-3xl text-orange-950 mb-4">Frequency Locked</h2>
          <p className="text-orange-900 mb-6 font-medium">
            Transmission requires a valid Gemini API Key connection.
          </p>
          {window.aistudio ? (
            <div className="space-y-4">
              <button
                onClick={handleOpenKeySelector}
                className="w-full py-4 bg-orange-950 text-orange-50 font-bold rounded hover:bg-orange-900 transition-all transform active:scale-95 uppercase tracking-widest shadow-lg"
              >
                Select API Key
              </button>
              <p className="text-xs text-orange-800 italic">
                A paid GCP project is recommended for best performance.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border-2 border-red-900 rounded text-red-900 text-sm font-mono">
              CRITICAL: API_KEY not found in environment. Please check your build settings.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-7xl mx-auto relative z-10">
      <header className="text-center mb-10 border-b-4 border-double border-orange-900 pb-6 relative">
        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-orange-900 hidden md:block"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-orange-900 hidden md:block"></div>
        <h1 className="retro-title text-4xl md:text-7xl text-orange-900 drop-shadow-lg mb-2 tracking-widest uppercase">
          Antakshari Helper
        </h1>
        <p className="text-orange-800 text-sm md:text-lg italic tracking-tighter">
          "The ultimate cheat-sheet for Bollywood legends!"
        </p>
      </header>

      <main className="flex flex-col md:flex-row gap-8 flex-1">
        <aside className="w-full md:w-1/4">
          <div className="bg-[#e9d5a1] p-6 rounded-lg border-2 border-orange-900 shadow-[8px_8px_0px_0px_rgba(139,69,19,1)] flex flex-col gap-4">
            <label htmlFor="letter-select" className="text-orange-900 font-bold text-xl mb-2 flex items-center gap-2">
              <span className="text-2xl">📻</span> Frequency
            </label>
            
            <select
              id="letter-select"
              value={selectedLetter}
              onChange={(e) => setSelectedLetter(e.target.value)}
              className="w-full bg-[#f4e4bc] border-2 border-orange-900 p-3 rounded text-xl focus:outline-none focus:ring-2 focus:ring-orange-800 text-orange-950 cursor-pointer"
            >
              <option value="" disabled>Pick a letter...</option>
              {LETTERS.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <div className="hidden md:grid grid-cols-4 gap-2 mt-4">
              {LETTERS.map(l => (
                <button
                  key={l}
                  onClick={() => setSelectedLetter(l)}
                  className={`
                    p-2 text-lg font-bold border-2 border-orange-900 rounded transition-all duration-200
                    ${selectedLetter === l 
                      ? 'bg-orange-300 text-orange-950 scale-105 shadow-inner' 
                      : 'bg-[#f4e4bc] text-orange-900 hover:bg-orange-100'
                    }
                  `}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex-1 min-h-[400px]">
          <div className="bg-[#fcf5e5] p-6 md:p-8 rounded-lg border-2 border-orange-900 shadow-[10px_10px_0px_0px_rgba(139,69,19,0.5)] h-full flex flex-col">
            {!selectedLetter && !error ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
                <div className="text-8xl grayscale opacity-30">📼</div>
                <h2 className="retro-title text-4xl text-orange-900">Deck Empty</h2>
                <p className="text-xl text-orange-800 max-w-md">
                  Select a frequency letter to begin retrieval.
                </p>
              </div>
            ) : error ? (
              <div className="text-center p-8 bg-orange-50 border-4 border-orange-900 rounded-lg text-orange-950 shadow-inner my-auto">
                <div className="text-5xl mb-4">🔇</div>
                <h3 className="text-2xl font-bold mb-2 uppercase tracking-wider font-['Shrikhand']">Static Noise</h3>
                <p className="text-sm font-mono mb-6 p-4 bg-white border border-orange-200 rounded text-left overflow-auto max-h-40">
                  {error}
                </p>
                <button 
                  onClick={() => selectedLetter ? loadSongs(selectedLetter) : window.location.reload()}
                  className="px-6 py-2 bg-orange-950 text-orange-50 font-bold rounded hover:bg-orange-800 transition uppercase shadow-md"
                >
                  Retune Radio
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6 border-b-2 border-dashed border-orange-300 pb-4">
                  <h2 className="retro-title text-3xl text-orange-950 flex items-center gap-3">
                    <span className="text-4xl">🎵</span> Channel "{selectedLetter}"
                  </h2>
                  {loading && <div className="animate-spin text-2xl">💿</div>}
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-orange-800 space-y-4">
                    <div className="animate-bounce text-6xl">📀</div>
                    <p className="text-xl font-bold animate-pulse uppercase tracking-widest">Scanning Waves...</p>
                  </div>
                ) : (
                  <div className="space-y-6 custom-scrollbar overflow-y-auto pr-4 flex-1">
                    {songs.map((song, index) => (
                      <div 
                        key={`${song.title}-${index}`}
                        className="p-5 border-2 border-[#d2b48c] bg-[#fffaf0] rounded hover:border-orange-950 hover:bg-orange-50 transition-all duration-300 relative group shadow-sm"
                      >
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-950 text-orange-50 border-2 border-orange-950 rounded-full flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                          {index + 1}
                        </div>
                        <div className="ml-6">
                          <h3 className="text-2xl font-bold text-orange-950 flex items-baseline gap-2 flex-wrap mb-1">
                            {song.title}
                            <span className="text-sm font-normal text-orange-700 italic border-l-2 border-orange-300 pl-2 ml-2">
                              {song.movie}
                            </span>
                          </h3>
                          <div className="mt-3 p-4 bg-[#f4e4bc] border-l-4 border-orange-900 rounded shadow-inner">
                            <p className="text-xl leading-relaxed text-orange-950 italic font-medium">
                              "{song.lyrics}"
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="h-4"></div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-12 text-center text-orange-900 text-xs md:text-sm py-8 border-t border-orange-300 border-dashed">
        <p className="font-bold mb-1 uppercase">Antakshari Radio 102.5 FM</p>
        <p>© {new Date().getFullYear()} Bollywood Retro Archives.</p>
      </footer>
    </div>
  );
};

export default App;