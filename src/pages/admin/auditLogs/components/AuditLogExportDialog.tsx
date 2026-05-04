import React, { useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiCode,
  FiDownload,
  FiFileText,
  FiGrid,
} from "react-icons/fi";
import Modal from "../../../../components/ui/Modal";
import { cn } from "../../../../utils/cn";
import type { AuditLogExportFormat } from "../../../../types/auditLog";
import { EXPORT_FORMAT_OPTIONS } from "../constants";
import { formatRangeLabel } from "../utils";

interface ExportRequest {
  format: AuditLogExportFormat;
  startDate: string;
  endDate: string;
}

interface AuditLogExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStartDate: string;
  defaultEndDate: string;
  onExport: (request: ExportRequest) => Promise<void> | void;
}

const formatIconMap: Record<AuditLogExportFormat, React.ReactNode> = {
  csv: <FiFileText className="w-5 h-5" />,
  json: <FiCode className="w-5 h-5" />,
  xlsx: <FiGrid className="w-5 h-5" />,
};

const AuditLogExportDialog: React.FC<AuditLogExportDialogProps> = ({
  isOpen,
  onClose,
  defaultStartDate,
  defaultEndDate,
  onExport,
}) => {
  const [format, setFormat] = useState<AuditLogExportFormat>("csv");
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFormat("csv");
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setIsExporting(false);
    setProgress(0);
    setErrorMessage(null);
  }, [defaultEndDate, defaultStartDate, isOpen]);

  useEffect(() => {
    if (!isExporting) return undefined;

    const steps = [10, 24, 39, 58, 73, 88, 100];
    let currentStep = 0;
    const timer = window.setInterval(() => {
      setProgress(steps[currentStep]);
      currentStep += 1;

      if (currentStep >= steps.length) {
        window.clearInterval(timer);

        try {
          Promise.resolve(onExport({ format, startDate, endDate }))
            .then(() => {
              setIsExporting(false);
              setProgress(100);
              onClose();
            })
            .catch((error: unknown) => {
              const message =
                error instanceof Error ? error.message : "Export failed. Please try again.";
              setErrorMessage(message);
              setIsExporting(false);
              setProgress(0);
            });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Export failed. Please try again.";
          setErrorMessage(message);
          setIsExporting(false);
          setProgress(0);
        }
      }
    }, 220);

    return () => window.clearInterval(timer);
  }, [endDate, format, isExporting, onClose, onExport, startDate]);

  const hasInvalidRange = useMemo(() => {
    if (!startDate || !endDate) return true;
    return new Date(startDate).getTime() > new Date(endDate).getTime();
  }, [endDate, startDate]);

  const handleStartExport = () => {
    if (!startDate || !endDate) {
      setErrorMessage("Select both a start and end date before exporting.");
      return;
    }

    if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
      setErrorMessage("The start date must be earlier than the end date.");
      return;
    }

    setErrorMessage(null);
    setIsExporting(true);
    setProgress(1);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Audit Logs"
      description="Generate a client-side export from the currently selected date range."
      size="lg"
    >
      <div className="space-y-6">
        <div className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <FiDownload className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase tracking-[0.18em] text-indigo-700">
                Export scope
              </h4>
              <p className="text-sm text-slate-600 font-medium">
                The export will use the selected format and date range, then be saved locally in
                your browser.
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Current range: {formatRangeLabel(startDate, endDate)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {EXPORT_FORMAT_OPTIONS.map((option) => {
            const isSelected = format === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormat(option.value)}
                className={cn(
                  "rounded-3xl border p-4 text-left transition-all",
                  isSelected
                    ? "border-indigo-200 bg-indigo-50 shadow-lg shadow-indigo-100/60"
                    : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50",
                )}
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center",
                      isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {formatIconMap[option.value]}
                  </div>
                  {isSelected && <FiCheckCircle className="w-5 h-5 text-indigo-600" />}
                </div>
                <div className="text-sm font-black text-slate-900">{option.label}</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{option.description}</p>
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 block">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              Start date
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </label>
          <label className="space-y-2 block">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              End date
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </label>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-700 flex items-center gap-2">
            <FiAlertTriangle className="w-4 h-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        {isExporting && (
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-slate-900">Generating export</p>
                <p className="text-xs font-medium text-slate-500">
                  Preparing the {format.toUpperCase()} file for download.
                </p>
              </div>
              <div className="text-sm font-black text-indigo-600">{progress}%</div>
            </div>
            <div className="h-3 rounded-full bg-white overflow-hidden border border-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-5 py-3 rounded-2xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartExport}
            disabled={isExporting || hasInvalidRange}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-black transition-all inline-flex items-center justify-center gap-2",
              isExporting || hasInvalidRange
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200",
            )}
          >
            <FiDownload className="w-4 h-4" />
            {isExporting ? "Exporting..." : `Export ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AuditLogExportDialog;
