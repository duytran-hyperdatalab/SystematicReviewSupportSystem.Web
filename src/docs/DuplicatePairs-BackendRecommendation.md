# Backend Recommendation: Paired Duplicate Endpoint

**Issue:** Architecture Mismatch — Flat List vs Pair Model  
**Severity:** WARNING  
**Date:** 2026-02-27

---

## Problem Statement

The current `GET /api/identification-processes/{id}/duplicates` returns a **flat list** of individual duplicate papers, each with a pointer (`duplicateOfPaperId` + `duplicateOfTitle`) to the original. But the deduplication review workflow requires a **pair-based model** — the researcher must see both papers side-by-side with full metadata to make an informed keep/remove decision.

**What the API gives:**

```
Item: { paper (full metadata), duplicateOfPaperId, duplicateOfTitle (string only), confidenceScore }
```

**What the UI needs:**

```
Pair: { paperA (full metadata), paperB (full metadata), confidenceScore, method, status }
```

The gap is that `duplicateOfTitle` is just a string — the original paper's authors, abstract, DOI, year, source are all missing. A researcher cannot make a meaningful comparison without seeing both papers in full.

---

## Recommended Approach: New Paired Endpoint

Add a **new endpoint** alongside the existing one (don't break the existing flat endpoint — it's still useful for statistics/reporting):

```
GET /api/identification-processes/{identificationProcessId}/duplicate-pairs
```

---

## Response Shape

### Success Response (200 OK)

```json
{
  "isSuccess": true,
  "message": "Retrieved 20 of 53 duplicate pairs.",
  "data": {
    "items": [
      {
        "id": "deduplication-result-uuid",
        "originalPaper": {
          "id": "f7e6d5c4-b3a2-1098-7654-321fedcba098",
          "title": "Machine Learning in Healthcare: A Systematic Review",
          "authors": "Smith, J.; Doe, A.; Johnson, M.",
          "abstract": "This paper reviews recent advances...",
          "doi": "10.1234/example.2024.001",
          "publicationType": "Journal Article",
          "publicationYear": "2024",
          "publicationYearInt": 2024,
          "source": "PubMed",
          "journal": "Journal of Medical Informatics",
          "keywords": "machine learning, healthcare",
          "url": "https://doi.org/10.1234/example.2024.001",
          "importedAt": "2024-06-01T10:30:00+00:00"
        },
        "duplicatePaper": {
          "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "title": "Machine Learning in Healthcare: A Systematic Review",
          "authors": "Smith, John; Doe, Alice; Johnson, Mark",
          "abstract": "This paper reviews recent advances...",
          "doi": "10.1234/example.2024.001",
          "publicationType": "Journal Article",
          "publicationYear": "2024",
          "publicationYearInt": 2024,
          "source": "IEEE Xplore",
          "journal": "Journal of Medical Informatics",
          "keywords": "machine learning, healthcare, AI",
          "url": null,
          "importedAt": "2024-06-02T14:00:00+00:00"
        },
        "method": 0,
        "methodText": "DOI_MATCH",
        "confidenceScore": 1.0,
        "deduplicationNotes": "Duplicate detected by DOI: 10.1234/example.2024.001",
        "status": "pending",
        "resolvedDecision": null,
        "resolvedAt": null,
        "resolvedBy": null,
        "detectedAt": "2024-06-01T11:00:00+00:00"
      }
    ],
    "totalCount": 53,
    "pageNumber": 1,
    "pageSize": 20,
    "totalPages": 3,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

### Empty Result (200 OK)

```json
{
  "isSuccess": true,
  "message": "No duplicate pairs found for this identification process.",
  "data": {
    "items": [],
    "totalCount": 0,
    "pageNumber": 1,
    "pageSize": 20,
    "totalPages": 0,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}
```

---

## Key Design Decisions

| Decision                                             | Rationale                                                                                                                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Both papers get full metadata**                    | Researcher needs authors, abstract, DOI, source, year from BOTH to compare                                                                                          |
| **Lightweight paper DTO** (not full `PaperResponse`) | Only include fields relevant for comparison — skip `conferenceLocation`, `conferenceCountry`, `pages`, `volume`, `issue`, `journalIssn`, etc. to keep payload small |
| **`status` field on the pair**                       | `"pending"` / `"resolved"` — UI needs this to filter queue and track progress                                                                                       |
| **`resolvedDecision` field**                         | `null` / `"keep-original"` / `"keep-duplicate"` / `"keep-both"` — stores what the researcher decided                                                                |
| **`resolvedAt` + `resolvedBy`**                      | Audit trail for who resolved when                                                                                                                                   |
| **Keep existing `/duplicates` endpoint**             | It's still useful for flat reporting, statistics, export. The new endpoint serves the review workflow specifically                                                  |

---

## Lightweight Paper DTO

Only the fields needed for side-by-side comparison:

```csharp
public class DuplicatePairPaperDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string? Authors { get; set; }
    public string? Abstract { get; set; }
    public string? Doi { get; set; }
    public string? PublicationType { get; set; }
    public string? PublicationYear { get; set; }
    public int? PublicationYearInt { get; set; }
    public string? Source { get; set; }        // Import source (PubMed, IEEE, etc.)
    public string? Journal { get; set; }
    public string? Keywords { get; set; }
    public string? Url { get; set; }
    public string? ImportedAt { get; set; }    // ISO 8601
}
```

## Duplicate Pair Response DTO

```csharp
public class DuplicatePairDto
{
    public Guid Id { get; set; }                          // DeduplicationResult ID
    public DuplicatePairPaperDto OriginalPaper { get; set; }
    public DuplicatePairPaperDto DuplicatePaper { get; set; }
    public int Method { get; set; }                       // Enum integer
    public string MethodText { get; set; }                // "DOI_MATCH", "TITLE_FUZZY", etc.
    public double? ConfidenceScore { get; set; }          // 0.0 to 1.0
    public string? DeduplicationNotes { get; set; }
    public string Status { get; set; }                    // "pending" | "resolved"
    public string? ResolvedDecision { get; set; }         // null | "keep-original" | "keep-duplicate" | "keep-both"
    public DateTimeOffset? ResolvedAt { get; set; }
    public string? ResolvedBy { get; set; }
    public DateTimeOffset DetectedAt { get; set; }
}
```

---

## Query Parameters

| Parameter       | Type     | Required | Default            | Description                                                                                   |
| --------------- | -------- | -------- | ------------------ | --------------------------------------------------------------------------------------------- |
| `search`        | `string` | No       | `null`             | Search in title/DOI/authors of **either** paper in the pair (case-insensitive, partial match) |
| `status`        | `string` | No       | `null`             | Filter by `"pending"` or `"resolved"`                                                         |
| `minConfidence` | `float`  | No       | `null`             | Filter pairs with confidence >= value (e.g., `0.95`)                                          |
| `method`        | `int`    | No       | `null`             | Filter by detection method enum (`0`=DOI_MATCH, `1`=TITLE_FUZZY, etc.)                        |
| `pageNumber`    | `int`    | No       | `1`                | Page number (minimum: 1)                                                                      |
| `pageSize`      | `int`    | No       | `20`               | Items per page (minimum: 1, maximum: 100)                                                     |
| `sortBy`        | `string` | No       | `"confidenceDesc"` | Sort order: `"confidenceDesc"`, `"confidenceAsc"`, `"detectedAtDesc"`                         |

### Validation Rules

- `identificationProcessId` must be a valid UUID of an existing Identification Process
- `pageNumber` clamped to minimum `1`
- `pageSize` clamped between `1` and `100`
- `status` must be `"pending"` or `"resolved"` if provided
- `minConfidence` must be between `0.0` and `1.0` if provided
- `search` matches against **both** papers' Title, DOI, or Authors

---

## Companion Endpoint: Resolve Duplicate Pair

```
PATCH /api/identification-processes/{identificationProcessId}/duplicate-pairs/{pairId}/resolve
```

### Request Body

```json
{
  "decision": "keep-original"
}
```

| Field      | Type     | Required | Values                                                 |
| ---------- | -------- | -------- | ------------------------------------------------------ |
| `decision` | `string` | Yes      | `"keep-original"` / `"keep-duplicate"` / `"keep-both"` |

### Business Logic

1. Validate that the `DeduplicationResult` exists and belongs to this process
2. Validate that the pair is currently in `"pending"` status
3. Update `DeduplicationResult`:
   - Set `Status` = `"resolved"`
   - Set `ResolvedDecision` = request decision
   - Set `ResolvedAt` = `DateTimeOffset.UtcNow`
   - Set `ResolvedBy` = user from JWT token
4. Apply the decision:
   - `"keep-original"` → Mark **duplicate paper** as excluded from this process
   - `"keep-duplicate"` → Mark **original paper** as excluded from this process
   - `"keep-both"` → Mark as not-a-duplicate, keep both papers in the process
5. Update PRISMA statistics (unique count, duplicate count)

### Success Response (200 OK)

```json
{
  "isSuccess": true,
  "message": "Duplicate pair resolved successfully.",
  "data": {
    "id": "deduplication-result-uuid",
    "status": "resolved",
    "resolvedDecision": "keep-original",
    "resolvedAt": "2024-06-02T15:30:00+00:00",
    "resolvedBy": "researcher@university.edu"
  },
  "errors": null
}
```

### Error Responses

| Status | Scenario                                         |
| ------ | ------------------------------------------------ |
| 400    | Invalid decision value                           |
| 400    | Pair already resolved                            |
| 404    | Pair not found or doesn't belong to this process |
| 500    | Server error                                     |

---

## Query Logic

```
DeduplicationResults WHERE:
  deduplicationResult.IdentificationProcessId == {identificationProcessId}

INCLUDE:
  deduplicationResult.Paper           → duplicatePaper (the paper flagged as duplicate)
  deduplicationResult.DuplicateOfPaper → originalPaper (the paper it duplicates)

PROJECT TO:
  DuplicatePairDto with both papers as DuplicatePairPaperDto
```

---

## Why NOT Frontend Transform?

Grouping/joining on the frontend was considered but is problematic:

| Problem                          | Detail                                                                                             |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| **N+1 fetches**                  | Would need to fetch full metadata for each `duplicateOfPaperId` separately — one API call per pair |
| **Pagination breaks**            | Frontend can't know total pair count for proper pagination when grouping across pages              |
| **Server-side status filtering** | Impossible to filter by `status` if the server doesn't track resolution status per pair            |
| **Performance**                  | For 500+ duplicates, fetching originals individually is untenable                                  |
| **Resolution tracking**          | No server-side record of who resolved what, when                                                   |

---

## Deduplication Methods Reference

| Value | Name           | Description                           | Typical Confidence |
| ----- | -------------- | ------------------------------------- | ------------------ |
| `0`   | `DOI_MATCH`    | Exact DOI match (highest reliability) | `1.0` (100%)       |
| `1`   | `TITLE_FUZZY`  | Fuzzy title matching                  | `0.7 – 0.95`       |
| `2`   | `TITLE_AUTHOR` | Title + Author similarity             | `0.8 – 0.95`       |
| `3`   | `HYBRID`       | Multiple criteria combined            | `0.6 – 0.99`       |
| `4`   | `MANUAL`       | Manual review by researcher           | `1.0` (100%)       |

---

## TypeScript Interfaces (Frontend Will Use)

```typescript
// Lightweight paper info for comparison view
interface DuplicatePairPaperDto {
  id: string;
  title: string;
  authors?: string | null;
  abstract?: string | null;
  doi?: string | null;
  publicationType?: string | null;
  publicationYear?: string | null;
  publicationYearInt?: number | null;
  source?: string | null;
  journal?: string | null;
  keywords?: string | null;
  url?: string | null;
  importedAt?: string | null;
}

// One duplicate pair (a deduplication result with both papers)
interface DuplicatePairResponse {
  id: string; // DeduplicationResult UUID
  originalPaper: DuplicatePairPaperDto;
  duplicatePaper: DuplicatePairPaperDto;
  method: number; // Enum integer
  methodText: string; // "DOI_MATCH", "TITLE_FUZZY", etc.
  confidenceScore?: number | null; // 0.0 to 1.0
  deduplicationNotes?: string | null;
  status: "pending" | "resolved";
  resolvedDecision?: string | null; // "keep-original" | "keep-duplicate" | "keep-both"
  resolvedAt?: string | null; // ISO 8601
  resolvedBy?: string | null;
  detectedAt: string; // ISO 8601
}

// Paginated response
interface PaginatedDuplicatePairResponse {
  items: DuplicatePairResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Request params
interface GetDuplicatePairsParams {
  identificationProcessId: string;
  search?: string;
  status?: "pending" | "resolved";
  minConfidence?: number;
  method?: number;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: "confidenceDesc" | "confidenceAsc" | "detectedAtDesc";
}

// Resolve request
interface ResolveDuplicatePairRequest {
  decision: "keep-original" | "keep-duplicate" | "keep-both";
}

// Resolve response data
interface ResolveDuplicatePairResult {
  id: string;
  status: string;
  resolvedDecision: string;
  resolvedAt: string;
  resolvedBy: string;
}
```

---

## Implementation Priority

| Priority         | Endpoint                                 | Blocks                                   |
| ---------------- | ---------------------------------------- | ---------------------------------------- |
| **1 (Critical)** | `GET .../duplicate-pairs`                | Entire deduplication review UI           |
| **2 (Critical)** | `PATCH .../duplicate-pairs/{id}/resolve` | Resolve workflow                         |
| **3 (Keep)**     | `GET .../duplicates` (existing)          | No changes — serves reporting/statistics |

---

## Relationship Between Endpoints

| Endpoint                                           | Purpose                                  | Returns                                           |
| -------------------------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| `GET .../duplicates`                               | Flat reporting, statistics, export       | Individual duplicate papers with metadata pointer |
| `GET .../duplicate-pairs` **(NEW)**                | Review workflow, side-by-side comparison | Paired papers with full metadata on both sides    |
| `PATCH .../duplicate-pairs/{id}/resolve` **(NEW)** | Record researcher decision               | Resolution result with audit trail                |
| `GET .../unique-papers`                            | Library tab, non-duplicate papers        | Papers with no DeduplicationResult                |

---

**Document Version:** 1.0  
**Requested by:** Frontend Team  
**Target:** Backend Team
