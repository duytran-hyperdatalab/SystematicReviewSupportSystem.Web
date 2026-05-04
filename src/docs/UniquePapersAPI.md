# Unique Papers API Documentation



---

## Overview

This endpoint retrieves **unique (non-duplicate) papers** within a specific Identification Process. In the PRISMA 2020 workflow, after papers are imported from multiple databases, duplicates are detected and recorded in the `DeduplicationResult` table. This API returns only the papers that were **not** flagged as duplicates — i.e., the unique pool of studies that proceed to the screening phase.

**Key concept:** Duplication is **process-scoped**, not global. A paper may be unique in one Identification Process but flagged as a duplicate in another.

---

## Get Unique Papers by Identification Process

### 1. Basic Info

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Route** | `/identification-processes/{identificationProcessId}/unique-papers` |
| **Content-Type** | `application/json` |
| **Description** | Get paginated list of non-duplicate papers for a specific identification process |

### 2. Request Details

#### Headers

```
Content-Type: application/json
Authorization: Bearer {token}  (if authentication enabled)
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `identificationProcessId` | `string (UUID)` | ✅ Yes | The ID of the Identification Process |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | `string` | ❌ No | `null` | Search in Title, DOI, or Authors (case-insensitive) |
| `year` | `integer` | ❌ No | `null` | Filter by publication year (exact match) |
| `pageNumber` | `integer` | ❌ No | `1` | Page number (minimum: 1) |
| `pageSize` | `integer` | ❌ No | `20` | Items per page (minimum: 1, maximum: 100) |

#### Validation Rules

- `identificationProcessId` must be a valid UUID of an existing Identification Process
- `pageNumber` is clamped to minimum `1`
- `pageSize` is clamped between `1` and `100`
- `search` matches against Title, DOI, or Authors (case-insensitive, partial match)
- `year` matches against the parsed integer publication year

### 3. Response Details

#### Success Response (200 OK)

```json
{
  "isSuccess": true,
  "message": "Retrieved 20 of 147 unique papers.",
  "data": {
    "items": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "title": "Machine Learning in Healthcare: A Systematic Review",
        "authors": "Smith, J.; Doe, A.; Johnson, M.",
        "abstract": "This paper reviews recent advances in machine learning applied to healthcare...",
        "doi": "10.1234/example.2024.001",
        "publicationType": "Journal Article",
        "publicationYear": "2024",
        "publicationYearInt": 2024,
        "publicationDate": "2024-03-15T00:00:00+00:00",
        "volume": "15",
        "issue": "3",
        "pages": "123-145",
        "publisher": "Springer",
        "language": "English",
        "keywords": "machine learning, healthcare, systematic review",
        "url": "https://doi.org/10.1234/example.2024.001",
        "conferenceName": null,
        "conferenceLocation": null,
        "conferenceCountry": null,
        "conferenceYear": null,
        "journal": "Journal of Medical Informatics",
        "journalIssn": "1234-5678",
        "source": "RIS",
        "importedAt": "2024-06-01T10:30:00+00:00",
        "importedBy": "researcher@university.edu",
        "selectionStatus": null,
        "selectionStatusText": null,
        "pdfUrl": null,
        "fullTextAvailable": null,
        "accessType": null,
        "accessTypeText": null,
        "createdAt": "2024-06-01T10:30:00+00:00",
        "modifiedAt": "2024-06-01T10:30:00+00:00"
      }
    ],
    "totalCount": 147,
    "pageNumber": 1,
    "pageSize": 20,
    "totalPages": 8,
    "hasPreviousPage": false,
    "hasNextPage": true
  },
  "errors": null
}
```

#### Empty Result (200 OK)

```json
{
  "isSuccess": true,
  "message": "No unique papers found for this identification process.",
  "data": {
    "items": [],
    "totalCount": 0,
    "pageNumber": 1,
    "pageSize": 20,
    "totalPages": 0,
    "hasPreviousPage": false,
    "hasNextPage": false
  },
  "errors": null
}
```

#### Error Responses

| Status | Scenario | Example Response |
|--------|----------|-----------------|
| **500** | Identification Process not found | `{ "isSuccess": false, "message": "IdentificationProcess with ID {id} not found.", "errors": null }` |
| **500** | Server error | `{ "isSuccess": false, "message": "An error occurred", "errors": null }` |

#### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (including empty results) |
| 500 | Identification Process not found or server error |

### 4. Business Logic Summary

#### What This API Does

1. **Validates** that the Identification Process exists
2. **Normalizes** pagination parameters (clamps `pageNumber` ≥ 1, `pageSize` between 1–100)
3. **Queries** papers through the relationship chain:
   ```
   Paper → ImportBatch → SearchExecution → IdentificationProcess
   ```
4. **Excludes** any paper that has a `DeduplicationResult` record for this Identification Process
5. **Applies** optional search and year filters
6. **Returns** paginated results ordered by `createdAt` descending (newest first)

#### Filtering Logic (Simplified)

```
Papers WHERE:
  paper.ImportBatch.SearchExecution.IdentificationProcessId == {id}
  AND paper has NO DeduplicationResult for this IdentificationProcess
```

#### Important Conditions for Frontend

| Condition | Detail |
|-----------|--------|
| **Unique = no deduplication record** | A paper is "unique" if it has zero entries in `DeduplicationResult` for this process |
| **Process-scoped** | Uniqueness is relative to one Identification Process, not global |
| **Selection status is always null** | `selectionStatus` and `selectionStatusText` are always `null` — status lives in `ScreeningResolution`, not on the paper |
| **Results change over time** | If deduplication runs again, papers previously "unique" may become "duplicate" |
| **Ordered by newest first** | Papers are sorted by `createdAt` descending |

#### Side Effects

- **None** — this is a read-only endpoint

#### Relationship to Duplicates Endpoint

| Endpoint | Returns |
|----------|---------|
| `GET .../unique-papers` | Papers with **no** `DeduplicationResult` for this process |
| `GET .../duplicates` | Papers with a `DeduplicationResult` for this process |
| **Together** | They cover **all** papers in the Identification Process |

### 5. Frontend Integration Notes

#### When to Call This API

- After importing papers and running deduplication, to display the **clean pool** of unique studies
- On the "Identification Results" or "PRISMA Flow" page
- When the user navigates to the screening phase to see which papers are eligible
- To populate data tables, charts, or export lists

#### Common Pitfalls

| ❌ Don't | ✅ Do |
|----------|------|
| Assume `totalCount` equals number of items returned | Use `totalCount` for total and `items.length` for current page |
| Hardcode page size | Respect `totalPages` and `hasNextPage` for pagination UI |
| Treat empty results as an error | Empty results (200 OK) are valid — no unique papers yet |
| Cache aggressively | Results can change after deduplication runs — refetch when needed |
| Ignore `selectionStatus` being null | Status is derived from `ScreeningResolution`, not stored on paper |

#### Loading & Error Handling

```typescript
// Recommended loading states
type LoadingState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

// Determine state from response
function getState(response: ApiResponse<PaginatedResponse<PaperResponse>>): LoadingState {
  if (!response.isSuccess) return 'error';
  if (response.data.totalCount === 0) return 'empty';
  return 'success';
}
```

#### Pagination Tips

- Use `hasNextPage` / `hasPreviousPage` to enable/disable pagination buttons
- Use `totalCount` to display "Showing X of Y papers"
- Use `totalPages` for page number selectors
- Reset to `pageNumber=1` when changing search or year filters

### 6. TypeScript Interfaces

```typescript
// ============================================
// Request
// ============================================
interface GetUniquePapersParams {
  identificationProcessId: string;     // UUID (path param)
  search?: string;                     // Optional search text
  year?: number;                       // Optional year filter
  pageNumber?: number;                 // Default: 1
  pageSize?: number;                   // Default: 20, max: 100
}

// ============================================
// Response Wrapper
// ============================================
interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T | null;
  errors: ApiError[] | null;
}

interface ApiError {
  code: string;
  message: string;
}

// ============================================
// Paginated Response
// ============================================
interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ============================================
// Paper Response
// ============================================
interface PaperResponse {
  id: string;                            // UUID

  // Core Metadata
  title: string;
  authors?: string | null;
  abstract?: string | null;
  doi?: string | null;
  publicationType?: string | null;
  publicationYear?: string | null;
  publicationYearInt?: number | null;
  publicationDate?: string | null;       // ISO 8601
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  publisher?: string | null;
  language?: string | null;
  keywords?: string | null;
  url?: string | null;

  // Conference Metadata
  conferenceName?: string | null;
  conferenceLocation?: string | null;
  conferenceCountry?: string | null;
  conferenceYear?: number | null;

  // Journal Metadata
  journal?: string | null;
  journalIssn?: string | null;

  // Source Tracking
  source?: string | null;
  importedAt?: string | null;            // ISO 8601
  importedBy?: string | null;

  // Selection Status (always null from this endpoint)
  selectionStatus?: string | null;
  selectionStatusText?: string | null;

  // Access
  pdfUrl?: string | null;
  fullTextAvailable?: boolean | null;
  accessType?: string | null;
  accessTypeText?: string | null;

  // Audit
  createdAt: string;                     // ISO 8601
  modifiedAt: string;                    // ISO 8601
}
```

### 7. Example API Calls

#### Fetch with Query Parameters

```typescript
async function getUniquePapers(
  params: GetUniquePapersParams
): Promise<PaginatedResponse<PaperResponse>> {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.set('search', params.search);
  if (params.year) queryParams.set('year', params.year.toString());
  if (params.pageNumber) queryParams.set('pageNumber', params.pageNumber.toString());
  if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());

  const url = `/api/identification-processes/${params.identificationProcessId}/unique-papers?${queryParams}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    }
  });

  const result: ApiResponse<PaginatedResponse<PaperResponse>> = await response.json();

  if (!result.isSuccess || !result.data) {
    throw new Error(result.message);
  }

  return result.data;
}
```

#### Usage Examples

```typescript
// Basic: Get first page
const page1 = await getUniquePapers({
  identificationProcessId: 'abc-123-def'
});
console.log(`${page1.totalCount} unique papers found`);

// With search
const filtered = await getUniquePapers({
  identificationProcessId: 'abc-123-def',
  search: 'machine learning',
  pageSize: 50
});

// With year filter
const papers2024 = await getUniquePapers({
  identificationProcessId: 'abc-123-def',
  year: 2024
});

// Pagination: next page
const page2 = await getUniquePapers({
  identificationProcessId: 'abc-123-def',
  pageNumber: 2,
  pageSize: 20
});
```

#### React Hook Example

```typescript
import { useState, useEffect, useCallback } from 'react';

interface UseUniquePapersOptions {
  identificationProcessId: string;
  pageSize?: number;
}

export function useUniquePapers({ identificationProcessId, pageSize = 20 }: UseUniquePapersOptions) {
  const [data, setData] = useState<PaginatedResponse<PaperResponse> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState<number | undefined>();
  const [pageNumber, setPageNumber] = useState(1);

  const fetchPapers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getUniquePapers({
        identificationProcessId,
        search: search || undefined,
        year,
        pageNumber,
        pageSize
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load papers');
    } finally {
      setLoading(false);
    }
  }, [identificationProcessId, search, year, pageNumber, pageSize]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // Reset to page 1 when filters change
  const updateSearch = (value: string) => {
    setSearch(value);
    setPageNumber(1);
  };

  const updateYear = (value: number | undefined) => {
    setYear(value);
    setPageNumber(1);
  };

  return {
    papers: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 0,
    hasNextPage: data?.hasNextPage ?? false,
    hasPreviousPage: data?.hasPreviousPage ?? false,
    pageNumber,
    loading,
    error,
    setPageNumber,
    setSearch: updateSearch,
    setYear: updateYear,
    refetch: fetchPapers
  };
}
```

#### React Component Example

```tsx
import React from 'react';
import { useUniquePapers } from './useUniquePapers';

interface Props {
  identificationProcessId: string;
}

export const UniquePapersTable: React.FC<Props> = ({ identificationProcessId }) => {
  const {
    papers,
    totalCount,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    pageNumber,
    loading,
    error,
    setPageNumber,
    setSearch,
    setYear
  } = useUniquePapers({ identificationProcessId, pageSize: 20 });

  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div>
      <h2>Unique Papers ({totalCount})</h2>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search title, DOI, authors..."
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="number"
          placeholder="Year"
          onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div>Loading...</div>
      ) : papers.length === 0 ? (
        <div>No unique papers found.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Authors</th>
              <th>Year</th>
              <th>DOI</th>
              <th>Journal</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((paper) => (
              <tr key={paper.id}>
                <td>{paper.title}</td>
                <td>{paper.authors ?? 'N/A'}</td>
                <td>{paper.publicationYear ?? 'N/A'}</td>
                <td>
                  {paper.doi ? (
                    <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noreferrer">
                      {paper.doi}
                    </a>
                  ) : 'N/A'}
                </td>
                <td>{paper.journal ?? 'N/A'}</td>
                <td>{paper.source ?? 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button disabled={!hasPreviousPage} onClick={() => setPageNumber(pageNumber - 1)}>
          Previous
        </button>
        <span>Page {pageNumber} of {totalPages}</span>
        <button disabled={!hasNextPage} onClick={() => setPageNumber(pageNumber + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};
```

---

## cURL Example

```bash
# Basic call
curl -X GET "https://your-api.com/api/identification-processes/abc-123-def/unique-papers" \
  -H "Authorization: Bearer {token}"

# With filters and pagination
curl -X GET "https://your-api.com/api/identification-processes/abc-123-def/unique-papers?search=machine+learning&year=2024&pageNumber=1&pageSize=50" \
  -H "Authorization: Bearer {token}"
```

---

## Summary

| Item | Detail |
|------|--------|
| **Endpoint** | `GET /api/identification-processes/{id}/unique-papers` |
| **Purpose** | Retrieve non-duplicate papers for a specific identification process |
| **Pagination** | ✅ Supported (`pageNumber`, `pageSize`, max 100) |
| **Search** | ✅ By title, DOI, or authors (case-insensitive) |
| **Year Filter** | ✅ Exact match on publication year |
| **Sort Order** | `createdAt` descending (newest first) |
| **Side Effects** | None (read-only) |
| **Companion** | `GET .../duplicates` returns the inverse set |

---

**Backend Implementation:**
- Controller: `SRSS.IAM.API.Controllers.PapersController.GetUniquePapersByIdentificationProcess`
- Service: `SRSS.IAM.Services.PaperService.IPaperService.GetUniquePapersByIdentificationProcessAsync`
- Repository: `SRSS.IAM.Repositories.PaperRepo.IPaperRepository.GetUniquePapersByIdentificationProcessAsync`

**Document Version:** 1.0  
**Maintained by:** Backend Team
