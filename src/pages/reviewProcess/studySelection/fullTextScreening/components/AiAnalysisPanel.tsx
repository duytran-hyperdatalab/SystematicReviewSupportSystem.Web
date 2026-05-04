import { useLayoutEffect, useRef, useState } from "react";
import { FiCpu, FiX, FiLoader, FiMessageSquare, FiAlertTriangle, FiChevronUp, FiChevronDown, FiCheck, FiInfo, FiHelpCircle } from "react-icons/fi";
import gsap from "gsap";
import { MarkdownContent } from "../../../../../components/ui/MarkdownContent";
import { cn } from "../../../../../utils/cn";
import type {
  AiAnalysisResult,
  AiResearchQuestionResult,
  AiCriteriaGroupResult,
  AiInclusionResult,
  AiExclusionResult,
  AiPicocMatching,
  MatchStatus,
  FullTextPaper
} from "../types";
import { MATCH_STATUS_CONFIG, PICOC_LABELS } from "../constants";

interface AiAnalysisPanelProps {
  paper: FullTextPaper;
  aiAnalysis: AiAnalysisResult | null;
  isAnalyzing: boolean;
  runAiAnalysis: (paperId: string) => void;
}

const mapMatchStatus = (status: string | undefined): MatchStatus => {
  if (!status) return "unknown";
  const lower = status.toLowerCase();
  if (lower.includes("not match") || lower.includes("not_match") || lower === "no") return "not_match";
  if (lower.includes("partial")) return "partial_match";
  if (lower.includes("match") || lower === "yes") return "match";
  return "unknown";
};

export default function AiAnalysisPanel({
  paper,
  aiAnalysis,
  isAnalyzing,
  runAiAnalysis,
}: AiAnalysisPanelProps) {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    protocol: true,
    picoc: true,
    criteria: true,
    questions: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useLayoutEffect(() => {
    if (aiAnalysis && resultsRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".analysis-section", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
        });

        gsap.from(".score-bar-fill", {
          width: 0,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.5,
        });
      }, resultsRef);

      return () => ctx.revert();
    }
  }, [aiAnalysis]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <FiCpu className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-gray-900">AI Assistant</h2>
        </div>
        <p className="text-[10px] text-gray-400">
          AI analysis is advisory only — you make the final decision.
        </p>
      </div>

      {/* Run Analysis Button */}
      {!aiAnalysis && !isAnalyzing && (
        <div className="px-4 py-4 border-b border-gray-100">
          <button
            onClick={() => runAiAnalysis(paper.id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
          >
            <FiCpu className="w-4 h-4" />
            Run AI Analysis
          </button>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            Analyze full text against protocol criteria
          </p>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="px-4 py-8 border-b border-gray-100">
          <div className="flex flex-col items-center gap-3">
            <FiLoader className="w-6 h-6 text-indigo-600 animate-spin" />
            <p className="text-sm text-gray-500">Analyzing full text...</p>
            <p className="text-[10px] text-gray-400 text-center px-4">
              Evaluating methodology, population, outcomes and criteria matching.
            </p>
          </div>
        </div>
      )}

      {/* AI Analysis Results */}
      {aiAnalysis && aiAnalysis.aiOutput && (
        <div ref={resultsRef} className="pb-10">
          {/* Suggested Decision */}
          <div className="px-4 py-4 border-b border-gray-100 analysis-section">
            <SuggestedDecision
              recommendation={aiAnalysis.recommendation}
              aiRecommendation={aiAnalysis.aiOutput.recommendation}
            />
          </div>

          {/* Score */}
          <div className="px-4 py-4 border-b border-gray-100 analysis-section">
            <div className="space-y-4">
              <ScoreDisplay
                label="Overall Relevance"
                score={aiAnalysis.relevanceScore}
                colorClass={
                  aiAnalysis.relevanceScore > 0.6
                    ? "text-green-600"
                    : aiAnalysis.relevanceScore > 0.3
                      ? "text-amber-600"
                      : "text-red-600"
                }
                barClass={
                  aiAnalysis.relevanceScore > 0.6
                    ? "bg-green-500"
                    : aiAnalysis.relevanceScore > 0.3
                      ? "bg-amber-500"
                      : "bg-red-500"
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Inclusion Matches</span>
                  <span className="text-xl font-bold text-green-600">{aiAnalysis.aiOutput.inclusionMatches}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Exclusion Matches</span>
                  <span className="text-xl font-bold text-red-600">{aiAnalysis.aiOutput.exclusionMatches}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Reasoning */}
          {aiAnalysis.aiOutput.reasoning && (
            <div className="px-4 py-4 border-b border-gray-100 analysis-section bg-gradient-to-b from-indigo-50/50 to-white/30">
              <div className="flex items-center gap-2 mb-3 text-indigo-700">
                <FiMessageSquare className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">AI Reasoning Analysis</span>
              </div>

              <div className="max-h-[320px] overflow-y-auto pr-2 
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-indigo-100
                [&::-webkit-scrollbar-thumb]:rounded-full
                hover:[&::-webkit-scrollbar-thumb]:bg-indigo-200
                transition-colors">
                <MarkdownContent
                  content={aiAnalysis.aiOutput.reasoning}
                  variant="blue"
                  className="space-y-1"
                />
              </div>
            </div>
          )}

          {/* Exclusion Highlights */}
          {aiAnalysis.aiOutput.exclusionHighlights && aiAnalysis.aiOutput.exclusionHighlights.length > 0 && (
            <div className="px-4 py-4 border-b border-gray-100 analysis-section bg-red-50/20">
              <div className="flex items-center gap-2 mb-2 text-red-700">
                <FiAlertTriangle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Critical Exclusions</span>
              </div>
              <div className="space-y-1.5 flex flex-col items-start w-full">
                {aiAnalysis.aiOutput.exclusionHighlights.map((highlight, idx) => (
                  <MarkdownContent
                    key={idx}
                    content={`• ${highlight}`}
                    variant="red"
                    inline
                  />
                ))}
              </div>
            </div>
          )}

          {/* General Matching */}
          {aiAnalysis.aiOutput.criteriaMatching && (
            <div className="analysis-section">
              <CollapsibleSection
                title="General Matching"
                isExpanded={expandedSections.protocol ?? true}
                onToggle={() => toggleSection("protocol")}
              >
                <div className="space-y-2">
                  <MatchRow label="Language" status={mapMatchStatus(aiAnalysis.aiOutput.criteriaMatching.language.match)} value={aiAnalysis.aiOutput.criteriaMatching.language.value} />
                  <MatchRow label="Domain" status={mapMatchStatus(aiAnalysis.aiOutput.criteriaMatching.domain.match)} value={aiAnalysis.aiOutput.criteriaMatching.domain.value} />
                  <MatchRow label="Study Type" status={mapMatchStatus(aiAnalysis.aiOutput.criteriaMatching.studyType.match)} value={aiAnalysis.aiOutput.criteriaMatching.studyType.value} />
                  {aiAnalysis.aiOutput.criteriaMatching.timeRange && (
                    <MatchRow label="Time Range" status={mapMatchStatus(aiAnalysis.aiOutput.criteriaMatching.timeRange.match)} value={aiAnalysis.aiOutput.criteriaMatching.timeRange.value} />
                  )}
                </div>
              </CollapsibleSection>
            </div>
          )}

          {/* Research Questions */}
          {aiAnalysis.aiOutput.researchQuestionResults?.length > 0 && (
            <div className="analysis-section">
              <CollapsibleSection
                title="Research Questions"
                isExpanded={expandedSections.questions ?? true}
                onToggle={() => toggleSection("questions")}
              >
                <div className="space-y-4">
                  {aiAnalysis.aiOutput.researchQuestionResults.map((rq, i) => (
                    <ResearchQuestionItem key={i} result={rq} />
                  ))}
                </div>
              </CollapsibleSection>
            </div>
          )}

          {/* Criteria Groups */}
          {aiAnalysis.aiOutput.criteriaGroupResults?.length > 0 && (
            <div className="analysis-section">
              <CollapsibleSection
                title="Criteria Groups"
                isExpanded={expandedSections.criteria ?? true}
                onToggle={() => toggleSection("criteria")}
              >
                <div className="space-y-6">
                  {aiAnalysis.aiOutput.criteriaGroupResults.map((group, i) => (
                    <CriteriaGroupItem key={i} group={group} />
                  ))}
                </div>
              </CollapsibleSection>
            </div>
          )}

          {/* Re-run */}
          <div className="px-4 py-3 border-b border-gray-100 analysis-section">
            <button
              onClick={() => runAiAnalysis(paper.id)}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <FiCpu className="w-3.5 h-3.5" />
              Re-run AI Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Sub-Components
// ============================================

function SuggestedDecision({
  recommendation,
  aiRecommendation
}: {
  recommendation: number;
  aiRecommendation: string;
}) {
  const isInclude = recommendation === 0;

  return (
    <div>
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
        AI Suggested Decision
      </p>
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2.5 rounded-xl border",
          isInclude
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-700",
        )}
      >
        {isInclude ? <FiCheck className="w-4 h-4" /> : <FiX className="w-4 h-4" />}
        <span className="font-semibold text-sm capitalize">{aiRecommendation}</span>
      </div>
      <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
        This is an AI suggestion. Review the analysis below and make your own decision.
      </p>
    </div>
  );
}

function ScoreDisplay({
  label,
  score,
  colorClass,
  barClass,
}: {
  label: string;
  score: number;
  colorClass: string;
  barClass: string;
}) {
  const percent = Math.round(score * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </span>
        <span className={cn("text-sm font-bold", colorClass)}>{percent}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full score-bar-fill", barClass)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:bg-gray-50 transition-colors"
      >
        {title}
        {isExpanded ? (
          <FiChevronUp className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <FiChevronDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
      {isExpanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function MatchRow({ label, status, value }: { label: string; status: MatchStatus; value?: string }) {
  const cfg = MATCH_STATUS_CONFIG[status];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">{label}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
            cfg.bg,
            cfg.color,
          )}
        >
          <MatchIcon status={status} />
          {cfg.label}
        </span>
      </div>
      {value && (
        <span className="text-[10px] text-gray-400 truncate pl-1 border-l border-gray-100">
          {value}
        </span>
      )}
    </div>
  );
}

function MatchIcon({ status }: { status: MatchStatus }) {
  switch (status) {
    case "match":
      return <FiCheck className="w-2.5 h-2.5" />;
    case "partial_match":
      return <FiInfo className="w-2.5 h-2.5" />;
    case "not_match":
      return <FiX className="w-2.5 h-2.5" />;
    case "unknown":
      return <FiHelpCircle className="w-2.5 h-2.5" />;
  }
}

function ResearchQuestionItem({ result }: { result: AiResearchQuestionResult }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = mapMatchStatus(result.match);
  const cfg = MATCH_STATUS_CONFIG[status];

  const hasPicoc = result.picocMatching && Object.values(result.picocMatching).some(v => v?.value || v?.match);

  return (
    <div className={cn(
      "border border-gray-100 rounded-xl overflow-hidden",
      hasPicoc ? "bg-gray-50/50" : "bg-white"
    )}>
      <div
        className={cn(
          "w-full flex flex-col gap-2 p-3 text-left",
          hasPicoc && "hover:bg-gray-100 transition-colors cursor-pointer"
        )}
        onClick={() => hasPicoc && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold text-gray-800 leading-snug flex-1">
            {result.question}
          </span>
          <span className={cn(
            "shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase",
            cfg.bg,
            cfg.color
          )}>
            <MatchIcon status={status} />
            {cfg.label}
          </span>
        </div>

        {hasPicoc && (
          <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
            {isExpanded ? "Hide Details" : "Show PICOC Details"}
          </div>
        )}
      </div>

      {hasPicoc && isExpanded && result.picocMatching && (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-gray-100 bg-white">
          {Object.keys(PICOC_LABELS).map((key) => {
            const pKey = key as keyof AiPicocMatching;
            const pMatch = result.picocMatching![pKey];
            if (!pMatch) return null;
            return (
              <MatchRow
                key={key}
                label={PICOC_LABELS[key]}
                status={mapMatchStatus(pMatch.match)}
                value={pMatch.value}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function CriteriaGroupItem({ group }: { group: AiCriteriaGroupResult }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
          {group.description || "Criteria Group"}
        </span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      {/* Inclusion Results */}
      {group.inclusionResults?.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider pl-1">Inclusion</p>
          {group.inclusionResults.map((res: AiInclusionResult, i: number) => (
            <div key={i} className="flex gap-2 p-2 bg-green-50/50 rounded-lg border border-green-100/50 text-[11px]">
              <FiCheck className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-gray-800 font-medium">{res.rule}</p>
                <p className="text-[10px] text-green-700 italic">Match: {res.match}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exclusion Results */}
      {group.exclusionResults?.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider pl-1">Exclusion</p>
          {group.exclusionResults.map((res: AiExclusionResult, i: number) => (
            <div key={i} className="flex gap-2 p-2 bg-red-50/50 rounded-lg border border-red-100/50 text-[11px]">
              <FiAlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="text-gray-800 font-medium">{res.rule}</p>
                <p className="text-[10px] text-red-700 italic">Match: {res.match}</p>
                {res.highlight && (
                  <div className="mt-1.5 p-2 bg-white/80 border border-red-100 rounded-md shadow-sm">
                    <MarkdownContent
                      content={res.highlight}
                      variant="red"
                      inline
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
