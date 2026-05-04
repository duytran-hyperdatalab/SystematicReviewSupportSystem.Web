import React, { useState, useEffect } from "react";
import gsap from "gsap";
import { FileText, Layout, Settings, Search, AlertCircle, CheckCircle2 } from "lucide-react";
import ConflictResolutionModal from "../../../components/reviewProcess/leader/ConflictResolutionModal";
import { useParams } from "react-router-dom";
import { useConflictsByPhase } from "../../../hooks/useStudySelection";
import { PaperPhase, PaperSelectionStatus, type ConflictPaperItem } from "../../../types/studySelection";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Pagination from "../../../components/ui/Pagination";
import { useDebounce } from "../../../hooks/useDebounce";



// Detailed mock data for the modal
// ... removed mock data ...

const ResolveConflictPage: React.FC = () => {
    const { screeningProcessId } = useParams<{ screeningProcessId: string }>();
    const [activeTab, setActiveTab] = useState<"title-abstract" | "full-text">("title-abstract");
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [statusFilter, setStatusFilter] = useState<"All" | "Conflict" | "Resolved">("All");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);

    // Fetch data using hook
    const phaseValue = activeTab === "title-abstract" ? PaperPhase.TitleAbstract : PaperPhase.FullText;
    const statusValue = statusFilter === "All" ? null : (statusFilter === "Conflict" ? PaperSelectionStatus.Conflict : PaperSelectionStatus.Resolved);

    const { data: conflictsData, isLoading } = useConflictsByPhase(screeningProcessId, {
        phase: phaseValue,
        status: statusValue,
        search: debouncedSearch,
        pageNumber,
        pageSize
    });

    useEffect(() => {
        gsap.from(".page-content", {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: "power3.out",
        });
    }, []);

    // Reset page number when filters change
    useEffect(() => {
        setPageNumber(1);
    }, [activeTab, debouncedSearch, statusFilter]);

    const handleOpenDetailModal = (paper: ConflictPaperItem) => {
        setSelectedPaperId(paper.paperId);
        setIsModalOpen(true);
    };

    const papers = conflictsData?.items || [];
    const totalCount = conflictsData?.totalCount || 0;

    return (
        <div className="flex flex-col h-full overflow-hidden page-content p-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1 min-h-[500px]">
                {/* Tab Navigation */}
                <div className="bg-white border-b border-gray-50">
                    <div className="flex px-4 sm:px-6">
                        <button
                            onClick={() => setActiveTab("title-abstract")}
                            className={`px-8 py-5 text-sm font-bold border-b-2 transition-all ${activeTab === "title-abstract"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <FileText className={`w-4 h-4 ${activeTab === "title-abstract" ? "text-blue-600" : "text-gray-400"}`} />
                                TITLE/ABSTRACT SCREENING
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("full-text")}
                            className={`px-8 py-5 text-sm font-bold border-b-2 transition-all ${activeTab === "full-text"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Layout className={`w-4 h-4 ${activeTab === "full-text" ? "text-blue-600" : "text-gray-400"}`} />
                                FULL-TEXT SCREENING
                            </div>
                        </button>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="p-6 border-b border-gray-50 bg-white flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title, authors or DOI..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar">
                        {(["All", "Conflict", "Resolved"] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${statusFilter === status
                                    ? "bg-white text-blue-600 shadow-sm border border-gray-100"
                                    : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Area */}
                <div className="flex-1 overflow-auto no-scrollbar relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-20 flex items-center justify-center">
                            <LoadingSpinner />
                        </div>
                    )}
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-gray-50/50 backdrop-blur-md">
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] w-[35%]">Title</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] w-[15%]">Authors</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] w-[10%]">Year</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] w-[15%]">Source</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] w-[15%]">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-center w-[10%]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {papers.map((paper) => (
                                <tr key={paper.paperId} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-6">
                                        <p className="text-sm font-bold text-gray-900 leading-relaxed group-hover:text-blue-900 transition-colors">
                                            {paper.title}
                                        </p>
                                        <p className="text-xs text-blue-600 font-medium mt-1">DOI: {paper.doi || "N/A"}</p>
                                    </td>
                                    <td className="px-6 py-6">
                                        <p className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors break-words">
                                            {paper.authors || "Unknown Authors"}
                                        </p>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="text-xs font-black text-gray-400 group-hover:text-gray-900 transition-colors">
                                            {paper.year || "N/A"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 font-medium">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                                            {paper.source || "N/A"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-sm">
                                        {paper.status === PaperSelectionStatus.Conflict ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-black uppercase tracking-widest">
                                                <AlertCircle className="w-3 h-3" />
                                                Conflict
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Resolved
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <button
                                            onClick={() => handleOpenDetailModal(paper)}
                                            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm group-hover:shadow hover:scale-105 active:scale-95 border border-transparent hover:border-blue-100"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!isLoading && papers.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="p-6 bg-gray-50 rounded-full mb-4">
                                {statusFilter === "Resolved" ? (
                                    <AlertCircle className="w-10 h-10 text-gray-300" />
                                ) : (
                                    <CheckCircle2 className="w-10 h-10 text-gray-300" />
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {statusFilter === "All" ? "No papers found" : `No ${statusFilter.toLowerCase()} papers`}
                            </h3>
                            <p className="text-gray-500 max-w-xs text-center mt-2">
                                Try adjusting your filters or search query to find what you're looking for.
                            </p>
                            {statusFilter !== "All" && (
                                <button
                                    onClick={() => setStatusFilter("All")}
                                    className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
                                >
                                    Reset status filter
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-400 font-medium font-mono uppercase tracking-wider">
                        Showing {papers.length} of {totalCount} papers
                    </p>
                    <Pagination
                        currentPage={pageNumber}
                        totalPages={conflictsData?.totalPages || 1}
                        onPageChange={setPageNumber}
                    />
                </div>
            </div>

            <ConflictResolutionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                paperId={selectedPaperId}
                processId={screeningProcessId}
                phase={phaseValue}
            />
        </div>
    );
};

export default ResolveConflictPage;


