# API Documentation: Search Strategy - Search Source Management

This document provides technical specifications for managing Search Sources within a Review Protocol.

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

### 2.1 Bulk Upsert Search Sources
`POST /api/search-strategies/search-sources/bulk`

**Purpose**: Performs a bulk Create or Update operation for multiple search sources associated with a protocol.

**Request Details**:
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**: `SearchSourceDto[]` (Array of objects)

**Validation Rules**:
- `protocolId`: Required.
- `masterSourceId`: Optional. If provided, must exist in the Master Search Sources table.
- `name`: Required. However, if `masterSourceId` is provided and `name` is empty, the system will automatically use the name from the Master Search Source.
- `sourceId`: Optional. If provided, the system attempts to update the existing source. If null/empty, a new source is created.

**Response Details**:
- **Success (200 OK)**: `ApiResponse<SearchSourceDto[]>` - Returns the list of created/updated sources with their assigned IDs.

---

### 2.2 Get Search Sources by Protocol ID
`GET /api/search-strategies/protocol/{protocolId}/sources`

**Purpose**: Retrieves all search sources defined for a specific protocol.

**Request Details**:
- **Path Params**:
    - `protocolId` (Guid, required): The unique identifier of the protocol.

**Response Details**:
- **Success (200 OK)**: `ApiResponse<SearchSourceDto[]>`

---

## 3. Business Logic Summary
- **Smart Creation**: When a `masterSourceId` is provided, the project-specific search source is automatically linked to global master data (e.g., Scopus, PubMed).
- **Naming Priority**: The `name` field allows for custom naming. If left blank while a master source is selected, the official master name is used as a default.
- **Bulk Operation**: This endpoint is transactional; it allows designers to save their entire search strategy (multiple databases) in a single network request.

---

## 4. TypeScript Interfaces

```typescript
export interface SearchSourceDto {
  /** Internal ID of the source (null for new items) */
  sourceId?: string;
  
  /** Reference to global Master Search Source (recommended) */
  masterSourceId?: string;
  
  /** ID of the Protocol this source belongs to */
  protocolId: string;
  
  /** Name of the source (e.g., "Scopus", "Manual Search") */
  name: string;
}

// Example API use
const saveSources = async (sources: SearchSourceDto[]) => {
    const response = await api.post<ApiResponse<SearchSourceDto[]>>(
        `/api/search-strategies/search-sources/bulk`, 
        sources
    );
    return response.data.data;
}
```
