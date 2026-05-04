# 📖 API Integration Guide: Candidate Paper Management

This document provides a comprehensive guide for frontend developers to integrate with the `CandidatePaper` APIs. These APIs are part of the **Snowballing** workflow, where references are extracted from existing papers to identify new "candidate" papers for the project repository.

---

## 🛠️ Global Considerations
- **Base URL**: `/api`
- **Authentication**: All endpoints require a valid JWT token in the `Authorization: Bearer <token>` header.
- **Base Response Wrapper**: Every response follows the `ApiResponse<T>` structure.
- **Enums**:
  - `CandidateStatus`: `Detected (0)`, `Matched (1)`, `Rejected (2)`, `Suggested (3)`
  - `PaperSourceType`: `DatabaseSearch (0)`, `Snowballing (1)`, `Manual (2)`

---

## 📡 API Endpoints

### 1. Extract References from Paper
`POST /api/papers/{paperId}/extract-references`

**Purpose**: Starts the background process to extract references (bibliography) from a paper's PDF.

#### Request Details
- **Path Params**: 
  - `paperId` (Guid, required): The ID of the paper to process.
- **Headers**: `Authorization: Bearer <token>`
- **Body**: None.

#### Response Details
- **Success (200 OK)**:
  ```typescript
  interface ApiResponse {
    isSuccess: boolean;
    message: string; // "References extraction started..."
  }
  ```
- **Error (401/404/500)**: Standard `ApiResponse` with `errors` array.

#### Business Logic Summary
- This triggers an asynchronous job (using GROBID) to parse the PDF.
- Extracted references are saved as `CandidatePaper` entities in the "Detected" status.
- It also performs **Project-Scoped Matching**: if an extracted reference matches an existing paper in the project, it links them automatically.

#### FE Integration Notes
- **Trigger**: Call this when a user clicks "Extract References" or "Snowballing" on a paper.
- **UX**: Since this is a background job, show a "Processing..." indicator. The candidates will appear in the candidate list once finished (consider polling or refreshing the list).

---

### 2. Get Papers with Candidate Counts
`GET /api/projects/{projectId}/papers/papers-with-candidates`

**Purpose**: Lists all papers in a project along with statistics about their extracted candidates.

#### Request Details
- **Path Params**: 
  - `projectId` (Guid, required)
- **Query Params**:
  - `pageNumber` (number, default: 1)
  - `pageSize` (number, default: 10)
  - `searchTerm` (string, optional): Search by title, author, or DOI.
  - `year` (string, optional): Filter by publication year.

#### Response Details
- **Success (200 OK)**:
  ```typescript
  interface ApiResponse<T> {
    isSuccess: boolean;
    data: PaginatedResponse<PaperWithCandidateDto>;
    message: string;
  }

  interface PaperWithCandidateDto {
    id: string;
    title: string;
    authors: string;
    abstract: string;
    publicationYear: string;
    doi: string;
    sourceType: string;
    source: string;
    pdfUrl?: string;
    importedAt: string;
    candidateCount: number;   // Total candidates extracted
    suggestedCount: number;   // High-quality new candidates
    duplicateCount: number;   // Candidates already in project
  }
  ```

#### Business Logic Summary
- Useful for an overview of which papers have been "snowballed" and how many results they yielded.
- `duplicateCount` refers to references that matched existing papers in the project repository.

---

### 3. Get Candidates for a Specified Paper
`GET /api/papers/{paperId}/candidate-papers` OR `GET /api/papers/{paperId}/candidates`

**Purpose**: Retrieves the list of references (candidates) extracted from a specific paper.

#### Request Details
- **Path Params**: 
  - `paperId` (Guid, required)
- **Query Params**:
  - `pageNumber`, `pageSize` (default: 1, 10)
  - `searchTerm` (string, optional)
  - `status` (CandidateStatus, optional): Filter by `Detected`, `Matched`, etc.
  - `year` (string, optional)

#### Response Details
- **Success (200 OK)**:
  ```typescript
  interface CandidatePaperDto {
    candidateId: string;
    originPaperId: string;    // The paper this was extracted from
    originPaperTitle: string;
    title: string;
    authors?: string;
    publicationYear?: string;
    doi?: string;
    rawReference?: string;    // The full raw string from the PDF
    status: number;           // CandidateStatus enum
    statusText: string;
    confidenceScore: number;  // Combined score
    extractionQualityScore: number; // How "complete" the metadata is
    matchConfidenceScore: number;   // Similarity score to existing papers
    isSelectedInProjectRepository: boolean;
    validationNote?: string;   // Reason for status (e.g., "Missing DOI")
  }
  ```

#### Business Logic Summary
- `Matched` status means the system found a high-confidence match in the current project.
- `Suggested` status means the metadata is high quality but no match was found (likely a new paper).

---

### 4. Select Candidates (Add to Project)
`POST /api/candidate-papers/select`

**Purpose**: Officially adds selected candidates to the project repository as new `Paper` entities.

#### Request Details
- **Body**:
  ```typescript
  interface SelectCandidatePaperRequest {
    projectId: string;
    candidateIds: string[];
  }
  ```

#### Response Details
- **Success (200 OK)**:
  ```typescript
  interface ApiResponse {
    isSuccess: boolean;
    message: string; // "Candidate papers selected..."
  }
  ```

#### Business Logic Summary
- For each `candidateId`:
  - If a match was already found (`TargetPaperId` exists), it reuses the existing paper.
  - If no match was found, it **creates a new Paper** entity in the project.
  - It creates a `PaperCitation` link between the `originPaper` and the `targetPaper`.
- **Side Effect**: The `IsSelectedInProjectRepository` flag is set to `true`.

---

### 5. Reject Candidates
`POST /api/candidate-papers/reject`

**Purpose**: Marks candidates as rejected so they no longer appear as potential additions.

#### Request Details
- **Body**:
  ```typescript
  interface RejectCandidatePaperRequest {
    candidateIds: string[];
  }
  ```

#### Business Logic Summary
- Simply sets the status of the candidates to `Rejected (2)`.

---

## ⌨️ Ready-to-Use TypeScript Types

```typescript
/**
 * Global Enums
 */
export enum CandidateStatus {
  Detected = 0,
  Matched = 1,
  Rejected = 2,
  Suggested = 3,
}

/**
 * Base Wrappers
 */
export interface ApiResponse<T = any> {
  isSuccess: boolean;
  message: string;
  data?: T;
  errors?: ApiError[];
}

export interface ApiError {
  code: string;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Candidate Specific DTOs
 */
export interface CandidatePaperDto {
  candidateId: string;
  originPaperId: string;
  originPaperTitle: string;
  title: string;
  authors?: string;
  publicationYear?: string;
  doi?: string;
  rawReference?: string;
  status: CandidateStatus;
  statusText: string;
  confidenceScore: number;
  extractionQualityScore: number;
  matchConfidenceScore: number;
  isSelectedInProjectRepository: boolean;
  validationNote?: string;
}

export interface PaperWithCandidateDto {
  id: string;
  title: string;
  authors: string;
  candidateCount: number;
  suggestedCount: number;
  duplicateCount: number;
  // ... other paper fields
}

/**
 * Request Interfaces
 */
export interface SelectCandidatePaperRequest {
  projectId: string;
  candidateIds: string[];
}

export interface RejectCandidatePaperRequest {
  candidateIds: string[];
}
```

## 🚀 Example API Call (Using Fetch)

```typescript
async function selectCandidates(projectId: string, candidateIds: string[]) {
  const response = await fetch('/api/candidate-papers/select', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${YOUR_TOKEN}`,
    },
    body: JSON.stringify({
      projectId,
      candidateIds
    }),
  });

  const result: ApiResponse = await response.json();
  if (result.isSuccess) {
    console.log("Success:", result.message);
  } else {
    console.error("Errors:", result.errors);
  }
}
```

---

## ⚠️ Common Pitfalls
1. **Redundant Selection**: The system skips candidates already marked as `IsSelectedInProjectRepository`. The FE should disable the selection checkbox for these items.
2. **Race Conditions**: Since extraction is a background job, the candidate list might be empty initially. Use a loading state or a refresh button.
3. **Large Batches**: Avoid selecting hundreds of candidates at once; while the backend handles it, large payloads might be slow.
