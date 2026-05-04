import React, { useState } from "react";
import {
    FiPlus,
    FiSearch,
    FiTrash2,
    FiInfo,
    FiX
} from "react-icons/fi";
import { cn } from "../../../utils/cn";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../ui/Table";
import ActionButton from "../slr-projects/ActionButton";
import { useExclusionReasonLibrary, useExclusionReasonLibraryMutations } from "../../../hooks/useExclusionReasonLibrary";
import { useDebounce } from "../../../hooks/useDebounce";
import Pagination from "../../ui/Pagination";
import LoadingSpinner from "../../ui/LoadingSpinner";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import FormField from "../../ui/FormField";
import Button from "../../ui/Button";
import Switch from "../../ui/Switch";
import { toastSuccess, toastError, toastLoading, dismissToast } from "../../../utils/toast";
import type { CreateExclusionReasonRequest } from "../../../types/exclusionReasonLibrary";

const ProjectExclusionCodeTab: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [onlyActive, setOnlyActive] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const debouncedSearch = useDebounce(searchTerm, 500);

    // Map filter selection to API parameter - we send undefined for "all" and true for "active only"

    const {
        items,
        totalCount,
        totalPages,
        isLoading
    } = useExclusionReasonLibrary({
        search: debouncedSearch,
        onlyActive: onlyActive,
        pageNumber: pageNumber,
        pageSize: pageSize
    });

    const {
        bulkCreate,
        isBulkCreating,
        deleteReason,
        isDeleting,
        toggleActive,
        isToggling
    } = useExclusionReasonLibraryMutations();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPageNumber(1); // Reset to first page on search
    };

    const handleToggleOnlyActive = () => {
        setOnlyActive(!onlyActive);
        setPageNumber(1); // Reset to first page on filter change
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        const loadingId = toastLoading(currentStatus ? "Disabling..." : "Enabling...");
        try {
            await toggleActive(id);
            dismissToast(loadingId);
            toastSuccess("Success", `Exclusion reason has been ${currentStatus ? 'disabled' : 'enabled'}.`);
        } catch (error) {
            dismissToast(loadingId);
            toastError("Error", "Failed to update status.");
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeletingId(id);
        setIsConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingId) return;

        try {
            await deleteReason(deletingId);
            toastSuccess("Success", "Exclusion code has been permanently deleted.");
            setIsConfirmOpen(false);
            setDeletingId(null);
        } catch (error) {
            toastError("Error", "Failed to delete the exclusion code.");
        }
    };

    const [newCodes, setNewCodes] = useState<{ code: string; name: string }[]>([{ code: "", name: "" }]);

    const handleAddRow = () => {
        setNewCodes([...newCodes, { code: "", name: "" }]);
    };

    const handleRemoveRow = (index: number) => {
        if (newCodes.length > 1) {
            setNewCodes(newCodes.filter((_, i) => i !== index));
        }
    };

    const handleUpdateRow = (index: number, field: "code" | "name", value: string) => {
        const updated = [...newCodes];
        updated[index] = { ...updated[index], [field]: value };
        setNewCodes(updated);
    };

    const handleBulkCreate = async () => {
        // Validate
        const invalid = newCodes.some(c => !c.name.trim() || !c.code.trim() || parseInt(c.code, 10) < 0);
        if (invalid) {
            toastError("Validation Error", "Please provide a valid non-negative code and name for all items.");
            return;
        }

        // Convert string codes to numbers
        const payload: CreateExclusionReasonRequest[] = newCodes.map(c => ({
            code: parseInt(c.code, 10),
            name: c.name
        }));

        try {
            await bulkCreate(payload);
            toastSuccess("Success", `Successfully added ${newCodes.length} exclusion codes.`);
            setIsModalOpen(false);
            setNewCodes([{ code: "", name: "" }]);
        } catch (error) {
            toastError("Error", "Failed to add exclusion codes to the library.");
        }
    };

    return (
        <div className="space-y-6">
            {/* 🛠️ Action Bar 🛠️ */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by code or name..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>

                    <button
                        onClick={handleToggleOnlyActive}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border",
                            onlyActive
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm"
                                : "bg-white text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        <div className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            onlyActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300"
                        )} />
                        {onlyActive ? "Active Only" : "Show Only Active"}
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        <FiPlus size={18} />
                        New Code
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden min-h-[400px] flex flex-col">
                <div className="flex-1">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[120px]">Code</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center w-[150px]">Status</TableHead>
                                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-20">
                                        <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                                            <LoadingSpinner size="lg" />
                                            <span className="text-sm font-black uppercase tracking-widest">Loading Library...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : items.length > 0 ? (
                                items.map((item) => (
                                    <TableRow key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="px-8 py-6">
                                            <span className="inline-flex px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg border border-indigo-100 uppercase tracking-tighter">
                                                {item.code}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-6">
                                            <div className="text-sm font-extrabold text-slate-900">{item.name}</div>
                                        </TableCell>
                                        <TableCell className="px-6 py-6 text-center">
                                            <div className="flex justify-center">
                                                <Switch
                                                    checked={item.isActive}
                                                    onChange={() => handleToggleActive(item.id, item.isActive)}
                                                    disabled={isToggling}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <ActionButton
                                                    icon={FiTrash2}
                                                    label="Delete"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteClick(item.id)}
                                                    disabled={isDeleting && deletingId === item.id}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-20 text-center">
                                        <div className="space-y-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto">
                                                <FiInfo size={32} />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-black text-slate-900">No results found</h4>
                                                <p className="text-slate-500 text-sm max-w-xs mx-auto">We couldn't find any exclusion codes matching your criteria.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* 🔢 Pagination 🔢 */}
                {!isLoading && totalPages > 1 && (
                    <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Showing {items.length} of {totalCount} reasons
                        </div>
                        <Pagination
                            currentPage={pageNumber}
                            totalPages={totalPages}
                            onPageChange={setPageNumber}
                        />
                    </div>
                )}
            </div>

            {/* 💡 Modal 💡 */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Exclusion Codes"
                description="Populate the system library with standard exclusion reasons."
                size="md"
            >
                <div className="space-y-6">
                    <div className="space-y-3">
                        {newCodes.map((code, index) => (
                            <div key={index} className="flex items-end gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 animate-in slide-in-from-top-2 duration-200">
                                <div className="w-24 shrink-0">
                                    <FormField
                                        id={`code-${index}`}
                                        label="Code"
                                        type="number"
                                        min={0}
                                        value={code.code}
                                        onChange={(e) => handleUpdateRow(index, "code", e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <FormField
                                        id={`name-${index}`}
                                        label="Name"
                                        placeholder="e.g. Not a relevant population"
                                        value={code.name}
                                        onChange={(e) => handleUpdateRow(index, "name", e.target.value)}
                                    />
                                </div>
                                {newCodes.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveRow(index)}
                                        className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <FiX size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <button
                            onClick={handleAddRow}
                            className="flex items-center gap-2 text-indigo-600 text-sm font-black hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
                        >
                            <FiPlus size={18} />
                            Add Another Row
                        </button>

                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isBulkCreating}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleBulkCreate}
                                isLoading={isBulkCreating}
                                className="px-8"
                            >
                                Save to Library
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* ⚠️ Selection Deletion Confirmation ⚠️ */}
            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Exclusion Code"
                message="Are you sure you want to delete this code? This action is permanent and cannot be undone."
                confirmText="Permanently Delete"
                cancelText="Keep Code"
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default ProjectExclusionCodeTab;
