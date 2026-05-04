import React from "react";
import AIProjectSetupWizard from "../../../pages/projects/AIProjectSetupWizard";

interface ProjectSetupSectionProps {
  projectId: string;
  isProjectSetupReady: boolean;
  onSetupSaved: () => void;
  embedded?: boolean;
}

const ProjectSetupSection: React.FC<ProjectSetupSectionProps> = ({
  projectId,
  onSetupSaved,
  embedded = true,
}) => {
  return (
    <div className="space-y-6">
      <AIProjectSetupWizard
        embedded={embedded}
        projectId={projectId}
        onSetupSaved={onSetupSaved}
      />
    </div>
  );
};

export default ProjectSetupSection;
