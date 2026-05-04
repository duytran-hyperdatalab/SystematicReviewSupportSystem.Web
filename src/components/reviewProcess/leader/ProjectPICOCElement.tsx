import React from "react";
import { Users, Zap, Activity, Target, Microscope } from "lucide-react";
import { clsx } from "clsx";

interface Picoc {
  id: string;
  population: string;
  intervention: string;
  comparator: string;
  outcome: string;
  context: string;
}

interface ProjectPICOCElementProps {
  picocs: Picoc[] | undefined;
  isCompact?: boolean;
}

const ProjectPICOCElement: React.FC<ProjectPICOCElementProps> = ({ picocs, isCompact }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-widest">
        <Target className="w-4 h-4 text-rose-500" />
        Project PICOC Framework
      </div>
      <div className={clsx(
        "grid gap-3",
        isCompact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
      )}>
        {picocs && picocs.length > 0 ? (
          picocs.map((p) => (
            <React.Fragment key={p.id}>
              <PicocElementCard label="Population" value={p.population} icon={<Users className="w-4 h-4" />} color="blue" isCompact={isCompact} />
              <PicocElementCard label="Intervention" value={p.intervention} icon={<Zap className="w-4 h-4" />} color="amber" isCompact={isCompact} />
              <PicocElementCard label="Comparator" value={p.comparator} icon={<Activity className="w-4 h-4" />} color="emerald" isCompact={isCompact} />
              <PicocElementCard label="Outcome" value={p.outcome} icon={<Target className="w-4 h-4" />} color="rose" isCompact={isCompact} />
              <PicocElementCard label="Context" value={p.context} icon={<Microscope className="w-4 h-4" />} color="indigo" isCompact={isCompact} />
            </React.Fragment>
          ))
        ) : (
          <div className="col-span-full py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm italic">
            No PICOC elements defined.
          </div>
        )}
      </div>
    </section>
  );
};

// Helper component for PICOC elements
const PicocElementCard = ({ label, value, icon, color, isCompact }: { label: string, value: string, icon: React.ReactNode, color: string, isCompact?: boolean }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
  };

  const text = value || `No ${label.toLowerCase()}`;
  const isLongText = text.length > 60; // Approximate threshold for 2 lines

  return (
    <div className={clsx(
      "p-3 rounded-xl border shadow-sm transition-all hover:shadow-md h-fit",
      colorMap[color]
    )}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 opacity-80">
          <div className="p-1 bg-white/50 rounded-md">
            {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-3 h-3" })}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
        </div>
        {isLongText && !isCompact && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[9px] font-black uppercase tracking-tighter hover:underline opacity-60 hover:opacity-100"
          >
            {isExpanded ? "Collapse" : "View Full"}
          </button>
        )}
      </div>
      <p className={clsx(
        "text-[11px] font-semibold leading-relaxed break-words",
        (!isCompact && !isExpanded) && "line-clamp-2"
      )}>
        {text}
      </p>
    </div>
  );
};

export default ProjectPICOCElement;
