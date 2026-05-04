import React from "react";
import Button from "../../ui/Button";
import Card from "../../ui/Card";
import type { ReviewNeed } from "../../../types/coreAndGovernance";

interface ReviewNeedsTabProps {
  reviewNeeds: ReviewNeed[];
  onAdd: () => void;
  isLeader?: boolean;
}

const ReviewNeedsTab: React.FC<ReviewNeedsTabProps> = ({ reviewNeeds, onAdd, isLeader = true }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Review Needs</h2>
        {isLeader && (
          <Button
            className="bg-blue-600 hover:bg-blue-700 shadow-none"
            onClick={onAdd}
          >
            Add Review Need
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {reviewNeeds.map((need) => (
          <Card key={need.need_id} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 w-full">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Description</h4>
                <p className="text-gray-800 leading-relaxed text-sm">{need.description}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Justification</h4>
                <p className="text-gray-600 leading-relaxed text-sm">{need.justification}</p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] text-blue-600 font-bold uppercase">
                  {need.identified_by.charAt(0)}
                </div>
                <p className="text-xs text-gray-500 italic">
                  Identified by <span className="font-semibold text-gray-700 not-italic">{need.identified_by}</span>
                </p>
              </div>
            </div>
          </Card>
        ))}
        {reviewNeeds.length === 0 && (
          <div className="col-span-full border-2 border-dashed border-gray-100 rounded-xl py-16 text-center">
            <p className="text-gray-400 font-medium italic">No review needs catalysts added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewNeedsTab;
