# Candidate Paper API Documentation

This document provides technical details for the [CandidatePaper](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/CandidatePaperService/DTOs/CandidatePaperDto.cs#8-25) API, part of the Systematic Review Support System (SRSS). This API manages the "Snowballing" candidate pool—references extracted from source papers during the Identification phase.

---

## Shared Data Structures (TypeScript)

### Common Wrappers
```typescript
interface ApiResponse<T = void> {
  isSuccess: boolean;
  message: string;
  data?: T;
  errors?: ApiError[];
}

interface ApiError {
  code: string;
  message: string;
}

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface PaginationRequest {
  pageNumber: number; // default: 1
  pageSize: number;   // default: 10
}
```

### Enumerations
```typescript
enum CandidateStatus {
  Detected = 0,  // Freshly extracted from GROBID
  Rejected = 1,  // Manually rejected by reviewer
  Imported = 2,  // Imported
  Duplicate = 3, // Duplicate inside identification snapshot
  Processed = 4, // Processed (citation entity created - available in citation graph)
  Added = 5,     // Added to the Snapshot Identification Process -> Ready for Title/Abstract Screeming
}
```

---

## 1. Extract References
Starts the automated reference extraction process for a specific paper.

- **Method**: `POST`
- **Route**: `/api/review-processes/{processId}/papers/{paperId}/extract-references`
- **Auth**: Required (Bearer Token)

### Request
- **Path Params**:
  - `processId: string` (UUID) - ID of the Review Process.
  - `paperId: string` (UUID) - ID of the source paper to extract from.

### Response
- **Status**: 200 OK
- **Body**: [ApiResponse](file:///d:/Capstone-project/be/SRSS/Shared/Shared/Models/ApiResponse.cs#17-22)
  ```json
  {
    "isSuccess": true,
    "message": "References extraction started and saved to candidate pool."
  }
  ```

### Business Logic
- Downloads the PDF associated with the paper.
- Uses **GROBID** to extract bibliographic references.
- **Side Effect**: Deletes any previously extracted candidates for this paper that were still in "Detected" status and replaces them with fresh data.

---

## 2. Get All Candidate Papers
Fetches a paginated list of all candidate papers across the entire review process pool.

- **Method**: `GET`
- **Route**: `/api/review-processes/{processId}/candidate-papers`
- **Auth**: Required (Bearer Token)

### Request
- **Query Params**:
  - `searchTerm?: string` - Search in Title, Authors, DOI, or Source Paper Title.
  - `status?: CandidateStatus` - Filter by status code.
  - `year?: string` - Filter by publication year.
  - `pageNumber: number`
  - `pageSize: number`

### Response
- **Status**: 200 OK
- **Body**: `ApiResponse<PaginatedResponse<CandidatePaperDto>>`

---

## 3. Get Papers with Candidates Overview
Provides a list of source papers and how many candidates (references) were extracted from each.

- **Method**: `GET`
- **Route**: `/api/review-processes/{processId}/papers-with-candidates`
- **Auth**: Required (Bearer Token)

### Request
- **Query Params**:
  - `searchTerm?: string` - Search in Source Paper Title, Authors, or DOI.
  - `year?: string` - Filter by Source Paper Year.
  - `pageNumber: number`
  - `pageSize: number`

### Response
- **DTO**: [PaperWithCandidateDto](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/CandidatePaperService/DTOs/PaperWithCandidateDto.cs#3-17)
  ```typescript
  interface PaperWithCandidateDto {
    id: string;
    title: string;
    authors: string;
    publicationYear: string;
    doi: string;
    sourceType: string;
    source: string;
    importedAt: string; // ISO Date
    candidateCount: number;
  }
  ```

---

## 4. Get Candidates by Paper ID
View the specifically extracted candidates for one source paper.

- **Method**: `GET`
- **Route**: `/api/review-processes/{processId}/papers/{paperId}/candidates`
- **Auth**: Required (Bearer Token)

### Request
- **Path Params**:
  - `paperId: string` (UUID)
- **Query Params**: Same as "Get All Candidate Papers".

### Response
- **Status**: 200 OK
- **Body**: `ApiResponse<PaginatedResponse<CandidatePaperDto>>`

---

## 5. Select Candidates (Batch Inclusion)
Includes selected candidates into the SLR Identification dataset.

- **Method**: `POST`
- **Route**: `/api/review-processes/{processId}/candidate-papers/select`
- **Auth**: Required (Bearer Token)

### Request
- **Body**: [SelectCandidatePaperRequest](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/CandidatePaperService/DTOs/CandidatePaperDto.cs#39-43)
  ```typescript
  interface SelectCandidatePaperRequest {
    candidateIds: string[]; // List of UUIDs
  }
  ```

### Business Logic
- Only candidates in `Processed`, `Imported`, or [Duplicate](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/PaperService/PaperService.cs#343-444) status can be selected.
- If a candidate successfully resolves to a paper entity, it is added to the `IdentificationProcessPaper` snapshot.
- Automatically skips candidates that are already present in the identification snapshot to prevent duplicates.

---

## 6. Reject Candidates (Batch)
Manually rejects candidates from the pool.

- **Method**: `POST`
- **Route**: `/api/review-processes/{processId}/candidate-papers/reject`

### Request
- **Body**: [RejectCandidatePaperRequest](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/CandidatePaperService/DTOs/CandidatePaperDto.cs#44-48)
  ```typescript
  interface RejectCandidatePaperRequest {
    candidateIds: string[];
  }
  ```

---

## Frontend Integration Tips

### Data Types (Reference)
```typescript
interface CandidatePaperDto {
  candidateId: string;
  originPaperId: string;      // The source paper this reference came from
  originPaperTitle: string;
  title: string;
  authors: string;
  publicationYear: string;
  doi: string;
  status: CandidateStatus;
  statusText: string;
  confidenceScore: number;    // Extraction quality (0-1)
}
```

### Best Practices
1. **Extraction Loading State**: Since `extract-references` can take several seconds (PDF download + GROBID processing), show a full-page loading overlay or a background progress indicator.
2. **Selection Logic**: Always check `status` before enabling the "Select" button. Users cannot select "Detected" candidates until they are "Processed" (usually happens automatically in the background).
3. **Filtering**: The `searchTerm` is high-performance and searches across multiple fields. Use it for a "Global Search" experience in the candidate pool.
4. **Error Handling**: Use the `ApiResponse.message` for toast notifications. If `isSuccess` is false, check `errors` array for field-specific validation.

### Example API Client (Axios)
```typescript
const getCandidates = async (processId: string, page = 1) => {
  const response = await axios.get<ApiResponse<PaginatedResponse<CandidatePaperDto>>>(
    `/api/review-processes/${processId}/candidate-papers`,
    { params: { pageNumber: page, pageSize: 20 } }
  );
  return response.data;
};
```
