
import React from 'react';
import { Plane, Train, Car, Bus, Clock, DollarSign, MapIcon, ChevronRight, Star } from './Icons';
import { DestinationData, TranslationLabels } from '../types';

interface RouteSectionProps {
  data: DestinationData;
  origin: string;
  labels: TranslationLabels;
}

const RouteSection: React.FC<RouteSectionProps> = ({ data, origin, labels }) => {
  const getIcon = (mode: string) => {
    const m = mode.toLowerCase();
    if (m.includes('flight') || m.includes('air') || m.includes('avion') || m.includes('flug')) return <Plane size={24} />;
    if (m.includes('train') || m.includes('rail') || m.includes('tren') || m.includes('zug')) return <Train size={24} />;
    if (m.includes('bus')) return <Bus size={24} />;
    return <Car size={24} />;
  };

  // Generate a direct booking URL based on mode
  const getBookingUrl = (mode: string, origin: string, destination: string) => {
    const m = mode.toLowerCase();
    const encodedOrigin = encodeURIComponent(origin);
    const encodedDest = encodeURIComponent(destination);

    if (m.includes('flight') || m.includes('air')) {
      // Google Flights Search
      return `https://www.google.com/travel/flights?q=Flights+to+${encodedDest}+from+${encodedOrigin}`;
    } else if (m.includes('train') || m.includes('rail')) {
      // Rome2Rio is excellent for mixed ground transport
      return `https://www.rome2rio.com/map/${encodedOrigin}/${encodedDest}`;
    } else if (m.includes('bus')) {
      return `https://www.busbud.com/en/search/${encodedOrigin}/${encodedDest}/today/1/0/0/0/0`;
    } else {
      // Default to Google Maps for car/driving
      return `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDest}`;
    }
  };
  
  const getButtonText = (mode: string) => {
     const m = mode.toLowerCase();
     if (m.includes('train') || m.includes('rail')) return "Book Train Tickets";
     if (m.includes('flight') || m.includes('air')) return "Search Flights";
     if (m.includes('bus')) return "Book Bus Tickets";
     return "View Directions";
  };

  const openUber = () => {
    const pickup = data.originCoordinates;
    const dropoff = data.coordinates; // Destination coords
    
    // Fallback if coords are 0,0 (though unlikely with Gemini schema)
    const pLat = pickup?.lat || '';
    const pLng = pickup?.lng || '';
    const dLat = dropoff?.lat || '';
    const dLng = dropoff?.lng || '';

    const url = `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${pLat}&pickup[longitude]=${pLng}&pickup[nickname]=${encodeURIComponent(origin)}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}&dropoff[nickname]=${encodeURIComponent(data.destinationName)}`;
    
    window.open(url, '_blank');
  };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(data.destinationName)}`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
         <div>
           <h2 className="text-2xl font-serif font-bold text-slate-800">{labels.routesHeader}</h2>
           <p className="text-slate-500">{labels.from} {origin} -&gt; {data.destinationName}</p>
         </div>
         <a 
           href={googleMapsUrl} 
           target="_blank" 
           rel="noopener noreferrer"
           className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-800 hover:underline"
         >
           <MapIcon size={18} />
           {labels.viewMap}
         </a>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {data.routes.map((route, index) => {
          const isPremium = route.category === 'Premium';
          const bookingUrl = getBookingUrl(route.mode, origin, data.destinationName);
          const modeLower = route.mode.toLowerCase();
          const isCar = modeLower.includes('car') || modeLower.includes('taxi') || modeLower.includes('drive') || modeLower.includes('cab');
          
          return (
            <div key={index} className={`relative rounded-2xl p-6 shadow-sm border transition-all hover:shadow-lg ${isPremium ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-slate-100'}`}>
              
              {isPremium && (
                <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Star size={10} fill="currentColor" />
                  PREMIUM / FASTEST
                </div>
              )}
              
              {!isPremium && (
                 <div className="absolute -top-3 left-6 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                   AFFORDABLE
                 </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center gap-6 mt-2">
                
                {/* Icon */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${isPremium ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {getIcon(route.mode)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-800">{route.mode}</h3>
                    <div className="flex gap-4 mt-2 md:mt-0">
                      <div className="flex items-center gap-1.5 text-slate-600 bg-white/50 px-3 py-1 rounded-full border border-slate-200/50">
                        <Clock size={14} />
                        <span className="text-sm font-medium">{route.duration}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${isPremium ? 'text-indigo-700 bg-indigo-100 border-indigo-200' : 'text-emerald-700 bg-emerald-100 border-emerald-200'}`}>
                        <DollarSign size={14} />
                        <span className="text-sm font-bold">{route.costEstimate}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm md:text-base">{route.details}</p>
                  
                  {/* Buttons Row */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a 
                        href={bookingUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md ${
                        isPremium 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                        }`}
                    >
                        {getButtonText(route.mode)}
                        <ChevronRight size={16} />
                    </a>

                    {/* Specific "Book Cab" Button for car-based routes */}
                    {isCar && (
                        <button
                            onClick={openUber}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md"
                        >
                            Book Cab
                            <Car size={16} />
                        </button>
                    )}
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-8">
        <h3 className="font-bold text-blue-900 mb-2">{labels.travelTipTitle}</h3>
        <p className="text-blue-800 text-sm">
          {labels.travelTipText}
        </p>
      </div>
    </div>
  );
};

export default RouteSection;
