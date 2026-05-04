# Frontend Integration Guide: MarkPaperAsNotRetrieved

This document covers only one API:
- MarkPaperAsNotRetrieved

---

## 1. Basic Info

- Method: `POST`
- Full route path: `/api/study-selection/{id}/papers/{paperId}/full-text/not-retrieved`
- Purpose: Explicitly mark a paper as **NotRetrieved** for full-text retrieval tracking.

Plain meaning for frontend:
- User says: "We could not retrieve full text for this paper."
- Backend stores that decision as a durable state.

---

## 2. Request Details

### Headers

- `Content-Type: application/json` (safe default; request has no body)
- `Authorization: Bearer <token>`
  - The endpoint itself does **not** have `[Authorize]` at action level.
  - But app pipeline uses authentication/authorization middleware globally, so FE should still send token in normal authenticated flows.

### Path Params

```ts
interface MarkPaperAsNotRetrievedPathParams {
  id: string; // StudySelectionProcessId (GUID)
  paperId: string; // PaperId (GUID)
}
```

Validation:
- Both must be valid GUIDs.
- Missing/invalid GUID format will fail model binding (400-level model validation response format).

### Query Params

- None.

### Request Body

- None.

```ts
type MarkPaperAsNotRetrievedRequestBody = never;
```

### Required vs Optional

- Required:
  - `id` (path)
  - `paperId` (path)
- Optional:
  - None

### Validation Rules (business validations from service)

Backend checks in this order:
1. StudySelectionProcess exists by `id`.
2. Paper exists by `paperId`.
3. ReviewProcess for StudySelectionProcess exists.
4. Paper belongs to same project as that ReviewProcess.

If any check fails, backend throws exception.

---

## 3. Response Details

### Success Response Schema

HTTP: `200 OK`

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

type MarkPaperAsNotRetrievedSuccessResponse = ApiResponse<boolean>;
```

Typical success payload:

```json
{
  "isSuccess": true,
  "message": "Paper marked as not retrieved successfully.",
  "data": true,
  "errors": null
}
```

### Error Response Schema

```ts
type MarkPaperAsNotRetrievedErrorResponse = ApiResponse<null>;
```

Important note:
- In this codebase, these validation failures currently throw `InvalidOperationException`.
- Global exception middleware maps non-domain exceptions to `500 Internal Server Error`.
- So not-found/mismatch conditions are currently returned as 500 (with readable message), not clean 404/409 domain responses.

Typical error payload shape:

```json
{
  "isSuccess": false,
  "message": "Paper does not belong to the same project as the study selection process.",
  "errors": null
}
```

### HTTP Status Codes Used

- `200` on success.
- `500` for current service-level validation/business exceptions (due to exception type mapping).
- `400` possible for route/model binding issues (e.g., malformed GUID).

---

## 4. Business Logic Summary

What it actually does:
- Marks one paper as `FullTextRetrievalStatus = NotRetrieved`.
- Updates `paper.ModifiedAt = UtcNow`.
- Persists to database.

Important conditions FE must know:
- Paper must belong to the same project as the given study-selection process.
- If paper is already `NotRetrieved`, endpoint is idempotent: returns success, no additional change.

Side effects:
- State change in `Paper` entity only.
- No queue/background extraction is triggered.
- No notification dispatch in this method.

Caching/timing considerations:
- Write is immediate within request transaction scope.
- FE should refresh paper detail/list after success to show latest retrieval status.

Pagination/filtering behavior:
- Not applicable (single-resource mutation endpoint).

---

## 5. Frontend Integration Notes

When FE should call this API:
- User explicitly chooses action like "Mark as Not Retrieved" in full-text workflow.
- Use when retrieval attempt failed or paper is inaccessible.

Common pitfalls:
- Do not send request body.
- Ensure both IDs are correct process-paper pair; cross-project mismatch fails.
- Do not assume 404 for missing entities; currently may come as 500 with message text.

Loading/error handling suggestions:
- Disable action button while request is in-flight.
- On success, optimistic UI update is fine, then re-fetch to keep server truth.
- On error, display backend message and allow retry.

Race conditions to watch:
- Concurrent calls with `UpdatePaperFullText` can overwrite status to `Retrieved` (last write wins).
- If user uploads full text and marks not-retrieved near-simultaneously, always re-fetch final server state.

---

## 6. Ready-to-Use FE Types + Example Calls

### TypeScript Types

```ts
export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  errors?: ApiError[] | null;
  data?: T;
}

export interface MarkPaperAsNotRetrievedPathParams {
  id: string; // StudySelectionProcessId GUID
  paperId: string; // PaperId GUID
}

export type MarkPaperAsNotRetrievedResponse = ApiResponse<boolean>;
```

### Fetch Example

```ts
export async function markPaperAsNotRetrieved(
  baseUrl: string,
  params: MarkPaperAsNotRetrievedPathParams,
  accessToken: string
): Promise<MarkPaperAsNotRetrievedResponse> {
  const url = `${baseUrl}/api/study-selection/${params.id}/papers/${params.paperId}/full-text/not-retrieved`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = (await res.json()) as MarkPaperAsNotRetrievedResponse;

  if (!res.ok || !data.isSuccess) {
    throw new Error(data.message || "Failed to mark paper as not retrieved");
  }

  return data;
}
```

### Axios Example

```ts
import axios from "axios";

export async function markPaperAsNotRetrievedAxios(
  baseUrl: string,
  params: MarkPaperAsNotRetrievedPathParams,
  accessToken: string
) {
  const url = `${baseUrl}/api/study-selection/${params.id}/papers/${params.paperId}/full-text/not-retrieved`;

  const response = await axios.post<MarkPaperAsNotRetrievedResponse>(
    url,
    undefined,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  return response.data;
}
```

---

## Quick FE Checklist

- Use `POST /api/study-selection/{id}/papers/{paperId}/full-text/not-retrieved`
- Send valid GUIDs for both path params
- No request body
- Handle success: `ApiResponse<boolean>` with `data = true`
- Handle business failures as possible `500` with useful `message`
- Re-fetch paper data after mutation to avoid stale UI
