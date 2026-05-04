# Duplicate Management API Documentation

**Version:** 1.0  
**Base URL:** `/api`  
**Last Updated:** 2026-04-22

---

## 1. Get Duplicate Pairs

### Basic Info

- **Method**: `GET`
- **Route**: `/api/projects/{projectId}/duplicate-pairs`
- **Description**: Retrieves a paginated list of duplicate pairs for side-by-side comparison. Each pair contains both the "original" (reference) paper and the "duplicate" paper with their full metadata, along with deduplication metrics (confidence, method).

### Request Details

- **Headers**:
  - `Authorization: Bearer {token}`
- **Path Parameters**:
  - `projectId` (UUID, Required): The ID of the Systematic Review Project.
- Query Parameters:
  - `search` (string, Optional): Search in title, DOI, or authors of **either** paper in the pair.
  - `status` (DeduplicationReviewStatus, Optional): Filter by review status (0 = Pending, 1 = Confirmed, 2 = Rejected).
  - `minConfidence` (decimal, Optional): Filter pairs with confidence score >= value (0.0 to 1.0).
  - `method` (DeduplicationMethod, Optional): Filter by detection method (0 = DOI_MATCH, 1 = TITLE_FUZZY, 2 = TITLE_AUTHOR, 3 = HYBRID, 4 = MANUAL, 5 = SEMANTIC).
  - `sortBy` (string, Optional): Sort order (`confidenceDesc` (default), `confidenceAsc`, `detectedAtDesc`).
  - `pageNumber` (int, Optional): Page number (default: 1).
  - `pageSize` (int, Optional): Items per page (default: 20, max: 100).
- **Request Body**: N/A

### Response Details

- **Success Response**: `ApiResponse<PaginatedResponse<DuplicatePairResponse>>`
- **HTTP Status Codes**:
  - `200 OK`: Successfully retrieved pairs (even if list is empty).
  - `401 Unauthorized`: Authentication missing or invalid.
  - `403 Forbidden`: User does not have access to the project.

### Business Logic Summary

- **What it does**: Queries the `DeduplicationResult` table for the project and joins both the primary paper (`PaperId`) and the reference paper (`DuplicateOfPaperId`).
- **Logic**: Returns only non-deleted papers. It is intended for the "Deduplication Workspace" where researchers perform side-by-side verification.
- **Side Effects**: None.

### Frontend Integration Notes

- **When to call**: When initializing the deduplication review screen.
- **Loading Suggestion**: Use a skeleton loader for the side-by-side comparison cards.
- **Common Pitfall**: Ensure you handle the case where `totalCount` is 0 by showing a "No duplicates found" message.

### Ready-to-Use FE Types

```typescript
export enum DeduplicationMethod {
  DOI_MATCH = 0,
  TITLE_FUZZY = 1,
  TITLE_AUTHOR = 2,
  HYBRID = 3,
  MANUAL = 4,
  SEMANTIC = 5,
}

export enum DeduplicationReviewStatus {
  Pending = 0,
  Confirmed = 1,
  Rejected = 2,
}

export enum DuplicateResolutionDecision {
  KEEP_BOTH = 0,
  CANCEL = 1,
}

export interface DuplicatePairPaperDto {
  id: string;
  title: string;
  authors?: string;
  abstract?: string;
  doi?: string;
  publicationType?: string;
  publicationYear?: string;
  publicationYearInt?: number;
  source?: string;
  journal?: string;
  keywords?: string;
  url?: string;
  importedAt?: string;
}

export interface DuplicatePairResponse {
  id: string;
  originalPaper: DuplicatePairPaperDto;
  duplicatePaper: DuplicatePairPaperDto;
  method: DeduplicationMethod;
  methodText: string;
  confidenceScore?: number;
  deduplicationNotes?: string;
  resolvedDecision?: DuplicateResolutionDecision;
  reviewStatus: DeduplicationReviewStatus;
  reviewStatusText: string;
  reviewedBy?: string;
  reviewedAt?: string;
  detectedAt: string;
}

// Example Call
async function getDuplicatePairs(projectId: string, pageNumber: number = 1) {
  const response = await fetch(
    `/api/projects/${projectId}/duplicate-pairs?pageNumber=${pageNumber}`,
  );
  return await response.json();
}
```

---

## 2. Resolve Duplicate Pair

### Basic Info

- **Method**: `PATCH`
- **Route**: `/api/projects/{projectId}/duplicate-pairs/{pairId}/resolve`
- **Description**: Records a researcher's decision on a detected duplicate pair. The researcher can either confirm it as a duplicate (CANCEL) or mark it as a false positive (KEEP_BOTH).

### Request Details

- **Headers**:
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `projectId` (UUID, Required): Project ID.
  - `pairId` (UUID, Required): The Deduplication Result ID.
- **Request Body**:

```typescript
export interface ResolveDuplicatePairRequest {
  decision: DuplicateResolutionDecision; // 0 = KEEP_BOTH, 1 = CANCEL
  notes?: string; // Optional reason/notes
}
```

### Response Details

- **Success Response**: `ApiResponse<ResolveDuplicatePairResponse>`
- **HTTP Status Codes**:
  - `200 OK`: Resolution saved successfully.
  - `400 BadRequest`: Invalid decision or missing required fields.
  - `404 NotFound`: Pair not found in the project.

### Business Logic Summary

- **Decision - CANCEL (1)**: The system confirms `PaperId` is a duplicate. The paper is soft-deleted (`IsDeleted = true`) to exclude it from the systematic review dataset.
- **Decision - KEEP_BOTH (0)**: The system marks the detection as a false positive. Both papers remain in the dataset.
- **Audit Trail**: The API automatically records the reviewer's ID and the timestamp of resolution.

### Frontend Integration Notes

- **When to call**: When a researcher clicks "Confirm Duplicate" or "Not a Duplicate" in the review UI.
- **UX Suggestion**: Optimistically update the UI to remove the resolved pair from the "Pending" list.
- **Pitfall**: Ensure the user provides a note if your project policy requires justification for manual overrides.

### Ready-to-Use FE Types

```typescript
export interface ResolveDuplicatePairResponse {
  id: string;
  reviewStatus: DeduplicationReviewStatus;
  reviewStatusText: string;
  resolvedDecision?: DuplicateResolutionDecision;
  reviewedAt?: string;
  reviewedBy?: string;
}

// Example Call
async function resolvePair(
  projectId: string,
  pairId: string,
  decision: DuplicateResolutionDecision,
) {
  const response = await fetch(`/api/projects/${projectId}/duplicate-pairs/${pairId}/resolve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision }),
  });
  return await response.json();
}
```

---

## 3. Mark As Duplicate (Manual)

### Basic Info

- **Method**: `POST`
- **Route**: `/api/projects/{projectId}/papers/{paperId}/mark-as-duplicate`
- **Description**: Manually flags a paper as a duplicate of another existing paper. This is used when a researcher discovers a duplicate that was not caught by the automated detection algorithm.

### Request Details

- **Headers**:
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `projectId` (UUID, Required): Project ID.
  - `paperId` (UUID, Required): The ID of the paper that is being marked as a duplicate (this paper will be removed).
- **Request Body**:

```typescript
export interface MarkAsDuplicateRequest {
  duplicateOfPaperId: string; // The ID of the paper that is the original/reference
  reason?: string; // Why this is being marked manually
}
```

### Response Details

- **Success Response**: `ApiResponse`
- **HTTP Status Codes**:
  - `200 OK`: Paper successfully marked and removed.
  - `400 BadRequest`: Papers belong to different projects or are the same paper.

### Business Logic Summary

- **What it does**: Creates a `DeduplicationResult` with method `MANUAL (4)` and status `Confirmed (1)`.
- **Effect**: The paper specified in the route (`paperId`) is immediately soft-deleted (`IsDeleted = true`).
- **Consistency**: Both papers must belong to the same project.

### Frontend Integration Notes

- **When to call**: From a general library view or search result when a user manually drags one paper onto another or selects "Mark as duplicate of...".
- **Safety**: Prompt for confirmation before calling this, as it involves deleting a record from the active dataset.

### Ready-to-Use FE Types

```typescript
// Example Call
async function markManualDuplicate(
  projectId: string,
  paperId: string,
  originalId: string,
  reason: string,
) {
  const response = await fetch(`/api/projects/${projectId}/papers/${paperId}/mark-as-duplicate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ duplicateOfPaperId: originalId, reason }),
  });
  return await response.json();
}
```
