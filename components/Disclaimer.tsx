import React, { useState } from 'react';
import { AlertOctagon, X } from 'lucide-react';

export const Disclaimer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-medical-900 border-b border-yellow-600/30 p-3 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-yellow-500">
          <AlertOctagon className="w-5 h-5 flex-shrink-0 animate-pulse" />
          <div className="text-xs md:text-sm text-slate-300">
            <span className="font-bold text-yellow-500">CDS Disclaimer:</span> AI output is for informational support only. 
            Verification by a licensed clinician is mandatory. Not a medical device.
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};