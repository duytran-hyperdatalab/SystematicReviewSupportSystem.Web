# ChecklistController API Contract

Source controller: [ChecklistController.cs](../Controllers/ChecklistController.cs)

This document is written for frontend integration. All responses shown below are wrapped by the shared API envelope unless the endpoint returns a file.

## Common Conventions

### Auth / Headers
- The controller does not declare `[Authorize]` directly, so there is no endpoint-specific auth attribute visible in the controller code.
- In practice, the application uses JWT authentication globally. Frontend should send an `Authorization: Bearer <token>` header unless your deployment explicitly allows anonymous access.
- Standard JSON requests should include `Content-Type: application/json`.

### Response Envelope
Most endpoints return `Shared.Models.ApiResponse<T>`.

TypeScript shape:
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
The report endpoint returns a raw file response, not an `ApiResponse` wrapper.

## Endpoints

### 1) List checklist templates
**Method:** `GET`

**Route:** `/api/checklist/templates`

**Purpose:** Returns all checklist templates, optionally filtered to system templates or custom templates.

#### Request Details
- Headers:
  - `Authorization: Bearer <token>` recommended
- Query params:
  - `isSystem?: boolean` - when `true`, returns only system templates; when `false`, returns only custom templates; when omitted, returns all templates.
- Path params: none
- Body: none

#### Response Details
Success response:
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

interface ApiResponseChecklistTemplateSummaryDtoArray extends ApiResponse<ChecklistTemplateSummaryDto[]> {}
```

Status codes used:
- `200 OK`

#### Business Logic Summary
- This endpoint does not return checklist item details, only a summary list.
- FE can use `isSystem=true` to show only official PRISMA templates.
- `itemCount` is useful for template cards.

#### Frontend Integration Notes
- Use this for template pickers and template management screens.
- The `isSystem` filter is the simplest way to split official vs custom templates.
- Empty array is a valid result; it does not mean an error.

---

### 2) Get checklist template by id
**Method:** `GET`

**Route:** `/api/checklist/templates/{id}`

**Purpose:** Returns one template with all of its item templates.

#### Request Details
- Headers:
  - `Authorization: Bearer <token>` recommended
- Path params:
  - `id: Guid` - template id
- Query params: none
- Body: none

#### Response Details
Success response:
```ts
interface ChecklistItemTemplateDto {
  id: string;
  templateId: string;
  parentId?: string | null;
  itemNumber: string;
  section: string;
  topic: string;
  description: string;
  order: number;
  isRequired: boolean;
  hasLocationField: boolean;
  defaultSampleAnswer?: string | null;
}

interface ChecklistTemplateDetailDto {
  id: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
  items: ChecklistItemTemplateDto[];
}

interface ApiResponseChecklistTemplateDetailDto extends ApiResponse<ChecklistTemplateDetailDto> {}
```

Status codes used:
- `200 OK`
- `404 Not Found` when the template does not exist

#### Business Logic Summary
- Returns the template in flat form, not as a nested tree.
- Hierarchy is represented by `parentId`.
- FE can rebuild nested sections/items using `parentId` if needed.

#### Frontend Integration Notes
- Use this when rendering a template detail page or preview.
- Sort by `order` and then `itemNumber` for display.
- A `parentId` indicates a sub-item such as `10a` under `10`.

---

### 3) Create custom template
**Method:** `POST`

**Route:** `/api/checklist/templates`

**Purpose:** Creates a user-defined checklist template.

#### Request Details
- Headers:
  - `Authorization: Bearer <token>` recommended
  - `Content-Type: application/json`
- Path params: none
- Query params: none
- Body schema:
```ts
interface CreateChecklistTemplateDto {
  name: string;
  description?: string | null;
  version: string;
  items: CreateChecklistItemTemplateDto[];
}

interface CreateChecklistItemTemplateDto {
  itemNumber: string;
  section: string;
  topic: string;
  description: string;
  order: number;
  isRequired: boolean;
  hasLocationField: boolean;
  defaultSampleAnswer?: string | null;
  parentItemNumber?: string | null;
}
```

Required vs optional:
- Required: `name`, `version`, `items`
- Each item requires `itemNumber`, `section`, `topic`, `description`, `order`
- `parentItemNumber` is optional and only used for hierarchy

Validation rules:
- `name` must not be empty
- `items` must contain at least one item
- `itemNumber`, `section`, `topic`, and `description` must not be empty for each item
- Duplicate `itemNumber` values are rejected
- If `parentItemNumber` is provided, it must match another item in the same request

#### Response Details
Success response:
```ts
interface ApiResponseChecklistTemplateDetailDto extends ApiResponse<ChecklistTemplateDetailDto> {}
```

Status codes used:
- `201 Created`
- `400 Bad Request` for invalid payload or invalid hierarchy

#### Business Logic Summary
- Creates a custom, non-system template.
- Items are stored in the order provided.
- Hierarchy is resolved from `parentItemNumber` after all items are collected.

#### Frontend Integration Notes
- Use this for admin/custom-template authoring flows.
- FE should preserve `itemNumber` uniqueness before submitting to avoid validation errors.
- If editing existing templates, keep the parent reference stable by item number.

---

### 4) Clone template to review checklist
**Method:** `POST`

**Route:** `/api/reviews/{reviewId}/checklist`

**Purpose:** Creates a checklist instance for a specific review by cloning a template.

#### Request Details
- Headers:
  - `Authorization: Bearer <token>` recommended
  - `Content-Type: application/json`
- Path params:
  - `reviewId: Guid` - systematic review id
- Query params: none
- Body schema:
```ts
interface CloneChecklistRequestDto {
  templateId: string;
}
```

Validation rules:
- `templateId` must point to an existing checklist template
- The review must exist
- The same template cannot be cloned twice into the same review

#### Response Details
Success response:
```ts
interface ChecklistSectionDto {
  section: string;
  items: ChecklistItemResponseDto[];
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

interface ApiResponseReviewChecklistDto extends ApiResponse<ReviewChecklistDto> {}
```

Status codes used:
- `201 Created`
- `400 Bad Request` if the same template already exists for the review or template/review is invalid

#### Business Logic Summary
- Cloning creates a review checklist instance and pre-creates one response row for each template item.
- Default sample answers from the template are copied into the new response content when present.
- After creation, the UI can immediately render the checklist and start editing answers.

#### Frontend Integration Notes
- Call this once when the reviewer starts a checklist for a review.
- Guard against duplicate creation in the UI. The backend rejects a second clone for the same review/template pair.
- After clone, keep the returned `reviewChecklistId` for future update and completion calls.

---

### 5) Get review checklist list for a review
**Method:** `GET`

**Route:** `/api/reviews/{reviewId}/checklist`

**Purpose:** Returns the list of checklist instances that belong to a review.

#### Request Details
- Headers:
  - `Authorization: Bearer <token>` recommended
- Path params:
  - `reviewId: Guid`
- Query params: none
- Body: none

#### Response Details
Success response:
```ts
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

interface ApiResponseReviewChecklistSummaryDtoArray extends ApiResponse<ReviewChecklistSummaryDto[]> {}
```

Status codes used:
- `200 OK`

#### Business Logic Summary
- Returns one row per checklist instance linked to the review.
- Use `reviewChecklistId` to open a specific checklist.

#### Frontend Integration Notes
- Render this as a checklist list or checklist history for the review.
- Each row should open the checklist detail endpoint using `reviewChecklistId`.

---

### 6) Get checklist details by checklist id
**Method:** `GET`

**Route:** `/api/checklist/{checkListId}`

**Purpose:** Fetches one checklist instance, including current responses.

#### Request Details
- Headers:
  - `Authorization: Bearer <token>` recommended
- Path params:
  - `checkListId: Guid`
- Query params: none
- Body: none

#### Response Details
Success response:
```ts
interface ChecklistItemResponseDto {
  itemTemplateId: string;
  responseId?: string | null;
  parentId?: string | null;
  itemNumber: string;
  section: string;
  topic: string;
  description: string;
  order: number;
  isRequired: boolean;
  hasLocationField: boolean;
  content?: string | null;
  location?: string | null;
  isNotApplicable: boolean;
  isReported: boolean;
  lastUpdatedAt?: string | null;
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

interface ApiResponseReviewChecklistDto extends ApiResponse<ReviewChecklistDto> {}
```

Status codes used:
- `200 OK`
- `404 Not Found` if the checklist does not exist

#### Business Logic Summary
- Returns both a grouped view (`sections`) and a flat view (`items`).
- Flat `items` is the canonical structure for updates and rendering.
- Sections are pre-grouped for convenience in the UI.

#### Frontend Integration Notes
- Prefer the `items` array for state management and use `sections` for display grouping.
- Keep local edits keyed by `itemTemplateId`.
- A missing checklist means the checklist id is invalid or was deleted.

---

### 7) Update a single checklist item response
**Method:** `PUT`

**Route:** `/api/checklist/{checkListId}/items/{itemId}`

**Purpose:** Saves one item response on the review checklist.

#### Request Details
- Headers:
  - `Authorization: Bearer <token>` recommended
  - `Content-Type: application/json`
- Path params:
  - `checkListId: Guid`
  - `itemId: Guid` - checklist item template id
- Query params: none
- Body schema:
```ts
interface UpdateChecklistItemDto {
  content?: string | null;
  location?: string | null;
  isNotApplicable: boolean;
  isReported: boolean;
}
```

Required vs optional:
- `isNotApplicable` and `isReported` are required booleans
- `content` and `location` are optional strings

Validation rules:
- The checklist must exist for the review
- `itemId` must belong to that checklist template
- If the item is marked not applicable, the backend still saves the record and counts it as complete

#### Response Details
Success response:
```ts
interface ApiResponseChecklistItemResponseDto extends ApiResponse<ChecklistItemResponseDto> {}
```

Status codes used:
- `200 OK`
- `404 Not Found` if the checklist does not exist
- `400 Bad Request` if the item does not belong to the checklist

#### Business Logic Summary
- Updates only one item, not the whole checklist.
- The backend immediately recalculates checklist completion after saving.
- If the item is marked `isReported`, the backend treats it as complete for progress purposes.

#### Frontend Integration Notes
- Use autosave or explicit save per row/item.
- Debounce text inputs if you autosave on typing.
- Keep updates atomic per item to avoid overwriting other rows.
- If the checklist is refreshed after update, use the returned response to update the local row state.

---

### 8) Get checklist completion
**Method:** `GET`

**Route:** `/api/checklist/{checkListId}/completion`

**Purpose:** Returns overall completion percentage for the review checklist.

#### Request Details
- Headers:
  - `Authorization: Bearer <token>` recommended
- Path params:
  - `checkListId: Guid`
- Query params: none
- Body: none

#### Response Details
Success response:
```ts
interface ChecklistCompletionDto {
  reviewChecklistId: string;
  completionPercentage: number;
  isCompleted: boolean;
}

interface ApiResponseChecklistCompletionDto extends ApiResponse<ChecklistCompletionDto> {}
```

Status codes used:
- `200 OK`
- `404 Not Found` if the review checklist does not exist

#### Business Logic Summary
- Completion is calculated from the current checklist response state.
- `isCompleted` becomes `true` when completion reaches 100%.
- The backend treats `isReported`, `isNotApplicable`, or non-empty content as complete for a given item.

#### Frontend Integration Notes
- Call after save operations if you want a live progress bar.
- Completion may jump in discrete steps because each checklist item contributes equally.
- Do not infer completion from item count alone if you have local unsaved changes.

---

### 9) Generate checklist report
**Method:** `POST`

**Route:** `/api/checklist/{checkListId}/generate-report`

**Purpose:** Generates a Word `.docx` report for the checklist.

#### Request Details
- Headers:
  - `Authorization: Bearer <token>` recommended
  - `Content-Type: application/json`
- Path params:
  - `checkListId: Guid`
- Query params: none
- Body schema:
```ts
interface GenerateReportRequest {
  includeOnlyCompletedItems: boolean;
}
```

#### Response Details
Success response:
- Binary file download
- MIME type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Filename pattern: `checklist-report-{checkListId}.docx`

Status codes used:
- `200 OK` with file payload
- `404 Not Found` if the checklist does not exist
- `500 Internal Server Error` if file generation fails

#### Business Logic Summary
- Generates a professional Word report from the current checklist state.
- Items are grouped by section.
- Sub-items are indented in the document.
- If `includeOnlyCompletedItems` is `true`, the report includes only items that are marked complete by the backend logic.

#### Frontend Integration Notes
- Trigger this from an export button or final submission screen.
- Use a file download handler, not JSON parsing.
- The UI should expect the browser to download the file rather than render it inline.
- If users need a preview, call the checklist retrieval endpoint first.

## Frontend Behavior Summary
- Template data is flat in storage, but hierarchy is represented by `parentId`.
- The review checklist endpoint returns both `sections` and `items`; `items` should be treated as the source of truth for editing.
- The backend recalculates completion after every item update, so progress state can change after each save.
- There is no pagination on checklist endpoints; all template/checklist data is returned in one payload.
- Generate report returns a file and should be handled as a blob download.

## Common Pitfalls
- Creating a checklist twice for the same review will fail.
- Updating an item with an `itemId` that belongs to another template will fail.
- The API does not infer hierarchy from item number text alone; it uses `parentId`.
- Custom templates must contain unique item numbers.
- Section names are stored as uppercase strings in seeded data, so compare case-insensitively in the UI.

## Suggested UI Flow
1. Load templates with `GET /api/checklist/templates`.
2. Show system templates and custom templates separately if desired.
3. Create the review checklist from a selected template.
4. Load the review checklist list with `GET /api/reviews/{reviewId}/checklist`.
5. Open one checklist with `GET /api/checklist/{checkListId}`.
6. Autosave each row with the item update endpoint.
7. Refresh completion with the completion endpoint or use the update response to update state.
8. Generate the report when the checklist is ready to export.
