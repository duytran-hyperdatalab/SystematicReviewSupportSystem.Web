# Review Process - Selection & Management API

This document provides technical details for the Review Process management and paper selection APIs. These endpoints are critical for managing the lifecycle of a Systematic Literature Review (SLR) and populating screening libraries.

---

## 1. Get Review Processes by Project

### Basic Info
- **Method**: `GET`
- **Route**: `GET /api/projects/{projectId}/review-processes`
- **Purpose**: Retrieves a list of all review processes (phases) created for a specific project with high-level progress statistics.

### Request Details
- **Path Params**: 
  - `projectId` (string/UUID): The unique identifier of the project.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>` (if applicable).

### Response Details
- **Success Response Schema**: `ApiResponse<ReviewProcessSnapshotResponse[]>`
- **HTTP Status**: `200 OK`

```typescript
export interface ReviewProcessSnapshotResponse {
  processId: string;
  processName: string;
  statusText: string;     // e.g., "Pending", "InProgress", "Completed"
  startAt?: string;       // ISO Date string (nullable)
  completedAt?: string;   // ISO Date string (nullable)
  progressPercent: number;
  totalPapersImported: number;
  totalIncludedPapers: number;
  totalExcludedPapers: number;
}
```

### Business Logic Summary
- **Logic**: This endpoint is used for project dashboarding and overview. It aggregates counts from the paper pool and specific phase libraries.
- **Progress Calculation**: `progressPercent` reflects how many papers in this specific phase have reached a terminal decision (Included/Excluded) vs. Total.
- **Scope**: Returns all processes regardless of status (`Pending`, `InProgress`, etc.).

### Frontend Integration Notes
- **Call frequency**: When entering a project workspace or clicking the "Workflow/Phases" tab.
- **Performance**: This calculation can be slightly intensive; consider showing a spinner for the phase list.
- **Ordering**: Processes are typically returned in the order they were created or should be executed.

---

## 2. Add Selected Papers

### Basic Info
- **Method**: `POST`
- **Route**: `POST /api/review-processes/{reviewProcessId}/papers`
- **Purpose**: Manually adds a specific set of papers (by ID) from the project's paper pool into a specific Review Process.

### Request Details
- **Path Params**: 
  - `reviewProcessId` (string/UUID): The target review process ID.
- **Request Body**:
```typescript
export interface AddSelectedPapersRequest {
  paperIds: string[]; // List of Paper UUIDs to add
}
```

### Response Details
- **Success Response Schema**: `ApiResponse<AddPapersToReviewProcessResponse>`
- **HTTP Status**: `200 OK`

```typescript
export interface AddPapersToReviewProcessResponse {
  inserted: number;           // Total papers successfully added
  skippedAsDuplicate: number; // Papers already in this process
  reviewProcessSnapshot: {
    reviewProcessId: string;
    reviewProcessName: string;
    statusText: string;
    progressPercent: number;
  };
}
```

### Business Logic Summary
- **Validation**: The backend will only add papers that belong to the same project as the review process.
- **Idempotency**: If a paper is already in the process, it will be skipped (`skippedAsDuplicate` count will increment).
- **Side Effects**: Triggers an update to the process's internal counts and status if necessary.

### Frontend Integration Notes
- **Usage**: Used in the "Add Papers" modal or "Paper Selection" screen.
- **Update**: Use the returned `reviewProcessSnapshot` to update the global state or local UI counts immediately without refetching the whole list.

---

## 3. Add Papers from Filter Setting

### Basic Info
- **Method**: `POST`
- **Route**: `POST /api/review-processes/{processId}/papers/add-from-filter-setting`
- **Purpose**: Automates the selection of papers by using a saved Filter Setting. Any paper currently matching the filter in the project pool will be added to the process.

### Request Details
- **Path Params**: 
  - `processId` (string/UUID): The target review process identifier.
- **Request Body**:
```typescript
export interface AddFromFilterSettingRequest {
  filterSettingId: string; // The ID of the saved filter configuration
}
```

### Response Details
- **Success Response Schema**: `ApiResponse<AddPapersFromFilterResponse>`
- **HTTP Status**: `200 OK`
- **Errors**: `400 Bad Request` if "No papers matched" (Special case: check message string).

```typescript
export interface AddPapersFromFilterResponse {
  inserted: number;
  skippedAsDuplicate: number;
  matchedTotal: number; // Total papers matching the filter before insertion
  processSnapshot: {
    processId: string;
    processName: string;
    statusText: string;
    progressPercent: number;
    existingPaperIds: string[]; // IDs of papers now present in the process
  };
}
```

### Business Logic Summary
- **Logic**: This is a powerful bulk-add tool. It evaluates the dynamic filter (e.g., "All IEEE papers from 2024") and imports the resulting set.
- **Edge Case**: If the filter query returns 0 results, the API returns a 400 error with the message "No papers matched". FE should handle this as a validation warning rather than a system crash.

### Frontend Integration Notes
- **UX**: Show a list of saved filters to the user. On selection, call this API.
- **Feedback**: Since this can add hundreds of papers, providing a "Result Summary" (X added, Y skipped) is highly recommended.
- **Loading State**: This can take 1-3 seconds for large pools.

---

## Ready-to-Use FE Types (TypeScript)

```typescript
export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors: any;
}

// Get Processes Example
const fetchProcesses = async (projectId: string): Promise<ReviewProcessSnapshotResponse[]> => {
  const response = await fetch(`/api/projects/${projectId}/review-processes`);
  const result: ApiResponse<ReviewProcessSnapshotResponse[]> = await response.json();
  return result.data;
};

// Add papers by Selection Example
const addPapers = async (processId: string, ids: string[]) => {
  const response = await fetch(`/api/review-processes/${processId}/papers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paperIds: ids })
  });
  return await response.json();
};
```
