
import React, { useState, useEffect, useRef } from 'react';
import Hero from './components/Hero';
import HistorySection from './components/HistorySection';
import RouteSection from './components/RouteSection';
import AttractionsSection from './components/AttractionsSection';
import FoodSection from './components/FoodSection';
import MapSection from './components/MapSection';
import HotelSection from './components/HotelSection';
import { generateTravelGuide, getTrendingDestinations } from './services/geminiService';
import { DestinationData, TranslationLabels, SuggestedDestination } from './types';
import { Compass, MapPin, Settings, Languages, Type, ChevronRight, Star, Globe, History, Train, Bed, MapIcon, Camera, Utensils } from './components/Icons';
import { LANGUAGES, FONTS, TRANSLATIONS } from './constants';

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Swiss Alps (Nature)
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80", // Paris (City)
  "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2066&q=80", // Venice (Water)
  "https://images.unsplash.com/photo-1512453979798-5ea90b7cadc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Dubai (Modern)
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80", // Thailand (Beach)
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Kyoto (Culture)
  "https://images.unsplash.com/photo-1533929736458-ca588d080e81?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"  // New York (Urban)
];

// Fallback suggestions in case API quota is hit or fails
const DEFAULT_SUGGESTIONS: SuggestedDestination[] = [
  { name: "Bali, Indonesia", price: "₹65,000", rating: "4.8", reason: "Season drop" },
  { name: "Istanbul, Turkey", price: "₹78,000", rating: "4.7", reason: "Flight deals" },
  { name: "Hanoi, Vietnam", price: "₹45,000", rating: "4.6", reason: "Budget friendly" },
  { name: "Lisbon, Portugal", price: "₹90,000", rating: "4.9", reason: "Trending now" },
];

const App: React.FC = () => {
  // View State for Multi-page experience
  const [view, setView] = useState<'welcome' | 'app'>('welcome');
  const [bgIndex, setBgIndex] = useState(0);

  const [data, setData] = useState<DestinationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>('');
  const [imageSeed, setImageSeed] = useState<number>(Date.now());
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'journey' | 'hotels' | 'map' | 'attractions' | 'food'>('overview');
  
  // Trending Suggestions State
  const [suggestions, setSuggestions] = useState<SuggestedDestination[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  
  // Settings State
  const [language, setLanguage] = useState('en');
  const [fontId, setFontId] = useState('standard');
  const [showSettings, setShowSettings] = useState(false);
  
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Apply Font Variables
    const font = FONTS.find(f => f.id === fontId) || FONTS[0];
    const root = document.documentElement;
    root.style.setProperty('--font-sans', font.sans);
    root.style.setProperty('--font-serif', font.serif);
  }, [fontId]);

  // Rotate Background Images
  useEffect(() => {
    if (view === 'welcome') {
      const interval = setInterval(() => {
        setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
      }, 60000); // 60 Seconds
      return () => clearInterval(interval);
    }
  }, [view]);

  // Fetch Daily Trending Destinations
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const daily = await getTrendingDestinations();
        if (daily && daily.length > 0) {
          setSuggestions(daily);
        } else {
          setSuggestions(DEFAULT_SUGGESTIONS);
        }
      } catch (e) {
        setSuggestions(DEFAULT_SUGGESTIONS);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const labels = TRANSLATIONS[language];
  const activeLanguageName = LANGUAGES.find(l => l.code === language)?.name || 'English';

  const getReadableError = (errCode: string) => {
    switch (errCode) {
      case "API_KEY_INVALID":
        return "Missing or invalid API Key. Please check your configuration.";
      case "NETWORK_ERROR":
        return "Network connection failed. Please check your internet.";
      case "SAFETY_BLOCK":
        return "The AI flagged the request as unsafe. Please try a different destination.";
      case "NO_CONTENT_GENERATED":
        return "We couldn't generate a guide for this location. Try a major city.";
      default:
        return "An unexpected error occurred. Please try again later.";
    }
  };

  const handleSearch = async (destination: string, originInput: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    setOrigin(originInput);
    setActiveTab('overview'); // Reset tab to overview on new search

    try {
      // Update seed to ensure fresh images
      setImageSeed(Date.now());
      const result = await generateTravelGuide(destination, originInput, activeLanguageName);
      setData(result);
      // Smooth scroll to content
      setTimeout(() => {
        document.getElementById('content-start')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(getReadableError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: labels.tabOverview, icon: History },
    { id: 'journey', label: labels.tabJourney, icon: Train },
    { id: 'hotels', label: labels.tabHotels, icon: Bed },
    { id: 'map', label: labels.tabMap, icon: MapIcon },
    { id: 'attractions', label: labels.tabAttractions, icon: Camera },
    { id: 'food', label: labels.tabFood, icon: Utensils },
  ] as const;

  // Welcome / Front Page Component
  if (view === 'welcome') {
    return (
      <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-between font-sans">
         {/* Background Slideshow with Glassy Blur Transition */}
         {BACKGROUND_IMAGES.map((img, index) => (
           <div 
             key={index}
             className={`absolute inset-0 z-0 transition-all duration-[2000ms] ease-in-out ${index === bgIndex ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-2xl scale-110'}`}
           >
             <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 z-10"></div>
             <img 
               src={img} 
               alt="Luxury Travel Background" 
               className={`w-full h-full object-cover transition-transform duration-[60000ms] ease-linear ${index === bgIndex ? 'scale-125' : 'scale-100'}`}
             />
           </div>
         ))}

         <div className="relative z-20 w-full flex-1 flex flex-col justify-center items-center px-6 text-center">
            <div className="mb-6 animate-in slide-in-from-top-10 duration-1000">
               <span className="bg-white/10 backdrop-blur-xl border border-white/20 text-accent-400 px-6 py-2 rounded-full text-sm font-semibold tracking-widest uppercase shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
                 Premium Travel Agent
               </span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-serif font-bold text-white mb-6 drop-shadow-2xl animate-in zoom-in-90 duration-1000 delay-200 tracking-tight">
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-amber-200">Elite</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto mb-12 animate-in slide-in-from-bottom-8 duration-1000 delay-500 drop-shadow-lg leading-relaxed mix-blend-overlay">
               Where your searching and bookings comes to your finger tips with easy way.
            </p>

            <button
               onClick={() => setView('app')}
               className="group relative inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/30 text-white px-10 py-5 rounded-full text-lg font-bold tracking-wide transition-all hover:bg-white/20 hover:scale-105 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700"
            >
               Enter Experience
               <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
         </div>

         {/* Suggested Places / Footer Area */}
         <div className="relative z-20 w-full max-w-7xl mx-auto px-6 pb-8 animate-in slide-in-from-bottom-20 duration-1000 delay-1000">
            <div className="flex items-center justify-between mb-4 text-white">
               <div>
                 <h3 className="font-serif text-xl md:text-2xl drop-shadow-md">Daily Affordable Getaways</h3>
                 <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
                   <Globe size={12} />
                   Curated from 100+ articles & sources today
                 </div>
               </div>
               <div className="text-sm opacity-70 text-right">
                 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
               </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {loadingSuggestions 
                  ? Array(4).fill(0).map((_, idx) => (
                      <div key={idx} className="h-40 rounded-2xl bg-white/10 backdrop-blur-lg animate-pulse border border-white/5"></div>
                    ))
                  : suggestions.map((dest, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                       setView('app');
                       // In a real app we might pre-fill the destination here
                    }}
                    className="group relative h-40 rounded-2xl overflow-hidden border border-white/20 backdrop-blur-lg bg-white/5 hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] text-left"
                  >
                     <img 
                       // Use a hash of the name to pick a stable random image from the background list + extra generic ones
                       src={`https://picsum.photos/seed/${dest.name.replace(/\s/g,'')}${new Date().getDate()}/400/300`} 
                       alt={dest.name} 
                       className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end">
                        <div className="flex justify-between items-end">
                           <div className="flex-1 mr-2">
                              <div className="font-bold text-white text-lg leading-tight mb-0.5 drop-shadow-sm line-clamp-1">{dest.name}</div>
                              <div className="text-[10px] text-white/80 leading-tight line-clamp-1 mb-1">{dest.reason}</div>
                              <div className="flex items-center gap-1 text-accent-400 text-xs font-bold">
                                 <Star size={10} fill="currentColor" />
                                 {dest.rating}
                              </div>
                           </div>
                           <div className="text-emerald-300 font-bold bg-emerald-950/60 px-2 py-1 rounded-lg text-xs backdrop-blur-md border border-emerald-500/30 whitespace-nowrap">
                              {dest.price}
                           </div>
                        </div>
                     </div>
                  </button>
               ))}
            </div>
            
            <div className="text-center text-white/40 text-xs mt-8 font-light tracking-wider">
               Powered by Gemini AI • Premium Travel Solutions
            </div>
         </div>
      </div>
    );
  }

  // Main Application
  return (
    <div className="min-h-screen pb-20 font-sans animate-in fade-in duration-500 bg-slate-50">
      
      {/* Header / Nav - Enhanced Glass */}
      <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-white/30 shadow-sm transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => setView('welcome')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Compass className="text-accent-500" size={28} />
            <span className="font-serif font-bold text-xl text-slate-800 tracking-tight">Habeeb <span className="text-accent-500">Elite</span></span>
          </button>
          
          <div className="flex items-center gap-4">
             {/* Settings Dropdown - Enhanced Glass */}
             <div className="relative" ref={settingsRef}>
               <button 
                 onClick={() => setShowSettings(!showSettings)}
                 className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                 title={labels.settingsHeader}
               >
                 <Settings size={20} />
               </button>
               
               {showSettings && (
                 <div className="absolute right-0 mt-2 w-72 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black/5">
                    
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
                        <Languages size={14} />
                        <span>{labels.languageLabel}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {LANGUAGES.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`text-sm py-1.5 px-3 rounded-lg text-left transition-colors ${language === lang.code ? 'bg-brand-50/50 text-brand-700 font-medium ring-1 ring-brand-200' : 'hover:bg-slate-50/80 text-slate-600'}`}
                          >
                            {lang.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-200/50 pt-4">
                      <div className="flex items-center gap-2 text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
                        <Type size={14} />
                        <span>{labels.typographyLabel}</span>
                      </div>
                      <div className="space-y-1">
                        {FONTS.map(font => (
                          <button
                            key={font.id}
                            onClick={() => setFontId(font.id)}
                            className={`w-full text-sm py-2 px-3 rounded-lg flex items-center justify-between transition-colors ${fontId === font.id ? 'bg-brand-50/50 text-brand-700 ring-1 ring-brand-200' : 'hover:bg-slate-50/80 text-slate-600'}`}
                          >
                            <span className="font-medium">{labels[font.translationKey as keyof TranslationLabels] || font.id}</span>
                            <span className="text-xs opacity-50" style={{ fontFamily: font.sans }}>Ag</span>
                          </button>
                        ))}
                      </div>
                    </div>

                 </div>
               )}
             </div>
          </div>
        </div>
      </header>

      {/* Hero (Search Interface) */}
      <div className="pt-16">
        <Hero onSearch={handleSearch} isLoading={loading} labels={labels} />
      </div>

      {/* Content Area */}
      <main id="content-start" className="max-w-7xl mx-auto px-4 -mt-20 relative z-20 mb-20">
        
        {error && (
          <div className="bg-red-50/90 backdrop-blur-md border border-red-200 text-red-700 p-4 rounded-xl mb-8 text-center shadow-lg animate-in fade-in slide-in-from-top-4 max-w-2xl mx-auto">
            <p className="font-semibold">Oops!</p>
            {error}
          </div>
        )}

        {data && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden min-h-[700px] flex flex-col">
            
            {/* Destination Header */}
            <div className="bg-white/60 p-6 md:px-8 md:pt-8 md:pb-4 border-b border-white/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">{data.destinationName}</h1>
                    <div className="flex items-center gap-2 text-slate-500 mt-2 font-medium">
                      <MapPin size={18} className="text-brand-500" />
                      <span>{labels.from} {origin}</span>
                    </div>
                  </div>
              </div>

              {/* Navigation Tabs - Scrollable on mobile */}
              <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                 {tabs.map((tab) => {
                   const isActive = activeTab === tab.id;
                   const Icon = tab.icon;
                   return (
                     <button
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id as any)}
                       className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border ${
                         isActive 
                           ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200 scale-105' 
                           : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                       }`}
                     >
                       <Icon size={18} />
                       {tab.label}
                     </button>
                   );
                 })}
              </div>
            </div>

            {/* Dynamic Content Pages */}
            <div className="p-6 md:p-10 bg-slate-50/50 flex-1 relative">
              
              <div className={activeTab === 'overview' ? 'block animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'}>
                 <HistorySection data={data} labels={labels} />
              </div>
              
              <div className={activeTab === 'journey' ? 'block animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'}>
                 <RouteSection data={data} origin={origin} labels={labels} />
              </div>

              <div className={activeTab === 'hotels' ? 'block animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'}>
                 <HotelSection data={data} labels={labels} />
              </div>

              <div className={activeTab === 'map' ? 'block animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'}>
                 <MapSection data={data} labels={labels} />
              </div>

              <div className={activeTab === 'attractions' ? 'block animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'}>
                 <AttractionsSection data={data} labels={labels} randomSeed={imageSeed} />
              </div>

              <div className={activeTab === 'food' ? 'block animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'}>
                 <FoodSection data={data} labels={labels} />
              </div>
            </div>

          </div>
        )}

        {!data && !loading && !error && (
          <div className="text-center py-20 opacity-60">
             <div className="w-16 h-16 bg-slate-200/50 backdrop-blur-sm rounded-full mx-auto flex items-center justify-center mb-4 text-slate-400">
               <Compass size={32} />
             </div>
             <p className="text-xl font-serif text-slate-600">Enter a destination to start your journey.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-white">
            <Compass size={24} />
            <span className="font-serif font-bold text-xl">Habeeb Elite</span>
          </div>
          <p className="mb-8 max-w-md mx-auto">AI-Powered travel planning. Routes, history, and hidden gems at your fingertips.</p>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} Habeeb Elite. Built with Gemini API.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
