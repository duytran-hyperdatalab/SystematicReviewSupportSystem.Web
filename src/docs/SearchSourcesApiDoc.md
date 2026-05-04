# API Documentation: Search Sources Integration

This document provides the technical specifications for integrating with the Search Sources endpoints within the Systematic Review Support System.

## 1. Bulk Upsert Search Sources

### Basic Info
- **Method**: `POST`
- **Full Route**: `/api/search-sources/bulk`
- **Description**: Allows bulk creation or updating of search sources (e.g., PubMed, Scopus, IEEE) for a specific project.

### Request Details
- **Headers**: 
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
- **Request Body Schema (`SearchSourceDto[]`)**:
```typescript
interface SearchSourceDto {
  /** 
   * Unique ID of the search source. 
   * - Leave null/undefined for new sources.
   * - Provide existing ID to update.
   */
  sourceId?: string; 
  
  /** 
   * ID of the template/master source if applicable (e.g., from a predefined list).
   * If provided and 'name' is empty, the system will use the master source's name.
   */
  masterSourceId?: string;

  /** ID of the project this source belongs to. (Required) */
  projectId: string;

  /** Display name of the source (e.g., "PubMed"). (Required, Max 500 chars) */
  name: string;
}
```

### Response Details
- **Success Response (`ApiResponse<SearchSourceDto[]>`)**:
```typescript
interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors?: ApiError[];
}

interface ApiError {
  code: string;
  message: string;
}
```
- **HTTP Status Codes**:
  - `200 OK`: Successfully saved sources.
  - `401 Unauthorized`: Token is missing or invalid.
  - `403 Forbidden`: User is not the Project Leader.
  - `400 Bad Request`: Validation failed or MasterSourceId not found.

---

## 2. Get Search Sources by Project

### Basic Info
- **Method**: `GET`
- **Full Route**: `/api/projects/{projectId}/sources`
- **Description**: Retrieves all search sources associated with a specific project.

### Request Details
- **Headers**: 
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
- **Path Parameters**:
  - `projectId` (UUID): The unique identifier of the project.

### Response Details
- **Success Response (`ApiResponse<SearchSourceDto[]>`)**:
  - Returns a list of `SearchSourceDto` objects.
- **HTTP Status Codes**:
  - `200 OK`: Success.
  - `401 Unauthorized`: Token is missing or invalid.

---

## Business Logic Summary

1.  **Project Leader Restriction**: Only the **Project Leader** can bulk upsert sources. The system checks if the authenticated user has the leader role for the specific `projectId` provided in the request.
2.  **Upsert Logic**: 
    - If `sourceId` is provided and exists in the database, the record is **updated**.
    - If `sourceId` is null, empty, or doesn't exist, a **new record** is created.
3.  **Master Source Integration**: If you provide a `masterSourceId`, the system validates its existence. If you leave the `name` field empty but provide a `masterSourceId`, the system will automatically fill the name from the master record.
4.  **No Monolith**: This service only manages "Search Sources". It does not handle the actual search results or papers here; it defines *where* you are searching.

---

## Frontend Integration Notes

-   **When to call**: 
    - `GET` should be called when initializing the Search Strategy configuration page.
    - `POST` should be called when the user clicks "Save" after adding/editing/removing sources in a list.
-   **Loading States**: Since bulk upsert can involve multiple database operations, show a global loading overlay to prevent concurrent edits.
-   **Error Handling**: 
    - If a `403 Forbidden` occurs, redirect or show a "Read-only" view as the user isn't the leader.
    - `400 Bad Request` messages will often contain specific validation errors for the `name` field.
-   **Optimization**: The bulk API returns the saved entities. You should update your local state/store with the returned data (especially for new items that now have a `sourceId`).

---

## Ready-to-Use Frontend Types & Examples

### TypeScript Interfaces
```typescript
export interface SearchSource {
  sourceId?: string;
  masterSourceId?: string;
  projectId: string;
  name: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors?: Array<{ code: string; message: string }>;
}
```

### Example API Call (Using Fetch)
```typescript
async function saveSources(projectId: string, sources: SearchSource[]) {
  const response = await fetch('/api/search-sources/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(sources)
  });
  
  const result: ApiResponse<SearchSource[]> = await response.json();
  
  if (result.isSuccess) {
    console.log('Sources saved:', result.data);
    return result.data;
  } else {
    throw new Error(result.message);
  }
}
```
