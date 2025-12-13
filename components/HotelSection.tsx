import React, { useState, useMemo, useEffect } from 'react';
import { Bed, Star, ChevronRight, DollarSign, SlidersHorizontal, ZoomIn, X, ChevronLeft, ImageIcon } from './Icons';
import { DestinationData, TranslationLabels, Hotel } from '../types';

interface HotelSectionProps {
  data: DestinationData;
  labels: TranslationLabels;
}

// Extension to Hotel interface for internal use
interface ParsedHotel extends Hotel {
  parsedPrice: number;
}

const HotelSection: React.FC<HotelSectionProps> = ({ data, labels }) => {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getBookingUrl = (hotelName: string, destination: string) => {
    const query = encodeURIComponent(`${hotelName} ${destination}`);
    return `https://www.booking.com/searchresults.html?ss=${query}`;
  };

  const getCurrencySymbol = (priceStr: string) => {
    if (priceStr.includes('€')) return '€';
    if (priceStr.includes('£')) return '£';
    if (priceStr.includes('¥')) return '¥';
    return '$';
  };

  const hotelData = useMemo(() => {
    return data.hotels.map(h => {
      const dollarMatch = h.priceEstimate.match(/\$\s?([\d,]+)/);
      if (dollarMatch) {
        return {
          ...h,
          parsedPrice: parseInt(dollarMatch[1].replace(/,/g, ''), 10)
        };
      }
      const match = h.priceEstimate.match(/(\d[\d,]*)/);
      return {
        ...h,
        parsedPrice: match ? parseInt(match[0].replace(/,/g, ''), 10) : 0
      };
    });
  }, [data.hotels]);

  const { minPrice, maxDataPrice, currencySymbol } = useMemo(() => {
    const prices = hotelData.map(h => h.parsedPrice).filter(p => p > 0);
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 500;
    const sym = data.hotels.length > 0 ? getCurrencySymbol(data.hotels[0].priceEstimate) : '$';
    return { minPrice: min, maxDataPrice: max, currencySymbol: sym };
  }, [hotelData, data.hotels]);

  const [priceFilter, setPriceFilter] = useState<number>(maxDataPrice);

  useEffect(() => {
    setPriceFilter(maxDataPrice);
  }, [maxDataPrice]);

  const filteredHotels = hotelData.filter(h => h.parsedPrice <= priceFilter || h.parsedPrice === 0);
  const budgetHotels = filteredHotels.filter(h => h.category === 'Budget');
  const luxuryHotels = filteredHotels.filter(h => h.category === 'Luxury');

  const openGallery = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setSelectedHotel(null);
    document.body.style.overflow = 'unset';
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % 3);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? 2 : prev - 1));
  };

  const renderHotelCard = (hotel: ParsedHotel, index: number) => {
    // Deterministic image based on hotel name
    const imageSeed = hotel.name.replace(/\s/g, '');
    const mainImageUrl = `https://picsum.photos/seed/${imageSeed}/800/600`;

    return (
      <div key={index} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all hover:shadow-xl flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
        {/* Clickable Image Area */}
        <div 
          className="relative h-48 overflow-hidden cursor-pointer"
          onClick={() => openGallery(hotel)}
        >
          <img 
            src={mainImageUrl} 
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-slate-800 flex items-center gap-2 shadow-lg">
              <ZoomIn size={16} />
              View Gallery
            </div>
          </div>
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm">
             <ImageIcon size={12} />
             <span>3 Photos</span>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-slate-800 leading-tight">{hotel.name}</h3>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">
                <Star size={12} fill="currentColor" />
                {hotel.rating}
              </div>
          </div>
          
          <p className="text-slate-600 text-sm mb-4 flex-1">{hotel.description}</p>
          
          <div className="flex items-center gap-2 text-slate-700 font-medium mb-4 bg-slate-50 p-2 rounded-lg text-sm">
              <DollarSign size={14} />
              {hotel.priceEstimate} / night
          </div>

          <a 
              href={getBookingUrl(hotel.name, data.destinationName)}
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
          >
              {labels.bookRoom}
              <ChevronRight size={16} />
          </a>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header & Slider Container */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Bed size={24} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-800">{labels.hotelsHeader}</h2>
          </div>

          {/* Filter Slider */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 w-full md:w-72">
            <div className="flex items-center justify-between mb-2 text-slate-700 font-medium text-sm">
              <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-slate-400" />
                  <span>{labels.priceFilterLabel}</span>
              </div>
              <span className="text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded-md">
                {currencySymbol}{priceFilter}
              </span>
            </div>
            
            <input
              type="range"
              min={minPrice > 0 ? minPrice : 0}
              max={maxDataPrice}
              step={10}
              value={priceFilter}
              onChange={(e) => setPriceFilter(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
            
            <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
              <span>{currencySymbol}{minPrice}</span>
              <span>{currencySymbol}{maxDataPrice}</span>
            </div>
          </div>
        </div>

        {/* Luxury Section */}
        <div>
          <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
            {labels.luxuryStays}
          </h3>
          {luxuryHotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {luxuryHotels.map(renderHotelCard)}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center text-slate-500 italic">
              No luxury options within this price range.
            </div>
          )}
        </div>

        {/* Budget Section */}
        <div>
          <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
            {labels.budgetStays}
          </h3>
          {budgetHotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgetHotels.map(renderHotelCard)}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center text-slate-500 italic">
              No budget options within this price range.
            </div>
          )}
        </div>
      </div>

      {/* Gallery Modal */}
      {selectedHotel && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button 
            onClick={closeGallery}
            className="absolute top-6 right-6 text-white/50 hover:text-white p-2 transition-colors z-50"
          >
            <X size={32} />
          </button>
          
          <div className="w-full max-w-5xl relative flex flex-col items-center">
             
             {/* Main Image Container */}
             <div className="relative w-full aspect-video bg-black/50 rounded-lg overflow-hidden flex items-center justify-center">
                {/* Navigation Buttons */}
                <button 
                  onClick={prevImage}
                  className="absolute left-4 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Animated Image */}
                <img 
                  key={currentImageIndex} // Key forces re-render for animation
                  src={`https://picsum.photos/seed/${selectedHotel.name.replace(/\s/g,'')}${currentImageIndex > 0 ? `-${currentImageIndex}` : ''}/1200/800`}
                  alt={`${selectedHotel.name} view ${currentImageIndex + 1}`}
                  className="max-h-[80vh] max-w-full object-contain shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500"
                />
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-white">
                   <h2 className="text-2xl font-serif font-bold">{selectedHotel.name}</h2>
                   <p className="opacity-80">{selectedHotel.category} • {selectedHotel.priceEstimate}</p>
                </div>
             </div>

             {/* Thumbnails */}
             <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
               {[0, 1, 2].map((idx) => (
                 <button
                   key={idx}
                   onClick={() => setCurrentImageIndex(idx)}
                   className={`relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                     currentImageIndex === idx ? 'border-brand-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                   }`}
                 >
                   <img 
                     src={`https://picsum.photos/seed/${selectedHotel.name.replace(/\s/g,'')}${idx > 0 ? `-${idx}` : ''}/200/200`}
                     alt={`Thumbnail ${idx}`}
                     className="w-full h-full object-cover"
                   />
                 </button>
               ))}
             </div>

          </div>
        </div>
      )}
    </>
  );
};

export default HotelSection;