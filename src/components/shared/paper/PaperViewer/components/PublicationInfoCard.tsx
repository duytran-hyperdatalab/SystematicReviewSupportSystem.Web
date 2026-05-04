import React from "react";
import { Sparkles } from "lucide-react";
import type { ScreeningPaper } from "../../../../../pages/reviewProcess/studySelection/titleAbstractScreening/types";


interface PublicationInfoCardProps {
  paper: ScreeningPaper;
  isFieldUpdated: (f: string) => boolean;
}

export const PublicationInfoCard: React.FC<PublicationInfoCardProps> = ({
  paper,
  isFieldUpdated,
}) => {
  const fields = [
    { label: "Journal", value: paper.journal, isUpdated: isFieldUpdated("Journal") },
    { label: "Conference", value: paper.conferenceName, isUpdated: isFieldUpdated("Conference") },
    { label: "Publisher", value: paper.publisher, isUpdated: isFieldUpdated("Publisher") },
    { label: "Volume", value: paper.volume, isUpdated: isFieldUpdated("Volume") },
    { label: "Issue", value: paper.issue, isUpdated: isFieldUpdated("Issue") },
    { label: "Pages", value: paper.pages, isUpdated: isFieldUpdated("Pages") },
    {
      label: "Pub. Date",
      value: paper.publicationDate,
      isUpdated: isFieldUpdated("publicationDate"),
    },
    { label: "Language", value: paper.language, isUpdated: isFieldUpdated("Language") },
    { label: "Pub. Type", value: paper.publicationType, isUpdated: false },
  ].filter((f) => f.value);

  if (fields.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
        Publication Details
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
        {fields.map((field) => (
          <div key={field.label} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {field.label}
              </span>
              {field.isUpdated && (
                <div className="group/spark relative flex items-center">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.1em] rounded-lg opacity-0 group-hover/spark:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10 backdrop-blur-md">
                    Suggested applied
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm font-bold text-slate-800 break-words">{field.value || "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
