# API Documentation: Search Execution Management

This document provides technical specifications for managing Search Executions within an Identification Process.

---

## 1. Global Response Format
All responses follow the standardized `ApiResponse<T>` structure:
```typescript
interface ApiResponse<T = any> {
  isSuccess: boolean;
  message: string;
  data: T | null;
  errors: ApiError[] | null;
}
```

---

## 2. API Endpoints

### 2.1 Create Search Execution
`POST /api/identification-processes/{identificationProcessId}/search-executions`

**Purpose**: Records a new search execution (e.g., a specific search run on a database like Scopus).

**Request Details**:
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Params**:
    - `identificationProcessId` (Guid, required): The ID of the Identification Process.
- **Request Body**: `CreateSearchExecutionRequest`

**Validation Rules**:
- `identificationProcessId`: Must match the ID in the URL.
- `searchSourceId`: Required. Must reference a valid `SearchSource` defined in the protocol.
- `type`: Numeric enum value (0: Database Search, 1: Manual Search, etc.)

**Response Details**:
- **Success (201 Created)**: `ApiResponse<SearchExecutionResponse>`

---

### 2.2 Update Search Execution
`PUT /api/search-executions/{id}`

**Purpose**: Updates the details of an existing search execution.

**Request Details**:
- **Path Params**:
    - `id` (Guid, required): The execution ID.
- **Request Body**: `UpdateSearchExecutionRequest`

**Response Details**:
- **Success (200 OK)**: `ApiResponse<SearchExecutionResponse>`

---

### 2.3 Get Search Executions by Process ID
`GET /api/identification-processes/{identificationProcessId}/search-executions`

**Purpose**: Lists all search executions for a specific process.

---

### 2.4 Delete Search Execution
`DELETE /api/search-executions/{id}`

**Purpose**: Removes a search execution record.

---

## 3. Business Logic Summary
- **Source Selection**: The frontend must retrieve valid `SearchSource` options from the protocol level. Users cannot enter a free-text source name; they must select from predefined project sources.
- **Auto-Mapping**: While the request uses `searchSourceId`, the response will include a `searchSource` string (the display name) for convenient UI rendering.
- **Timeline**: `executedAt` is automatically set to the current UTC timestamp upon creation.

---

## 4. TypeScript Interfaces

```typescript
export enum SearchExecutionType {
    DatabaseSearch = 0,
    ManualSearch = 1,
    Other = 2
}

export interface CreateSearchExecutionRequest {
  identificationProcessId: string;
  /** Selection from Protocol-level Search Sources */
  searchSourceId: string;
  searchQuery?: string;
  type: SearchExecutionType;
  notes?: string;
}

export interface UpdateSearchExecutionRequest {
  id: string;
  searchSourceId?: string;
  searchQuery?: string;
  type?: SearchExecutionType;
  notes?: string;
}

export interface SearchExecutionResponse {
  id: string;
  identificationProcessId: string;
  /** Display name of the source */
  searchSource: string;
  searchQuery: string | null;
  executedAt: string;
  resultCount: number;
  type: SearchExecutionType;
  typeText: string;
  notes: string | null;
  importBatchCount: number;
}
```
