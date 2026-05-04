import React from "react";
import { FiRefreshCw, FiGitBranch } from "react-icons/fi";
import { cn } from "../../../../../utils/cn";

interface GraphSectionProps {
  citationGraph: any;
  isDiscoveryLoading: boolean;
  graphDepth: number;
  setGraphDepth: (depth: number) => void;
  minConfidence: number;
  setMinConfidence: (confidence: number) => void;
  setOpenGraph: (open: boolean) => void;
}

export const GraphSection: React.FC<GraphSectionProps> = ({
  citationGraph,
  isDiscoveryLoading,
  graphDepth,
  setGraphDepth,
  minConfidence,
  setMinConfidence,
  setOpenGraph,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Network Depth
            </span>
            <div className="flex gap-1">
              {[1, 2, 3].map((d) => (
                <button
                  key={d}
                  onClick={() => setGraphDepth(d)}
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black border transition-all active:scale-90",
                    d === graphDepth
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/20"
                      : "bg-white text-slate-400 border-slate-200 hover:border-blue-400",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="h-6 w-px bg-slate-100 hidden sm:block" />
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Precision
            </span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-32 accent-blue-600"
            />
            <span className="text-[10px] font-black text-blue-600 font-mono">
              {(minConfidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      <div className="aspect-video bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden group border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:32px_32px]" />

        {isDiscoveryLoading ? (
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <FiRefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
            <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
              Building Neural Network...
            </div>
          </div>
        ) : citationGraph ? (
          <div className="z-10 text-center px-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.25em] mb-2 backdrop-blur-sm">
              <FiGitBranch className="w-3.5 h-3.5" /> Intelligence Visualizer Active
            </div>
            <div>
              <h3 className="text-white text-3xl font-black mb-2 tracking-tight">
                {citationGraph.nodes.length} Nodes & {citationGraph.edges.length} Edges
              </h3>
              <p className="text-white/50 text-xs max-w-sm mx-auto leading-relaxed font-medium">
                Analysis complete. Explore the full citation universe at depth {graphDepth}.
                Interact with nodes to see specific paper relationships.
              </p>
            </div>

            <button
              onClick={() => setOpenGraph(true)}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-900/40 active:scale-95"
            >
              Launch Visualizer
            </button>
          </div>
        ) : (
          <div className="text-white/20 text-[10px] font-black uppercase tracking-widest">
            Network unavailable
          </div>
        )}
      </div>
    </div>
  );
};
