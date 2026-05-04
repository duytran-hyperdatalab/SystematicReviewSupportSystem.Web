// Import RIS Modal - Dual Mode (from-strategy OR quick-import)
import { useState } from "react";
import { FiX, FiUpload, FiLock } from "react-icons/fi";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import type { SearchExecution } from "../../../types/identification";

interface ImportRISModalProps {
  identificationProcessId: string;
  isOpen: boolean;
  mode: "from-strategy" | "quick-import";
  preselectedStrategyId?: string; // locked if mode = 'from-strategy'
  availableStrategies?: SearchExecution[]; // for quick-import mode
  onClose: () => void;
  onSubmit: (file: File, source?: string, strategyId?: string) => Promise<void>;
  isUploading?: boolean;
  uploadProgress?: number; // 0-100
  sourceOptions?: { label: string; value: string }[];
  sourceLabel?: string;
  sourcePlaceholder?: string;
  sourceRequiredInQuickImport?: boolean;
  showStrategySelectorInQuickImport?: boolean;
}

const DATABASE_SOURCES = [
  { label: "PubMed", value: "PubMed" },
  { label: "IEEE Xplore", value: "IEEE Xplore" },
  { label: "ACM Digital Library", value: "ACM Digital Library" },
  { label: "Scopus", value: "Scopus" },
  { label: "Web of Science", value: "Web of Science" },
  { label: "Cochrane Library", value: "Cochrane Library" },
  { label: "Google Scholar", value: "Google Scholar" },
  { label: "Other", value: "Other" },
];

export default function ImportRISModal({
  isOpen,
  mode,
  preselectedStrategyId,
  availableStrategies = [],
  onClose,
  onSubmit,
  isUploading = false,
  uploadProgress = 0,
  sourceOptions = DATABASE_SOURCES,
  sourceLabel = "Database Source",
  sourcePlaceholder = "Select a database source...",
  sourceRequiredInQuickImport = true,
  showStrategySelectorInQuickImport = true,
}: ImportRISModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(preselectedStrategyId || "");
  const [isDragging, setIsDragging] = useState(false);

  const preselectedStrategy = availableStrategies.find((s) => s.id === preselectedStrategyId);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelected(files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    // Simulate parsing (in real app, parse RIS file)
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelected(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    // In quick-import mode, source is required
    if (mode === "quick-import" && sourceRequiredInQuickImport && !selectedSource) return;

    await onSubmit(selectedFile, selectedSource, selectedStrategyId || undefined);

    // Reset form
    setSelectedFile(null);
    setSelectedSource("");
    setSelectedStrategyId(preselectedStrategyId || "");
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setSelectedSource("");
      setSelectedStrategyId(preselectedStrategyId || "");
      onClose();
    }
  };

  const canSubmit =
    selectedFile &&
    !isUploading &&
    (mode === "from-strategy" ||
      (mode === "quick-import" && (!sourceRequiredInQuickImport || Boolean(selectedSource))));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === "from-strategy" ? "Import RIS to Strategy" : "Quick Import RIS File"}
      size="lg"
    >
      {/* Mode-specific Info Banner */}
      {mode === "from-strategy" && preselectedStrategy && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-2 text-sm">
            <FiLock className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
            <div className="text-blue-800">
              <p className="font-medium">Importing to strategy:</p>
              <p className="text-xs text-blue-700 mt-1">
                {preselectedStrategy.searchSource} -{" "}
                {new Date(preselectedStrategy.executedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RIS File <span className="text-red-500">*</span>
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 bg-white"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiUpload className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                    disabled={isUploading}
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Parsed Record Count */}
                {/* {parsedRecordCount !== null && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-green-800">
                      <FiCheck className="w-4 h-4" />
                      <p className="font-medium">
                        {parsedRecordCount.toLocaleString()} records detected
                      </p>
                    </div>
                  </div>
                )} */}
              </div>
            ) : (
              <div className="text-center">
                <FiUpload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-700 mb-1">
                  Drag and drop your RIS file here, or{" "}
                  <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                    browse
                    <input
                      type="file"
                      accept=".ris"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">Supported: .ris</p>
              </div>
            )}
          </div>
        </div>

        {/* Source Selector (Quick Import Mode Only) */}
        {mode === "quick-import" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {sourceLabel} {sourceRequiredInQuickImport && <span className="text-red-500">*</span>}
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isUploading}
            >
              <option value="">{sourcePlaceholder}</option>
              {sourceOptions.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Strategy Selector (Quick Import Mode Only) */}
        {mode === "quick-import" && showStrategySelectorInQuickImport && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link to Existing Strategy{" "}
              <span className="text-xs text-gray-500 font-normal">(optional)</span>
            </label>
            <select
              value={selectedStrategyId}
              onChange={(e) => setSelectedStrategyId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isUploading || availableStrategies.length === 0}
            >
              <option value="">Don't link to a strategy</option>
              {availableStrategies.map((strategy) => (
                <option key={strategy.id} value={strategy.id}>
                  {strategy.searchSource} - {new Date(strategy.executedAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && uploadProgress > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Uploading...</span>
              <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            <FiUpload className="w-4 h-4 mr-2" />
            {isUploading ? "Importing..." : "Import RIS File"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
