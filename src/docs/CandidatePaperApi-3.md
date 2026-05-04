# Candidate Paper API Documentation (Backward Snowballing)

This module handles the **Backward Snowballing** process, enabling reference extraction from full-text PDFs (via GROBID). Candidate papers are scoped to a specific **Review Process** to maintain data integrity and project traceability.

---

## 1. Extract References
**Extracts references from a paper's full-text PDF and populates the candidate pool for a specific Review Process.**

- **Method**: `POST`
- **Route**: `/api/review-processes/{processId}/papers/{paperId}/extract-references`
- **Auth**: Required (JWT)

### Request Details
- **Path Parameters**:
  - `processId` (string, Guid): The Review Process ID.
  - `paperId` (string, Guid): The ID of the paper from which to extract references.

### Business Logic Summary
1. Validates that the paper belongs to the specified `ReviewProcess`.
2. Downloads the PDF and extracts references using GROBID.
3. Clears existing `Detected` candidates for the origin paper within this process.
4. Saves new candidates linked to the `ReviewProcessId`.

---

## 2. Get Candidate Papers
**Retrieves a paginated and filtered list of candidate papers for a specific Review Process.**

- **Method**: `GET`
- **Route**: `/api/review-processes/{processId}/candidate-papers`
- **Auth**: Required (JWT)

### Request Details
- **Path Parameters**:
  - `processId` (string, Guid): The Review Process ID.
- **Query Parameters**:
  - `pageNumber` (int, default 1): Page to retrieve.
  - `pageSize` (int, default 20): Items per page.
  - `searchTerm` (string): Text search across Title, Authors, DOI, and Origin Paper.
  - `status` (int): Filter by status enum.
  - `year` (string): Filter by publication year.

### Response Details
- **Success (200 OK)**:
```typescript
interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

interface CandidatePaperDto {
  candidateId: string;
  reviewProcessId: string;
  originPaperId: string;
  originPaperTitle: string | null;
  originPaperAuthors: string | null;
  title: string;
  authors: string | null;
  publicationYear: string | null;
  doi: string | null;
  rawReference: string | null;
  status: number; // Enum: 0=Detected, 1=Rejected, 2=Imported, 3=Duplicate
  statusText: string;
}
```

---

## 3. Reject Candidates
**Rejects candidate papers, marking them as out of scope for the Review Process.**

- **Method**: `POST`
- **Route**: `/api/review-processes/{processId}/candidate-papers/reject`
- **Auth**: Required (JWT)

---

## 4. Select (Import) Candidates
**Deduplicates and imports candidates into the Review Process as new Papers.**

- **Method**: `POST`
- **Route**: `/api/review-processes/{processId}/candidate-papers/select`
- **Auth**: Required (JWT)

### Business Logic Summary
1. **Deduplication**: Checks for existing papers in the **same Review Process** by DOI or normalized Title.
2. **Import**: For unique papers, creates a new `Paper` entity:
   - Sets `ReviewProcessId`.
   - Sets `SourceType = Snowballing (1)`.
   - Links via `OriginPaperId`.
3. **Status Update**: Candidate status changes to `Imported` (or `Duplicate`).

---

## Ready-to-Use Types (TypeScript)

```typescript
export enum CandidateStatus {
  Detected = 0,
  Rejected = 1,
  Imported = 2,
  Duplicate = 3
}

export interface CandidatePaperDto {
  candidateId: string;
  reviewProcessId: string;
  originPaperId: string;
  originPaperTitle: string | null;
  originPaperAuthors: string | null;
  title: string;
  authors: string | null;
  publicationYear: string | null;
  doi: string | null;
  status: CandidateStatus;
  statusText: string;
}
```
