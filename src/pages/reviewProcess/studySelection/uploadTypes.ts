export interface UploadPdfOptions {
  extractWithGrobid?: boolean;
}

export type MetadataEnhancedFieldKey = "title" | "authors" | "abstract" | "doi" | "journal";

export interface MetadataEnhancedField {
  key: MetadataEnhancedFieldKey;
  label: string;
  value: string;
}

export interface MetadataEnhancementResult {
  paperId: string;
  extractedAt: string;
  usedGrobid: boolean;
  updatedFields: MetadataEnhancedField[];
}
