import React, { useState, useMemo } from "react";
import { FiPlus, FiSearch, FiX, FiCheck, FiAlertCircle, FiBookOpen, FiEdit3 } from "react-icons/fi";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";
import FormField from "../../../ui/FormField";
import { cn } from "../../../../utils/cn";
import { useExclusionReasonLibrary } from "../../../../hooks/useExclusionReasonLibrary";
import { useDebounce } from "../../../../hooks/useDebounce";
import LoadingSpinner from "../../../ui/LoadingSpinner";
import { FiInfo } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { useAddExclusionReasons } from "../../../../hooks/useStudySelection";
import { toastSuccess, toastError } from "../../../../utils/toast";




interface CustomReason {
    id: string; // for UI tracking
    code: string;
    name: string;
}

interface AddExclusionReasonsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd?: (data: { libraryReasonIds: string[], customReasons: { code: number, name: string }[] }) => void;
}

const AddExclusionReasonsModal: React.FC<AddExclusionReasonsModalProps> = ({ isOpen, onClose, onAdd }) => {
    // --- Library Section State ---
    const [libSearch, setLibSearch] = useState("");
    const debouncedSearch = useDebounce(libSearch, 500);
    const [selectedLibIds, setSelectedLibIds] = useState<Set<string>>(new Set());

    // --- Custom Section State ---
    const [customReasons, setCustomReasons] = useState<CustomReason[]>([
        { id: Math.random().toString(), code: "", name: "" }
    ]);

    const {
        items: libraryItems,
        isLoading: isLibraryLoading,
    } = useExclusionReasonLibrary({
        search: debouncedSearch,
        onlyActive: true,
        pageNumber: 1,
        pageSize: 100, // Show enough items
    });

    const { screeningProcessId } = useParams<{ screeningProcessId: string }>();
    const { mutateAsync: addReasons, isPending: isAdding } = useAddExclusionReasons();




    const toggleLibrarySelection = (id: string) => {
        const next = new Set(selectedLibIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedLibIds(next);
    };

    const addCustomRow = () => {
        setCustomReasons([...customReasons, { id: Math.random().toString(), code: "", name: "" }]);
    };

    const removeCustomRow = (id: string) => {
        if (customReasons.length > 1) {
            setCustomReasons(customReasons.filter(r => r.id !== id));
        }
    };

    const updateCustomRow = (id: string, field: "code" | "name", value: string) => {
        setCustomReasons(customReasons.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const resetForm = () => {
        setSelectedLibIds(new Set());
        setLibSearch("");
        setCustomReasons([{ id: Math.random().toString(), code: "", name: "" }]);
    };

    // --- Helpers ---
    const hasDuplicates = useMemo(() => {
        const codes = new Set<string>();
        const names = new Set<string>();
        let duplicateFound = false;

        // Check selected library reasons
        libraryItems.filter(r => selectedLibIds.has(r.id)).forEach(r => {
            codes.add(r.code.toString());
            names.add(r.name.toLowerCase());
        });

        // Check custom reasons
        const errors: Record<string, { code?: boolean, name?: boolean }> = {};

        customReasons.forEach(r => {
            if (r.code && codes.has(r.code)) {
                errors[r.id] = { ...errors[r.id], code: true };
                duplicateFound = true;
            }
            if (r.name && names.has(r.name.toLowerCase())) {
                errors[r.id] = { ...errors[r.id], name: true };
                duplicateFound = true;
            }
            if (r.code) codes.add(r.code);
            if (r.name) names.add(r.name.toLowerCase());
        });

        return { duplicateFound, errors };
    }, [selectedLibIds, customReasons, libraryItems]);

    const isValid = useMemo(() => {
        const hasSelection = selectedLibIds.size > 0 || customReasons.some(r => r.code && r.name);
        const allCustomValid = customReasons.every(r => (!r.code && !r.name) || (r.code && r.name && !hasDuplicates.errors[r.id]));
        return hasSelection && allCustomValid && !hasDuplicates.duplicateFound;
    }, [selectedLibIds, customReasons, hasDuplicates]);

    const handleAdd = async () => {
        if (!isValid || !screeningProcessId) return;

        try {
            const data = {
                libraryReasonIds: Array.from(selectedLibIds),
                customReasons: customReasons
                    .filter(r => r.code && r.name)
                    .map(r => ({ code: parseInt(r.code), name: r.name }))
            };

            await addReasons({
                processId: screeningProcessId,
                request: data
            });

            toastSuccess("Exclusion Reasons Added", "Successfully added new exclusion reasons to the process.");
            
            resetForm();
            if (onAdd) {
                onAdd(data);
            }
            onClose();
        } catch (error: any) {
            const apiMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
            toastError("Failed to Add Reasons", apiMessage);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Exclusion Reasons"
            size="xl"
            description="Reuse standard library reasons or define your own custom ones."
        >
            <div className="space-y-8 py-2">
                {/* Section 1: From Library */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <FiBookOpen size={20} className="stroke-[2.5]" />
                        <h3 className="text-sm font-black uppercase tracking-wider">From Global Library</h3>
                    </div>

                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search standard reasons (e.g. 'duplicate', 'animal')..."
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                value={libSearch}
                                onChange={(e) => setLibSearch(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                            {isLibraryLoading ? (
                                <div className="col-span-2 py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
                                    <LoadingSpinner size="lg" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Loading Library...</span>
                                </div>
                            ) : libraryItems.length > 0 ? (
                                libraryItems.map((reason) => {
                                    const isSelected = selectedLibIds.has(reason.id);
                                    return (
                                        <button
                                            key={reason.id}
                                            onClick={() => toggleLibrarySelection(reason.id)}
                                            className={cn(
                                                "flex items-center gap-3 p-4 rounded-2xl text-left border transition-all duration-300 group",
                                                isSelected
                                                    ? "bg-indigo-50 border-indigo-200 shadow-sm"
                                                    : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                                                isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-transparent group-hover:bg-slate-200"
                                            )}>
                                                <FiCheck size={14} className="stroke-[3]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">Code: {reason.code}</span>
                                                </div>
                                                <div className={cn(
                                                    "text-sm font-bold truncate transition-colors",
                                                    isSelected ? "text-indigo-900" : "text-slate-700"
                                                )}>
                                                    {reason.name}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="col-span-2 py-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 mx-auto">
                                        <FiInfo size={24} />
                                    </div>
                                    No matching library reasons found
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-100" />
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">OR</div>
                    <div className="h-px flex-1 bg-slate-100" />
                </div>

                {/* Section 2: Custom Reasons */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <FiEdit3 size={20} className="stroke-[2.5]" />
                            <h3 className="text-sm font-black uppercase tracking-wider">Custom Reasons</h3>
                        </div>
                        <button
                            onClick={addCustomRow}
                            className="flex items-center gap-2 text-[11px] font-black text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all uppercase tracking-wider"
                        >
                            <FiPlus size={16} />
                            Add Another row
                        </button>
                    </div>

                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                        <div className="space-y-3">
                            {customReasons.map((reason, index) => (
                                <div key={reason.id} className="flex items-start gap-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="w-24 shrink-0">
                                        <FormField
                                            id={`code-${reason.id}`}
                                            label={index === 0 ? "Code" : ""}
                                            type="number"
                                            placeholder="Code"
                                            value={reason.code}
                                            onChange={(e) => updateCustomRow(reason.id, "code", e.target.value)}
                                            className={cn(hasDuplicates.errors[reason.id]?.code && "ring-2 ring-rose-500/20 border-rose-300")}
                                        />
                                        {hasDuplicates.errors[reason.id]?.code && (
                                            <span className="text-[9px] font-bold text-rose-500 mt-1 flex items-center gap-1 uppercase tracking-tighter">
                                                <FiAlertCircle size={10} /> Duplicate
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <FormField
                                            id={`name-${reason.id}`}
                                            label={index === 0 ? "Reason Name" : ""}
                                            placeholder="e.g. Not relevant to research topic"
                                            value={reason.name}
                                            onChange={(e) => updateCustomRow(reason.id, "name", e.target.value)}
                                            className={cn(hasDuplicates.errors[reason.id]?.name && "ring-2 ring-rose-500/20 border-rose-300")}
                                        />
                                        {hasDuplicates.errors[reason.id]?.name && (
                                            <span className="text-[9px] font-bold text-rose-500 mt-1 flex items-center gap-1 uppercase tracking-tighter">
                                                <FiAlertCircle size={10} /> Duplicate name
                                            </span>
                                        )}
                                    </div>
                                    <div className={cn("pt-1", index === 0 ? "mt-7" : "mt-0")}>
                                        <button
                                            onClick={() => removeCustomRow(reason.id)}
                                            disabled={customReasons.length === 1}
                                            className={cn(
                                                "p-3 rounded-xl transition-all",
                                                customReasons.length === 1
                                                    ? "text-slate-200 cursor-not-allowed"
                                                    : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                            )}
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer / Summary UI */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div className="flex flex-col">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Selection</div>
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-lg border border-indigo-100 uppercase tracking-tight">
                                {selectedLibIds.size} Library
                            </div>
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-100 uppercase tracking-tight">
                                {customReasons.filter(r => r.code && r.name).length} Custom
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={onClose} className="px-8 h-12">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdd}
                            disabled={!isValid || isAdding}
                            className="px-10 h-12 bg-indigo-600 shadow-xl shadow-indigo-200 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                        >
                            {isAdding ? (
                                <>
                                    <LoadingSpinner size="sm" />
                                    <span>Adding...</span>
                                </>
                            ) : (
                                "Add Reasons"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AddExclusionReasonsModal;
