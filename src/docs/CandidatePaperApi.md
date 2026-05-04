# Candidate Paper API Documentation

This module handles the **Backward Snowballing** process, allowing the system to extract references from full-text PDFs (via GROBID), manage them in a candidate pool, and promote them to the main project screening queue.

## Table of Contents
- [Extract References](#1-extract-references)
- [Get Candidate Papers](#2-get-candidate-papers)
- [Reject Candidates](#3-reject-candidates)
- [Select Candidates](#4-select-candidates)

---

## 1. Extract References
**Extracts references from a paper's full-text PDF and populates the candidate pool.**

- **Method**: `POST`
- **Route**: `/api/candidate-papers/extract/{paperId}`
- **Auth**: Required (JWT)

### Request Details
- **Path Parameters**:
  - `paperId` (string, Guid): The ID of the existing paper to extract references from.
- **Headers**:
  - `Authorization: Bearer <token>`

### Response Details
- **Success (200 OK)**:
```typescript
interface ApiResponse {
  isSuccess: boolean;
  message: string;
  errors: ApiError[] | null;
}
```
- **Error (400/500)**: Standard error response.

### Business Logic Summary
1. Locates the paper and its associated PDF.
2. Downloads the PDF and sends it to the GROBID service.
3. Parses references into metadata (Title, Authors, DOI, Year).
4. Cleans up any previous "Detected" candidates for this paper.
5. Saves new candidates to the database with status `Detected`.

---

## 2. Get Candidate Papers
**Retrieves all candidate papers in the pool for a specific project.**

- **Method**: `GET`
- **Route**: `/api/candidate-papers/project/{projectId}`
- **Auth**: Required (JWT)

### Request Details
- **Path Parameters**:
  - `projectId` (string, Guid): The project ID.

### Response Details
- **Success (200 OK)**:
```typescript
interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors: ApiError[] | null;
}

interface CandidatePaperDto {
  candidateId: string;
  projectId: string;
  originPaperId: string;
  title: string;
  authors: string | null;
  publicationYear: string | null;
  doi: string | null;
  rawReference: string | null;
  normalizedReference: string | null;
  status: number; // Enum: 0=Detected, 1=Selected, 2=Rejected, 3=Imported, 4=Duplicate
  statusText: string;
}
```

---

## 3. Reject Candidates
**Rejects one or multiple candidate papers from the pool.**

- **Method**: `POST`
- **Route**: `/api/candidate-papers/reject`
- **Auth**: Required (JWT)

### Request Details
- **Body Schema**:
```typescript
interface RejectCandidatePaperRequest {
  candidateIds: string[];
}
```

### Response Details
- **Success (200 OK)**: `ApiResponse` (Standard)

### Business Logic Summary
- Updates the status of provided candidates to `Rejected`.
- Only affects candidates currently in `Detected` status.

---

## 4. Select Candidates
**Promotes candidates to the main screening queue after deduplication.**

- **Method**: `POST`
- **Route**: `/api/candidate-papers/select`
- **Auth**: Required (JWT)

### Request Details
- **Body Schema**:
```typescript
interface SelectCandidatePaperRequest {
  candidateIds: string[];
}
```

### Response Details
- **Success (200 OK)**: `ApiResponse` (Standard)

### Business Logic Summary
1. Validates candidates exist and are in `Detected` status.
2. Performs **Deduplication**:
   - Checks if a paper with the same **DOI** exists in the project.
   - Checks if a paper with the same **Title** (case-insensitive) exists.
3. **If duplicate**: Marks candidate status as `Duplicate` and does NOT create a new paper.
4. **If unique**:
   - Marks candidate status as `Selected`.
   - Creates a new `Paper` entity with `SourceType = Snowballing (1)`.
   - Links the new paper to the `OriginPaperId`.

---

## Frontend Integration Notes
- **Loading State**: Extraction can take several seconds as it involves downloading a PDF and external processing via GROBID. FE should show a prominent loading spinner or use a background polling mechanism if possible.
- **Workflow**: Typically, the user clicks "Extract" on a paper detail page, then navigates to a "Snowballing Candidate Pool" view to review and Approve/Reject the results.
- **Error Handling**: 401 Unauthorized if token is expired. Handle 404/400 if the paper or project does not exist.

## Ready-to-Use Types (TypeScript)

```typescript
export enum CandidateStatus {
  Detected = 0,
  Selected = 1,
  Rejected = 2,
  Imported = 3,
  Duplicate = 4
}

export interface CandidatePaperDto {
  candidateId: string;
  projectId: string;
  originPaperId: string;
  title: string;
  authors: string | null;
  publicationYear: string | null;
  doi: string | null;
  rawReference: string | null;
  status: CandidateStatus;
  statusText: string;
}

export interface SelectCandidatePaperRequest {
  candidateIds: string[];
}

export interface RejectCandidatePaperRequest {
  candidateIds: string[];
}

export interface ApiResponse<T = any> {
  isSuccess: boolean;
  message: string;
  data?: T;
  errors?: { code: string; message: string }[];
}
```
