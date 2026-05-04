import React, { useState } from "react";
import { Upload, FileCode, AlertCircle, Info, Code2, Loader2 } from "lucide-react";
import Modal from "../Modal";
import Button from "../Button";
import Textarea from "../Textarea";
import { validateChecklistDraftJson } from "../../../utils/documentEditorHelpers";
import { toast } from "react-hot-toast";
import { studySelectionService } from "../../../services/studySelectionService";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: (data: any) => void;
  screeningProcessId?: string;
  allowImportCriterias?: boolean;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({ 
  isOpen, 
  onClose, 
  onImport,
  screeningProcessId,
  allowImportCriterias
}) => {
  const [jsonInput, setJsonInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isImportingFromProtocol, setIsImportingFromProtocol] = useState(false);


  const handleImportFromProtocol = async () => {
    if (!screeningProcessId) {
      toast.error("Process ID is missing. Cannot import criteria.");
      return;
    }

    setIsImportingFromProtocol(true);
    try {
      const response = await studySelectionService.getLiveReviewImport(screeningProcessId);
      if (response.isSuccess && response.data) {
        onImport?.(response.data);
        onClose();
        toast.success("Criteria imported and appended successfully!");
      } else {
        toast.error(response.message || "Failed to import criteria from protocol");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while importing criteria");
    } finally {
      setIsImportingFromProtocol(false);
    }
  };

  const handleImport = () => {
    try {
      if (!jsonInput.trim()) {
        setValidationError("Please provide JSON content to import.");
        return;
      }

      const parsed = JSON.parse(jsonInput);
      const validation = validateChecklistDraftJson(parsed);

      if (!validation.isValid) {
        setValidationError(validation.error || "Invalid JSON structure");
        return;
      }

      if (onImport) {
        onImport(parsed);
      }
      setValidationError(null);
      onClose();
      setJsonInput("");
    } catch (e) {
      setValidationError("Invalid JSON format. Please check your syntax.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        toast.error("Please upload a .json file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonInput(content);
        setValidationError(null);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Checklist JSON"
      description="Populate your checklist from raw JSON data."
      size="lg"
    >
      <div className="space-y-6">
        {/* Tutorial Toggle */}
        <div className="space-y-3">
          <button
            onClick={() => setShowTutorial(!showTutorial)}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors group"
          >
            <Info size={14} className="group-hover:rotate-12 transition-transform" />
            {showTutorial ? "Hide Structure Guide" : "View JSON Structure Guide"}
          </button>

          {showTutorial && (
            <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 animate-in fade-in slide-in-from-top-2 duration-300">
              <h4 className="text-sm font-black text-indigo-900 mb-3 flex items-center gap-2">
                <Code2 className="text-indigo-500" size={16} />
                Required Data Structure
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <p className="text-[11px] font-medium text-indigo-700/80 leading-relaxed">
                    Importing will append new criteria to your current work. Ensure the JSON follows the schema.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-[10px] font-bold text-indigo-600/70">
                      <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      New content will be appended to the end of the document
                    </li>
                    <li className="flex items-start gap-2 text-[10px] font-bold text-indigo-600/70">
                      <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      Client-side IDs are regenerated safely
                    </li>
                    <li className="flex items-start gap-2 text-[10px] font-bold text-indigo-600/70">
                      <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      Orders are normalized automatically
                    </li>
                  </ul>
                </div>
                <pre className="text-[9px] font-mono bg-white/80 p-3 rounded-xl border border-indigo-100 text-indigo-800 leading-normal overflow-auto max-h-[140px] CustomScrollbar shadow-inner">
                  {`{
  "title": "Checklist Title",
  "paragraphs": [
    { "text": "Basic info" }
  ],
  "sections": [
    {
      "title": "Section 1",
      "items": [
        { "text": "Criteria 1" }
      ]
    }
  ]
}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Textarea Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">JSON Content</label>
            <div className="flex items-center gap-4">

              {allowImportCriterias && screeningProcessId && (
                <button
                  type="button"
                  onClick={handleImportFromProtocol}
                  disabled={isImportingFromProtocol}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isImportingFromProtocol ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Code2 className="w-3.5 h-3.5" />
                  )}
                  Import criterias
                </button>
              )}

              <label className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Upload .json
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
          <Textarea
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setValidationError(null);
            }}
            placeholder='e.g. { "title": "Checklist Name", "sections": [...] }'
            className="font-mono text-[11px] h-[350px] bg-slate-50/50 leading-relaxed CustomScrollbar"
            error={!!validationError}
          />
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-red-900 tracking-tight">Validation Failed</p>
              <p className="text-xs font-medium text-red-600 leading-relaxed">{validationError}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose} className="rounded-2xl px-8 hover:bg-slate-50">
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!jsonInput.trim()}
            className="rounded-2xl px-12 gap-2 shadow-lg shadow-indigo-100"
          >
            <FileCode className="w-5 h-5" /> Import Now
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportDialog;
