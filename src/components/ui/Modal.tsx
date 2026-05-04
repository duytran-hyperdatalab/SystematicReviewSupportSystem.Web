import React, { useEffect, useRef } from "react";
import { cn } from "../../utils/cn";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  description?: React.ReactNode;
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
  description,
  closeOnOutsideClick = true,
  closeOnEsc = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeStyles = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-(--z-index-modal) flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with frosted glass effect */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        aria-hidden="true"
      />

      {/* Modal Content container for scaling animation */}
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden transform transition-all z-10 animate-in zoom-in-95 fade-in duration-300",
          sizeStyles[size],
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header Section */}
        <div className="px-8 pt-8 pb-6 flex items-start justify-between border-b border-slate-50">
          <div className="space-y-1">
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {title}
            </div>
            {description && (
              <div className="text-sm font-medium text-slate-500">{description}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90 group"
          >
            <FiX size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Body Section */}
        <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
