import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiChevronDown, FiChevronUp, FiAlertTriangle } from "react-icons/fi";
import { cn } from "../../../../utils/cn";
import Select from "../../../../components/ui/Select";


interface ExcludeMenuProps {
  paperId: string;
  onExclude: (
    paperId: string,
    exclusionReasonId: string | null,
    reason: string | null,
  ) => void;
  isSubmitting: boolean;
  exclusionReasons: { id: string; name: string }[];
  hasMoreReasons: boolean;
  onShowMoreReasons: () => void;
  onResetReasons: () => void;
}

export default function ExcludeMenu({
  paperId,
  onExclude,
  isSubmitting,
  exclusionReasons,
  hasMoreReasons,
  onShowMoreReasons,
  onResetReasons,
}: ExcludeMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReasonId, setSelectedReasonId] = useState<string | null>(null);
  const [exclusionJustification, setExclusionJustification] = useState("");
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current || !isOpen) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;
    
    // Determine if we should open top or bottom
    // Default to top because DecisionBar is typically at the bottom
    const preferredPosition = spaceAbove > 450 || spaceAbove > spaceBelow ? "top" : "bottom";
    setPosition(preferredPosition);

    // Calculate specific coordinates for Portal
    const padding = 12;
    const menuWidth = Math.min(viewportWidth - padding * 2, 340); // Responsive width
    
    let left = rect.left + rect.width / 2 - menuWidth / 2;
    
    // Prevent horizontal overflow
    if (left < padding) left = padding;
    if (left + menuWidth > viewportWidth - padding) left = viewportWidth - padding - menuWidth;

    const style: React.CSSProperties = {
      position: "fixed",
      left: `${left}px`,
      width: `${menuWidth}px`,
      zIndex: 100,
    };

    if (preferredPosition === "top") {
      style.bottom = `${viewportHeight - rect.top + 8}px`;
    } else {
      style.top = `${rect.bottom + 8}px`;
    }

    setMenuStyle(style);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
    }
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition, exclusionReasons.length]);

  // Close on Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedReasonId(null);
      setExclusionJustification("");
      onResetReasons();
    }
  }, [isOpen, onResetReasons]);

  const handleConfirm = () => {
    if (selectedReasonId && exclusionJustification.trim()) {
      onExclude(paperId, selectedReasonId, exclusionJustification);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative flex-1">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSubmitting}
        className={cn(
          "w-full inline-flex items-center justify-center gap-2 px-4 py-3 font-semibold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
          isOpen 
            ? "bg-red-700 text-white ring-2 ring-red-100" 
            : "bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
        )}
      >
        <FiX className={cn("w-4 h-4 transition-transform", isOpen && "rotate-90")} />
        {isOpen ? "Close" : "Exclude"}
        <kbd className="ml-1 px-1 py-0.5 bg-red-500/50 rounded text-[9px] font-mono">2</kbd>
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: position === "top" ? 10 : -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: position === "top" ? 10 : -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={menuStyle}
              className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 flex flex-col pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-900">Exclude Paper</p>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[350px] pr-1 custom-scrollbar">
                {/* Reason Code Select */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-0.5">
                    Exclusion Reason <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {exclusionReasons.length > 0 ? (
                      <Select
                        id="exclusion-reason-select"
                        value={selectedReasonId ?? ""}
                        onChange={(e) => setSelectedReasonId(e.target.value)}
                        options={exclusionReasons.map((r) => ({
                          value: r.id,
                          label: r.name,
                        }))}
                        placeholder="Select a reason..."
                        className="!py-2.5 !text-xs !rounded-xl !bg-gray-50 focus:!bg-white focus:!border-red-300 focus:!ring-4 focus:!ring-red-50/50 transition-all"
                        autoFocus
                      />
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-700 italic flex items-center gap-2">
                        <FiAlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Wait for leader import exclusion reason code
                      </div>
                    )}

                    {/* Show More / Hide Reasons Button */}
                    {(hasMoreReasons || exclusionReasons.length > 5) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasMoreReasons) {
                            onShowMoreReasons();
                          } else {
                            onResetReasons();
                          }
                        }}
                        className="text-[10px] font-bold uppercase text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1.5 px-1 py-0.5"
                      >
                        {hasMoreReasons ? (
                          <><span>Show more reasons</span> <FiChevronDown className="w-3 h-3" /></>
                        ) : (
                          <><span>Reset list</span> <FiChevronUp className="w-3 h-3" /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Justification Textarea */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-0.5">
                    Justification <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={exclusionJustification}
                    onChange={(e) => setExclusionJustification(e.target.value)}
                    placeholder="Briefly explain the exclusion..."
                    rows={3}
                    className="w-full px-4 py-3 text-xs border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:border-red-300 focus:ring-4 focus:ring-red-50/50 outline-none transition-all resize-none shadow-inner"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-5 pt-4 border-t border-gray-50">
                <button
                  onClick={handleConfirm}
                  disabled={
                    !selectedReasonId || !exclusionJustification.trim() || isSubmitting
                  }
                  className="flex-1 px-4 py-2.5 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 active:bg-red-800 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Confirm Exclusion"}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
