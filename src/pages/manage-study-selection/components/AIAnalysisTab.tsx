import React from 'react';
import { Cpu, Play } from 'lucide-react';
import Button from '../../../components/ui/Button';

export const AIAnalysisTab: React.FC = () => {
  return (
    <div className="p-8 flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-300">
      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100">
        <Cpu className="w-8 h-8 text-indigo-500" />
      </div>
      <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider mb-2">AI Analysis</h3>
      <p className="text-sm text-slate-500 mb-8 max-w-[200px] mx-auto">
        Use AI to automatically analyze this paper based on your inclusion criteria.
      </p>

      <Button
        className="w-full max-w-[200px] h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 group"
        onClick={() => { }}
      >
        <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
        Run AI Analysis
      </Button>
    </div>
  );
};
