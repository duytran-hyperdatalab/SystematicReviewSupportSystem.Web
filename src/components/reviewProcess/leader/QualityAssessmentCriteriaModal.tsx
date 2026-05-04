import React, { useState } from "react";
import { Modal } from "../../ui/Modal";
import Button from "../../ui/Button";
import { 
  Plus, 
  Trash2, 
  Info,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useQualityAssessment } from "../../../pages/reviewProcess/qualityAssessment/hooks/useQualityAssessment";

interface QualityAssessmentCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  qualityAssessmentProcessId: string;
  reviewProcessId: string;
  onApply?: () => void;
}

// const DEFAULT_QA_CRITERIA = [
//   "Is the paper based on research (or is it a discussion paper based on expert opinion)?",
//   "What research method was used: Experiment, Quasi-Experiment, Lessons learnt, Case study, Opinion Survey, Tertiary Study, Other (specify)?",
//   "Is there a clear statement of the aims of the study?",
//   "Is there an adequate description of the context in which the research or observation was carried out?",
//   "Was the research method appropriate to address the aims of the research? (i.e. Expert Opinion).",
//   "Was the recruitment strategy (for human-based experiments and quasi-experiments) or experimental material or context (for lessons learnt) appropriate to the aims of the research?",
//   "For empirical studies (apart from Lessons Learnt), was there a control group or baseline with which to evaluate SR procedures/techniques?",
//   "For empirical studies (apart from Lessons Learnt), was the data collected in a way that addressed the research issue?",
//   "For empirical studies (apart from Lessons Learnt), was the data analysis sufficiently rigorous?",
//   "Has the relationship between researcher and participants been considered to an adequate degree?",
//   "Is there a clear statement of findings?",
//   "Is the study of value for research or practice?",
// ];

const DEFAULT_QA_CRITERIA = [
  "Bài báo dựa trên nghiên cứu thực nghiệm hay là bài thảo luận dựa trên ý kiến chuyên gia?",
  "Phương pháp nghiên cứu nào đã được sử dụng: Thực nghiệm, Bán thực nghiệm, Bài học kinh nghiệm, Nghiên cứu tình huống, Khảo sát ý kiến, Nghiên cứu cấp ba (Tertiary Study), hoặc Khác (vui lòng nêu rõ)?",
  "Mục tiêu của nghiên cứu có được phát biểu rõ ràng không?",
  "Bối cảnh thực hiện nghiên cứu hoặc quan sát có được mô tả đầy đủ không?",
  "Phương pháp nghiên cứu có phù hợp để giải quyết các mục tiêu đề ra không? (Ví dụ: Ý kiến chuyên gia).",
  "Chiến lược tuyển chọn đối tượng (đối với thực nghiệm trên người) hoặc tài liệu/bối cảnh thực nghiệm (đối với bài học kinh nghiệm) có phù hợp với mục tiêu nghiên cứu không?",
  "Đối với các nghiên cứu thực chứng (ngoại trừ Bài học kinh nghiệm), có nhóm đối chứng hoặc mốc cơ sở (baseline) để đánh giá các quy trình/kỹ thuật SR không?",
  "Đối với các nghiên cứu thực chứng (ngoại trừ Bài học kinh nghiệm), dữ liệu thu thập có giải quyết được vấn đề nghiên cứu không?",
  "Đối với các nghiên cứu thực chứng (ngoại trừ Bài học kinh nghiệm), việc phân tích dữ liệu có đủ độ chặt chẽ không?",
  "Mối quan hệ giữa người nghiên cứu và đối tượng tham gia đã được xem xét ở mức độ thỏa đáng chưa?",
  "Các kết quả nghiên cứu có được trình bày rõ ràng không?",
  "Nghiên cứu này có giá trị đối với công tác nghiên cứu hoặc thực hành không?",
];

const QualityAssessmentCriteriaModal: React.FC<QualityAssessmentCriteriaModalProps> = ({
  isOpen,
  onClose,
  qualityAssessmentProcessId,
  reviewProcessId: reviewProcessId,
  onApply,
}) => {
  const { 
    upsertStrategy, 
    bulkChecklists, 
    bulkCriteria, 
  } = useQualityAssessment(qualityAssessmentProcessId, true);
  
  const [criteria, setCriteria] = useState<{ id: string; text: string }[]>(
    DEFAULT_QA_CRITERIA.map((text) => ({ id: uuidv4(), text }))
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAddCriterion = () => {
    setCriteria([...criteria, { id: uuidv4(), text: "" }]);
  };

  const handleRemoveCriterion = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id));
  };

  const handleUpdateCriterion = (id: string, text: string) => {
    setCriteria(criteria.map((c) => (c.id === id ? { ...c, text } : c)));
  };

  const handleApplyCriteria = async () => {
    if (criteria.some((c) => !c.text.trim())) {
      toast.error("Please fill in all criteria or remove empty ones.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Upsert Strategy
      const strategyResponse = await upsertStrategy({
        qaStrategyId: null!,
        reviewProcessId: reviewProcessId,
        description: "Default Quality Assessment Strategy",
        checklists: []
      });
      
      const strategyId = strategyResponse.data?.qaStrategyId;
      if (!strategyId) throw new Error("Failed to get Strategy ID");

      // 2. Bulk Checklists
      const checklistResponse = await bulkChecklists([
        {
          checklistId: null!,
          qaStrategyId: strategyId,
          name: "Default Quality Checklist",
          criteria: []
        }
      ]);
      
      const checklistId = checklistResponse.data?.[0]?.checklistId;
      if (!checklistId) throw new Error("Failed to get Checklist ID");

      // 3. Upsert Criteria
      const criteriaPayload = criteria.map(c => ({
        criterionId: null!,
        checklistId: checklistId,
        question: c.text,
        weight: 1.0
      }));

      await bulkCriteria(criteriaPayload);
      
      if (onApply) {
        onApply();
      }
      onClose();
    } catch (error) {
      console.error("Failed to save QA configuration:", error);
      toast.error("Failed to save Quality Assessment configuration. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quality Assessment Criteria"
      size="xl"
    >
      <div className="flex flex-col gap-6 py-2 h-[75vh]">
        {/* Header Section */}
        <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 shadow-sm shrink-0">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-50 shrink-0">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Configure Quality Assessment</h3>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Define the criteria used to evaluate the methodological quality and risk of bias for included studies.
              These questions will be presented to reviewers during the Quality Assessment phase.
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="px-5 py-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 shrink-0">
          <Info className="w-4 h-4 text-amber-600" />
          <p className="text-xs text-amber-800 font-medium">
            Reviewers will rate each criterion for every paper. You can add, edit, or remove criteria below.
          </p>
        </div>

        {/* Scrollable Criteria List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {criteria.map((criterion, index) => (
            <div 
              key={criterion.id}
              className="group flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-2xl transition-all hover:border-blue-200 hover:shadow-md hover:shadow-blue-50/50 animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="mt-2.5 flex items-center justify-center w-6 h-6 rounded-lg bg-slate-50 text-[10px] font-black text-slate-400 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                {index + 1}
              </div>
              
              <div className="flex-1">
                <textarea
                  value={criterion.text}
                  onChange={(e) => handleUpdateCriterion(criterion.id, e.target.value)}
                  placeholder="Enter assessment question..."
                  className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-700 placeholder:text-slate-300 min-h-[60px] resize-none font-medium leading-relaxed"
                />
              </div>

              <button
                onClick={() => handleRemoveCriterion(criterion.id)}
                className="mt-1 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                title="Remove Criterion"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            onClick={handleAddCriterion}
            className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/30 transition-all group"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Add Custom Criterion</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 shrink-0">
          <Button variant="secondary" onClick={onClose} className="px-6 rounded-xl">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleApplyCriteria}
            className="px-8 rounded-xl shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 border-none"
            disabled={criteria.length === 0 || isSaving}
            isLoading={isSaving}
          >
            <ChevronRight className="w-4 h-4 mr-2" />
            Apply & Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QualityAssessmentCriteriaModal;
