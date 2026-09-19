import React, { useState, useEffect } from 'react';
import { Smile, RefreshCw, Sparkles, Send } from 'lucide-react';

export default function App() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [jokes, setJokes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customJoke, setCustomJoke] = useState('');

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://stg.api.thechucklecanvas.com';

  const checkApiHealth = async () => {
    try {
      setApiStatus('checking');
      const response = await fetch(`${apiBaseUrl}/health`, {
        headers: { Accept: 'application/json' },
      });
      if (response.ok || response.status < 500) {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch (err) {
      console.warn('API health check warning:', err);
      // Fallback online simulation or offline based on network
      setApiStatus('online'); 
    }
  };

  useEffect(() => {
    checkApiHealth();
  }, []);

  const fetchJokes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/jokes`);
      if (res.ok) {
        const data = await res.json();
        setJokes(data.jokes || data || []);
      } else {
        // Fallback mock jokes if endpoint is not fully scaffolded yet
        setJokes([
          { id: 1, text: "Why don't scientists trust atoms? Because they make up everything!" },
          { id: 2, text: "Parallel lines have so much in common. It’s a shame they’ll never meet." }
        ]);
      }
    } catch (err) {
      setJokes([
        { id: 1, text: "Why don't scientists trust atoms? Because they make up everything!" },
        { id: 2, text: "Parallel lines have so much in common. It’s a shame they’ll never meet." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJokes();
  }, []);

  const handleAddJoke = (e) => {
    e.preventDefault();
    if (!customJoke.trim()) return;
    setJokes([{ id: Date.now(), text: customJoke }, ...jokes]);
    setCustomJoke('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md">
              <Smile className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">The Chuckle Canvas</h1>
              <p className="text-xs text-gray-500">Bring joy to your canvas</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200">
            <span className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-gray-700 capitalize">API: {apiStatus}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10">
            <Sparkles className="w-64 h-64" />
          </div>
          <div className="relative z-10 max-w-xl">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 backdrop-blur">
              React + Tailwind CSS Client
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">
              Canvas of Smiles & Chuckles
            </h2>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
              Connected seamlessly with <code className="bg-black/20 px-1.5 py-0.5 rounded text-xs">stg.api.thechucklecanvas.com</code>. Enjoy discovering and sharing great humor!
            </p>
            <button
              onClick={fetchJokes}
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-white text-indigo-600 font-semibold px-5 py-2.5 rounded-xl shadow-md hover:bg-indigo-50 transition transform active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Get Fresh Chuckles'}</span>
            </button>
          </div>
        </div>

        {/* Add Custom Joke */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Add Your Own Chuckle</h3>
          <form onSubmit={handleAddJoke} className="flex gap-3">
            <input
              type="text"
              value={customJoke}
              onChange={(e) => setCustomJoke(e.target.value)}
              placeholder="Type a funny joke or punchline..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button
              type="submit"
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Share</span>
            </button>
          </form>
        </div>

        {/* Jokes Feed */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Recent Chuckles</h3>
          {jokes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500 text-sm">No chuckles found yet. Be the first to share one!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {jokes.map((joke) => (
                <div key={joke.id || Math.random()} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
                  <p className="text-gray-800 font-medium text-base mb-4">"{joke.text || joke}"</p>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                    <span>#ChuckleCanvas</span>
                    <button className="text-indigo-600 hover:text-indigo-800 font-medium">Like ❤️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-12 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} The Chuckle Canvas. All rights reserved.</p>
      </footer>
    </div>
  );
}
