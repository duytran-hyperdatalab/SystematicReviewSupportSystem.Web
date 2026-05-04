# Study Selection API Gap Report

## Scope

This report evaluates API contract readiness for these UI workspaces:

1. Title/Abstract Screening
2. Full-Text Screening

Frontend references analyzed:

1. [src/pages/reviewProcess/studySelection/titleAbstractScreening/TitleAbstractScreeningWorkspace.tsx](../pages/reviewProcess/studySelection/titleAbstractScreening/TitleAbstractScreeningWorkspace.tsx)
2. [src/pages/reviewProcess/studySelection/fullTextScreening/FullTextScreeningWorkspace.tsx](../pages/reviewProcess/studySelection/fullTextScreening/FullTextScreeningWorkspace.tsx)
3. [src/services/studySelectionService.ts](../services/studySelectionService.ts)
4. [src/types/studySelection.ts](../types/studySelection.ts)

---

## API ↔ UI Mapping

### 1. Title/Abstract Screening

UI data requirements:

1. Paginated paper list with status and reviewer decisions
2. Paper metadata/details for viewer
3. Process statistics for header and progress
4. Submit include/exclude decision
5. Resolve conflict

Mapped endpoints:

1. GET /study-selection/{processId}/papers
2. GET /study-selection/{processId}/statistics
3. POST /study-selection/{processId}/papers/{paperId}/decision
4. POST /study-selection/{processId}/papers/{paperId}/resolve

Contract coverage summary:

1. Core list/detail/statistics/decision flows are available
2. Pagination metadata is available
3. Status and resolution fields are available

### 2. Full-Text Screening

UI data requirements:

1. Paginated paper list with full-text availability indicators
2. PDF or URL for full-text reader
3. Process statistics for header and progress
4. Submit include/exclude decision
5. Resolve conflict
6. AI analysis panel content
7. Attach/upload full text when missing

Mapped endpoints:

1. GET /study-selection/{processId}/papers
2. GET /study-selection/{processId}/statistics
3. POST /study-selection/{processId}/papers/{paperId}/decision
4. POST /study-selection/{processId}/papers/{paperId}/resolve

Contract coverage summary:

1. Reader can consume existing pdfUrl/url fields when present
2. Full-text upload/update operations are not available
3. AI analysis operations are not available

---

## API Contract Status Update

Backend confirmed resolution for the following previously reported issues:

1. Issue #2 Full-text upload endpoint
2. Issue #3 Sort mismatch (relevance sort)
3. Issue #4 Filter limitations
4. Issue #5 Resolved-state invariant

Open items are listed below.

---

## 🚨 Remaining API Contract Issues

### Issue 1: Missing AI analysis endpoint and schema

- Endpoint: Not available
- Severity: BLOCKER
- What UI needs:
  1. suggestedDecision
  2. relevanceScore
  3. confidenceScore
  4. protocolMatches
  5. picocMatch
  6. criteriaMatch
  7. highlights with section/page context (full-text)
- What API currently provides:
  1. No study-selection AI analysis endpoint or response type
- Why this is a problem:
  1. AI panels in both screening workspaces are currently mock-only and cannot be backed by real data
- Exact backend change recommendation:
  1. Add POST /study-selection/{processId}/papers/{paperId}/analyze
  2. Return a typed payload with explainable sections (protocol, PICOC, criteria, highlights)
  3. Include stable analysis id and timestamp for traceability/re-run UX

---

## Resolved Issues (Verified by Backend Update)

### Issue #2: Full-text upload/link management

- Status: RESOLVED
- Delivered backend change:
  1. POST /study-selection/{id}/papers/{paperId}/full-text
  2. Accepts pdfUrl and/or url
  3. Implemented across controller/service/DTO
- Frontend integration impact:
  1. Replace placeholder upload behavior in full-text reader with actual mutation
  2. Invalidate papers query after upload and refresh selected paper document link

### Issue #3: Sort option mismatch

- Status: RESOLVED
- Delivered backend change:
  1. Added RelevanceDesc = 4 to PaperSortBy
  2. Sorting strategy: decision count + conflicts-first
  3. Implemented across DTO/service
- Frontend integration impact:
  1. Update frontend enum mapping to include value 4
  2. Wire "Relevance" UI option to RelevanceDesc instead of TitleAsc

### Issue #4: Filtering limitations

- Status: RESOLVED
- Delivered backend change:
  1. Added query params: hasFullText, hasConflict, decidedByReviewerId
  2. Implemented across controller/DTO/service
- Frontend integration impact:
  1. Extend papers query param types
  2. Add filter controls where needed (full-text triage/conflict workflows)

### Issue #5: Resolved-state invariant

- Status: RESOLVED
- Delivered backend change:
  1. Added finalDecision + finalDecisionText to PaperWithDecisionsResponse
  2. Guaranteed non-null for decided papers
  3. Implemented across DTO/service
- Frontend integration impact:
  1. Prefer finalDecision/finalDecisionText when rendering resolved decisions
  2. Remove fallback assumptions for resolved status when possible

### Issue 2: Missing full-text upload/link management endpoint

- Endpoint: Not available
- Severity: BLOCKER
- What UI needs:
  1. Upload or link full text for papers missing pdfUrl/url
  2. Persist updated full-text source and reflect in queue/reader
- What API currently provides:
  1. Read-only pdfUrl/url in paper list payload
- Why this is a problem:
  1. Full-text workflow cannot recover papers with missing document links
- Exact backend change recommendation:
  1. Add POST /study-selection/{processId}/papers/{paperId}/full-text
  2. Support multipart upload and/or external URL association
  3. Return updated paper full-text fields after mutation

### Issue 3: Sort option mismatch (relevance label vs enum contract)

- Endpoint: GET /study-selection/{processId}/papers
- Severity: WARNING
- What UI needs:
  1. Relevance-based sort option as displayed in UI
- What API currently provides:
  1. sortBy only supports title/year variants
- Why this is a problem:
  1. UI implies relevance sort but request maps to title sort, causing behavior mismatch
- Exact backend change recommendation:
  1. Add relevance sort enum value with defined ranking source
  2. Or remove relevance sort option from UI until backend supports it

### Issue 4: Filtering limitations for production full-text triage

- Endpoint: GET /study-selection/{processId}/papers
- Severity: WARNING
- What UI needs:
  1. Filter by full-text availability
  2. Filter unresolved conflicts quickly
  3. Optional reviewer-centric filtering
- What API currently provides:
  1. search, status, sortBy, pageNumber, pageSize
- Why this is a problem:
  1. Large datasets become hard to triage efficiently; increased operator workload
- Exact backend change recommendation:
  1. Extend params with hasFullText, hasConflict, decidedByReviewerId (optional)
  2. Keep existing params backward compatible

### Issue 5: Ambiguous resolved-state invariant

- Endpoint: GET /study-selection/{processId}/papers
- Severity: WARNING
- What UI needs:
  1. Deterministic final decision when paper status is resolved
- What API currently provides:
  1. status can be resolved while resolution object may be null (frontend currently falls back)
- Why this is a problem:
  1. Potential incorrect UI state for resolved papers
- Exact backend change recommendation:
  1. Enforce invariant: resolved status must always include non-null resolution
  2. Alternatively include explicit finalStatus field in top-level paper payload

---

## Updated TypeScript Types (Current Contract Only)

```ts
export interface IntegrationApiError {
  code: string;
  message: string;
}

export interface IntegrationApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors: IntegrationApiError[] | null;
}

export interface IntegrationPaperDecision {
  id: string;
  reviewerId: string;
  reviewerName: string;
  decision: 0 | 1;
  reason: string | null;
  decidedAt: string;
}

export interface IntegrationPaperResolution {
  id: string;
  finalDecision: 0 | 1;
  resolutionNotes: string | null;
  resolvedBy: string;
  resolverName: string;
  resolvedAt: string;
}

export interface IntegrationPaper {
  paperId: string;
  title: string;
  doi: string | null;
  authors: string | null;
  publicationYear: number | null;
  abstract: string | null;
  journal: string | null;
  source: string | null;
  keywords: string | null;
  publicationType: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  publisher: string | null;
  language: string | null;
  url: string | null;
  pdfUrl: string | null;
  conferenceName: string | null;
  conferenceLocation: string | null;
  journalIssn: string | null;
  status: 0 | 1 | 2 | 3 | 4;
  statusText: string;
  finalDecision: 0 | 1 | null;
  finalDecisionText: string | null;
  decisions: IntegrationPaperDecision[];
  resolution: IntegrationPaperResolution | null;
}

export interface IntegrationPaperListData {
  items: IntegrationPaper[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
```

---

## Example Integration Snippets

### Safe API Call

```ts
import { studySelectionService } from "../services/studySelectionService";

function assertSuccess<T>(response: {
  isSuccess: boolean;
  message: string;
  data: T;
  errors: Array<{ code: string; message: string }> | null;
}): T {
  if (!response.isSuccess) {
    const detail = response.errors?.map((e) => `${e.code}: ${e.message}`).join("; ");
    throw new Error(detail || response.message || "Request failed");
  }
  return response.data;
}

export async function fetchStudySelectionPapers(
  processId: string,
  params?: {
    search?: string;
    status?: number;
    sortBy?: number;
    pageNumber?: number;
    pageSize?: number;
  },
) {
  const response = await studySelectionService.getPapersWithDecisions(processId, params);
  return assertSuccess(response);
}
```

Updated query params to align with backend additions:

```ts
type StudySelectionPapersParams = {
  search?: string;
  status?: number;
  sortBy?: 0 | 1 | 2 | 3 | 4;
  pageNumber?: number;
  pageSize?: number;
  hasFullText?: boolean;
  hasConflict?: boolean;
  decidedByReviewerId?: string;
};
```

### Suggested React Query Hook

```ts
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../constants/queryKeys";
import { fetchStudySelectionPapers } from "./fetchStudySelectionPapers";

export function useStudySelectionPapers(
  processId: string | undefined,
  params: {
    search?: string;
    status?: number;
    sortBy?: number;
    pageNumber: number;
    pageSize: number;
  },
) {
  return useQuery({
    queryKey: QUERY_KEYS.studySelection.papers(
      processId ?? "",
      params as unknown as Record<string, unknown>,
    ),
    queryFn: async () => {
      if (!processId) throw new Error("Missing processId");
      return fetchStudySelectionPapers(processId, params);
    },
    enabled: Boolean(processId),
    staleTime: 60_000,
  });
}
```

### Safe Fallback Handling

```ts
export function getPaperDocumentUrl(paper: { pdfUrl: string | null; url: string | null }) {
  return paper.pdfUrl || paper.url || null;
}

export function mapResolvedDecision(
  status: number,
  finalDecision: 0 | 1 | null,
): "pending" | "included" | "excluded" | "conflicted" {
  if (status === 4) {
    if (finalDecision === null) return "pending";
    return finalDecision === 0 ? "included" : "excluded";
  }
  if (status === 1) return "included";
  if (status === 2) return "excluded";
  if (status === 3) return "conflicted";
  return "pending";
}
```

---

## Frontend Risk Notes

1. Race condition risk in full-text hook due to state update during render path in selection sync.
2. Stale async AI-analysis updates if paper changes while request is in-flight.
3. Inconsistent handling of response isSuccess across service methods can hide logical API failures.
4. Relevance sort semantics are now backend-defined; product should validate expected ranking behavior.
5. Potential over-fetching for queue list if full metadata/abstract is always returned for list view.

---

## Backend Action Priority

1. BLOCKER: Add AI analysis endpoint contract

## Frontend Follow-up Priority

1. Integrate full-text upload mutation
2. Extend query params and filter UI for hasFullText/hasConflict/decidedByReviewerId
3. Wire RelevanceDesc sort option in both screening workspaces
4. Consume finalDecision/finalDecisionText for resolved rendering
