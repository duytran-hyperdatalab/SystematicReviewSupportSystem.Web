import React from "react";
import Modal from "../Modal";
import { EditorPanel } from "./EditorPanel";
import { PreviewPanel } from "./PreviewPanel";
import { v4 as uuidv4 } from "uuid";
import type { StudySelectionChecklistTemplate } from "../../../types/studySelectionChecklistTemplate";
import type { CreateStudySelectionChecklistTemplateRequest } from "../../../types/studySelectionChecklistTemplate";
import type { DocumentDraft } from "../../../types/documentEditor";
import { mergeChecklistDrafts } from "../../../utils/documentEditorHelpers";

interface DocumentAuthoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateStudySelectionChecklistTemplateRequest | null) => void;
  isSubmitting?: boolean;
  title?: string;
  description?: string;
  submitText?: string;
  template?: StudySelectionChecklistTemplate | null;
  screeningProcessId?: string;
  allowImportCriterias?: boolean;
}

const emptyDraft: DocumentDraft = { title: "", paragraphs: [], sections: [] };

export const DocumentAuthoringModal: React.FC<DocumentAuthoringModalProps> = ({ 
  isOpen, 
  onClose,
  onSubmit,
  isSubmitting,
  title = "Document Tool",
  description = "Design your document structure with real-time preview.",
  submitText,
  template,
  screeningProcessId,
  allowImportCriterias
}) => {
  // Initialize local state
  const [localDraft, setLocalDraft] = React.useState<DocumentDraft>(emptyDraft);

  // Initial Loading Logic
  React.useEffect(() => {
    if (isOpen) {
      if (template) {
        // Initial load from template
        const initialFromTemplate: DocumentDraft = {
          title: template.name,
          paragraphs: [{ id: uuidv4(), text: template.description, order: 1 }],
          sections: (template.sections ?? []).map((s, sIdx) => ({
            id: uuidv4(),
            title: s.title,
            description: s.description,
            order: sIdx + 1,
            items: s.items.map((i, iIdx) => ({
              id: uuidv4(),
              text: i.text,
              order: iIdx + 1
            }))
          }))
        };
        setLocalDraft(initialFromTemplate);
      } else {
        setLocalDraft(emptyDraft);
      }
    }
  }, [isOpen, template]);
 
  const handleImport = (importData: any) => {
    // Always append imported data to the current draft
    const merged = mergeChecklistDrafts(localDraft, importData);
    setLocalDraft(merged);
  };
   return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="xl"
      className="max-w-[95vw] h-[90vh]"
    >
      <div className="flex h-[calc(90vh-180px)] -m-8 overflow-hidden bg-white">
        {/* Left Side: Editor */}
        <div className="w-full md:w-[45%] lg:w-[40%] border-r border-slate-100 h-full flex flex-col bg-slate-50/30">
          <div className="p-4 border-b border-slate-100/50 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Editor Workspace</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 md:p-8 xl:p-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 transition-colors">
            <div className="max-w-2xl mx-auto">
              <EditorPanel 
                onSubmit={onSubmit} 
                isSubmitting={isSubmitting} 
                submitText={submitText} 
                localDraft={localDraft}
                setLocalDraft={setLocalDraft}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Live Preview */}
        <div className="hidden md:block flex-1 h-full bg-slate-50/50">
          <PreviewPanel 
            localDraft={localDraft} 
            onImport={handleImport}
            screeningProcessId={screeningProcessId}
            allowImportCriterias={allowImportCriterias}
          />
        </div>
      </div>
    </Modal>
  );
};

export default DocumentAuthoringModal;
