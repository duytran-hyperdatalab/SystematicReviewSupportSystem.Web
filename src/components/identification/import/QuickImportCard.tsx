// Quick Import Card - SECONDARY ENTRY PATH
import { useState } from "react";
import { FiAlertCircle, FiUpload, FiX } from "react-icons/fi";
import Button from "../../ui/Button";
import type { SearchExecution } from "../../../types/identification";

interface QuickImportCardProps {
  identificationProcessId: string;
  availableStrategies: SearchExecution[];
  onImport: (file: File, source: string, strategyId?: string) => Promise<void>;
  isUploading: boolean;
  uploadProgress?: number; // 0-100
}

const DATABASE_SOURCES = [
  "PubMed",
  "IEEE Xplore",
  "ACM Digital Library",
  "Scopus",
  "Web of Science",
  "Cochrane Library",
  "Google Scholar",
  "Other",
];

export default function QuickImportCard({
  availableStrategies,
  onImport,
  isUploading,
  uploadProgress = 0,
}: QuickImportCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedSource) return;
    await onImport(selectedFile, selectedSource, selectedStrategyId || undefined);
    // Reset form
    setSelectedFile(null);
    setSelectedSource("");
    setSelectedStrategyId("");
  };

  const canImport = selectedFile && selectedSource && !isUploading;
  const willAutoCreateStrategy = !selectedStrategyId;

  return (
    <div
      id="quick-import"
      className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 mt-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiAlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">Quick Import</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              Import RIS files without a predefined strategy
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold">
          Fallback Option
        </span>
      </div>

      {/* Warning Banner */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
        <div className="flex gap-2 text-sm text-orange-800">
          <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Not recommended for systematic reviews</p>
            <p className="text-xs text-orange-700 mt-1">
              For better organization and audit trails, create a search strategy first, then import
              your RIS files.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* File Upload Zone */}
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
                  onClick={() => setSelectedFile(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
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
                      accept=".ris,.bib,.csv,.xml"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">Supported: .ris, .bib, .csv, .xml</p>
              </div>
            )}
          </div>
        </div>

        {/* Source Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Database Source <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a database source...</option>
            {DATABASE_SOURCES.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        {/* Optional Strategy Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link to Existing Strategy{" "}
            <span className="text-xs text-gray-500 font-normal">(optional)</span>
          </label>
          <select
            value={selectedStrategyId}
            onChange={(e) => setSelectedStrategyId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={availableStrategies.length === 0}
          >
            <option value="">Don't link to a strategy</option>
            {availableStrategies.map((strategy) => (
              <option key={strategy.id} value={strategy.id}>
                {strategy.searchSource} - {new Date(strategy.executedAt).toLocaleDateString()}
              </option>
            ))}
          </select>
          {availableStrategies.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              No strategies available. Create one first for better organization.
            </p>
          )}
        </div>

        {/* Auto-Create Warning */}
        {willAutoCreateStrategy && selectedFile && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex gap-2 text-sm">
              <FiAlertCircle className="w-4 h-4 text-yellow-700 mt-0.5 shrink-0" />
              <div className="text-yellow-800">
                <p className="font-medium">Auto-strategy will be created</p>
                <p className="text-xs text-yellow-700 mt-1">
                  A search strategy will be automatically created as: "{selectedSource} Import -{" "}
                  {new Date().toLocaleDateString()}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && uploadProgress > 0 && (
          <div className="mb-3">
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

        {/* Import Button */}
        <Button onClick={handleImport} disabled={!canImport} className="w-full" variant="secondary">
          <FiUpload className="w-4 h-4 mr-2" />
          {isUploading ? "Importing..." : "Import RIS File"}
        </Button>
      </div>
    </div>
  );
}
