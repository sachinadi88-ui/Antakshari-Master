
import React, { useState, useEffect, useCallback } from 'react';
import { fetchSongsByLetter } from './services/geminiService';
import { Song } from './types';

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const App: React.FC = () => {
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadSongs = useCallback(async (letter: string) => {
    if (!letter) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSongsByLetter(letter);
      setSongs(data);
      if (data.length === 0) {
        setError("Could not find any songs for this letter. Try another one!");
      }
    } catch (err: any) {
      console.error("App Error Catch:", err);
      // Detailed error reporting for Vercel debugging
      const msg = err.message || "";
      if (msg.includes('403') || msg.toLowerCase().includes('permission')) {
        setError("Access Denied (403): Check if Gemini API is enabled for your key and that the key is set in Vercel Environment Variables.");
      } else if (msg.includes('API_KEY')) {
        setError("Configuration Error: API_KEY is missing. Add it to your Vercel project settings.");
      } else {
        setError(`Error: ${msg || "Something went wrong. Please try again."}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLetter) {
      loadSongs(selectedLetter);
    }
  }, [selectedLetter, loadSongs]);

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
              <span className="text-2xl">📻</span> Choose a Letter
            </label>
            
            <select
              id="letter-select"
              value={selectedLetter}
              onChange={(e) => setSelectedLetter(e.target.value)}
              className="w-full bg-[#f4e4bc] border-2 border-orange-900 p-3 rounded text-xl focus:outline-none focus:ring-2 focus:ring-orange-800 text-orange-950"
            >
              <option value="" disabled>Select a letter...</option>
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
                      : 'bg-[#f4e4bc] text-orange-900 hover:bg-orange-100 hover:shadow-md'
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
          <div className="bg-[#fcf5e5] p-6 md:p-8 rounded-lg border-2 border-orange-900 shadow-[10px_10px_0px_0px_rgba(139,69,19,0.5)] h-full">
            {!selectedLetter ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-80">
                <div className="text-8xl animate-pulse">📻</div>
                <h2 className="retro-title text-4xl text-orange-900">Ready to play?</h2>
                <p className="text-xl text-orange-800 max-w-md">
                  Select a letter on the left to start finding the best Bollywood tracks.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6 border-b-2 border-dashed border-orange-300 pb-4">
                  <h2 className="retro-title text-3xl text-orange-950 flex items-center gap-3">
                    <span className="text-4xl">🎵</span> Songs for "{selectedLetter}"
                  </h2>
                  {loading && <div className="animate-spin text-2xl">💿</div>}
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-orange-800 space-y-4">
                    <div className="animate-bounce text-6xl">📀</div>
                    <p className="text-xl font-bold animate-pulse">Consulting the archives...</p>
                  </div>
                ) : error ? (
                  <div className="text-center p-12 bg-orange-50 border-2 border-dashed border-red-300 rounded-lg text-red-800">
                    <p className="text-lg font-bold mb-4 whitespace-pre-wrap">{error}</p>
                    <button 
                      onClick={() => loadSongs(selectedLetter)}
                      className="px-6 py-2 bg-orange-200 border-2 border-orange-900 text-orange-950 font-bold rounded hover:bg-orange-300 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                    >
                      Retry Search
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 custom-scrollbar max-h-[70vh] overflow-y-auto pr-4">
                    {songs.map((song, index) => (
                      <div 
                        key={`${song.title}-${index}`}
                        className="p-5 border-2 border-[#d2b48c] bg-[#fffaf0] rounded hover:border-orange-900 hover:translate-x-1 transition-all duration-300 relative group"
                      >
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-200 text-orange-950 border-2 border-orange-900 rounded-full flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-110">
                          {index + 1}
                        </div>
                        
                        <div className="ml-6">
                          <h3 className="text-2xl font-bold text-orange-950 flex items-baseline gap-2 flex-wrap">
                            {song.title}
                            <span className="text-sm font-normal text-orange-700 italic border-l-2 border-orange-300 pl-2 ml-2">
                              {song.movie}
                            </span>
                          </h3>
                          
                          <div className="mt-3 p-3 bg-orange-50 border-l-4 border-orange-800 rounded">
                            <p className="song-details text-xl leading-relaxed text-orange-900 italic">
                              "{song.lyrics}"
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-12 text-center text-orange-900 text-xs md:text-sm py-8 border-t border-orange-200">
        <p>© {new Date().getFullYear()} Retro Bollywood Antakshari. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default App;
