// Mock data for Review Process Workspace
// TODO: Replace with actual API calls

import type {
  PhaseStats,
  Activity,
  TeamMember,
  Alert,
  ProgressStats,
} from "../types/reviewProcessWorkspace";

export const getMockPhaseStats = (): PhaseStats => ({
  identification: {
    recordsImported: 1247,
    duplicatesRemoved: 89,
    databasesSearched: 5,
    uniqueRecords: 1158,
  },
  screening: {
    totalPapers: 1158,
    included: 67,
    excluded: 856,
    conflictCount: 168,
    pendingCount: 67,
  },
  extraction: {
    studiesExtracted: 45,
    fieldsExtracted: 23,
    pending: 22,
    completed: 45,
    awaitingConsensus: 12,
  },
  quality: {
    totalPapers: 67,
    highQualityPapers: 58,
    lowQualityPapers: 9,
    inProgressPapers: 0,
    notStartedPapers: 0,
  },
  synthesis: {
    studiesSynthesized: 58,
    themes: 12,
    findings: 34,
    status: "In Progress",
  },
  prisma: {
    lastGenerated: "2 days ago",
    version: "v2020",
    completeness: "89%",
    status: "Draft",
  },
});

export const getMockActivities = (): Activity[] => [
  {
    id: "1",
    type: "phase_started",
    title: "Identification phase started",
    description: "Database search initiated across 5 sources",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: "John Researcher",
    phaseRelated: "Identification",
  },
  {
    id: "2",
    type: "record_added",
    title: "Records imported",
    description: "1,247 records imported from databases",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    user: "Sarah Chen",
    phaseRelated: "Identification",
  },
  {
    id: "3",
    type: "screening_done",
    title: "Screening milestone reached",
    description: "800+ records screened by title and abstract",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user: "Mike Wilson",
    phaseRelated: "Screening",
  },
];

export const getMockTeamMembers = (): TeamMember[] => [
  {
    id: "1",
    name: "John Researcher",
    role: "Lead Reviewer",
    initials: "JD",
    avatarColor: "blue",
  },
  {
    id: "2",
    name: "Sarah Chen",
    role: "Reviewer",
    initials: "SC",
    avatarColor: "purple",
  },
  {
    id: "3",
    name: "Mike Wilson",
    role: "Reviewer",
    initials: "MW",
    avatarColor: "green",
  },
];

export const getMockAlerts = (): Alert[] => [
  {
    id: "1",
    message: "need resolution",
    highlight: "3 screening conflicts",
  },
  {
    id: "2",
    message: "Quality assessment checklist incomplete for",
    highlight: "12 studies",
  },
];

export const getMockProgressStats = (): ProgressStats => ({
  completionPercentage: 42,
  recordsProcessed: 856,
  totalRecords: 1158,
  estimatedCompletion: "6 weeks",
});
