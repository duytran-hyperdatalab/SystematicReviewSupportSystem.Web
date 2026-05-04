import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { FiAlertTriangle } from "react-icons/fi";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "danger",
}) => {
  const variantStyles = {
    danger: {
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      confirmBtn: "bg-rose-600 hover:bg-rose-700 shadow-rose-100",
    },
    warning: {
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      confirmBtn: "bg-amber-600 hover:bg-amber-700 shadow-amber-100",
    },
    info: {
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      confirmBtn: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100",
    },
  };

  const style = variantStyles[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <div className={`w-20 h-20 ${style.iconBg} rounded-full flex items-center justify-center`}>
          <FiAlertTriangle className={`w-10 h-10 ${style.iconColor}`} />
        </div>
        
        <div className="space-y-2">
          <p className="text-slate-600 font-medium leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex gap-3 w-full pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-2xl font-bold py-3"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            className={`flex-1 rounded-2xl font-bold py-3 text-white shadow-lg border-none! ${style.confirmBtn}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
