import React from "react";
import Button from "../../ui/Button";
import Card from "../../ui/Card";
import type { ReviewObjective } from "../../../types/coreAndGovernance";

interface ObjectivesTabProps {
  objectives: ReviewObjective[];
  onAdd: () => void;
  isLeader?: boolean;
}

const ObjectivesTab: React.FC<ObjectivesTabProps> = ({ objectives, onAdd, isLeader = true }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Review Objectives
        </h2>
        {isLeader && <Button onClick={onAdd}>Add Objective</Button>}
      </div>
      <div className="space-y-4">
        {objectives.map((obj) => (
          <Card key={obj.objective_id}>
            <p>{obj.objective_statement}</p>
          </Card>
        ))}
        {objectives.length === 0 && (
          <p className="text-center text-gray-500 py-8">No objectives added yet</p>
        )}
      </div>
    </div>
  );
};

export default ObjectivesTab;
