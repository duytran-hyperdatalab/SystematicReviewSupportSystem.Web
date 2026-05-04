import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Mock data & setup to have a similar layout to Study Selection page
const dummyStats = {
  total: 50,
  included: 10,
  excluded: 5,
  pending: 35,
  conflicted: 0,
  completionPercentage: 30,
};

const dummyPapers = Array.from({ length: 10 }).map((_, i) => ({
  id: `paper-${i}`,
  title: `Sample Study Title for Quality Assessment ${i + 1}`,
  authors: "Smith J. et al.",
  status: i === 0 ? "included" : "pending",
  abstract:
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo...",
}));

export function useQualityAssessment() {
  const navigate = useNavigate();
  const { projectId, processId } = useParams();
  
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(dummyPapers[0].id);
  const [rightPanelMode, setRightPanelMode] = useState<"criteria" | "ai">("criteria");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedPaper = useMemo(
    () => dummyPapers.find((p) => p.id === selectedPaperId), 
    [selectedPaperId]
  );

  const filteredPapers = useMemo(() => {
    if (!searchQuery) return dummyPapers;
    return dummyPapers.filter((p) => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.authors.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleBack = () => {
    navigate(`/projects/${projectId}/processes/${processId}`);
  };

  return {
    // Data
    stats: dummyStats,
    papers: filteredPapers,
    selectedPaper,
    
    // State
    selectedPaperId,
    rightPanelMode,
    searchQuery,

    // Actions
    setSelectedPaperId,
    setRightPanelMode,
    setSearchQuery,
    handleBack,
  };
}