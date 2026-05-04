import { useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiTag } from "react-icons/fi";
import Button from "../ui/Button";

interface NameFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  isLoading: boolean;
  title?: string;
  placeholder?: string;
  initialValue?: string;
}

export default function NameFilterModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title = "Name your filter collection",
  placeholder = "e.g., My Research View",
  initialValue = "",
}: NameFilterModalProps) {
  const [name, setName] = useState(initialValue);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="relative group">
            <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-gray-900 transition-all outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) onConfirm(name.trim());
              }}
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl font-bold uppercase tracking-wider text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onConfirm(name.trim())}
              isLoading={isLoading}
              disabled={!name.trim()}
              className="flex-1 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-500/20"
            >
              Save Collection
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
