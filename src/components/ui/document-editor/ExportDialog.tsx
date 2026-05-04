import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Download, Copy, Check } from "lucide-react";
import type { RootState } from "../../../redux/store";
import Modal from "../Modal";
import Button from "../Button";
import { toast } from "react-hot-toast";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose }) => {
  const { draft } = useSelector((state: RootState) => state.documentEditor);
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(draft, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    toast.success("JSON copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `document-${draft.title.toLowerCase().replace(/\s+/g, "-") || "draft"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("JSON file downloaded!");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Document JSON"
      size="lg"
    >
      <div className="space-y-4">
        <div className="relative group">
          <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg text-xs overflow-auto max-h-[500px] font-mono leading-relaxed CustomScrollbar">
            {jsonString}
          </pre>
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
              onClick={handleCopy}
            >
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" /> Download JSON
          </Button>
        </div>
      </div>
    </Modal>
  );
};
