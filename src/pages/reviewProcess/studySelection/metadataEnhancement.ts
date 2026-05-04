import type { PaperWithDecisionsResponse } from "../../../types/studySelection";
import type {
  MetadataEnhancedField,
  MetadataEnhancedFieldKey,
  MetadataEnhancementResult,
} from "./uploadTypes";

interface ComparablePaperMetadata {
  title: string | null;
  authors: string | null;
  abstract: string | null;
  doi: string | null;
  journal: string | null;
}

const FIELD_LABELS: Record<MetadataEnhancedFieldKey, string> = {
  title: "Title",
  authors: "Authors",
  abstract: "Abstract",
  doi: "DOI",
  journal: "Journal",
};

function normalizeValue(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getComparableMetadata(
  paper: ComparablePaperMetadata | PaperWithDecisionsResponse,
): ComparablePaperMetadata {
  return {
    title: normalizeValue(paper.title),
    authors: normalizeValue(paper.authors),
    abstract: normalizeValue(paper.abstract),
    doi: normalizeValue(paper.doi),
    journal: normalizeValue(paper.journal),
  };
}

export function hasIncompleteMetadata(paper: ComparablePaperMetadata): boolean {
  const metadata = getComparableMetadata(paper);
  return !metadata.doi || !metadata.authors || !metadata.abstract;
}

export function buildMetadataEnhancementResult(
  before: ComparablePaperMetadata,
  after: PaperWithDecisionsResponse,
  usedGrobid: boolean,
): MetadataEnhancementResult | null {
  if (!usedGrobid) {
    return null;
  }

  const previous = getComparableMetadata(before);
  const next = getComparableMetadata(after);
  const updatedFields: MetadataEnhancedField[] = (
    Object.keys(FIELD_LABELS) as MetadataEnhancedFieldKey[]
  ).flatMap((key) => {
    if (previous[key] === next[key] || !next[key]) {
      return [];
    }

    return [
      {
        key,
        label: FIELD_LABELS[key],
        value: next[key],
      } satisfies MetadataEnhancedField,
    ];
  });

  return {
    paperId: after.paperId,
    extractedAt: new Date().toISOString(),
    usedGrobid: true,
    updatedFields,
  };
}
