# Get Data Extraction Templates API Documentation

This document covers two endpoints for retrieving Data Extraction Templates:
1. `GetTemplatesByProtocolId`: Retrieve all extraction templates for a specific protocol.
2. `GetTemplateById`: Retrieve a single extraction template by its ID.

---

## 1. Get Templates By Protocol ID

### Basic Info
- **Method:** `GET`
- **Route:** `/api/data-extraction/protocol/{protocolId}/templates`
- **Purpose:** Retrieves a list of all data extraction templates associated with a specific protocol, including their full hierarchical tree structure (Sections -> Fields -> Sub-Fields & Options).

### Request Details
- **Headers:** `Authorization: Bearer <token>` (if authentication is required by your global middleware).
- **Path params:** 
  - `protocolId` (string, UUID) - The unique identifier of the protocol.
- **Query params:** None.
- **Request body:** None.
- **Validation rules:** `protocolId` must be a valid GUID/UUID format.

### Response Details
- **Success response schema:** `ApiResponse<ExtractionTemplateDto[]>`
- **Error response schema:** Standard `ApiResponse` with error messages.
- **HTTP status codes used:** 
  - 200 OK (Success)
  - 400 Bad Request (Invalid GUID format)
  - 401/403 (Auth issues if applied)
  - 500 Internal Server Error
- **Important response notes:** The response contains the full nested tree structure of sections, fields, sub-fields, and options.

---

## 2. Get Template By ID

### Basic Info
- **Method:** `GET`
- **Route:** `/api/data-extraction/templates/{templateId}`
- **Purpose:** Retrieves the full details of a single extraction template by its ID, complete with its hierarchical tree structure.

### Request Details
- **Headers:** `Authorization: Bearer <token>` (if authentication is required).
- **Path params:** 
  - `templateId` (string, UUID) - The unique identifier of the template.
- **Query params:** None.
- **Request body:** None.
- **Validation rules:** `templateId` must be a valid GUID/UUID format.

### Response Details
- **Success response schema:** `ApiResponse<ExtractionTemplateDto>`
- **Error response schema:** Standard `ApiResponse<null>`.
- **HTTP status codes used:** 
  - 200 OK (Success)
  - 400 Bad Request
  - 404 Not Found (If the template doesn't exist, mapped from KeyNotFoundException)
  - 500 Internal Server Error

---

## Business Logic Summary
- **What the API actually does:** These endpoints query the database for `ExtractionTemplate` and eagerly load the entire hierarchy (Template -> Sections -> Fields -> Options & SubFields) to reconstruct the nested DTO structure.
- **Important conditions FE must know:** The return structure reflects the new hierarchy. Previously, fields were flat under the template. Now, they are grouped under `Sections`. You must iterate over `sections` first.
- **Side effects:** None. (Read-only endpoints)
- **Caching/Timing:** No explicit caching implemented. Eager loading complex trees might take a fraction of a second on very large templates.
- **Pagination/Filtering:** No pagination. All templates for a protocol or the full tree for a single template are returned at once.

---

## Frontend Integration Notes
- **When FE should call this API:** 
  - Call `/protocol/{protocolId}/templates` when loading the Extraction Template list/management screen for a certain protocol.
  - Call `/templates/{templateId}` when opening a specific template to view or edit its structure (e.g., in a form builder UI).
- **Common pitfalls:** 
  - Expecting `fields` to be a direct property of the template. You must iterate through `sections` first, then access `fields` inside each section.
  - Ensure recursive rendering for fields, as `SubFields` can theoretically be deeply nested (though practically mostly 1-2 levels).
- **Loading/Error handling:** Show a skeleton loader while fetching the tree. Handle 404 gracefully if a template was deleted by someone else.

---

## Generate Ready-to-Use FE Types

```typescript
// Standard API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[]; // Or your standard error format
}

// Main Template Interface
export interface ExtractionTemplateDto {
  templateId?: string; // UUID
  protocolId: string; // UUID
  name: string;
  description?: string;
  sections: ExtractionSectionDto[]; // Nested sections
}

// Section Interface
export interface ExtractionSectionDto {
  sectionId?: string; // UUID
  name: string;
  description?: string;
  sectionType: number; // 0 = FlatForm, 1 = MatrixGrid
  orderIndex: number;
  fields: ExtractionFieldDto[]; // Nested fields
}

// Field Interface (Recursive)
export interface ExtractionFieldDto {
  fieldId?: string; // UUID
  sectionId?: string; // UUID
  parentFieldId?: string; // UUID
  name: string;
  instruction?: string;
  fieldType: number; // 0=Text, 1=Integer, 2=Decimal, 3=Boolean, 4=SingleSelect, 5=MultiSelect
  isRequired: boolean;
  orderIndex: number;
  options: FieldOptionDto[];
  subFields: ExtractionFieldDto[]; // Recursive nested sub-fields
}

// Field Option Interface
export interface FieldOptionDto {
  optionId?: string; // UUID
  fieldId?: string; // UUID
  value: string;
  displayOrder: number;
}
```

### Example API Calls (using Axios)

```typescript
import axios from 'axios';

const api = axios.create({ baseURL: '/api/data-extraction' });

// Get all templates for a protocol
export const getTemplatesByProtocolId = async (protocolId: string): Promise<ExtractionTemplateDto[]> => {
  const response = await api.get<ApiResponse<ExtractionTemplateDto[]>>(`/protocol/${protocolId}/templates`);
  return response.data.data;
};

// Get a single template by ID
export const getTemplateById = async (templateId: string): Promise<ExtractionTemplateDto> => {
  const response = await api.get<ApiResponse<ExtractionTemplateDto>>(`/templates/${templateId}`);
  return response.data.data;
};
```
