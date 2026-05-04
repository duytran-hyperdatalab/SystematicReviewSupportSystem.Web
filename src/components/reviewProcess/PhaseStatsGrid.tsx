// Phase Statistics Grid Component - Grid of phase summary cards

import PhaseSummaryCard from "./PhaseSummaryCard";
import { PHASE_ICONS } from "../../constants/phaseConfig";
import type { PhaseStats } from "../../types/reviewProcessWorkspace";

interface PhaseStatsGridProps {
  phaseStats: PhaseStats;
  currentPhase: number;
  onOpenPhase: (phaseName: string) => void;
}

export default function PhaseStatsGrid({
  phaseStats,
  currentPhase,
  onOpenPhase,
}: PhaseStatsGridProps) {
  const getPhaseStatus = (phaseIndex: number): "current" | "completed" | "locked" | "available" => {
    if (currentPhase === phaseIndex) return "current";
    if (currentPhase > phaseIndex) return "completed";
    // PRISMA Report (phase 5) is always accessible — it's a read-only aggregate view
    if (phaseIndex === 5) return "available";
    return "locked";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Identification Card */}
      <PhaseSummaryCard
        phaseName="Identification"
        phaseIcon={<PHASE_ICONS.identification />}
        stats={[
          { label: "Records Imported", value: phaseStats.identification.recordsImported },
          { label: "Records Duplicated", value: phaseStats.identification.duplicatesRemoved },
          { label: "Import Batches", value: phaseStats.identification.databasesSearched },
          {
            label: "Unique Records",
            value: phaseStats.identification.uniqueRecords,
            variant: "success",
          },
        ]}
        status={getPhaseStatus(0)}
        actionLabel="Open Identification"
        onActionClick={() => onOpenPhase("identification")}
        lastUpdated="2 hours ago"
      />

      {/* Study Selection Card */}
      <PhaseSummaryCard
        phaseName="Study Selection"
        phaseIcon={<PHASE_ICONS.screening />}
        stats={[
          { label: "Total Papers", value: phaseStats.screening.totalPapers },
          { label: "Included", value: phaseStats.screening.included, variant: "success" },
          { label: "Excluded", value: phaseStats.screening.excluded },
          { label: "Pending", value: phaseStats.screening.pendingCount, variant: "warning" },
        ]}
        status={getPhaseStatus(1)}
        actionLabel="Open Study Selection"
        onActionClick={() => onOpenPhase("screening")}
        lastUpdated="5 hours ago"
      />

      {/* Quality Assessment Card */}
      <PhaseSummaryCard
        phaseName="Quality Assessment"
        phaseIcon={<PHASE_ICONS.quality />}
        stats={[
          { label: "Total Papers", value: phaseStats.quality.totalPapers },
          { label: "High Quality", value: phaseStats.quality.highQualityPapers, variant: "success" },
          { label: "Low Quality", value: phaseStats.quality.lowQualityPapers, variant: "danger" },
          { label: "In Progress", value: phaseStats.quality.inProgressPapers, variant: "warning" },
        ]}
        status={getPhaseStatus(2)}
        actionLabel="Open Quality Assessment"
        onActionClick={() => onOpenPhase("quality")}
        lastUpdated="3 days ago"
      />

      {/* Extraction Card */}
      <PhaseSummaryCard
        phaseName="Data Extraction"
        phaseIcon={<PHASE_ICONS.extraction />}
        stats={[
          { label: "Studies", value: phaseStats.extraction.studiesExtracted },
          { label: "Fields Extracted", value: phaseStats.extraction.fieldsExtracted },
          { label: "Completed", value: phaseStats.extraction.completed, variant: "success" },
          { label: "Pending", value: phaseStats.extraction.pending, variant: "warning" },
          { label: "Consensus", value: phaseStats.extraction.awaitingConsensus, variant: "danger" },
        ]}
        status={getPhaseStatus(3)}
        actionLabel="Open Extraction"
        onActionClick={() => onOpenPhase("extraction")}
        lastUpdated="1 day ago"
      />

      {/* Synthesis Card */}
      <PhaseSummaryCard
        phaseName="Synthesis"
        phaseIcon={<PHASE_ICONS.synthesis />}
        stats={[
          { label: "Studies", value: phaseStats.synthesis.studiesSynthesized },
          { label: "Themes", value: phaseStats.synthesis.themes },
          { label: "Key Findings", value: phaseStats.synthesis.findings },
          { label: "Status", value: phaseStats.synthesis.status },
        ]}
        status={getPhaseStatus(4)}
        actionLabel="Open Synthesis"
        onActionClick={() => onOpenPhase("synthesis")}
        lastUpdated="5 days ago"
      />

      {/* PRISMA Card */}
      <PhaseSummaryCard
        phaseName="PRISMA Report"
        phaseIcon={<PHASE_ICONS.prisma />}
        stats={[
          { label: "Last Generated", value: phaseStats.prisma.lastGenerated },
          { label: "Version", value: phaseStats.prisma.version },
          { label: "Completeness", value: phaseStats.prisma.completeness },
          { label: "Status", value: phaseStats.prisma.status, variant: "warning" },
        ]}
        status={getPhaseStatus(5)}
        actionLabel="View PRISMA Report"
        onActionClick={() => onOpenPhase("prisma")}
        lastUpdated="1 week ago"
      />
    </div>
  );
}
