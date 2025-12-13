import React, { useState } from 'react';
import { Camera, Clock } from './Icons';
import { DestinationData, TranslationLabels } from '../types';

interface AttractionsSectionProps {
  data: DestinationData;
  labels: TranslationLabels;
  randomSeed: number; // Added randomSeed prop
}

const AttractionsSection: React.FC<AttractionsSectionProps> = ({ data, labels, randomSeed }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'camera'>('all');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold text-slate-800">{labels.attractionsHeader}</h2>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {labels.allAttractions}
          </button>
          <button 
            onClick={() => setActiveTab('camera')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'camera' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Camera size={16} />
            {labels.cameraSpots}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Render General Attractions if tab is 'all' */}
        {activeTab === 'all' && data.topAttractions.map((spot, index) => (
          <div key={`attr-${index}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col h-full">
            <div className="h-40 bg-slate-200 relative overflow-hidden">
               {/* Use randomSeed to change image on every search */}
               <img 
                 src={`https://picsum.photos/seed/${spot.name.replace(/\s/g,'')}-${randomSeed}/800/600`} 
                 alt={spot.name}
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                 loading="lazy"
               />
               <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-700 uppercase tracking-wider">
                 {spot.type}
               </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-600 transition-colors">{spot.name}</h3>
              </div>
              <p className="text-slate-600 text-sm mb-4 flex-1">{spot.description}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                <Clock size={14} />
                <span>{spot.bestTime}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Render Camera Spots */}
        {(activeTab === 'camera' || activeTab === 'all') && (
           <>
             {activeTab === 'all' && <div className="col-span-full h-px bg-slate-200 my-4" />}
             {activeTab === 'all' && <h3 className="col-span-full text-lg font-bold text-slate-700 flex items-center gap-2"><Camera size={20} className="text-rose-500"/> {labels.cameraSpots}</h3>}
             
             {data.photographySpots.map((spot, index) => (
              <div key={`photo-${index}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-rose-100 flex flex-col h-full relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-rose-500"></div>
                <div className="h-48 bg-slate-800 relative overflow-hidden">
                   <img 
                     src={`https://picsum.photos/seed/${spot.name.replace(/\s/g,'')}camera-${randomSeed}/800/600`} 
                     alt={spot.name}
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                     loading="lazy"
                   />
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                     <Camera size={32} className="text-white drop-shadow-lg" />
                   </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{spot.name}</h3>
                  <p className="text-slate-600 text-sm mb-4 flex-1">{spot.description}</p>
                  <div className="bg-rose-50 text-rose-800 text-xs p-3 rounded-xl border border-rose-100 italic">
                    <span className="font-bold not-italic mr-1">💡 {labels.proTip}:</span>
                    "{spot.bestAngle}"
                  </div>
                </div>
              </div>
            ))}
           </>
        )}
      </div>
    </div>
  );
};

export default AttractionsSection;