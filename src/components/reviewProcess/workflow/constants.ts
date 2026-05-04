import {
  FiFilter,
  FiCheckSquare,
  FiFileText,
  FiLayers
} from "react-icons/fi";
import type { IconType } from "react-icons";

export interface PhaseDefinition {
  id: number;
  name: string;
  key: string;
  icon: IconType;
}

export const WORKFLOW_PHASES: PhaseDefinition[] = [
  { id: 1, name: "Study Selection", key: "screening", icon: FiFilter },
  { id: 2, name: "Data Extraction", key: "extraction", icon: FiFileText },
  { id: 3, name: "Quality Assessment", key: "quality", icon: FiCheckSquare },
  { id: 4, name: "Synthesis", key: "synthesis", icon: FiLayers },
  // { id: 5, name: "PRISMA Report", key: "prisma", icon: FiClipboard },
];
