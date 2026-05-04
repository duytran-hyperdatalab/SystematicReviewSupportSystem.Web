import { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiFilter, FiSettings, FiCheck, FiPlus } from "react-icons/fi";
import type { PaperPoolFilterSetting } from "./types";

interface SavedFilterDropdownProps {
  savedFilters: PaperPoolFilterSetting[];
  selectedFilterId: string | null;
  onSelect: (filter: PaperPoolFilterSetting) => void;
  onManage: () => void;
  onSaveNew: () => void;
  isCreating?: boolean;
}

export default function SavedFilterDropdown({
  savedFilters,
  selectedFilterId,
  onSelect,
  onManage,
  onSaveNew,
  isCreating = false,
}: SavedFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedFilter = savedFilters.find((f) => f.id === selectedFilterId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all ${
          isOpen
            ? "border-blue-500 bg-blue-50 shadow-sm"
            : "border-gray-100 bg-white hover:border-gray-200"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedFilter ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"}`}
        >
          <FiFilter className="w-4 h-4" />
        </div>
        <div className="text-left">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
            Active View
          </div>
          <div className="text-sm font-bold text-gray-900 leading-none">
            {selectedFilter ? selectedFilter.name : "Unsaved View"}
          </div>
        </div>
        <FiChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-gray-50 bg-gray-50/50">
            <button
              onClick={() => {
                onSaveNew();
                setIsOpen(false);
              }}
              disabled={isCreating}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiPlus className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">
                Save Current View
              </span>
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
            <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Saved Filter Collections
            </div>
            {savedFilters.length === 0 ? (
              <div className="px-3 py-8 text-center text-xs text-gray-400 italic">
                No saved filters yet
              </div>
            ) : (
              savedFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    onSelect(filter);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${
                    selectedFilterId === filter.id
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-sm font-bold truncate">{filter.name}</span>
                    <span className="text-[10px] text-gray-400 truncate">
                      {filter.searchText || "No search term"}
                    </span>
                  </div>
                  {selectedFilterId === filter.id && <FiCheck className="w-4 h-4 shrink-0" />}
                </button>
              ))
            )}
          </div>

          <div className="p-2 border-t border-gray-50 bg-gray-50/50">
            <button
              onClick={() => {
                onManage();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                <FiSettings className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Manage Filters</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
