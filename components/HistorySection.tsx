import React from 'react';
import { History, Info } from './Icons';
import { DestinationData, TranslationLabels } from '../types';

interface HistorySectionProps {
  data: DestinationData;
  labels: TranslationLabels;
}

const HistorySection: React.FC<HistorySectionProps> = ({ data, labels }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Introduction Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
              <Info size={24} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-800">{labels.overviewHeader}</h2>
          </div>
          <p className="text-xl text-slate-600 font-light leading-relaxed mb-6">
            "{data.tagline}"
          </p>
          <p className="text-slate-700 leading-relaxed">
            {data.description}
          </p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
               <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">{labels.bestTime}</span>
               <p className="text-slate-800 font-medium mt-1">{data.bestTimeToVisit}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
               <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">{labels.currency}</span>
               <p className="text-slate-800 font-medium mt-1">{data.currency}</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
            <History size={24} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-800">{labels.historyHeader}</h2>
        </div>
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {data.history}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistorySection;