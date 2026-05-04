import type { WorkspaceQAPaper } from "../QualityAssessmentWorkspace";
import { Search, Filter, MoreHorizontal, User, FileText, CheckCircle2, Clock } from "lucide-react";
import Card from "../../../../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/Table";
import Button from "../../../../components/ui/Button";
import Pagination from "../../../../components/ui/Pagination";

interface AssignMembersTabContentProps {
  papers: WorkspaceQAPaper[];
  isLeader?: boolean;
  onPaperClick: (paperId: string) => void;
  onAssignClick: (e: React.MouseEvent, paperId: string) => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

function getPaperStatus(paper: WorkspaceQAPaper, isLeader: boolean = false) {
  if (paper.resolution && typeof paper.resolution.finalDecision === "number") {
    return paper.resolution.finalDecision === 1 ? "high-quality" : "low-quality";
  }
  if (paper.completionPercentage === 100 && !isLeader) return "completed";
  if (paper.completionPercentage > 0) return "in-progress";
  return "pending";
}

function getPaperReviewers(paper: WorkspaceQAPaper) {
  if ("reviewers" in paper && Array.isArray(paper.reviewers)) {
    return paper.reviewers;
  }
  return [];
}

export function AssignMembersTabContent({ 
  papers, 
  isLeader, 
  onPaperClick, 
  onAssignClick,
  onSearchChange,
  searchQuery = "",
  currentPage,
  totalPages,
  totalItems,
  onPageChange
}: AssignMembersTabContentProps) {
  const pageSize = 10;

  return (
    <Card className="rounded-2xl border border-slate-200 outline-none shadow-sm overflow-hidden bg-white">
      <div className="p-6 border-b border-slate-200 bg-white rounded-t-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {isLeader ? "Assign Papers to Team Members" : "My Assessment Papers"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isLeader 
              ? "Distribute quality assessment tasks among the review team."
              : "Review and evaluate your assigned papers."}
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              placeholder="Search papers by title..."
              className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-72 transition-all bg-slate-50 focus:bg-white"
            />
          </div>
          <Button variant="outline" className="rounded-xl flex gap-2">
            <Filter size={16} />
            Filter
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 text-center">
                <input type="checkbox" className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-600 transition-colors" />
              </TableHead>
              <TableHead className="font-semibold text-slate-600">Paper Details</TableHead>
              {isLeader && (
                <TableHead className="font-semibold text-slate-600 w-48">Assigned Reviewers</TableHead>
              )}
              <TableHead className="font-semibold text-slate-600 w-40">Status</TableHead>
              <TableHead className="w-16"><span></span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {papers.map((paper) => (
              <TableRow 
                key={paper.paperId} 
                className="group cursor-pointer hover:bg-blue-50/30 transition-colors"
                onClick={() => onPaperClick(paper.paperId)}
              >
                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-600 transition-colors" />
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                        {paper.title}
                      </span>
                      <span className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {paper.authors || "Unknown authors"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                {isLeader && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        {getPaperReviewers(paper).length === 0 ? (
                          <span 
                            onClick={(e) => onAssignClick(e, paper.paperId)}
                            className="text-xs text-slate-400 italic cursor-pointer hover:text-blue-600 transition-colors"
                          >
                            Unassigned
                          </span>
                        ) : (
                          getPaperReviewers(paper).map((member, idx) => (
                            <div 
                              key={idx} 
                              className="relative group/member shrink-0 cursor-pointer"
                              onClick={(e) => onAssignClick(e, paper.paperId)}
                            >
                              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 ring-2 ring-white hover:bg-blue-200 transition-colors">
                                <span className="text-xs font-bold text-blue-700">
                                  {(member.fullname || member.username).substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/member:block z-10 w-max bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg">
                                {member.fullname || member.username}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {getPaperReviewers(paper).length < 2 && (
                        <button 
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-slate-300 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 ring-2 ring-white shrink-0 transition-all relative group/btn"
                          onClick={(e) => onAssignClick(e, paper.paperId)}
                        >
                          <User size={14} />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:block z-10 w-max bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg">
                            Assign Reviewer
                          </div>
                        </button>
                      )}
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  {(() => {
                    const status = getPaperStatus(paper, isLeader);
                    
                    const statusStyles: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
                      "high-quality": { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: <CheckCircle2 size={12} className="text-emerald-500" />, label: 'High Quality' },
                      "low-quality": { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', icon: <CheckCircle2 size={12} className="text-rose-500" />, label: 'Low Quality' },
                      "completed": { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: <CheckCircle2 size={12} className="text-emerald-500" />, label: 'Completed' },
                      "in-progress": { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: <Clock size={12} className="text-blue-500" />, label: 'In Progress' },
                      "pending": { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', icon: <Clock size={12} className="text-slate-400" />, label: 'Pending' }
                    };
                    
                    const style = statusStyles[status] || statusStyles['pending'];
                    
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text}`}>
                        {style.icon}
                        {style.label}
                      </span>
                    );
                  })()}
                </TableCell>
                <TableCell className="text-right">
                  <button className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {papers.length === 0 && (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center">
            <FileText size={48} className="text-slate-300 mb-4" />
            <p className="text-sm font-medium text-slate-900">No papers found</p>
            <p className="text-xs mt-1">Try adjusting your search filters</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </Card>
  );
}