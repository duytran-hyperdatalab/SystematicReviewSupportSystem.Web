import React, { useState } from "react";
import { EditorPanel } from "./EditorPanel";
import { PreviewPanel } from "./PreviewPanel";
import { ExportDialog } from "./ExportDialog";
import { FileDown, Settings2, Trash2, LayoutDashboard } from "lucide-react";
import Button from "../Button";
import ConfirmModal from "../ConfirmModal";
import type { DocumentDraft } from "../../../types/documentEditor";

const emptyDraft: DocumentDraft = { title: "", paragraphs: [], sections: [] };

export const DocumentAuthoringEditor: React.FC = () => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [localDraft, setLocalDraft] = useState<DocumentDraft>(emptyDraft);

  const handleReset = () => {
    setLocalDraft(emptyDraft);
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Top Navigation / Header */}
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 shrink-0 bg-white/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Document Authoring</h1>
            <p className="text-xs text-gray-400 font-medium">Design your document structure</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => setIsResetConfirmOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Clear Editor
          </Button>
          <div className="w-px h-6 bg-gray-100 mx-1"></div>
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-2 border-gray-200"
            onClick={() => setIsExportOpen(true)}
          >
            <Settings2 className="w-4 h-4" /> Export Options
          </Button>
          <Button 
            size="sm" 
            className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm"
            onClick={() => setIsExportOpen(true)}
          >
            <FileDown className="w-4 h-4" /> Export JSON
          </Button>
        </div>
      </header>

      {/* Split Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Editor */}
        <div className="w-full md:w-[45%] lg:w-[40%] border-r border-gray-100 h-full flex flex-col bg-slate-50/30">
          <div className="p-4 border-b border-gray-50 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Editor Workspace</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 md:p-8 xl:p-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 transition-colors">
            <div className="max-w-2xl mx-auto">
               <EditorPanel 
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
          />
        </div>
      </main>

      {/* Export Dialog */}
      <ExportDialog 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
      />

      {/* Reset Confirmation */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleReset}
        title="Clear Document Editor"
        message="Are you sure you want to clear your current work? This action cannot be undone."
      />
    </div>
  );
};



