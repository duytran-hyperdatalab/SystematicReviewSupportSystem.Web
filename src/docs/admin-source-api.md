# API Documentation: Admin Master Search Source Management

This document provides complete technical specifications for the Admin Master Search Source API. These endpoints are designed for system administrators to manage the global list of bibliographic databases and search sources available in the system.

## 1. Global Response Format
All responses from the backend follow this standardized structure:

```typescript
interface ApiResponse<T = any> {
  isSuccess: boolean;
  message: string;
  data: T | null;
  errors: ApiError[] | null;
}

interface ApiError {
  code: string;
  message: string;
}
```

---

## 2. API Endpoints

### 2.0 Get Available Master Sources (Public/User)
`GET /api/master-sources/available`

**Purpose**: Retrieves a simplified list of all ACTIVE master search sources. This is intended for regular users to select sources during review planning.

**Request Details**:
- **Headers**: `Authorization: Bearer <JWT_TOKEN>` (Common User role)

**Response Details**:
- **Success (200 OK)**: `ApiResponse<AvailableMasterSearchSourceResponse[]>`

### 2.1 Get All Master Sources (Admin)
`GET /api/admin/master-sources`

**Purpose**: Retrieves a list of all master search sources with optional filtering.

**Request Details**:
- **Headers**: `Authorization: Bearer <JWT_TOKEN>` (Admin role required)
- **Query Params**:
    - `isActive` (boolean, optional): Filter by active/inactive status.
    - `sourceName` (string, optional): Search by name (case-insensitive, partial match).

**Response Details**:
- **Success (200 OK)**: `ApiResponse<MasterSearchSourceResponse[]>`

---

### 2.2 Get Master Source by ID
`GET /api/admin/master-sources/{id}`

**Purpose**: Retrieves full details for a specific master source.

**Request Details**:
- **Path Params**:
    - `id` (Guid, required): The unique identifier of the source.

**Response Details**:
- **Success (200 OK)**: `ApiResponse<MasterSearchSourceResponse>`
- **Not Found (404)**: If ID doesn't exist.

---

### 2.3 Create Master Source
`POST /api/admin/master-sources`

**Purpose**: Adds a new master source to the system.

**Request Details**:
- **Request Body**: `CreateMasterSearchSourceRequest`
- **Validation Rules**:
    - `sourceName`: Required, max 255 chars. Must be unique globally.
    - `baseUrl`: Max 1000 chars, optional.

**Response Details**:
- **Success (200 OK)**: `ApiResponse<MasterSearchSourceResponse>`
- **Conflict (409)**: If the name already exists.

---

### 2.4 Update Master Source
`PUT /api/admin/master-sources/{id}`

**Purpose**: Updates an existing master source.

**Request Details**:
- **Path Params**:
    - `id` (Guid, required): The source ID.
- **Request Body**: `UpdateMasterSearchSourceRequest`

**Response Details**:
- **Success (200 OK)**: `ApiResponse<MasterSearchSourceResponse>`

---

### 2.5 Toggle Status
`PATCH /api/admin/master-sources/{id}/status`

**Purpose**: Toggles the `isActive` state of a source (Active <-> Inactive).

**Request Details**:
- **Path Params**:
    - `id` (Guid, required): The source ID.

**Response Details**:
- **Success (200 OK)**: `ApiResponse<MasterSearchSourceResponse>`

---

### 2.6 Get Usage Count
`GET /api/admin/master-sources/{id}/usage`

**Purpose**: Returns the number of project-specific `SearchSource` entities currently referencing this master source.

**Request Details**:
- **Path Params**:
    - `id` (Guid, required): The source ID.

**Response Details**:
- **Success (200 OK)**: `ApiResponse<number>` (The `data` field contains the count).

---

### 2.7 Delete Master Source
`DELETE /api/admin/master-sources/{id}`

**Purpose**: Removes a master source from the system.

**Request Details**:
- **Path Params**:
    - `id` (Guid, required): The source ID.

**Response Details**:
- **Success (200 OK)**: `ApiResponse`
- **Invalid Operation (400)**: If the source is in use (Usage Count > 0).

---

## 3. Business Logic Summary
- **Uniqueness**: The system prevents duplicate names for Master Sources.
- **Dependency Protection**: A Master Source cannot be deleted if it is referenced by any project. Use the `/usage` endpoint to check dependencies before attempting deletion.
- **Soft Control**: Setting `isActive` to `false` prevents users from selecting this source for *new* projects, but doesn't affect existing projects using it.

## 4. Frontend Integration Notes
- **Confirmation Flow**: When deleting, it's recommended to call the `/usage` endpoint first. If usage > 0, disable the delete button or show an informative message.
- **Error Handling**: Use the `errors` array in `ApiResponse` to display field-level validation messages.

## 5. TypeScript Interfaces

```typescript
export interface ApiResponse<T = any> {
  isSuccess: boolean;
  message: string;
  data: T | null;
  errors: ApiError[] | null;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface MasterSearchSourceResponse {
  id: string;
  sourceName: string;
  baseUrl: string | null;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  modifiedAt: string;
}

export interface CreateMasterSearchSourceRequest {
  sourceName: string;
  baseUrl?: string;
  isActive?: boolean;
}

export interface UpdateMasterSearchSourceRequest {
  sourceName: string;
  baseUrl?: string;
  isActive: boolean;
}

// Example API use with axios
const getSources = async (name?: string) => {
    const response = await axios.get<ApiResponse<MasterSearchSourceResponse[]>>(
        `/api/admin/master-sources`, 
        { params: { sourceName: name } }
    );
    return response.data.data;
}
```
