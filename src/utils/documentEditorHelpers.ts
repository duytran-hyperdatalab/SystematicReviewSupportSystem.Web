import { v4 as uuidv4 } from "uuid";
import type { DocumentDraft } from "../types/documentEditor";

export const validateChecklistDraftJson = (json: any): { isValid: boolean; error?: string } => {
  if (typeof json !== 'object' || json === null) return { isValid: false, error: "Invalid JSON format" };
  
  // Basic structures
  if (json.title !== undefined && typeof json.title !== 'string') return { isValid: false, error: "Invalid 'title' format" };
  if (json.paragraphs !== undefined && !Array.isArray(json.paragraphs)) return { isValid: false, error: "Invalid 'paragraphs' format" };
  if (json.sections !== undefined && !Array.isArray(json.sections)) return { isValid: false, error: "Invalid 'sections' format" };

  // Validate paragraphs if present
  if (json.paragraphs) {
    for (const p of json.paragraphs) {
      if (typeof p.text !== 'string') return { isValid: false, error: "A paragraph is missing 'text' property" };
    }
  }

  // Validate sections if present
  if (json.sections) {
    for (const s of json.sections) {
      if (typeof s.title !== 'string') return { isValid: false, error: "A section is missing 'title' property" };
      if (s.items && !Array.isArray(s.items)) return { isValid: false, error: "Section 'items' must be an array" };
      if (s.items) {
        for (const item of s.items) {
          if (typeof item.text !== 'string') return { isValid: false, error: "An item is missing 'text' property" };
        }
      }
    }
  }

  return { isValid: true };
};

export const normalizeChecklistDraft = (draft: Partial<DocumentDraft>): DocumentDraft => {
  return {
    title: draft.title || "Untitled Document",
    paragraphs: (draft.paragraphs || []).map((p, idx) => ({
      ...p,
      id: uuidv4(),
      order: idx + 1
    })),
    sections: (draft.sections || []).map((s, sIdx) => ({
      ...s,
      id: uuidv4(),
      order: sIdx + 1,
      items: (s.items || []).map((item, iIdx) => ({
        ...item,
        id: uuidv4(),
        order: iIdx + 1
      }))
    }))
  };
};

export const mergeChecklistDrafts = (current: DocumentDraft, incoming: Partial<DocumentDraft>): DocumentDraft => {
  const normalizedIncoming = normalizeChecklistDraft(incoming);
  
  // Use protocol title if manual title is empty or just "Untitled Document"
  const useProtocolTitle = !current.title.trim() || current.title === "Untitled Document" || current.title === "Untitled Template";
  
  return {
    title: useProtocolTitle ? (incoming.title || current.title) : current.title,
    
    // If we have manual paragraphs, we keep them and append protocol paragraphs.
    // If no manual paragraphs, we just use protocol paragraphs.
    paragraphs: [
      ...current.paragraphs,
      ...normalizedIncoming.paragraphs.map((p, idx) => ({
        ...p,
        order: current.paragraphs.length + idx + 1
      }))
    ],
    
    sections: [
      ...current.sections,
      ...normalizedIncoming.sections.map((s, idx) => ({
        ...s,
        order: current.sections.length + idx + 1
      }))
    ]
  };
};
