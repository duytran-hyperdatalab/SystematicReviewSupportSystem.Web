import React, { useState, useMemo } from "react";
import { 
  FiPlus, 
  FiSearch, 
  FiDatabase, 
  FiEdit2, 
  FiTrash2, 
  FiToggleLeft, 
  FiToggleRight,
  FiExternalLink,
  FiFilter,
  FiAlertCircle
} from "react-icons/fi";
import { useMasterSources, useMasterSourceActions } from "../../hooks/useMasterSources";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useForm } from "react-hook-form";
import type { CreateMasterSearchSourceRequest, MasterSearchSource } from "../../types/masterSource";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import SectionLoading from "../../components/ui/SectionLoading";
import { motion, AnimatePresence } from "framer-motion";

const MasterSourcePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<MasterSearchSource | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: sources, isLoading } = useMasterSources({
    sourceName: searchQuery || undefined,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active"
  });

  const { createSource, updateSource, toggleStatus, deleteSource, isCreating, isUpdating, isDeleting } = useMasterSourceActions();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateMasterSearchSourceRequest>();

  const handleOpenModal = (source?: MasterSearchSource) => {
    if (source) {
      setEditingSource(source);
      setValue("sourceName", source.sourceName);
      setValue("baseUrl", source.baseUrl);
      setValue("isActive", source.isActive);
      setValue("logoUrl", source.logoUrl || "");
    } else {
      setEditingSource(null);
      reset({
        sourceName: "",
        baseUrl: "",
        isActive: true,
        logoUrl: ""
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: CreateMasterSearchSourceRequest) => {
    try {
      if (editingSource) {
        await updateSource({ id: editingSource.id, data });
      } else {
        await createSource(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSource(deleteId);
      setDeleteId(null);
    }
  };

  const filteredSources = useMemo(() => {
    if (!sources) return [];
    return sources.filter(s => {
      const matchesSearch = s.sourceName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.baseUrl.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || 
                            (statusFilter === "active" && s.isActive) || 
                            (statusFilter === "inactive" && !s.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [sources, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Search Sources</h1>
          <p className="text-slate-500 mt-1">Manage global bibliographic databases for SLR projects.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
        >
          <FiPlus className="w-5 h-5" />
          <span>Create New Source</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-600 font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 min-w-[160px]">
            <FiFilter className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-slate-600 font-bold w-full cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="py-20">
            <SectionLoading type="admin" title="Loading sources..." />
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FiDatabase className="w-10 h-10 opacity-20" />
            </div>
            <p className="text-lg font-bold">No sources found</p>
            <p className="text-sm">Try adjusting your filters or create a new one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Source Name</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Base URL</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-center">Usage</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {filteredSources.map((source) => (
                    <motion.tr 
                      key={source.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                            {source.sourceName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-700">{source.sourceName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a 
                          href={source.baseUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors group underline decoration-slate-200 underline-offset-4"
                        >
                          <span className="truncate max-w-[250px]">{source.baseUrl}</span>
                          <FiExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                            source.isActive 
                              ? "bg-emerald-50 text-emerald-600" 
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            {source.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-black text-slate-700 leading-none">
                            {source.usageCount || 0}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">Projects</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleStatus(source.id)}
                            title={source.isActive ? "Deactivate" : "Activate"}
                            className={`p-2 rounded-xl transition-all ${
                              source.isActive 
                                ? "text-emerald-500 hover:bg-emerald-50" 
                                : "text-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            {source.isActive ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                          </button>
                          <button
                            onClick={() => handleOpenModal(source)}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Edit"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(source.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            title="Delete"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSource ? "Edit Search Source" : "Create New Search Source"}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-3">
            <FiAlertCircle className="text-indigo-600 w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm text-indigo-900 leading-relaxed font-medium">
              These sources will be available globally for all users to select during the search identification phase.
            </p>
          </div>

          <FormField
            id="sourceName"
            label="Source Name"
            errorMessage={errors.sourceName?.message}
            {...register("sourceName", { required: "Source name is required" })}
            placeholder="e.g., Scopus, Web of Science"
            className="rounded-2xl"
          />

          <FormField
            id="baseUrl"
            label="Base URL"
            errorMessage={errors.baseUrl?.message}
            {...register("baseUrl", { 
              required: "Base URL is required",
              pattern: {
                value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
                message: "Enter a valid URL"
              }
            })}
            placeholder="e.g., https://www.scopus.com"
            className="rounded-2xl"
          />

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-700">Initial Status</p>
              <p className="text-xs text-slate-500">Enable this source immediately</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                {...register("isActive")}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 rounded-2xl font-bold py-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating || isUpdating}
              className="flex-2 rounded-2xl font-bold py-3 bg-indigo-600 border-none! shadow-lg shadow-indigo-100"
            >
              {editingSource ? "Save Changes" : "Create Source"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Search Source"
        message="Are you sure you want to delete this search source? This action cannot be undone and may affect active projects."
        confirmText="Delete Source"
      />
    </div>
  );
};

export default MasterSourcePage;
