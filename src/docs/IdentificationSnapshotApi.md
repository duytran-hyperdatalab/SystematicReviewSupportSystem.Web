# 📄 API Documentation: Identification Snapshot Flow

This document provides the integration details for the **User-Built Identification Snapshot** workflow. The system has moved from an automatic snapshot generation to a manual process where users select valid papers after deduplication to form the screening dataset.

---

## 1. Get Ready Papers for Snapshot
**Purpose**: Retrieve the list of "unique" papers in an identification process that are eligible for the snapshot.

### Basic Info
- **Method**: `GET`
- **Route**: `/api/identification-processes/{id}/ready-papers`
- **Description**: Returns all papers imported into this process that are NOT duplicates (confirmed or pending) and have NOT yet been added to the snapshot.

### Request Details
- **Path Parameters**:
  - `id` (string/UUID): The Identification Process ID.
- **Query Parameters**:
  - `search` (optional, string): Filters by Title, DOI, or Authors.
  - `year` (optional, int): Filters by Publication Year.
  - `pageNumber` (default: 1): For pagination.
  - `pageSize` (default: 10): Number of items per page.

### Response Details
- **Success Response (200 OK)**:
```typescript
interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaperResponse {
  id: string;
  title: string;
  authors: string | null;
  abstract: string | null;
  doi: string | null;
  publicationYear: string | null;
  journal: string | null;
  source: string | null;
  importedAt: string; // ISO Date String
  // ... and other bibliographic fields
}
```

### Business Logic Summary
- **Visibility**: This API is high-performance because it uses the server-side deduplication resolution logic.
- **Exclusion Logic**: It automatically hides papers marked as duplicates (`CANCEL`) or those still waiting for a user decision (`Pending`). It also hides papers already in the current snapshot to avoid redundant selection.
- **Sorting**: Returns items ordered by `CreatedAt DESC`.

### Frontend Integration Notes
- **When to call**: Call this when the user is in the "Build Dataset" or "Add to Snapshot" view of the Identification Workspace.
- **Empty State**: An empty list means all unique papers have already been added to the snapshot or there are no valid papers yet.

---

## 2. Add Papers to Identification Snapshot
**Purpose**: Manually select specific papers and freeze them into the snapshot (Dataset for Screening).

### Basic Info
- **Method**: `POST`
- **Route**: `/api/identification-processes/{id}/snapshot`
- **Description**: Appends a list of paper IDs to the process snapshot.

### Request Details
- **Body Schema**:
```typescript
interface AddPapersToSnapshotRequest {
  paperIds: string[]; // UUIDs of papers to add
}
```

### Response Details
- **Success Response (200 OK)**:
```typescript
{
  "isSuccess": true,
  "message": "Papers added to snapshot successfully."
}
```

### Business Logic Summary
- **Append-Only**: This is an append operation. If some IDs were already in the snapshot, they are ignored (no duplicates created).
- **Immutable State**: Once a paper is in the snapshot, it is preserved even if the original record is modified later (bibliographic "freeze").
- **No Delete**: There is currently no endpoint to remove papers from the snapshot once added.

### Frontend Integration Notes
- **Bulk Selection**: Design your UI for multi-select (check-all on page or manually selecting rows).
- **Post-Action UX**: After a successful call, the "Ready Papers" list will automatically update (those papers will disappear from it) because of the exclusion logic.

---

## 3. Get Snapshot Papers
**Purpose**: View the frozen list of papers specifically selected for screening.

### Basic Info
- **Method**: `GET`
- **Route**: `/api/identification-processes/{id}/snapshot`
- **Description**: Returns exactly what is currently in the snapshot.

### Request Details
- **Path Parameters**:
  - `id` (string/UUID): The Identification Process ID.
- **Query Parameters**: Same as "Get Ready Papers" (`search`, `year`, `pageNumber`, `pageSize`).

### Response Details
- **Success Response (200 OK)**: same as `GET .../ready-papers`.

### Business Logic Summary
- **Source of Truth**: These are the ONLY papers that will be visible in the subsequent Screening (Study Selection) phase.
- **Pagination**: Standard behavior supported.

### Frontend Integration Notes
- **Progressive Building**: Users can import papers -> resolve duplicates -> add to snapshot -> import more -> add more. This API allows them to see the current sum of their work.

---

## 🚀 Ready-to-Use Code

### TypeScript Definitions
```typescript
export interface AddPapersToSnapshotRequest {
  paperIds: string[];
}

export interface PaperResponse {
  id: string;
  title: string;
  authors: string | null;
  abstract: string | null;
  doi: string | null;
  publicationYear: string | null;
  // ... other fields
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
```

### Axios Example Usage
```typescript
/**
 * Bulk add papers to the screening snapshot
 * @param identificationProcessId The process ID
 * @param paperIds List of UUIDs to append
 */
async function addSelectedToSnapshot(identificationProcessId: string, paperIds: string[]) {
  try {
    const response = await axios.post(`/api/identification-processes/${identificationProcessId}/snapshot`, {
      paperIds: paperIds
    });
    
    if (response.data.isSuccess) {
       toast.success("Successfully added papers to the screening dataset.");
       // Refresh the list logic
    }
  } catch (error) {
    console.error("Failed to update snapshot", error);
  }
}
```
