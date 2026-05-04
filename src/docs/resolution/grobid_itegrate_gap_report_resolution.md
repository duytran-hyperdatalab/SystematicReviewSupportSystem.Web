# GROBID Gap Report Resolution

This document outlines the changes made to the backend to resolve the issues identified in the Frontend Gap Report ([StudySelection-Grobid-GapReport.md](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.API/docs/StudySelection-Grobid-GapReport.md)).

## 1. Validation of Reported Issues

1. **No explicit extraction status in response**: Valid. The UI needs to know if extraction succeeded, failed, or was skipped.
2. **No field-level metadata source attribution**: Valid. The UI needs provenance data to display source badges (e.g., RIS vs. GROBID).
3. **No extraction result payload**: Valid. Knowing exactly what GROBID extracted (even if discarded during merge) is important for the UI.
4. **No retry extraction endpoint**: Valid. Needed for recovery when upload succeeds but extraction fails. 
5. **No persisted extraction audit metadata**: Valid but marked as `NICE_TO_HAVE`. The backend modifications (specifically the [PaperSourceMetadata](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Repositories/Entities/PaperSourceMetadata.cs#6-25) and [GrobidHeaderResult](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Repositories/Entities/GrobidHeaderResult.cs#5-24) entities) now persist this information, though a dedicated endpoint to retrieve the full audit history per field wasn't requested for this iteration.

## 2. Summary of Backend Changes

* **Safe additions**: The changes are strictly additive. No existing fields were removed or renamed in the response DTOs.
* **New DTOs**: Added [ExtractionStatusResponse](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/DTOs/StudySelection/StudySelectionDto.cs#175-183), [MetadataSourcesResponse](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/DTOs/StudySelection/StudySelectionDto.cs#184-192), and [ExtractionResultResponse](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/DTOs/StudySelection/StudySelectionDto.cs#193-202) to encapsulate the new data.
* **Updated [PaperWithDecisionsResponse](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/DTOs/StudySelection/StudySelectionDto.cs#136-174)**: Included the new DTOs as optional properties ([Extraction](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/DTOs/StudySelection/RetryExtractionRequest.cs#5-9), [MetadataSources](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/DTOs/StudySelection/StudySelectionDto.cs#184-192), [ExtractionResult](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/DTOs/StudySelection/StudySelectionDto.cs#193-202)).
* **StudySelectionService Update**: Modified [UpdatePaperFullTextAsync](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/StudySelectionService/StudySelectionService.cs#980-1186) and the mapping logic to populate these new fields. Infer metadata sources based on the existence of records in [PaperSourceMetadata](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Repositories/Entities/PaperSourceMetadata.cs#6-25).
* **New Endpoint**: Created `POST /api/paper-fulltext/{paperId}/extract-metadata` in [PaperFullTextUploadController](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.API/Controllers/PaperFullTextUploadController.cs#21-28) and [RetryMetadataExtractionAsync](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/StudySelectionService/StudySelectionService.cs#1187-1232) in [StudySelectionService](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/StudySelectionService/StudySelectionService.cs#17-26) to handle retries.

## 3. Updated API Schemas (TypeScript-Friendly)

### Updated Response Schema ([PaperWithDecisionsResponse](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/DTOs/StudySelection/StudySelectionDto.cs#136-174))

```typescript
export interface PaperWithDecisionsResponse {
  paperId: string;
  title: string;
  doi?: string;
  authors?: string;
  publicationYear?: number;
  abstract?: string;
  journal?: string;
  source?: string;
  keywords?: string;
  publicationType?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  language?: string;
  url?: string;
  pdfUrl?: string;
  pdfFileName?: string;
  conferenceName?: string;
  conferenceLocation?: string;
  journalIssn?: string;
  status: number; // PaperSelectionStatus enum
  statusText: string;
  finalDecision?: number; // ScreeningDecisionType enum
  finalDecisionText?: string;
  decisions: ScreeningDecisionResponse[];
  resolution?: ScreeningResolutionResponse;
  
  // NEW FIELDS added for Gap Report resolution
  extraction?: ExtractionStatusResponse;
  metadataSources?: MetadataSourcesResponse;
  extractionResult?: ExtractionResultResponse;
}

export interface ExtractionStatusResponse {
  requested: boolean;
  provider?: string | null;
  status: "not_requested" | "succeeded" | "failed" | "partial";
  message?: string | null;
  retryToken?: string | null;
}

export interface MetadataSourcesResponse {
  title?: "RIS" | "GROBID" | "MANUAL" | null;
  authors?: "RIS" | "GROBID" | "MANUAL" | null;
  abstract?: "RIS" | "GROBID" | "MANUAL" | null;
  doi?: "RIS" | "GROBID" | "MANUAL" | null;
  journal?: "RIS" | "GROBID" | "MANUAL" | null;
}

export interface ExtractionResultResponse {
  title?: string | null;
  authors?: string | null;
  abstract?: string | null;
  doi?: string | null;
  journal?: string | null;
  updatedFields: string[];
}
```

### New Request Schema ([RetryExtractionRequest](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/DTOs/StudySelection/RetryExtractionRequest.cs#5-9))

```typescript
export interface RetryExtractionRequest {
  provider: string; // Defaults to "GROBID"
}
```

## 4. Frontend Impact Notes

* **Backward Compatibility**: Fully backward compatible. The existing fields in [PaperWithDecisionsResponse](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/DTOs/StudySelection/StudySelectionDto.cs#136-174) remain unchanged. The new fields are optional (`?`), so existing frontend code parsing the response will not break.
* **UI Updates**:
    * The UI can now confidently use `response.extraction.status` to determine the outcome of the GROBID process and show appropriate success/warning toasts.
    * Persistent `RIS` / `GROBID` badges can be rendered using the `response.metadataSources` object without needing to invent provenance locally.
    * The `response.extractionResult` provides the exact data extracted, allowing for accurate "AI Extracted Metadata" displays.
    * A "Retry Extraction" button can now be wired up to the new `POST /api/paper-fulltext/{paperId}/extract-metadata` endpoint.
* **Rollout Considerations**: The backend changes can be deployed immediately. The frontend can adopt the new fields gradually. Note that the retry logic currently throws a `NotImplementedException` simulating completion semantics, as physical file downloading from Supabase is required for a full implementation. This needs backend/product confirmation for the architectural approach.
