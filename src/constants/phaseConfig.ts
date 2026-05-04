// Phase configuration constants

import {
  FiDatabase,
  FiFilter,
  FiFileText,
  FiCheckSquare,
  FiLayers,
  FiClipboard,
} from "react-icons/fi";

/**
 * Map of phase names to their React Icons
 */
export const PHASE_ICONS = {
  identification: FiDatabase,
  screening: FiFilter,
  extraction: FiFileText,
  quality: FiCheckSquare,
  synthesis: FiLayers,
  prisma: FiClipboard,
} as const;

/**
 * Display names for phases
 */
export const PHASE_NAMES = {
  identification: "Identification",
  screening: "Study Selection",
  extraction: "Data Extraction",
  quality: "Quality Assessment",
  synthesis: "Synthesis",
  prisma: "PRISMA Report",
} as const;

export type PhaseName = keyof typeof PHASE_NAMES;
