# ChecklistController API Contract

Source controller: [ChecklistController.cs](../Controllers/ChecklistController.cs)

This document is written for frontend integration. All JSON responses are wrapped by the shared API envelope unless an endpoint returns a file.

## Common Conventions

### Auth / Headers

- The controller does not declare `[Authorize]` directly, so there is no endpoint-specific auth attribute visible in this class.
- In practice, JWT auth can be enforced globally by the app. Frontend should send `Authorization: Bearer <token>` unless your deployment explicitly allows anonymous access.
- JSON requests should include `Content-Type: application/json`.

### Response Envelope

Most endpoints return `Shared.Models.ApiResponse<T>`.

```ts
interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  errors?: ApiError[] | null;
  data?: T | null;
}

interface ApiError {
  code: string;
  message: string;
}
```

### File Downloads

The report endpoint returns a raw file response, not an `ApiResponse` envelope.

## Core DTOs (Current)

```ts
interface ChecklistTemplateSummaryDto {
  id: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  version: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ChecklistTemplateSectionDto {
  id: string;
  templateId: string;
  name: string;
  description?: string | null;
  order: number;
  sectionNumber: string;
  items: ChecklistItemTemplateDto[]; // root items, each may contain children
}

interface ChecklistItemTemplateDto {
  id: string;
  templateId: string;
  sectionId?: string | null;
  parentId?: string | null;
  itemNumber: string;
  section: string;
  topic: string;
  description: string;
  order: number;
  isRequired: boolean;
  hasLocationField: boolean;
  isSectionHeaderOnly: boolean;
  hasChildren: boolean;
  canRespond: boolean;
  defaultSampleAnswer?: string | null;
  children: ChecklistItemTemplateDto[];
}

interface ChecklistTemplateDetailDto {
  id: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
  sections: ChecklistTemplateSectionDto[]; // preferred for UI rendering
  items: ChecklistItemTemplateDto[]; // flat compatibility view
}

interface CreateChecklistTemplateDto {
  name: string;
  description?: string | null;
  version: string;
  sections: CreateChecklistSectionTemplateDto[]; // preferred new flow
  items: CreateChecklistItemTemplateDto[]; // legacy compatibility flow
}

interface CreateChecklistSectionTemplateDto {
  name: string;
  description?: string | null;
  order: number;
  sectionNumber?: string | null;
  items: CreateChecklistItemTemplateDto[];
}

interface CreateChecklistItemTemplateDto {
  itemNumber?: string | null; // optional, auto-generated if missing
  section: string; // used in legacy flow
  topic: string;
  description: string;
  order: number;
  isRequired: boolean;
  hasLocationField: boolean;
  isSectionHeaderOnly: boolean;
  defaultSampleAnswer?: string | null;
  parentItemNumber?: string | null; // used in legacy flow
  subItems: CreateChecklistItemTemplateDto[];
}

interface CloneChecklistRequestDto {
  templateId: string;
}

interface UpdateChecklistItemDto {
  location?: string | null;
}

interface ChecklistItemResponseDto {
  itemTemplateId: string;
  responseId?: string | null;
  sectionId?: string | null;
  parentId?: string | null;
  itemNumber: string;
  section: string;
  topic: string;
  description: string;
  order: number;
  isRequired: boolean;
  hasLocationField: boolean;
  isSectionHeaderOnly: boolean;
  hasChildren: boolean;
  canRespond: boolean;
  children: ChecklistItemResponseDto[];
  location?: string | null;
  isReported: boolean;
  lastUpdatedAt?: string | null;
}

interface ChecklistSectionDto {
  sectionId?: string | null;
  sectionNumber: string;
  section: string;
  description?: string | null;
  order: number;
  items: ChecklistItemResponseDto[];
}

interface ReviewChecklistSummaryDto {
  reviewChecklistId: string;
  reviewId: string;
  reviewTitle: string;
  templateId: string;
  templateName: string;
  isCompleted: boolean;
  completionPercentage: number;
  itemCount: number;
  lastUpdatedAt: string;
}

interface ReviewChecklistDto {
  reviewChecklistId: string;
  reviewId: string;
  reviewTitle: string;
  templateId: string;
  templateName: string;
  isCompleted: boolean;
  completionPercentage: number;
  lastUpdatedAt: string;
  sections: ChecklistSectionDto[];
  items: ChecklistItemResponseDto[];
}

interface ChecklistCompletionDto {
  reviewChecklistId: string;
  completionPercentage: number;
  isCompleted: boolean;
}

interface GenerateReportRequest {
  includeOnlyCompletedItems: boolean;
}
```

## Endpoints

### 1) List checklist templates

**Method:** `GET`

**Route:** `/api/checklist/templates`

**Purpose:** Returns checklist template summaries.

#### Request

- Query:
  - `isSystem?: boolean`

#### Response

- `200 OK`
- `ApiResponse<ChecklistTemplateSummaryDto[]>`

#### Notes

- Summary only, no section/item tree.
- Use for template picker and management list.

---

### 2) Get checklist template by id

**Method:** `GET`

**Route:** `/api/checklist/templates/{id}`

**Purpose:** Returns one template with section hierarchy and item tree metadata.

#### Response

- `200 OK` -> `ApiResponse<ChecklistTemplateDetailDto>`
- `404 Not Found`

#### Notes

- `sections` is the preferred render model for frontend.
- `items` remains available as flat compatibility view.
- Use `canRespond` to decide whether an item is editable.

---

### 3) Create custom template

**Method:** `POST`

**Route:** `/api/checklist/templates`

**Purpose:** Creates a custom template.

#### Request

- Body: `CreateChecklistTemplateDto`
- Preferred new flow:
  - `sections` contains section objects.
  - each section has root `items`.
  - each item can contain `subItems` recursively.
- Legacy compatibility flow:
  - `items` with `parentItemNumber` and optional `section` is still accepted.

#### Validation / Behavior

- `name` is required.
- At least one checklist item is required.
- `topic` and `description` are required for each item.
- Item numbers must be unique per template.
- If `itemNumber` is omitted, backend auto-generates:
  - root items: `1`, `2`, `3`, ...
  - sub-items: `<parent>.1`, `<parent>.2`, ...
- Parent/grouping items are non-response:
  - `isSectionHeaderOnly = true`
  - response fields are disabled in later checklist usage.

#### Response

- `201 Created` -> `ApiResponse<ChecklistTemplateDetailDto>`
- `400 Bad Request` for invalid payload/hierarchy

---

### 4) Clone template to review checklist

**Method:** `POST`

**Route:** `/api/reviews/{reviewId}/checklist`

**Purpose:** Creates a review checklist instance by cloning a template.

#### Request

- Body: `CloneChecklistRequestDto`

#### Response

- `201 Created` -> `ApiResponse<ReviewChecklistDto>`
- `400 Bad Request` for invalid template/review or duplicate clone

#### Notes

- Responses are created only for eligible leaf items (`canRespond = true`).
- Group/header or parent items are not response targets.

---

### 5) Get checklist list for a review

**Method:** `GET`

**Route:** `/api/reviews/{reviewId}/checklist`

**Purpose:** Returns checklist instances under a review.

#### Response

- `200 OK` -> `ApiResponse<ReviewChecklistSummaryDto[]>`

---

### 6) Get checklist details by checklist id

**Method:** `GET`

**Route:** `/api/checklist/{checkListId}`

**Purpose:** Returns one review checklist with grouped and flat item views.

#### Response

- `200 OK` -> `ApiResponse<ReviewChecklistDto>`
- `404 Not Found`

#### Notes

- `sections` includes section metadata (`sectionId`, `sectionNumber`, `description`, `order`).
- `items` includes `canRespond`, hierarchy markers (`parentId`, `hasChildren`, `isSectionHeaderOnly`), and recursive `children` for UI tree rendering.

---

### 7) Update one checklist item response

**Method:** `PUT`

**Route:** `/api/checklist/{checkListId}/items/{itemId}`

**Purpose:** Saves one response row for one checklist item.

#### Request

- Body: `UpdateChecklistItemDto`

#### Response

- `200 OK` -> `ApiResponse<ChecklistItemResponseDto>`
- `404 Not Found` if checklist does not exist
- Error when item is invalid/non-editable

#### Critical Rule

- Only leaf items can be updated.
- Update is rejected for:
  - `isSectionHeaderOnly == true`
  - items that have children

#### Notes

- Backend recalculates completion after each update.

---

### 8) Get checklist completion

**Method:** `GET`

**Route:** `/api/checklist/{checkListId}/completion`

**Purpose:** Returns completion status for a review checklist.

#### Response

- `200 OK` -> `ApiResponse<ChecklistCompletionDto>`
- `404 Not Found`

#### Completion Rule

- Completion is calculated using only response-eligible leaf items.

---

### 9) Generate checklist report

**Method:** `POST`

**Route:** `/api/checklist/{checkListId}/generate-report`

**Purpose:** Generates a Word `.docx` checklist report.

#### Request

- Body: `GenerateReportRequest`

#### Response

- `200 OK` with file payload
- MIME: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- filename: `checklist-report-{checkListId}.docx`

---

## Frontend Integration Summary

- Render template details from `sections` first, not from flat `items`.
- Use `canRespond` to enable/disable editable controls.
- Show group/header items in UI, but do not send update requests for them.
- Keep item state keyed by `itemTemplateId`.
- Re-fetch completion or trust completion returned after successful updates.
- Section names in seeded PRISMA data are UI-style labels:
  - Title, Abstract, Introduction, Methods, Results, Discussion, Other information.

## Common Pitfalls

- Cloning the same template twice for one review is rejected.
- Updating a non-leaf item is rejected.
- Item number text is display-oriented; hierarchy logic should use parent relationships (`parentId`, tree structure).
- For create-template payloads, avoid duplicate item numbers.

## Suggested UI Flow

1. `GET /api/checklist/templates`
2. select template
3. `POST /api/reviews/{reviewId}/checklist`
4. `GET /api/checklist/{checkListId}`
5. edit only items where `canRespond === true`
6. `PUT /api/checklist/{checkListId}/items/{itemId}` per edited row
7. `GET /api/checklist/{checkListId}/completion`
8. `POST /api/checklist/{checkListId}/generate-report`
