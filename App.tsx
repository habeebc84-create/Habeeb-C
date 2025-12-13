import React, { useState, useEffect, useRef } from 'react';
import Hero from './components/Hero';
import HistorySection from './components/HistorySection';
import RouteSection from './components/RouteSection';
import AttractionsSection from './components/AttractionsSection';
import FoodSection from './components/FoodSection';
import MapSection from './components/MapSection';
import HotelSection from './components/HotelSection'; // Added
import { generateTravelGuide } from './services/geminiService';
import { DestinationData, TranslationLabels } from './types';
import { Compass, MapPin, History, Utensils, Camera, MapIcon, Settings, Languages, Type, Bed } from './components/Icons'; // Added Bed
import { LANGUAGES, FONTS, TRANSLATIONS } from './constants';

const App: React.FC = () => {
  const [data, setData] = useState<DestinationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  // Add a random seed state to refresh images on new searches
  const [imageSeed, setImageSeed] = useState<number>(Date.now());
  
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
    { id: 'overview', label: labels.tabOverview, icon: <History size={18} /> },
    { id: 'journey', label: labels.tabJourney, icon: <MapIcon size={18} /> },
    { id: 'hotels', label: labels.tabHotels, icon: <Bed size={18} /> }, // Added Hotel tab
    { id: 'map', label: labels.tabMap, icon: <Compass size={18} /> },
    { id: 'attractions', label: labels.tabAttractions, icon: <Camera size={18} /> },
    { id: 'food', label: labels.tabFood, icon: <Utensils size={18} /> },
  ];

  return (
    <div className="min-h-screen pb-20 font-sans">
      
      {/* Header / Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="text-accent-500" size={28} />
            <span className="font-serif font-bold text-xl text-slate-800 tracking-tight">Habeeb <span className="text-accent-500">Elite</span></span>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Settings Dropdown */}
             <div className="relative" ref={settingsRef}>
               <button 
                 onClick={() => setShowSettings(!showSettings)}
                 className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                 title={labels.settingsHeader}
               >
                 <Settings size={20} />
               </button>
               
               {showSettings && (
                 <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <Languages size={14} />
                        <span>{labels.languageLabel}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {LANGUAGES.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`text-sm py-1.5 px-3 rounded-lg text-left transition-colors ${language === lang.code ? 'bg-brand-50 text-brand-700 font-medium' : 'hover:bg-slate-50 text-slate-600'}`}
                          >
                            {lang.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <Type size={14} />
                        <span>{labels.typographyLabel}</span>
                      </div>
                      <div className="space-y-1">
                        {FONTS.map(font => (
                          <button
                            key={font.id}
                            onClick={() => setFontId(font.id)}
                            className={`w-full text-sm py-2 px-3 rounded-lg flex items-center justify-between transition-colors ${fontId === font.id ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50 text-slate-600'}`}
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

      {/* Hero */}
      <div className="pt-16">
        <Hero onSearch={handleSearch} isLoading={loading} labels={labels} />
      </div>

      {/* Content Area */}
      <main id="content-start" className="max-w-6xl mx-auto px-4 -mt-20 relative z-20 mb-20">
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8 text-center shadow-lg animate-in fade-in slide-in-from-top-4">
            <p className="font-semibold">Oops!</p>
            {error}
          </div>
        )}

        {data && (
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden min-h-[600px]">
            
            {/* Destination Header */}
            <div className="bg-white p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">{data.destinationName}</h1>
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                  <MapPin size={16} />
                  <span>{labels.from} {origin}</span>
                </div>
              </div>
              <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl overflow-x-auto max-w-full">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'bg-white text-brand-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Content */}
            <div className="p-6 md:p-10">
              {activeTab === 'overview' && <HistorySection data={data} labels={labels} />}
              {activeTab === 'journey' && <RouteSection data={data} origin={origin} labels={labels} />}
              {activeTab === 'hotels' && <HotelSection data={data} labels={labels} />}
              {activeTab === 'map' && <MapSection data={data} labels={labels} />}
              {/* Pass the imageSeed to AttractionsSection to randomize images */}
              {activeTab === 'attractions' && <AttractionsSection data={data} labels={labels} randomSeed={imageSeed} />}
              {activeTab === 'food' && <FoodSection data={data} labels={labels} />}
            </div>

          </div>
        )}

        {!data && !loading && !error && (
          <div className="text-center py-20 opacity-60">
             <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto flex items-center justify-center mb-4 text-slate-400">
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