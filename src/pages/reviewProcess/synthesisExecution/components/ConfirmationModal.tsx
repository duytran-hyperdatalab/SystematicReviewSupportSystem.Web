import { AlertTriangle, X } from "lucide-react";
import Button from "../../../../components/ui/Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isConfirming?: boolean;
  variant?: "danger" | "primary";
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  isConfirming = false,
  variant = "primary",
  onClose,
  onConfirm,
}: ConfirmationModalProps) {
  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = () => {
    if (isConfirming) {
      return;
    }

    onClose();
  };

  const handleDialogClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl"
        onClick={handleDialogClick}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600 shadow-sm">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">Confirmation</p>
              <h3 className="mt-1 text-xl font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close confirmation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Cancel
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={() => void onConfirm()}
            isLoading={isConfirming}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
