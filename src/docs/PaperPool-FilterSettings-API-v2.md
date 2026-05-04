# Paper Pool + Filter Settings API Documentation

This document is frontend-integration focused for these endpoints:

- `GET /api/projects/{projectId}/papers` (`GetPaperPool`)
- `GET /api/projects/{projectId}/filter-metadata` (`GetFilterMetadata`)
- `GET /api/projects/{projectId}/filter-settings` (`GetFilterSettings`)
- `GET /api/projects/{projectId}/filter-settings/{id}` (`GetFilterSettingById`)
- `POST /api/projects/{projectId}/filter-settings` (`CreateFilterSetting`)
- `PUT /api/projects/{projectId}/filter-settings/{id}` (`UpdateFilterSetting`)
- `DELETE /api/projects/{projectId}/filter-settings/{id}` (`DeleteFilterSetting`)

---

## Shared Contracts

### Response Envelope

```ts
interface ApiError {
  code: string;
  message: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  errors?: ApiError[];
  data?: T;
}
```

### Pagination Shape

```ts
interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
```

### Common Value Constraints

- `doiState` and `fullTextState` must be one of: `"all" | "has" | "missing"`.
- `yearFrom` must be `<= yearTo` when both are provided.
- `pageNumber` minimum is normalized to `1`.
- `pageSize` is normalized in service layer:
  - if `< 1` => `20`
  - if `> 100` => `100`

### Auth

- No `[Authorize]` attribute is applied on these 6 endpoints in current controller code.
- If your deployment enforces global auth middleware/policies, include bearer token as required by environment.

---

## 1) Get Paper Pool

### Basic Info

- **Method:** `GET`
- **Route:** `/api/projects/{projectId}/papers`
- **Purpose:** List project papers with search, filtering, and pagination for Paper Pool UI.

### Request Details

- **Headers:** `Authorization: Bearer <token>` if environment requires auth.
- **Path params:**
  - `projectId: string` (GUID, required)
- **Query params:**

```ts
interface GetPaperPoolQuery {
  searchText?: string;
  keyword?: string;
  yearFrom?: number;
  yearTo?: number;
  searchSourceId?: string; // "all" | GUID, default "all"
  importBatchId?: string;  // "all" | GUID, default "all"
  doiState?: "all" | "has" | "missing"; // default "all"
  fullTextState?: "all" | "has" | "missing"; // default "all"
  onlyUnused?: boolean;
  recentlyImported?: boolean;
  pageNumber?: number; // default 1
  pageSize?: number;   // default 10 (then normalized in service)
}
```

- **Validation rules:**
  - `doiState` invalid => HTTP `400`.
  - `fullTextState` invalid => HTTP `400`.
  - `yearFrom > yearTo` => HTTP `400`.

### Response Details

```ts
interface AssignedReviewerDto {
  id: string;
  name: string;
}

interface PaperResponse {
  id: string;
  title: string;
  authors?: string;
  abstract?: string;
  doi?: string;
  publicationType?: string;
  publicationYear?: string;
  publicationYearInt?: number;
  publicationDate?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  language?: string;
  keywords?: string;
  url?: string;
  conferenceName?: string;
  conferenceLocation?: string;
  conferenceCountry?: string;
  conferenceYear?: number;
  journal?: string;
  journalIssn?: string;
  journalEIssn?: string;
  md5?: string;
  source?: string;
  searchSourceId?: string;
  importedAt?: string;
  importedBy?: string;
  selectionStatus?: number | null;
  selectionStatusText?: string | null;
  stage: number;
  stageText: string;
  assignmentStatus: number;
  assignmentStatusText: string;
  assignedReviewers: AssignedReviewerDto[];
  pdfUrl?: string;
  fullTextRetrievalStatus: number;
  fullTextRetrievalStatusText: string;
  fullTextAvailable?: boolean;
  accessType?: number;
  accessTypeText?: string;
  createdAt: string;
  modifiedAt: string;
  decidedStatus: string;
}
```

- **Success:** `200 OK` with `ApiResponse<PaginatedResponse<PaperResponse>>`
- **Client errors:** `400 Bad Request` for invalid states/date-range
- **Other errors:** may return standard API error envelope from exception middleware

### Business Logic Summary

- Filters by project first, then applies text/metadata filters.
- `searchText` checks title/abstract/authors/doi/keywords.
- `keyword` is keyword-field specific filter.
- `searchSourceId` supports direct paper source and source through import/search execution.
- `onlyUnused = true` excludes papers already present in process-related tables.
- `recentlyImported = true` currently means imported within last 7 days.
- Pagination `totalCount` is computed before `Skip/Take` and is suitable for UI paging.

### Frontend Integration Notes

- Use this endpoint as the main Paper Pool table source.
- For `searchSourceId` and `importBatchId`, send `"all"` for no filter.
- Treat `pageSize` returned in response as source of truth (because server normalizes values).
- If user enters custom state values, validate client-side before request to avoid avoidable `400`.

### Example API Call

```ts
const res = await api.get<ApiResponse<PaginatedResponse<PaperResponse>>>(
  `/api/projects/${projectId}/papers`,
  {
    params: {
      searchText: "machine learning",
      doiState: "has",
      fullTextState: "all",
      searchSourceId: "all",
      importBatchId: "all",
      onlyUnused: false,
      recentlyImported: false,
      pageNumber: 1,
      pageSize: 20,
    },
  }
);
```

---

## 2) Get Filter Metadata

### Basic Info

- **Method:** `GET`
- **Route:** `/api/projects/{projectId}/filter-metadata`
- **Purpose:** Provide options for filter dropdowns (search sources, import batches).

### Request Details

- **Path params:**
  - `projectId: string` (GUID, required)
- **Query/body:** none

### Response Details

```ts
interface FilterOptionResponse {
  id: string;
  name: string;
}

interface PaperPoolFilterMetadataResponse {
  searchSources: FilterOptionResponse[];
  importBatches: FilterOptionResponse[];
}
```

- **Success:** `200 OK` with `ApiResponse<PaperPoolFilterMetadataResponse>`
- **Errors:** standard API error envelope

### Business Logic Summary

- `searchSources`: loaded by `projectId`.
- `importBatches`: loaded through search execution belonging to the same project.
- Import batch `name` uses file name; if missing, backend generates a fallback label.

### Frontend Integration Notes

- Call on Paper Pool screen load (or cache per project).
- Use returned `id` directly in `searchSourceId` / `importBatchId`.
- Add your own `"All"` option in UI and map to `"all"` in requests.

### Example API Call

```ts
const res = await api.get<ApiResponse<PaperPoolFilterMetadataResponse>>(
  `/api/projects/${projectId}/filter-metadata`
);
```

---

## 3) Get Filter Settings

### Basic Info

- **Method:** `GET`
- **Route:** `/api/projects/{projectId}/filter-settings`
- **Purpose:** Get saved filter collections for a project.

### Request Details

- **Path params:**
  - `projectId: string` (GUID, required)

### Response Details

```ts
interface FilterStateDto {
  keyword?: string;
  yearFrom?: number;
  yearTo?: number;
  searchSourceId: string; // "all" | GUID
  importBatchId: string;  // "all" | GUID
  doiState: "all" | "has" | "missing";
  fullTextState: "all" | "has" | "missing";
  onlyUnused: boolean;
  recentlyImported: boolean;
}

interface FilterSettingResponse {
  id: string;
  name: string;
  searchText?: string;
  filters: FilterStateDto;
  createdAt: string;
}
```

- **Success:** `200 OK` with `ApiResponse<FilterSettingResponse[]>`

### Business Logic Summary

- Returns project-scoped filter settings sorted by latest created first.
- IDs for source/batch are serialized as string GUIDs; missing values are returned as `"all"`.

### Frontend Integration Notes

- Use this to populate "Saved Filters" list.
- Use returned object directly to restore filter form state.

### Example API Call

```ts
const res = await api.get<ApiResponse<FilterSettingResponse[]>>(
  `/api/projects/${projectId}/filter-settings`
);
```

---

## 4) Create Filter Setting

### Basic Info

- **Method:** `POST`
- **Route:** `/api/projects/{projectId}/filter-settings`
- **Purpose:** Save a new filter collection under a project.

### Request Details

- **Path params:**
  - `projectId: string` (GUID, required)
- **Body:**

```ts
interface FilterSettingRequest {
  name: string; // required, unique per project (case-insensitive)
  searchText?: string;
  filters: FilterStateDto;
}
```

- **Validation rules:**
  - `name` required (non-empty)
  - `name` must be unique per project
  - `doiState`, `fullTextState` must be valid state values
  - `yearFrom <= yearTo` when both provided
  - `searchSourceId` / `importBatchId` should be `"all"` or valid GUID string

### Response Details

- **Success:** `201 Created` with `ApiResponse<FilterSettingResponse>`
- **Client errors:** `400 Bad Request` for invalid state values or invalid request
- **Conflict-like business failure:** duplicate name currently throws service exception (surface status depends on global exception mapping)

### Business Logic Summary

- Normalizes state values to lowercase.
- Stores `"all"` IDs as `null` internally.
- Saves complete filter snapshot for later reuse.

### Frontend Integration Notes

- Before calling, validate unique name in UI if possible for better UX.
- On success, prepend returned item to local list (backend returns newest-first on list).

### Example API Call

```ts
const payload: FilterSettingRequest = {
  name: "Missing DOI + Recent",
  searchText: "",
  filters: {
    keyword: "",
    yearFrom: 2020,
    yearTo: 2026,
    searchSourceId: "all",
    importBatchId: "all",
    doiState: "missing",
    fullTextState: "all",
    onlyUnused: false,
    recentlyImported: true,
  },
};

const res = await api.post<ApiResponse<FilterSettingResponse>>(
  `/api/projects/${projectId}/filter-settings`,
  payload
);
```

---

## 5) Get Filter Setting Detail

### Basic Info

- **Method:** `GET`
- **Route:** `/api/projects/{projectId}/filter-settings/{id}`
- **Purpose:** Get one saved filter setting detail by id in a project scope.

### Request Details

- **Path params:**
  - `projectId: string` (GUID, required)
  - `id: string` (filter setting GUID, required)
- **Query/body:** none

### Response Details

- **Success:** `200 OK` with `ApiResponse<FilterSettingResponse>`
- **Errors:**
  - Not found/business error when `id` does not belong to `projectId` (handled by global exception pipeline)

### Business Logic Summary

- Reads one record by composite scope (`projectId + id`), not by `id` alone.
- Returns complete saved filter payload in the same shape as list/create/update endpoints.

### Frontend Integration Notes

- Use when opening “saved filter detail” view, edit modal, or restoring one specific saved filter by id.
- If API returns not-found error, clear stale local state and refresh saved filters list.

### Example API Call

```ts
const res = await api.get<ApiResponse<FilterSettingResponse>>(
  `/api/projects/${projectId}/filter-settings/${filterId}`
);
```

---

## 6) Update Filter Setting

### Basic Info

- **Method:** `PUT`
- **Route:** `/api/projects/{projectId}/filter-settings/{id}`
- **Purpose:** Update an existing saved filter setting.

### Request Details

- **Path params:**
  - `projectId: string` (GUID, required)
  - `id: string` (filter setting GUID, required)
- **Body:** same as `FilterSettingRequest`
- **Validation:** same as create + target filter must belong to `projectId`

### Response Details

- **Success:** `200 OK` with `ApiResponse<FilterSettingResponse>`
- **Client errors:** `400 Bad Request` for invalid states/request
- **Not found/business errors:** handled by exception pipeline if id/project mismatch

### Business Logic Summary

- Enforces same uniqueness rule on `name` (excluding current record).
- Updates all saved fields atomically.

### Frontend Integration Notes

- Use optimistic UI carefully; rollback on failure.
- Keep `id` and `projectId` tightly scoped to avoid cross-project update attempts.

### Example API Call

```ts
const res = await api.put<ApiResponse<FilterSettingResponse>>(
  `/api/projects/${projectId}/filter-settings/${filterId}`,
  payload
);
```

---

## 7) Delete Filter Setting

### Basic Info

- **Method:** `DELETE`
- **Route:** `/api/projects/{projectId}/filter-settings/{id}`
- **Purpose:** Remove a saved filter setting.

### Request Details

- **Path params:**
  - `projectId: string` (GUID, required)
  - `id: string` (filter setting GUID, required)

### Response Details

- **Success:** `200 OK` with `ApiResponse<void>`-style success message
- **Not found/business errors:** handled by exception pipeline if id/project mismatch

### Business Logic Summary

- Deletes only when the record belongs to the given project.

### Frontend Integration Notes

- Confirm user action before delete.
- On success, remove item from local saved-filter list immediately.

### Example API Call

```ts
await api.delete<ApiResponse<unknown>>(
  `/api/projects/${projectId}/filter-settings/${filterId}`
);
```

---

## Suggested FE Types Export

```ts
export type FilterState = "all" | "has" | "missing";

export interface PaperPoolQuery extends GetPaperPoolQuery {}
export interface PaperPoolPageResponse extends ApiResponse<PaginatedResponse<PaperResponse>> {}
export interface FilterMetadataApiResponse extends ApiResponse<PaperPoolFilterMetadataResponse> {}
export interface FilterSettingsApiResponse extends ApiResponse<FilterSettingResponse[]> {}
export interface FilterSettingApiResponse extends ApiResponse<FilterSettingResponse> {}
```

