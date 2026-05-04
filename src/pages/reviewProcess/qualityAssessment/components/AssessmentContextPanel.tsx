interface AssessmentContextPanelProps {
  mode: "criteria" | "ai";
}

const DUMMY_CRITERIA = [
  "Is the research question clearly stated?",
  "Is the study design appropriate?",
  "Are the data collection methods valid?",
  "Are the findings clearly described?"
];

export default function AssessmentContextPanel({ mode }: AssessmentContextPanelProps) {
  return (
    <div className="w-80 shrink-0 bg-white border-l border-gray-200 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-900">
          {mode === "criteria" ? "Quality Checklist" : "AI Suggestions"}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {mode === "criteria" ? (
          <div className="space-y-6">
            {DUMMY_CRITERIA.map((crit, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-sm font-medium text-gray-800">{idx + 1}. {crit}</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-1 text-xs font-medium border border-gray-200 rounded-md hover:bg-emerald-50 hover:text-emerald-700 transition">
                    Yes
                  </button>
                  <button className="flex-1 py-1 text-xs font-medium border border-gray-200 rounded-md hover:bg-rose-50 hover:text-rose-700 transition">
                    No
                  </button>
                  <button className="flex-1 py-1 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-100 transition">
                    Partial
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            <p className="mb-4">AI evaluating paper against established criteria.</p>
            <div className="p-3 bg-blue-50 text-blue-800 rounded-lg">
              🤖 Suggestion: Based on section 3.2, the data collection methods seem well documented. (Confidence: 85%)
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2">
        <button className="w-full py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition shadow-sm">
          Complete Assessment
        </button>
      </div>
    </div>
  );
}