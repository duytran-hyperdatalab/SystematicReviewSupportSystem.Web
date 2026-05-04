import React from "react";
import { clsx } from "clsx";
import { HelpCircle } from "lucide-react";

interface ResearchQuestion {
  id: string;
  questionText: string;
}

interface ProjectResearchQuestionsProps {
  researchQuestions: ResearchQuestion[] | undefined;
  isCompact?: boolean;
}

const ProjectResearchQuestions: React.FC<ProjectResearchQuestionsProps> = ({ researchQuestions, isCompact }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-widest">
        <HelpCircle className="w-4 h-4 text-indigo-500" />
        Research Questions
      </div>
      <div className={clsx(
        "grid gap-3",
        isCompact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
      )}>
        {researchQuestions && researchQuestions.length > 0 ? (
          researchQuestions.map((rq, index) => (
            <ResearchQuestionCard key={rq.id} index={index} text={rq.questionText} isCompact={isCompact} />
          ))
        ) : (
          <div className="col-span-full py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm italic">
            No research questions defined.
          </div>
        )}
      </div>
    </section>
  );
};

const ResearchQuestionCard = ({ index, text, isCompact }: { index: number, text: string, isCompact?: boolean }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isLongText = text.length > 100;

  return (
    <div className="flex flex-col gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-all shadow-sm group h-fit">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px] group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
            RQ{index + 1}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question</span>
        </div>
        {isLongText && !isCompact && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter hover:underline opacity-60 hover:opacity-100"
          >
            {isExpanded ? "Collapse" : "View Full"}
          </button>
        )}
      </div>
      <p className={clsx(
        "text-slate-700 text-sm font-medium break-words leading-relaxed",
        (!isCompact && !isExpanded) && "line-clamp-2"
      )}>
        {text}
      </p>
    </div>
  );
};

export default ProjectResearchQuestions;
