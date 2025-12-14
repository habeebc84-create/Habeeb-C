
import React, { useState } from 'react';
import { Utensils, Sunrise, Sun, Moon, DollarSign, MapPin, Car, Bus } from './Icons';
import { DestinationData, TranslationLabels, Dish, Coordinates } from '../types';

interface FoodSectionProps {
  data: DestinationData;
  labels: TranslationLabels;
}

const FoodSection: React.FC<FoodSectionProps> = ({ data, labels }) => {
  const [activeCategory, setActiveCategory] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Breakfast');

  const filteredFood = data.culinaryDelights.filter(
    (dish) => dish.category === activeCategory
  );

  const openUber = (coords: Coordinates, name: string) => {
    const url = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${coords.lat}&dropoff[longitude]=${coords.lng}&dropoff[nickname]=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
  };

  const openTransitRoute = (coords: Coordinates) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=transit`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <Utensils size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800">{labels.cuisineHeader}</h2>
            <p className="text-xs text-green-600 font-bold uppercase tracking-wide">
              Verified Affordable Prices • Best Value
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start">
          <button 
            onClick={() => setActiveCategory('Breakfast')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === 'Breakfast' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Sunrise size={16} />
            Breakfast
          </button>
          <button 
            onClick={() => setActiveCategory('Lunch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === 'Lunch' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Sun size={16} />
            Lunch
          </button>
          <button 
            onClick={() => setActiveCategory('Dinner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === 'Dinner' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Moon size={16} />
            Dinner
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFood.length > 0 ? (
          filteredFood.map((dish, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow animate-in slide-in-from-bottom-2 duration-300">
              <div className="w-full md:w-32 h-40 md:h-32 shrink-0 rounded-xl overflow-hidden bg-orange-50 relative">
                 <img 
                   src={`https://picsum.photos/seed/${dish.name.replace(/\s/g,'')}${activeCategory}/400/400`} 
                   alt={dish.name}
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {dish.category}
                 </div>
              </div>
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{dish.name}</h3>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">{dish.description}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mt-2 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                    <MapPin size={12} className="text-slate-400"/>
                    {dish.bestPlaceToTry}
                  </div>
                  
                  {dish.priceRange && (
                    <div className="flex items-center gap-1 text-xs text-green-700 font-bold bg-green-50 px-2 py-1.5 rounded-lg border border-green-100">
                      <DollarSign size={12} />
                      {dish.priceRange}
                    </div>
                  )}
                </div>

                {/* Transport Buttons */}
                <div className="flex gap-2 mt-auto">
                    <button
                       onClick={() => openUber(dish.coordinates, dish.name)}
                       className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    >
                       <Car size={14} />
                       Cab
                    </button>
                    <button
                       onClick={() => openTransitRoute(dish.coordinates)}
                       className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                       <Bus size={14} />
                       Bus
                    </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
             No recommendations found for this category.
          </div>
        )}
      </div>
      
      {/* Travel Tips at the bottom of food section as a bonus */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-slate-800 mb-4 px-2">{labels.tipsHeader}</h3>
        <div className="bg-slate-800 text-slate-200 rounded-2xl p-6 md:p-8">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {data.travelTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-accent-500 mt-1">•</span>
                <span className="text-sm leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FoodSection;
