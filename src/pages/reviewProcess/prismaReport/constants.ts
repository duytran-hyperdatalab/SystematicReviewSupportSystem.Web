// Constants for the PRISMA Report workspace

import type { PrismaStage } from "../../../types/prismaReport";

/** Mapping of flow sections to their member stages */
export const FLOW_SECTIONS = {
  identification: {
    label: "Identification",
    stages: ["RecordsIdentified" as PrismaStage, "DuplicateRecordsRemoved" as PrismaStage],
    color: "indigo",
  },
  screening: {
    label: "Screening",
    stages: ["RecordsScreened" as PrismaStage, "RecordsExcluded" as PrismaStage],
    color: "blue",
  },
  eligibility: {
    label: "Eligibility",
    stages: [
      "ReportsSoughtForRetrieval" as PrismaStage,
      "ReportsNotRetrieved" as PrismaStage,
      "ReportsAssessed" as PrismaStage,
      "ReportsExcluded" as PrismaStage,
    ],
    color: "amber",
  },
  included: {
    label: "Included",
    stages: ["StudiesIncludedInReview" as PrismaStage],
    color: "green",
  },
} as const;

/** Summary card configuration */
export const SUMMARY_CARDS = [
  {
    key: "totalIdentified" as const,
    label: "Records Identified",
    description: "From all databases & registers",
    colorScheme: "indigo",
  },
  {
    key: "duplicatesRemoved" as const,
    label: "Duplicates Removed",
    description: "Before screening",
    colorScheme: "orange",
  },
  {
    key: "recordsScreened" as const,
    label: "Records Screened",
    description: "After deduplication",
    colorScheme: "blue",
  },
  {
    key: "studiesIncluded" as const,
    label: "Studies Included",
    description: "In final review",
    colorScheme: "green",
  },
] as const;

/** Colors per section for the flow diagram */
export const SECTION_COLORS: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    badge: string;
    connector: string;
    lightBg: string;
  }
> = {
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-800",
    badge: "bg-indigo-100 text-indigo-700",
    connector: "bg-indigo-300",
    lightBg: "bg-indigo-25",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    badge: "bg-blue-100 text-blue-700",
    connector: "bg-blue-300",
    lightBg: "bg-blue-25",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    badge: "bg-amber-100 text-amber-700",
    connector: "bg-amber-300",
    lightBg: "bg-amber-25",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    badge: "bg-green-100 text-green-700",
    connector: "bg-green-300",
    lightBg: "bg-green-25",
  },
};
