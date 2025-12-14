
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, ChevronRight, Compass } from './Icons';
import { TranslationLabels } from '../types';

interface HeroProps {
  onSearch: (destination: string, origin: string) => void;
  isLoading: boolean;
  labels: TranslationLabels;
}

const POPULAR_CITIES = [
  { name: 'London, UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80' },
  { name: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80' },
  { name: 'New York, USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80' },
  { name: 'Dubai, UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea90b7cadc9?auto=format&fit=crop&w=400&q=80' },
];

const Hero: React.FC<HeroProps> = ({ onSearch, isLoading, labels }) => {
  const [destination, setDestination] = useState('');
  const [origin, setOrigin] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  
  // 3D Tilt State
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

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

  const handleDestinationSelect = (dest: string) => {
    setDestination(dest);
    document.getElementById('origin-input')?.focus();
  };

  // 3D Mouse Movement Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const box = card.getBoundingClientRect();
    
    // Calculate center
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    
    // Calculate mouse position relative to center
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation (adjust divisor to control sensitivity)
    // RotateX is controlled by Y axis movement, RotateY by X axis
    const rotateX = -(mouseY / 25); 
    const rotateY = (mouseX / 25);

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    // Reset to flat
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div 
      className="relative min-h-[95vh] w-full overflow-hidden flex flex-col justify-center pb-12 perspective-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 
         High-Definition 3D-like Background 
         Using an image with strong perspective and depth.
      */}
      <div className="absolute inset-0 z-0 transform scale-105">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-slate-900/90 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80" 
          alt="Realistic Travel World" 
          className="w-full h-full object-cover animate-in fade-in duration-1000"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-8 pt-20 flex flex-col items-center justify-center">
        
        <div className="text-center max-w-4xl mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 text-white text-sm font-semibold mb-8 animate-in slide-in-from-top-4 duration-700 shadow-xl">
             <Compass size={16} className="text-accent-500" />
             <span className="tracking-wide uppercase">AI-Powered Premium Travel</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-serif font-bold text-white mb-8 leading-tight drop-shadow-2xl animate-in zoom-in-95 duration-700 delay-100">
            {labels.heroTitle}
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-200 max-w-2xl mx-auto font-light leading-relaxed animate-in slide-in-from-bottom-8 duration-700 delay-200 drop-shadow-md">
            {labels.heroSubtitle}
          </p>
        </div>

        {/* 3D Search Card - Updated Glass Effect */}
        <div 
          ref={cardRef}
          style={{ 
             transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
             transition: 'transform 0.1s ease-out'
          }}
          className="w-full max-w-3xl bg-white/20 backdrop-blur-2xl p-3 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/30 animate-in slide-in-from-bottom-12 duration-1000 delay-300 relative overflow-hidden"
        >
          {/* Subtle sheen effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none rounded-[2.5rem]"></div>

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 relative z-10">
            
            <div className="flex-1 relative group bg-white/20 backdrop-blur-md rounded-[2rem] hover:bg-white/40 transition-all duration-300 border border-white/20 hover:border-accent-200/50 shadow-inner">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-accent-500">
                <Navigation size={24} />
              </div>
              <div className="flex flex-col justify-center h-full px-16 py-4">
                <label className="text-[10px] uppercase font-bold text-white/70 tracking-wider mb-0.5">Origin</label>
                <input 
                  id="origin-input"
                  type="text"
                  placeholder={labels.fromPlaceholder}
                  value={origin}
                  onChange={(e) => {
                    setOrigin(e.target.value);
                    if(useCurrentLocation) setUseCurrentLocation(false);
                  }}
                  className="w-full bg-transparent text-white font-bold placeholder-white/50 focus:outline-none text-lg"
                  required
                />
              </div>
              <button 
                type="button"
                onClick={() => setUseCurrentLocation(!useCurrentLocation)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/20 transition-colors ${useCurrentLocation ? 'text-accent-400 bg-white/10' : 'text-white/50'}`}
                title="Use Current Location"
              >
                <MapPin size={20} />
              </button>
            </div>

            <div className="hidden md:block w-px bg-white/30 my-3"></div>

            <div className="flex-1 relative group bg-white/20 backdrop-blur-md rounded-[2rem] hover:bg-white/40 transition-all duration-300 border border-white/20 hover:border-accent-200/50 shadow-inner">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-accent-500">
                <Search size={24} />
              </div>
              <div className="flex flex-col justify-center h-full px-16 py-4">
                <label className="text-[10px] uppercase font-bold text-white/70 tracking-wider mb-0.5">Destination</label>
                <input 
                  type="text" 
                  placeholder={labels.toPlaceholder}
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-transparent text-white font-bold placeholder-white/50 focus:outline-none text-lg"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-slate-900/90 backdrop-blur-md hover:bg-accent-600 text-white font-bold text-lg rounded-[2rem] px-10 py-5 md:py-0 transition-all shadow-lg hover:shadow-accent-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 md:min-w-[180px] hover:scale-105 active:scale-95 border border-white/10"
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

        {/* Popular Destinations Chips - Floating Effect */}
        <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 w-full max-w-4xl">
           <div className="flex flex-wrap justify-center gap-4">
             {POPULAR_CITIES.map((city, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDestinationSelect(city.name)}
                  className="group relative h-20 w-40 md:w-48 rounded-2xl overflow-hidden shadow-lg border border-white/20 hover:border-accent-400 transition-all hover:-translate-y-2 hover:shadow-2xl"
                >
                   <img src={city.image} alt={city.name} className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all duration-500" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                      <span className="text-white font-medium text-sm drop-shadow-md group-hover:text-accent-200 transition-colors">{city.name}</span>
                   </div>
                </button>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;
