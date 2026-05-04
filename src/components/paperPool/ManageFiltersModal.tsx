import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FiX,
  FiTrash2,
  FiEdit3,
  FiSearch,
  FiCopy,
  FiCalendar,
  FiDatabase,
  FiChevronRight,
  FiFilter,
  FiSettings,
} from "react-icons/fi";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import type { PaperPoolFilterMetadata, PaperPoolFilterSetting } from "./types";

interface ManageFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedFilters: PaperPoolFilterSetting[];
  onDelete: (id: string) => Promise<void>;
  onSaveAsNew: (draft: PaperPoolFilterSetting) => Promise<void>;
  detailFilter: PaperPoolFilterSetting | null;
  isLoadingDetail: boolean;
  onViewDetail: (id: string) => void;
  isCreating: boolean;
  isDeleting: boolean;
  metadata: PaperPoolFilterMetadata | null;
}

export default function ManageFiltersModal({
  isOpen,
  onClose,
  savedFilters,
  onDelete,
  onSaveAsNew,
  detailFilter,
  isLoadingDetail,
  onViewDetail,
  isCreating,
  isDeleting,
  metadata,
}: ManageFiltersModalProps) {
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PaperPoolFilterSetting | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<string | null>(null);

  useEffect(() => {
    if (detailFilter) {
      setDraft(detailFilter);
    }
  }, [detailFilter]);

  if (!isOpen) return null;

  const handleSelectFilter = (id: string) => {
    setActiveFilterId(id);
    onViewDetail(id);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
              Manage Filter Collections
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Edit, clone or remove your saved filter configurations
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Filter List */}
          <div className="w-80 border-r border-gray-100 bg-gray-50/30 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search collections..."
                  className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
              {savedFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleSelectFilter(filter.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    activeFilterId === filter.id
                      ? "bg-white border-2 border-blue-500 shadow-sm"
                      : "border-2 border-transparent hover:bg-gray-100/50"
                  }`}
                >
                  <div className="text-left overflow-hidden">
                    <div
                      className={`text-sm font-bold truncate ${activeFilterId === filter.id ? "text-blue-600" : "text-gray-900"}`}
                    >
                      {filter.name}
                    </div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                      {new Date(filter.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {activeFilterId === filter.id ? (
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  ) : (
                    <FiChevronRight className="w-4 h-4 text-gray-300" />
                  )}
                </button>
              ))}
              {savedFilters.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-300">
                    <FiFilter className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    No collections
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Content: Filter Details/Editor */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white">
            {!activeFilterId ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <FiSettings className="w-10 h-10 text-gray-300" />
                </div>
                <h4 className="text-lg font-black text-gray-400 uppercase tracking-widest">
                  Select a collection
                </h4>
                <p className="text-sm text-gray-400 max-w-xs mt-2">
                  Choose a saved filter from the list on the left to view and edit its details.
                </p>
              </div>
            ) : isLoadingDetail ? (
              <div className="h-full flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : draft ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-400">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tight">
                      {draft.name}
                    </h4>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                      Filter Identity & Rules
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isConfirmingDelete === draft.id ? (
                      <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
                        <span className="text-xs font-bold text-red-600 px-3">Confirm delete?</span>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 rounded-xl"
                          onClick={() => onDelete(draft.id)}
                          isLoading={isDeleting}
                        >
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-gray-200"
                          onClick={() => setIsConfirmingDelete(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-100 hover:bg-red-50 rounded-xl"
                        onClick={() => setIsConfirmingDelete(draft.id)}
                      >
                        <FiTrash2 className="w-4 h-4 mr-2" />
                        Delete Collection
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                      Collection Name
                    </label>
                    <div className="relative group">
                      <FiEdit3 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="text"
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-gray-900 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                      Search Keyword
                    </label>
                    <div className="relative group">
                      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="text"
                        value={draft.searchText || ""}
                        onChange={(e) => setDraft({ ...draft, searchText: e.target.value })}
                        placeholder="All papers"
                        className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-gray-900 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                    Detailed Filter Rules
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Years */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FiCalendar className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-600">Year Range</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={draft.filters.yearFrom ?? ""}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              filters: {
                                ...draft.filters,
                                yearFrom: e.target.value ? Number(e.target.value) : null,
                              },
                            })
                          }
                          placeholder="Start"
                          className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <span className="text-gray-400 font-bold">-</span>
                        <input
                          type="number"
                          value={draft.filters.yearTo ?? ""}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              filters: {
                                ...draft.filters,
                                yearTo: e.target.value ? Number(e.target.value) : null,
                              },
                            })
                          }
                          placeholder="End"
                          className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {/* Source */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FiDatabase className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-600">Source</span>
                      </div>
                      <select
                        value={draft.filters.searchSourceId}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            filters: { ...draft.filters, searchSourceId: e.target.value as any },
                          })
                        }
                        className="bg-transparent text-xs font-bold text-blue-600 focus:outline-none"
                      >
                        <option value="all">All Sources</option>
                        {metadata?.searchSources.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* DOI/FullText Toggles */}
                    <div className="col-span-2 grid grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          DOI Status
                        </div>
                        <select
                          value={draft.filters.doiState}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              filters: { ...draft.filters, doiState: e.target.value as any },
                            })
                          }
                          className="w-full bg-transparent text-xs font-bold text-gray-900 focus:outline-none"
                        >
                          <option value="all">Any Status</option>
                          <option value="has">Has DOI</option>
                          <option value="missing">Missing DOI</option>
                        </select>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          Full Text
                        </div>
                        <select
                          value={draft.filters.fullTextState}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              filters: { ...draft.filters, fullTextState: e.target.value as any },
                            })
                          }
                          className="w-full bg-transparent text-xs font-bold text-gray-900 focus:outline-none"
                        >
                          <option value="all">Any Status</option>
                          <option value="has">Has PDF</option>
                          <option value="missing">Missing PDF</option>
                        </select>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Unused Only
                        </div>
                        <input
                          type="checkbox"
                          checked={draft.filters.onlyUnused}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              filters: { ...draft.filters, onlyUnused: e.target.checked },
                            })
                          }
                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    className="rounded-2xl px-6 py-3 font-bold uppercase tracking-wider text-xs border-gray-200"
                    onClick={() => onSaveAsNew(draft)}
                    isLoading={isCreating}
                  >
                    <FiCopy className="w-4 h-4 mr-2" />
                    Save Changes As New Filter
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
