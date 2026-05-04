import { useState } from "react";
import Modal from "../../../../components/ui/Modal";
import { FiSearch, FiUserPlus, FiUsers } from "react-icons/fi";
import { cn } from "../../../../utils/cn";
import type { ProjectMember } from "../../../../types/project";

interface QAAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userIds: string[]) => void;
  members: ProjectMember[];
  assignedUserIds?: string[];
  isAssigning: boolean;
}

export function QAAssignModal({
  isOpen,
  onClose,
  onAssign,
  members,
  assignedUserIds = [],
  isAssigning,
}: QAAssignModalProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCloseModal = () => {
    setSelectedUserIds([]);
    setSearchTerm("");
    onClose();
  };

  const filteredMembers = members.filter(
    (m) =>
      (m.fullName || m.userName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      
      if (assignedUserIds.length + prev.length >= 2) {
        return prev;
      }
      
      return [...prev, userId];
    });
  };

  const handleAssign = () => {
    onAssign(selectedUserIds);
    setSelectedUserIds([]); // reset on successful trigger
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Assign Quality Reviewers"
      description="Select team members to evaluate quality of the paper."
      size="lg"
      closeOnOutsideClick={true}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-100/80 rounded-2xl w-full border border-slate-200/50 p-1">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 bg-white text-indigo-600 shadow-sm shadow-slate-200 border border-slate-100">
            <FiUsers size={14} />
            Members List
          </button>
          
          <div className="px-4 text-xs font-semibold text-slate-500">
            <span className={cn(assignedUserIds.length + selectedUserIds.length >= 2 ? "text-red-500" : "")}>
              {assignedUserIds.length + selectedUserIds.length} / 2
            </span> Reviewers
          </div>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Member Search */}
          <div className="relative group max-w-md">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search active team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 focus:bg-white transition-all placeholder:text-slate-300 placeholder:font-medium"
            />
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const isAlreadyAssigned = assignedUserIds.includes(member.userId);
                const isSelected = selectedUserIds.includes(member.userId);
                const isMaxReached = assignedUserIds.length + selectedUserIds.length >= 2;
                const isDisabled = isAlreadyAssigned || (isMaxReached && !isSelected);
                const displayName = member.fullName || member.userName;
                const initials = (displayName || "?").substring(0, 2).toUpperCase();

                return (
                  <div
                    key={member.userId}
                    onClick={() => {
                      if (!isDisabled) {
                        toggleUserSelection(member.userId);
                      }
                    }}
                    className={cn(
                      "group relative flex items-center gap-4 p-4 border rounded-3xl transition-all duration-300",
                      isDisabled ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200" : "cursor-pointer hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50",
                      isSelected && !isAlreadyAssigned
                        ? "bg-indigo-50/50 border-indigo-200 shadow-sm shadow-indigo-100/50"
                        : (!isDisabled ? "bg-white border-slate-100" : "")
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 transition-transform",
                        isSelected || isAlreadyAssigned
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                          : "bg-slate-100 text-slate-500 group-hover:scale-105"
                      )}
                    >
                      {initials}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-black text-slate-800 tracking-tight truncate">
                          {displayName}
                        </h4>
                        {isAlreadyAssigned && (
                          <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                            Assigned
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-medium truncate">
                        {member.email}
                      </div>
                    </div>

                    <div className="pl-4 border-l border-slate-100 ml-2">
                       <input
                        type="checkbox"
                        checked={isSelected || isAlreadyAssigned}
                        disabled={isDisabled}
                        readOnly
                        className="w-5 h-5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500/30 transition-all checked:border-indigo-600 cursor-pointer pointer-events-none"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
             <div className="py-20 flex flex-col items-center justify-center text-center opacity-30 grayscale">
                <FiUserPlus size={48} className="text-slate-300 mb-4" />
                <p className="text-sm font-black text-slate-900 uppercase">
                  {searchTerm ? "No Match Found" : "No Members Available"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
           <div className="flex items-center gap-3">
             {selectedUserIds.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100/50">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                        {selectedUserIds.length} Selected
                    </p>
                </div>
             )}
           </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCloseModal}
              className="px-8 py-3.5 text-[11px] font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={selectedUserIds.length === 0 || isAssigning}
              className={cn(
                "flex items-center gap-2 px-12 py-4 text-[11px] font-black rounded-2xl transition-all active:scale-95 uppercase tracking-widest shadow-lg min-w-[180px] justify-center",
                selectedUserIds.length > 0 && !isAssigning
                  ? "bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-indigo-100"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
              )}
            >
              {isAssigning ? "Assigning..." : "Assign Members"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
