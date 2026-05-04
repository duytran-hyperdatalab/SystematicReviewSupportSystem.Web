import React, { useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiTrash2,
  FiInfo
} from "react-icons/fi";
import { useParams } from "react-router-dom";
import { cn } from "../../../../utils/cn";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../../ui/Table";
import ActionButton from "../../../admin/slr-projects/ActionButton";
import Pagination from "../../../ui/Pagination";
import AddExclusionReasonsModal from "./AddExclusionReasonsModal";
import ConfirmModal from "../../../ui/ConfirmModal";
import Switch from "../../../ui/Switch";
import Select from "../../../ui/Select";
import { useStudySelectionExclusionReasons, useToggleExclusionReasonActive, useDeleteExclusionReason } from "../../../../hooks/useStudySelection";
import { useDebounce } from "../../../../hooks/useDebounce";
import { toastSuccess, toastError } from "../../../../utils/toast";

const ProcessExclusionCodeTab: React.FC = () => {
  const { screeningProcessId: studySelectionProcessId } = useParams<{ screeningProcessId: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [onlyActive, setOnlyActive] = useState(false);
  const [source, setSource] = useState(0); // 0: All, 1: Library, 2: Custom
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const toggleActiveMutation = useToggleExclusionReasonActive();
  const deleteMutation = useDeleteExclusionReason();

  const { data: exclusionReasons = [], isLoading } = useStudySelectionExclusionReasons(
    studySelectionProcessId,
    {
      onlyActive,
      source,
      search: debouncedSearchTerm
    }
  );

  const handleToggleActive = (id: string) => {
    toggleActiveMutation.mutate(id, {
      onSuccess: (data) => {
        toastSuccess(
          "Status Updated",
          `Exclusion code "${data.name}" is now ${data.isActive ? "active" : "disabled"}.`
        );
      },
      onError: (error: any) => {
        toastError("Update Failed", error.message || "Failed to update exclusion code status.");
      }
    });
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingId || !studySelectionProcessId) return;

    deleteMutation.mutate(
      { id: deletingId, processId: studySelectionProcessId },
      {
        onSuccess: () => {
          toastSuccess("Code Deleted", "Exclusion reason has been removed successfully.");
          setIsConfirmOpen(false);
          setDeletingId(null);
        },
        onError: (error: any) => {
          toastError("Deletion Failed", error.message || "Failed to delete exclusion reason.");
        }
      }
    );
  };

  // The local data is already filtered by the server
  const filteredData = exclusionReasons;

  return (
    <div className="space-y-6 p-6">
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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-[180px]">
            <Select
              value={source.toString()}
              onChange={(e) => setSource(Number(e.target.value))}
              options={[
                { value: "0", label: "All Sources" },
                { value: "1", label: "Library Only" },
                { value: "2", label: "Custom Only" }
              ]}
              className="!bg-slate-50 !border-none !font-black uppercase !text-slate-600"
            />
          </div>

          <button
            onClick={() => setOnlyActive(!onlyActive)}
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
            {onlyActive ? "Active" : "All Status"}
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

      {/* 📊 Table 📊 */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden min-h-[400px] flex flex-col">
        <div className="flex-1">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[120px]">Code</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[150px]">Source</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center w-[150px]">Status</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                      <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading reasons...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="px-8 py-6">
                      <span className="inline-flex px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg border border-indigo-100 uppercase tracking-tighter">
                        {item.code}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="text-sm font-extrabold text-slate-900">{item.name}</div>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap",
                        item.source === 0 // 0: Library
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : "bg-purple-50 text-purple-600 border-purple-100"
                      )}>
                        {item.source === 0 ? "Library" : "Custom"}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={item.isActive}
                          onChange={() => handleToggleActive(item.id)}
                          disabled={toggleActiveMutation.isPending}
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
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
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

        {/* 🔢 Pagination (UI Only) 🔢 */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Showing {filteredData.length} of {exclusionReasons.length} reasons
          </div>
          <Pagination
            currentPage={pageNumber}
            totalPages={1}
            onPageChange={setPageNumber}
          />
        </div>
      </div>

      <AddExclusionReasonsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(data) => {
          console.log("Adding reasons:", data);
          setIsModalOpen(false);
        }}
      />

      {/* ⚠️ Selection Deletion Confirmation ⚠️ */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => !deleteMutation.isPending && setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title="Delete Exclusion Code"
        message="Are you sure you want to delete this code? This action is permanent and cannot be undone."
        confirmText="Permanently Delete"
        cancelText="Keep Code"
        variant="danger"
      />
    </div>
  );
};

export default ProcessExclusionCodeTab;
