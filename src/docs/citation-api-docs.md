# Citation APIs – Frontend Integration Guide

## 1) API Overview

Base controller route: `/api/papers`

Available endpoints:

1. `GET /api/papers/{id}/references`
2. `GET /api/papers/{id}/citations`
3. `GET /api/papers/{id}/citation-count`
4. `GET /api/papers/{id}/reference-count`
5. `GET /api/papers/{id}/graph?depth=2&minConfidence=0.7`
6. `GET /api/papers/top-cited?topN=10`

---

## 2) Common Contracts (Used by All Endpoints)

### Headers
- `Content-Type: application/json` (recommended)
- `Accept: application/json`
- `Authorization: Bearer <token>` is **not required by this controller** (no `[Authorize]` on controller/actions).

### Standard Success Envelope

```ts
export interface ApiResponse<T> {
  isSuccess: boolean; // true on success
  message: string;
  data?: T;
  errors?: ApiError[] | null;
}

export interface ApiError {
  code: string;
  message: string;
}
```

### JSON Response Format (Actual Payload)

#### Success JSON (generic)

```json
{
  "isSuccess": true,
  "message": "...",
  "data": {},
  "errors": null
}
```

#### Error JSON (generic)

```json
{
  "isSuccess": false,
  "message": "Yêu cầu không hợp lệ",
  "errors": [
    {
      "code": "INVALID_MODEL_STATE",
      "message": "The value 'abc' is not valid."
    }
  ]
}
```

### Shared DTOs

```ts
export interface PaperNodeDto {
  id: string;          // Guid
  title: string;
  year: number | null;
  authors: string | null;
  doi: string | null;
  citationCount: number;
}

export interface CitationEdgeDto {
  sourcePaperId: string;   // Guid
  targetPaperId: string;   // Guid
  confidenceScore: number; // decimal in backend
}

export interface CitationGraphDto {
  nodes: PaperNodeDto[];
  edges: CitationEdgeDto[];
}
```

### Common Error Schema

```ts
export interface ApiErrorResponse {
  isSuccess: false;
  message: string;
  errors?: ApiError[] | null;
}
```

Typical error statuses for these endpoints:
- `400` invalid route/query format (example: invalid Guid)
- `500` unhandled backend exception

---

## 3) Endpoint Details

## Endpoint A: Get References

### 1. Basic Info
- **Method:** `GET`
- **Route:** `/api/papers/{id}/references`
- **Purpose:** Returns papers that the given paper references (outgoing citations).

### 2. Request Details
- **Path params**
  - `id: string (Guid)` **required**
- **Query params:** none
- **Request body:** none
- **Validation rules**
  - `id` must be a valid Guid.

```ts
export interface GetReferencesPathParams {
  id: string;
}
```

### 3. Response Details

```ts
export type GetReferencesResponse = ApiResponse<PaperNodeDto[]>;
```

- **Success status:** `200`
- **Error statuses:** `400`, `500`
- **Important notes**
  - Self-citation rows (`source == target`) are excluded.
  - Duplicate papers are deduplicated by `id`.

#### Success JSON Example

```json
{
  "isSuccess": true,
  "message": "References retrieved successfully.",
  "data": [
    {
      "id": "8f6a6d92-730a-4ba2-a8ce-7f6581f6af5b",
      "title": "A Survey on Systematic Reviews",
      "year": 2022,
      "authors": "Kitchenham B.",
      "doi": "10.1145/123456",
      "citationCount": 12
    }
  ],
  "errors": null
}
```

### 4. Business Logic Summary
- Queries citation table where `sourcePaperId = id`.
- Loads each target paper and returns basic node info.
- If paper does not exist or has no references, returns empty array (still success).

### 5. Frontend Integration Notes
- Use when opening a paper detail view and showing "References" tab/list.
- Handle empty list as normal state.
- Do not assume paper existence from this API alone.

### 6. Example API Call

```ts
const res = await fetch(`/api/papers/${paperId}/references`);
const json: GetReferencesResponse = await res.json();
```

---

## Endpoint B: Get Citations

### 1. Basic Info
- **Method:** `GET`
- **Route:** `/api/papers/{id}/citations`
- **Purpose:** Returns papers that cite the given paper (incoming citations).

### 2. Request Details
- **Path params**
  - `id: string (Guid)` **required**
- **Query params:** none
- **Request body:** none
- **Validation rules**
  - `id` must be valid Guid.

```ts
export interface GetCitationsPathParams {
  id: string;
}
```

### 3. Response Details

```ts
export type GetCitationsResponse = ApiResponse<PaperNodeDto[]>;
```


- **Success status:** `200`
- **Error statuses:** `400`, `500`
- **Important notes**
  - Self-citations are excluded.
  - Duplicate source papers are deduplicated by `id`.

#### Success JSON Example

```json
{
  "isSuccess": true,
  "message": "Citations retrieved successfully.",
  "data": [
    {
      "id": "63891c24-ef0c-40de-8a52-19710f805d4e",
      "title": "Evidence-Based Software Engineering",
      "year": 2021,
      "authors": "Dyba T.",
      "doi": "10.1109/456789",
      "citationCount": 30
    }
  ],
  "errors": null
}
```

### 4. Business Logic Summary
- Queries citation table where `targetPaperId = id`.
- Returns source papers that point to this paper.

### 5. Frontend Integration Notes
- Use for "Cited by" list.
- Safe to show count from `data.length`, but for authoritative count use dedicated count API.

### 6. Example API Call

```ts
const res = await fetch(`/api/papers/${paperId}/citations`);
const json: GetCitationsResponse = await res.json();
```

---

## Endpoint C: Get Citation Count

### 1. Basic Info
- **Method:** `GET`
- **Route:** `/api/papers/{id}/citation-count`
- **Purpose:** Returns total number of incoming citation rows for a paper.

### 2. Request Details
- **Path params**
  - `id: string (Guid)` **required**
- **Query params:** none
- **Request body:** none

```ts
export interface GetCitationCountPathParams {
  id: string;
}
```

### 3. Response Details

```ts
export type GetCitationCountResponse = ApiResponse<number>;
```

- **Success status:** `200`
- **Error statuses:** `400`, `500`
- **Important notes**
  - Count endpoint does **not** explicitly filter self-citations.

#### Success JSON Example

```json
{
  "isSuccess": true,
  "message": "Citation count retrieved successfully.",
  "data": 25,
  "errors": null
}
```

### 4. Business Logic Summary
- Performs DB `COUNT` on rows with `targetPaperId = id`.
- Returns `0` when no rows.

### 5. Frontend Integration Notes
- Use for fast badges/stat cards.
- Prefer this endpoint over `citations.length` for large datasets.

### 6. Example API Call

```ts
const res = await fetch(`/api/papers/${paperId}/citation-count`);
const json: GetCitationCountResponse = await res.json();
```

---

## Endpoint D: Get Reference Count

### 1. Basic Info
- **Method:** `GET`
- **Route:** `/api/papers/{id}/reference-count`
- **Purpose:** Returns total number of outgoing citation rows for a paper.

### 2. Request Details
- **Path params**
  - `id: string (Guid)` **required**
- **Query params:** none
- **Request body:** none

```ts
export interface GetReferenceCountPathParams {
  id: string;
}
```

### 3. Response Details

```ts
export type GetReferenceCountResponse = ApiResponse<number>;
```

- **Success status:** `200`
- **Error statuses:** `400`, `500`
- **Important notes**
  - Count endpoint does **not** explicitly filter self-citations.

#### Success JSON Example

```json
{
  "isSuccess": true,
  "message": "Reference count retrieved successfully.",
  "data": 14,
  "errors": null
}
```

### 4. Business Logic Summary
- Performs DB `COUNT` on rows with `sourcePaperId = id`.
- Returns `0` when no rows.

### 5. Frontend Integration Notes
- Use for overview metrics and list item metadata.

### 6. Example API Call

```ts
const res = await fetch(`/api/papers/${paperId}/reference-count`);
const json: GetReferenceCountResponse = await res.json();
```

---

## Endpoint E: Get Citation Graph

### 1. Basic Info
- **Method:** `GET`
- **Route:** `/api/papers/{id}/graph`
- **Purpose:** Returns citation network graph from a start paper.

### 2. Request Details
- **Path params**
  - `id: string (Guid)` **required**
- **Query params**
  - `depth?: number` (default `2`)
  - `minConfidence?: number` (default `0.7`)
- **Request body:** none
- **Validation/normalization rules**
  - `depth < 0` → forced to `0`
  - `depth > 3` → forced to `3`
  - `minConfidence` accepted as decimal and used as `>=` threshold

```ts
export interface GetCitationGraphPathParams {
  id: string;
}

export interface GetCitationGraphQuery {
  depth?: number;         // backend clamps to [0..3]
  minConfidence?: number; // default 0.7
}
```

### 3. Response Details

```ts
export type GetCitationGraphResponse = ApiResponse<CitationGraphDto>;
```

- **Success status:** `200`
- **Error statuses:** `400`, `500`
- **Important notes**
  - Graph expansion is outgoing only (`source -> target`).
  - Hard cap: max `500` nodes.
  - Self-citation edges are excluded.
  - Duplicate edges (same source-target pair) are removed.

#### Success JSON Example

```json
{
  "isSuccess": true,
  "message": "Citation graph retrieved successfully.",
  "data": {
    "nodes": [
      {
        "id": "20df180d-1b55-4980-956d-b85c9953e98d",
        "title": "Root Paper",
        "year": 2020,
        "authors": "Smith J.",
        "doi": "10.123/456",
        "citationCount": 8
      },
      {
        "id": "b0f05148-b949-4b39-9543-b7f9c3d242e0",
        "title": "Referenced Paper",
        "year": 2019,
        "authors": "Johnson D.",
        "doi": null,
        "citationCount": 21
      }
    ],
    "edges": [
      {
        "sourcePaperId": "20df180d-1b55-4980-956d-b85c9953e98d",
        "targetPaperId": "b0f05148-b949-4b39-9543-b7f9c3d242e0",
        "confidenceScore": 0.92
      }
    ]
  },
  "errors": null
}
```

### 4. Business Logic Summary
- Breadth-first style expansion level-by-level from start paper.
- Uses confidence filter to include only edges where `confidenceScore >= minConfidence`.
- Stops when depth reached or node cap reached.
- Then fetches node metadata in bulk.

### 5. Frontend Integration Notes
- Use for graph visualization page/modal.
- For fast UI, request smaller depth first (e.g., `depth=1`) then allow user to expand.
- Since node cap exists, large graphs may be truncated.
- If start paper is missing, backend can still return success with empty `nodes`.

### 6. Example API Call

```ts
const params = new URLSearchParams({ depth: "2", minConfidence: "0.7" });
const res = await fetch(`/api/papers/${paperId}/graph?${params.toString()}`);
const json: GetCitationGraphResponse = await res.json();
```

---

## Endpoint F: Get Top Cited Papers

### 1. Basic Info
- **Method:** `GET`
- **Route:** `/api/papers/top-cited`
- **Purpose:** Returns top cited papers sorted by incoming citation count descending.

### 2. Request Details
- **Path params:** none
- **Query params**
  - `topN?: number` (default `10`)
- **Request body:** none
- **Validation/normalization rules**
  - `topN <= 0` → forced to `10`
  - `topN > 100` → forced to `100`

```ts
export interface GetTopCitedPapersQuery {
  topN?: number; // backend clamps to [1..100] with defaults
}
```

### 3. Response Details

```ts
export type GetTopCitedPapersResponse = ApiResponse<PaperNodeDto[]>;
```

- **Success status:** `200`
- **Error statuses:** `400`, `500`
- **Important notes**
  - No pagination; always returns at most normalized `topN`.

#### Success JSON Example

```json
{
  "isSuccess": true,
  "message": "Top cited papers retrieved successfully.",
  "data": [
    {
      "id": "f1888868-0ee4-4189-a54f-35ebff7d7935",
      "title": "Top Ranked Paper",
      "year": 2018,
      "authors": "Williams A.",
      "doi": "10.456/789",
      "citationCount": 125
    }
  ],
  "errors": null
}
```

### 4. Business Logic Summary
- Orders papers by incoming citation count descending.
- Returns top N records after normalization.

### 5. Frontend Integration Notes
- Use for dashboard widgets, leaderboards, default highlights.
- For large pages, cache briefly client-side because data is ranking-oriented and may be requested often.

### 6. Example API Call

```ts
const res = await fetch(`/api/papers/top-cited?topN=20`);
const json: GetTopCitedPapersResponse = await res.json();
```

---

## Endpoint G: Get Suggested Papers

### 1. Basic Info
- **Method:** `GET`
- **Route:** `/api/papers/{id}/suggestions`
- **Purpose:** Returns suggested candidate papers closely related to a specific paper in the citation graph.

### 2. Request Details
- **Path params:**
  - `id: string (Guid)` **required**
- **Query params**
  - `limit?: number` (default `5`)
- **Request body:** none

```ts
export interface GetSuggestedPapersPathParams {
  id: string;
}

export interface GetSuggestedPapersQuery {
  limit?: number; // default 5
}
```

### 3. Response Details

```ts
export type GetSuggestedPapersResponse = ApiResponse<PaperNodeDto[]>;
```

#### Success JSON Example

```json
{
  "isSuccess": true,
  "message": "Suggested papers retrieved successfully.",
  "data": [
    {
      "id": "c2b0c1ee-ffaa-45cc-bbee-98abc332abcd",
      "title": "Related Literature on Systematic Mapping",
      "year": 2023,
      "authors": "Peterson K.",
      "doi": "10.789/012",
      "citationCount": 42
    }
  ],
  "errors": null
}
```

### 4. Business Logic Summary
- Retrieves directly adjacent papers (references and citations) for the given paper.
- Orders them by incoming citation count (popularity within the scope) descending.
- Excludes the input paper itself and limits the result size.

### 5. Frontend Integration Notes
- Recommended for the "Suggested Papers" sidebar.
- Safe to fall back gracefully if an empty list is retrieved.

### 6. Example API Call

```ts
const res = await fetch(`/api/papers/${paperId}/suggestions?limit=5`);
const json: GetSuggestedPapersResponse = await res.json();
```

---

## 4) Frontend Edge Cases and Pitfalls

1. Invalid Guid in route returns `400` before service execution.
2. No paper-existence check in service for these endpoints:
   - You may get `200` with empty `data`/`0` even if paper ID is unknown.
3. Count vs list behavior mismatch:
   - list endpoints exclude self-citation rows,
   - count endpoints do not explicitly exclude them.
4. `depth` and `topN` are silently normalized by backend (no validation error).

---

## 5) Ready-to-Use FE Types + Client Example

```ts
// ---------- Shared ----------
export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data?: T;
  errors?: ApiError[] | null;
}

export interface PaperNodeDto {
  id: string;
  title: string;
  year: number | null;
  authors: string | null;
  doi: string | null;
  citationCount: number;
}

export interface CitationEdgeDto {
  sourcePaperId: string;
  targetPaperId: string;
  confidenceScore: number;
}

export interface CitationGraphDto {
  nodes: PaperNodeDto[];
  edges: CitationEdgeDto[];
}

// ---------- API responses ----------
export type GetReferencesResponse = ApiResponse<PaperNodeDto[]>;
export type GetCitationsResponse = ApiResponse<PaperNodeDto[]>;
export type GetCitationCountResponse = ApiResponse<number>;
export type GetReferenceCountResponse = ApiResponse<number>;
export type GetCitationGraphResponse = ApiResponse<CitationGraphDto>;
export type GetTopCitedPapersResponse = ApiResponse<PaperNodeDto[]>;
export type GetSuggestedPapersResponse = ApiResponse<PaperNodeDto[]>;

// ---------- simple client ----------
const api = {
  getReferences: (id: string) => fetch(`/api/papers/${id}/references`).then(r => r.json() as Promise<GetReferencesResponse>),
  getCitations: (id: string) => fetch(`/api/papers/${id}/citations`).then(r => r.json() as Promise<GetCitationsResponse>),
  getCitationCount: (id: string) => fetch(`/api/papers/${id}/citation-count`).then(r => r.json() as Promise<GetCitationCountResponse>),
  getReferenceCount: (id: string) => fetch(`/api/papers/${id}/reference-count`).then(r => r.json() as Promise<GetReferenceCountResponse>),
  getGraph: (id: string, q?: { depth?: number; minConfidence?: number }) => {
    const params = new URLSearchParams();
    if (q?.depth != null) params.set("depth", String(q.depth));
    if (q?.minConfidence != null) params.set("minConfidence", String(q.minConfidence));
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return fetch(`/api/papers/${id}/graph${suffix}`).then(r => r.json() as Promise<GetCitationGraphResponse>);
  },
  getTopCited: (topN?: number) => {
    const suffix = topN != null ? `?topN=${topN}` : "";
    return fetch(`/api/papers/top-cited${suffix}`).then(r => r.json() as Promise<GetTopCitedPapersResponse>);
  },
  getSuggestions: (id: string, limit?: number) => {
    const suffix = limit != null ? `?limit=${limit}` : "";
    return fetch(`/api/papers/${id}/suggestions${suffix}`).then(r => r.json() as Promise<GetSuggestedPapersResponse>);
  }
};
