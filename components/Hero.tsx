import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, ChevronRight, Compass } from './Icons';
import { TranslationLabels } from '../types';

interface HeroProps {
  onSearch: (destination: string, origin: string) => void;
  isLoading: boolean;
  labels: TranslationLabels;
}

const Hero: React.FC<HeroProps> = ({ onSearch, isLoading, labels }) => {
  const [destination, setDestination] = useState('');
  const [origin, setOrigin] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  useEffect(() => {
    if (useCurrentLocation) {
      if (navigator.geolocation) {
        setOrigin(labels.locating);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setOrigin(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          },
          (error) => {
            console.error(error);
            setOrigin('');
            setUseCurrentLocation(false);
            alert("Could not retrieve location. Please enter manually.");
          }
        );
      } else {
        alert("Geolocation is not supported by this browser.");
        setUseCurrentLocation(false);
      }
    }
  }, [useCurrentLocation, labels.locating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination && origin && origin !== labels.locating) {
      onSearch(destination, origin);
    }
  };

  const handleTrendingClick = (dest: string) => {
    setDestination(dest);
    // Optional: Focus the origin input
    document.getElementById('origin-input')?.focus();
  };

  const trendingDestinations = ['Paris, France', 'Kyoto, Japan', 'New York, USA', 'Dubai, UAE'];

  return (
    <div className="relative min-h-[85vh] w-full overflow-hidden flex flex-col justify-center">
      {/* Background Image with animated zoom effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
          alt="Travel Background" 
          className="w-full h-full object-cover animate-in fade-in duration-1000 scale-105"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-8 pt-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-accent-500 text-sm font-semibold mb-6 animate-in slide-in-from-bottom-4 duration-700">
             <Compass size={16} />
             <span>AI-Powered Travel Agent</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-sm animate-in slide-in-from-bottom-6 duration-700 delay-100">
            {labels.heroTitle} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-amber-200">
              Adventure
            </span>
          </h1>
          
          <p className="text-xl text-slate-200 mb-10 max-w-xl font-light leading-relaxed animate-in slide-in-from-bottom-8 duration-700 delay-200">
            {labels.heroSubtitle}
          </p>

          {/* Modern Search Card */}
          <div className="bg-white/95 backdrop-blur-xl p-2 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-10 duration-700 delay-300">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
              
              <div className="flex-1 relative group bg-slate-50 rounded-[1.5rem] hover:bg-white transition-colors border border-transparent hover:border-slate-200">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Navigation size={22} />
                </div>
                <div className="flex flex-col justify-center h-full px-14 py-3">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Origin</label>
                  <input 
                    id="origin-input"
                    type="text"
                    placeholder={labels.fromPlaceholder}
                    value={origin}
                    onChange={(e) => {
                      setOrigin(e.target.value);
                      if(useCurrentLocation) setUseCurrentLocation(false);
                    }}
                    className="w-full bg-transparent text-slate-900 font-medium placeholder-slate-300 focus:outline-none text-lg"
                    required
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => setUseCurrentLocation(!useCurrentLocation)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-100 transition-colors ${useCurrentLocation ? 'text-accent-500 bg-accent-50' : 'text-slate-300'}`}
                  title="Use Current Location"
                >
                  <MapPin size={20} />
                </button>
              </div>

              <div className="hidden md:block w-px bg-slate-200 my-2"></div>

              <div className="flex-1 relative group bg-slate-50 rounded-[1.5rem] hover:bg-white transition-colors border border-transparent hover:border-slate-200">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={22} />
                </div>
                <div className="flex flex-col justify-center h-full px-14 py-3">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Destination</label>
                  <input 
                    type="text" 
                    placeholder={labels.toPlaceholder}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-transparent text-slate-900 font-medium placeholder-slate-300 focus:outline-none text-lg"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-slate-900 hover:bg-accent-600 text-white font-medium text-lg rounded-[1.5rem] px-8 py-4 md:py-0 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 md:min-w-[160px]"
              >
                {isLoading ? (
                  <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{labels.exploreButton}</span>
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Trending Pills */}
          <div className="mt-8 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
            <span className="text-white/60 text-sm font-medium mr-1">Trending:</span>
            {trendingDestinations.map((dest) => (
              <button
                key={dest}
                onClick={() => handleTrendingClick(dest)}
                className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 text-sm backdrop-blur-sm transition-all hover:border-white/30"
              >
                {dest}
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;