// Types specific to Review Process Workspace

export interface PhaseStats {
  identification: {
    recordsImported: number;
    duplicatesRemoved: number;
    databasesSearched: number;
    uniqueRecords: number;
  };
  screening: {
    totalPapers: number;
    included: number;
    excluded: number;
    conflictCount: number;
    pendingCount: number;
  };
  extraction: {
    studiesExtracted: number;
    fieldsExtracted: number;
    pending: number;
    completed: number;
    awaitingConsensus: number;
  };
  quality: {
    totalPapers: number;
    highQualityPapers: number;
    lowQualityPapers: number;
    inProgressPapers: number;
    notStartedPapers: number;
  };
  synthesis: {
    studiesSynthesized: number;
    themes: number;
    findings: number;
    status: string;
  };
  prisma: {
    lastGenerated: string;
    version: string;
    completeness: string;
    status: string;
  };
}

export type ActivityType = "phase_started" | "record_added" | "screening_done";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  user: string;
  phaseRelated: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarColor: string;
}

export interface Alert {
  id: string;
  message: string;
  highlight?: string;
}

export interface ProgressStats {
  completionPercentage: number;
  recordsProcessed: number;
  totalRecords: number;
  estimatedCompletion: string;
}
