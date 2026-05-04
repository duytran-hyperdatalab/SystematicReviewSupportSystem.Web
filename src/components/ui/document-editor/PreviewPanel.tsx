import React, { useState } from "react";
import { PreviewDocument } from "./PreviewDocument";
import { Eye, Download, Upload } from "lucide-react";
import Button from "../Button";
import { ExportDialog } from "./ExportDialog";
import { ImportDialog } from "./ImportDialog";
import type { DocumentDraft } from "../../../types/documentEditor";

interface PreviewPanelProps {
  localDraft: DocumentDraft;
  onImport?: (data: any) => void;
  screeningProcessId?: string;
  allowImportCriterias?: boolean;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  localDraft,
  onImport,
  screeningProcessId,
  allowImportCriterias
}) => {
  const draft = localDraft;
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10 transition-all">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Live Preview</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3"
            onClick={() => setIsImportOpen(true)}
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" /> Import
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            className="h-8 text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3"
            onClick={() => setIsExportOpen(true)}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8 xl:p-12 scrollbar-hide">
        <PreviewDocument draft={draft} />
      </div>

      <ExportDialog 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
      />
      <ImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={onImport}
        screeningProcessId={screeningProcessId}
        allowImportCriterias={allowImportCriterias}
      />
    </div>
  );
};

