import { cn } from "../../../../../utils/cn";

export type ImradSectionKey = "introduction" | "methods" | "results" | "discussion";

interface ImradSection {
  key: ImradSectionKey;
  label: string;
}

const IMRAD_SECTIONS: ImradSection[] = [
  { key: "introduction", label: "Introduction" },
  { key: "methods", label: "Methods" },
  { key: "results", label: "Results" },
  { key: "discussion", label: "Discussion" },
];

interface ImradSidebarProps {
  activeSection: ImradSectionKey | null;
  onSectionClick: (sectionKey: ImradSectionKey) => void;
  width?: number;
}

/**
 * IMRAD Sidebar for PDF Navigation
 * Provides quick access to Introduction, Methods, Results, and Discussion sections.
 */
export function ImradSidebar({ activeSection, onSectionClick, width = 200 }: ImradSidebarProps) {
  return (
    <div
      style={{ width: `${width}px` }}
      className="bg-slate-50 border-r border-slate-100 flex flex-col h-full animate-in slide-in-from-left duration-300 shrink-0 overflow-hidden"
    >
      <div className="p-4 border-b border-slate-100 bg-white/50">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">IMRAD</h3>
      </div>

      <div className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {IMRAD_SECTIONS.map((section) => {
          const isActive = activeSection === section.key;

          return (
            <button
              key={section.key}
              onClick={() => {
                console.log("Navigate to section:", section.key);
                onSectionClick(section.key);
              }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-xl transition-all duration-200 group",
                "text-xs font-bold uppercase tracking-tight",
                isActive
                  ? "bg-blue-100 text-blue-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
              )}
            >
              <div className="flex items-center justify-between">
                <span>{section.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 bg-white/30">
        <p className="text-[9px] text-slate-400 leading-tight font-medium">
          Structured Reading Mode
        </p>
      </div>
    </div>
  );
}
