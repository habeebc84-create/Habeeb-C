import React from 'react';
import { Utensils } from './Icons';
import { DestinationData, TranslationLabels } from '../types';

interface FoodSectionProps {
  data: DestinationData;
  labels: TranslationLabels;
}

const FoodSection: React.FC<FoodSectionProps> = ({ data, labels }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
          <Utensils size={24} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-800">{labels.cuisineHeader}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.culinaryDelights.map((dish, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex gap-4 hover:shadow-md transition-shadow">
            <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-xl overflow-hidden bg-orange-50">
               <img 
                 src={`https://picsum.photos/seed/${dish.name.replace(/\s/g,'')}/400/400`} 
                 alt={dish.name}
                 className="w-full h-full object-cover"
               />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-xl font-bold text-slate-800 mb-1">{dish.name}</h3>
              <p className="text-slate-600 text-sm mb-3 line-clamp-2">{dish.description}</p>
              <div className="text-xs text-orange-700 font-medium bg-orange-50 px-3 py-1.5 rounded-lg self-start">
                {labels.tryAt}: {dish.bestPlaceToTry}
              </div>
            </div>
          </div>
        ))}
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