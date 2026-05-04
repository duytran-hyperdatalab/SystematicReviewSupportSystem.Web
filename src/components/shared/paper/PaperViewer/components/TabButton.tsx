import React from "react";
import { cn } from "../../../../../utils/cn";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label, count }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl",
        active
          ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
      )}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "px-1.5 py-0.5 rounded-lg text-[9px] font-black",
            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};
