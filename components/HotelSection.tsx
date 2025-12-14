
import React, { useState, useMemo, useEffect } from 'react';
import { Bed, Star, ChevronRight, DollarSign, SlidersHorizontal, ZoomIn, X, ChevronLeft, ImageIcon, MessageSquare, User, Send, ThumbsUp, Wifi, Waves, Dumbbell, Coffee, CircleParking, Tv } from './Icons';
import { DestinationData, TranslationLabels, Hotel } from '../types';

interface HotelSectionProps {
  data: DestinationData;
  labels: TranslationLabels;
}

// Extension to Hotel interface for internal use
interface ParsedHotel extends Hotel {
  parsedPrice: number;
}

interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  comment: string;
  likes: number;
}

const HotelSection: React.FC<HotelSectionProps> = ({ data, labels }) => {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeModalTab, setActiveModalTab] = useState<'gallery' | 'reviews'>('gallery');
  
  // Fake database of reviews (in real app, this would be fetched)
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});
  
  // Review Form State
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  const getBookingUrl = (hotelName: string, destination: string) => {
    const query = encodeURIComponent(`${hotelName} ${destination}`);
    return `https://www.booking.com/searchresults.html?ss=${query}`;
  };

  const getCurrencySymbol = (priceStr: string) => {
    if (priceStr.includes('₹')) return '₹';
    if (priceStr.includes('€')) return '€';
    if (priceStr.includes('£')) return '£';
    if (priceStr.includes('¥')) return '¥';
    return '$';
  };

  const getAmenityIcon = (amenity: string) => {
    const a = amenity.toLowerCase();
    if (a.includes('wifi') || a.includes('internet')) return <Wifi size={14} />;
    if (a.includes('pool') || a.includes('swim')) return <Waves size={14} />;
    if (a.includes('gym') || a.includes('fitness') || a.includes('workout')) return <Dumbbell size={14} />;
    if (a.includes('break') || a.includes('coffee') || a.includes('restaur') || a.includes('dining')) return <Coffee size={14} />;
    if (a.includes('park') || a.includes('garage')) return <CircleParking size={14} />;
    if (a.includes('tv') || a.includes('cable')) return <Tv size={14} />;
    return <Star size={14} />; // Default
  };

  const hotelData = useMemo(() => {
    return data.hotels.map(h => {
      // First try to find INR price
      const inrMatch = h.priceEstimate.match(/₹\s?([\d,]+)/);
      if (inrMatch) {
        return {
          ...h,
          parsedPrice: parseInt(inrMatch[1].replace(/,/g, ''), 10)
        };
      }
      
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

  const openDetails = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setCurrentImageIndex(0);
    setActiveModalTab('gallery');
    document.body.style.overflow = 'hidden';

    // Initialize random reviews for this hotel if not exist
    if (!reviews[hotel.name]) {
      const initialReviews: Review[] = [
        { id: 1, author: "Alex J.", rating: 5, date: "2 months ago", comment: "Absolutely stunning views and great service. Worth every penny!", likes: 12 },
        { id: 2, author: "Sarah M.", rating: 4, date: "3 months ago", comment: "Clean rooms and good location. Breakfast was a bit repetitive though.", likes: 4 },
        { id: 3, author: "Mike T.", rating: 5, date: "1 week ago", comment: "Best stay of our trip. Highly recommend!", likes: 8 }
      ];
      setReviews(prev => ({ ...prev, [hotel.name]: initialReviews }));
    }
  };

  const closeDetails = () => {
    setSelectedHotel(null);
    document.body.style.overflow = 'unset';
    setNewReviewAuthor('');
    setNewReviewComment('');
    setNewReviewRating(5);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotel || !newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newReview: Review = {
      id: Date.now(),
      author: newReviewAuthor,
      rating: newReviewRating,
      date: "Just now",
      comment: newReviewComment,
      likes: 0
    };

    setReviews(prev => ({
      ...prev,
      [selectedHotel.name]: [newReview, ...(prev[selectedHotel.name] || [])]
    }));

    setNewReviewAuthor('');
    setNewReviewComment('');
    setNewReviewRating(5);
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
    const imageSeed = hotel.name.replace(/\s/g, '');
    const mainImageUrl = `https://picsum.photos/seed/${imageSeed}/800/600`;

    return (
      <div key={index} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all hover:shadow-xl flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
        <div 
          className="relative h-48 overflow-hidden cursor-pointer"
          onClick={() => openDetails(hotel)}
        >
          <img 
            src={mainImageUrl} 
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-slate-800 flex items-center gap-2 shadow-lg">
              <ZoomIn size={16} />
              View Details
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
          
          {/* Amenities Grid */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {hotel.amenities.slice(0, 4).map((amenity, i) => (
                <div key={i} className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                   {getAmenityIcon(amenity)}
                   <span>{amenity}</span>
                </div>
              ))}
            </div>
          )}

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
        
        {/* Header & Slider */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Bed size={24} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-800">{labels.hotelsHeader}</h2>
          </div>

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

      {/* Details Modal (Gallery + Reviews) */}
      {selectedHotel && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button 
            onClick={closeDetails}
            className="absolute top-6 right-6 text-white/50 hover:text-white p-2 transition-colors z-50"
          >
            <X size={32} />
          </button>
          
          <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
             
             {/* Header */}
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                   <h2 className="text-2xl font-serif font-bold text-slate-900">{selectedHotel.name}</h2>
                   <p className="text-slate-500 text-sm">{selectedHotel.category} • {selectedHotel.priceEstimate}</p>
                </div>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveModalTab('gallery')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeModalTab === 'gallery' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <ImageIcon size={16} />
                    Gallery
                  </button>
                  <button 
                    onClick={() => setActiveModalTab('reviews')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeModalTab === 'reviews' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <MessageSquare size={16} />
                    Reviews
                  </button>
                </div>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto bg-slate-50">
               
               {activeModalTab === 'gallery' && (
                 <div className="p-6 flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg group">
                      <img 
                        key={currentImageIndex}
                        src={`https://picsum.photos/seed/${selectedHotel.name.replace(/\s/g,'')}${currentImageIndex > 0 ? `-${currentImageIndex}` : ''}/1200/800`}
                        alt="Hotel View"
                        className="w-full h-full object-cover"
                      />
                      <button 
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight size={24} />
                      </button>
                   </div>
                   <div className="flex gap-3 mt-4">
                     {[0, 1, 2].map((idx) => (
                       <button
                         key={idx}
                         onClick={() => setCurrentImageIndex(idx)}
                         className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-brand-500' : 'border-transparent opacity-60'}`}
                       >
                         <img 
                           src={`https://picsum.photos/seed/${selectedHotel.name.replace(/\s/g,'')}${idx > 0 ? `-${idx}` : ''}/200/200`}
                           className="w-full h-full object-cover"
                           alt="thumb"
                         />
                       </button>
                     ))}
                   </div>
                   
                   {/* Modal Amenities List */}
                   {selectedHotel.amenities && (
                     <div className="w-full mt-6">
                        <h4 className="font-bold text-slate-800 mb-3">Amenities</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {selectedHotel.amenities.map((am, i) => (
                                <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
                                    <div className="text-brand-500">{getAmenityIcon(am)}</div>
                                    {am}
                                </div>
                            ))}
                        </div>
                     </div>
                   )}
                 </div>
               )}

               {activeModalTab === 'reviews' && (
                 <div className="p-6 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                   
                   {/* Add Review Form */}
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <MessageSquare size={18} className="text-brand-500" />
                       Write a Review
                     </h3>
                     <form onSubmit={handleSubmitReview} className="space-y-4">
                       <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Rating</label>
                         <div className="flex gap-1">
                           {[1, 2, 3, 4, 5].map(star => (
                             <button
                               type="button"
                               key={star}
                               onClick={() => setNewReviewRating(star)}
                               className="focus:outline-none transition-transform hover:scale-110"
                             >
                               <Star 
                                 size={24} 
                                 fill={star <= newReviewRating ? "#fbbf24" : "none"} 
                                 className={star <= newReviewRating ? "text-amber-400" : "text-slate-300"}
                               />
                             </button>
                           ))}
                         </div>
                       </div>
                       
                       <input 
                         type="text"
                         placeholder="Your Name"
                         value={newReviewAuthor}
                         onChange={(e) => setNewReviewAuthor(e.target.value)}
                         className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                         required
                       />
                       
                       <textarea 
                         placeholder="Share your experience..."
                         value={newReviewComment}
                         onChange={(e) => setNewReviewComment(e.target.value)}
                         className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all min-h-[100px]"
                         required
                       />
                       
                       <button 
                         type="submit"
                         className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                       >
                         <Send size={16} />
                         Post Review
                       </button>
                     </form>
                   </div>

                   {/* Review List */}
                   <div className="space-y-4">
                     <h3 className="font-bold text-slate-800">Recent Reviews ({reviews[selectedHotel.name]?.length || 0})</h3>
                     {reviews[selectedHotel.name]?.map((review) => (
                       <div key={review.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                         <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                               <User size={16} />
                             </div>
                             <div>
                               <p className="font-bold text-slate-800 text-sm">{review.author}</p>
                               <p className="text-xs text-slate-400">{review.date}</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-0.5 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-xs font-bold">
                             <Star size={10} fill="currentColor" />
                             {review.rating}
                           </div>
                         </div>
                         <p className="text-slate-600 text-sm leading-relaxed mb-3">{review.comment}</p>
                         <div className="flex items-center gap-4 border-t border-slate-50 pt-3">
                           <button className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 text-xs font-medium transition-colors">
                             <ThumbsUp size={14} />
                             Helpful ({review.likes})
                           </button>
                         </div>
                       </div>
                     ))}
                   </div>

                 </div>
               )}

             </div>

          </div>
        </div>
      )}
    </>
  );
};

export default HotelSection;
