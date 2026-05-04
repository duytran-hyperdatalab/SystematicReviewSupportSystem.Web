import { useRef, useState } from "react";
import {
  FiCheckSquare,
  FiChevronDown,
  FiChevronUp,
  FiCpu,
  FiFileText,
  FiInfo,
  FiLoader,
  FiUpload,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Modal from "../../../../components/ui/Modal";
import Tooltip from "../../../../components/ui/Tooltip";
import { cn } from "../../../../utils/cn";
import { hasIncompleteMetadata } from "../metadataEnhancement";
import type { UploadPdfOptions } from "../uploadTypes";

interface UploadFullTextPdfModalProps {
  isOpen: boolean;
  isUploading: boolean;
  paper: {
    title: string;
    authors: string | null;
    doi: string | null;
    abstract: string | null;
    journal: string | null;
  };
  onClose: () => void;
  onSubmit: (file: File, options: UploadPdfOptions) => Promise<unknown>;
}

const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;

export default function UploadFullTextPdfModal({
  isOpen,
  isUploading,
  paper,
  onClose,
  onSubmit,
}: UploadFullTextPdfModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const extractWithGrobid = true;
  const [isMetadataSectionExpanded, setIsMetadataSectionExpanded] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth >= 768,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    const isPdfType = file.type === "application/pdf";
    const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfType && !hasPdfExtension) {
      toast.error("Only PDF files are allowed.");
      return;
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      toast.error("File size exceeds 20 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    validateAndSetFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile || isUploading) {
      return;
    }

    await onSubmit(selectedFile, { extractWithGrobid });
  };

  const incompleteMetadata = hasIncompleteMetadata(paper);
  const actionLabel = "Upload & Extract Metadata";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Full Text PDF"
      description="Upload the paper PDF and enhance missing metadata with AI extraction."
      size="lg"
      closeOnOutsideClick={!isUploading}
      closeOnEsc={!isUploading}
    >
      <div className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Section 1
              </p>
              <h4 className="text-lg font-semibold text-slate-900">PDF Upload</h4>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Required
            </span>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={handleFileSelected}
            />

            {selectedFile ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="rounded-2xl bg-white p-3 text-indigo-600 shadow-sm">
                    <FiFileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · PDF ready to upload
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Replace File
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading}
                    className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Remove selected PDF"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex w-full flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-10 text-center transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="mb-4 rounded-2xl bg-indigo-50 p-4 text-indigo-600">
                  <FiUpload className="h-6 w-6" />
                </div>
                <p className="text-base font-semibold text-slate-900">Choose a PDF to upload</p>
                <p className="mt-1 max-w-md text-sm text-slate-500">
                  Select the full-text article PDF. Maximum file size: 20 MB.
                </p>
              </button>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <button
            type="button"
            onClick={() => setIsMetadataSectionExpanded((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 text-left"
            aria-expanded={isMetadataSectionExpanded}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Section 2
              </p>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-semibold text-slate-900">Metadata Enhancement</h4>
                <Tooltip
                  content="This feature uses machine learning to read the PDF header and extract bibliographic information."
                  position="top"
                >
                  <span
                    className="inline-flex rounded-full border border-slate-200 bg-white p-1.5 text-slate-500"
                    aria-label="What AI metadata extraction does"
                    tabIndex={0}
                  >
                    <FiInfo className="h-3.5 w-3.5" />
                  </span>
                </Tooltip>
              </div>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              Enabled
            </span>
            <span className="ml-auto rounded-full bg-slate-100 p-2 text-slate-500 md:hidden">
              {isMetadataSectionExpanded ? (
                <FiChevronUp className="h-4 w-4" />
              ) : (
                <FiChevronDown className="h-4 w-4" />
              )}
            </span>
          </button>

          <div
            className={cn(
              "overflow-hidden rounded-3xl border border-indigo-100 bg-linear-to-br from-indigo-50 via-white to-sky-50 transition-all",
              isMetadataSectionExpanded ? "max-h-[420px] p-5" : "max-h-0 p-0 border-transparent",
            )}
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white p-3 text-indigo-600 shadow-sm">
                  <FiCpu className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-base font-semibold text-slate-900">
                    Enhance Metadata with AI
                  </h5>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Automatically extract missing metadata (authors, abstract, DOI, journal
                    information) from the uploaded PDF.
                  </p>
                </div>
              </div>

              {incompleteMetadata && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  This paper has incomplete metadata. AI extraction may improve it.
                </div>
              )}

              <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-white px-4 py-4 shadow-sm transition-colors">
                <div className="mt-1 flex h-4 w-4 items-center justify-center rounded bg-indigo-600 text-white">
                  <FiCheckSquare className="h-3 w-3" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      AI metadata extraction enabled
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Automatically extract missing metadata from the PDF to improve paper details.
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    Estimated time: 3–6 seconds
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Section 3
            </p>
            <h4 className="text-lg font-semibold text-slate-900">Upload Action</h4>
          </div>

          <div className="rounded-2xl bg-white p-4" aria-live="polite" aria-busy={isUploading}>
            {isUploading ? (
              <div className="space-y-3">
                <LoadingRow label="Uploading PDF..." />
                <LoadingRow label="Queuing AI metadata extraction..." subdued={true} />
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                Upload the PDF. Metadata extraction will happen automatically in the background.
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isUploading ? (
                <FiLoader className="h-4 w-4 animate-spin" />
              ) : (
                <FiUpload className="h-4 w-4" />
              )}
              {isUploading ? "Working..." : actionLabel}
            </button>
          </div>
        </section>
      </div>
    </Modal>
  );
}

function LoadingRow({ label, subdued = false }: { label: string; subdued?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1.5" aria-hidden="true">
        <span
          className={cn(
            "h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-600",
            subdued && "bg-slate-400",
          )}
        />
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-400 [animation-delay:120ms]" />
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-400 [animation-delay:240ms]" />
      </span>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
  );
}
