# Import RIS File API

## Endpoint: Import bibliographic records from RIS

### 1) Basic Info
- **Method:** `POST`
- **Route:** `/api/papers/import/ris`
- **Purpose:** Upload a `.ris` file and import paper records into a project's paper pool, with duplicate detection and import summary.

### 2) Request Details

#### Headers
- `Content-Type: multipart/form-data`
- No endpoint-level `[Authorize]` attribute is declared in this controller action.

#### Path Params
- None.

#### Query Params
- None.

#### Form Data Body (multipart/form-data)
- `file` (**required**, file): RIS file to import.
- `projectId` (**required**, string UUID): Target project that owns the paper pool.
- `searchSourceId` (*optional*, string UUID): Search source/database id (for example PubMed/Scopus source record id).

#### Frontend TypeScript Contract
```ts
// multipart/form-data payload (represented as a helper interface)
export interface ImportRisFormDataInput {
  file: File; // must end with .ris, max 10MB
  projectId: string; // UUID
  searchSourceId?: string; // UUID
}
```

#### Validation Rules
- `file` is required and must not be empty.
- File extension must be `.ris` (case-insensitive check via lowercasing).
- File size must be `<= 10MB`.
- `projectId` must reference an existing project, otherwise service throws.
- If `searchSourceId` is provided, it must reference an existing search source, otherwise service throws.
- RIS content must be parseable and contain at least one valid record.

### 3) Response Details

#### Success Response Schema
```ts
export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  errors?: ApiError[] | null;
  data?: T | null;
}

export interface RisImportResultDto {
  importBatchId?: string | null; // UUID
  totalRecords: number;
  importedRecords: number;
  duplicateRecords: number;
  skippedRecords: number;
  updatedRecords: number;
  errors: string[];
  importedPaperIds: string[]; // UUID[]
}
```

#### Error Response Schema
```ts
export type ImportRisErrorResponse = ApiResponse<null>;
```

#### HTTP Status Codes Used
- `200 OK`
  - Import executed (including "no new records" scenario).
- `400 Bad Request`
  - Missing file.
  - Invalid extension.
  - File too large.
  - Import fully failed condition in controller (`totalRecords === 0 && errors.length > 0`).
- `500 Internal Server Error` (or global exception-mapped error)
  - Invalid/non-existent `projectId`.
  - Invalid/non-existent `searchSourceId`.
  - RIS parse failure.
  - No valid RIS records found.
  - Any unexpected exception in import pipeline.

#### Important Response Notes
- Import can return `200 OK` even when `importedRecords = 0`, if records are all duplicates/updates; message indicates no new records.
- `updatedRecords` is incremented for matched duplicates treated as updates in current logic.
- `duplicateRecords` is tracked separately and can overlap logically with update outcomes.

### 4) Business Logic Summary
- The API validates the uploaded file (presence, extension, size), then parses RIS records.
- It creates an import batch for audit/tracking, then processes each paper in project scope.
- Matching pipeline includes DOI/exact/fuzzy/semantic matching to detect existing records.
- Records considered matches above threshold are counted as duplicates/updates and not inserted as new papers.
- Non-matching records are inserted as new papers and linked to the import batch.
- Entire import runs in a transaction for atomic persistence of import artifacts.

### 5) Frontend Integration Notes
- Call this endpoint when user uploads RIS into a specific project's paper pool.
- Always send `multipart/form-data` using `FormData`; do not send JSON body.
- Client-side pre-checks recommended: extension `.ris`, max size 10MB, and valid `projectId` selection.
- Handle 200 with zero imported records as a valid state (not an error UI).
- Show server `message` prominently because it carries useful outcome context.
- Treat 500-class errors as recoverable failures; suggest retry or verifying project/source configuration.

### 6) Ready-to-Use FE Types + Example API Call

```ts
export interface ImportRisApiResult extends ApiResponse<RisImportResultDto> {}
```

```ts
export async function importRisFile(input: ImportRisFormDataInput): Promise<ImportRisApiResult> {
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("projectId", input.projectId);
  if (input.searchSourceId) formData.append("searchSourceId", input.searchSourceId);

  const response = await fetch("/api/papers/import/ris", {
    method: "POST",
    body: formData
  });

  const data = (await response.json()) as ImportRisApiResult;

  if (!response.ok) {
    // Normalize API errors for UI-level handling
    throw new Error(data.message || "Import RIS failed");
  }

  return data;
}
```

### Example Success Payload
```json
{
  "isSuccess": true,
  "message": "Successfully imported 12 records.",
  "errors": null,
  "data": {
    "importBatchId": "9ebf72a6-182f-47f9-abf5-9b9414d7b732",
    "totalRecords": 20,
    "importedRecords": 12,
    "duplicateRecords": 8,
    "skippedRecords": 0,
    "updatedRecords": 8,
    "errors": [],
    "importedPaperIds": [
      "77d907ec-7307-4af0-a275-6643e448302c"
    ]
  }
}
```
