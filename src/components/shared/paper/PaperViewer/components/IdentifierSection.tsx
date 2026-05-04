import React from "react";
import { FiLink2, FiHash, FiDatabase, FiCopy } from "react-icons/fi";
import { Sparkles } from "lucide-react";
import type { ScreeningPaper } from "../../../../../pages/reviewProcess/studySelection/titleAbstractScreening/types";

interface IdentifierSectionProps {
  paper: ScreeningPaper;
  isFieldUpdated: (f: string) => boolean;
}

export const IdentifierSection: React.FC<IdentifierSectionProps> = ({
  paper,
  isFieldUpdated,
}) => {
  const identifiers = [
    {
      label: "DOI",
      value: paper.doi,
      icon: <FiLink2 className="w-3.5 h-3.5" />,
      isUpdated: isFieldUpdated("DOI"),
    },
    {
      label: "ISSN",
      value: paper.journalIssn,
      icon: <FiHash className="w-3.5 h-3.5" />,
      isUpdated: isFieldUpdated("ISSN"),
    },
    {
      label: "E-ISSN",
      value: paper.journalEIssn,
      icon: <FiHash className="w-3.5 h-3.5" />,
      isUpdated: isFieldUpdated("E-ISSN"),
    },
    {
      label: "MD5",
      value: paper.md5,
      icon: <FiDatabase className="w-3.5 h-3.5" />,
      isUpdated: isFieldUpdated("Md5"),
    },
  ].filter((i) => i.value);

  if (identifiers.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
        Unique Identifiers
      </h2>
      <div className="space-y-4">
        {identifiers.map((item) => (
          <div key={item.label} className="flex items-center justify-between group/item">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-blue-50 group-hover/item:text-blue-500 transition-colors">
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {item.label}
                  </span>
                  {item.isUpdated && (
                    <div className="group/spark relative flex items-center">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.1em] rounded-lg opacity-0 group-hover/spark:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10 backdrop-blur-md">
                        Suggested applied
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs font-mono font-bold text-slate-600 truncate max-w-[200px]">
                  {item.value}
                </p>
              </div>
            </div>
            {item.label === "DOI" && (
              <button
                onClick={() => navigator.clipboard.writeText(item.value!)}
                className="p-2 opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-blue-600 transition-all"
              >
                <FiCopy className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
