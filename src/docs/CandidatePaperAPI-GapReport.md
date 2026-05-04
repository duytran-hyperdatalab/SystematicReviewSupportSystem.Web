# Candidate Paper API ↔ UI Integration Gap Report

This document outlines the discrepancies between the UI requirements for the Backward Snowballing candidate pool (`SnowballingCandidatesTab.tsx`) and the current `Candidate Paper API` documentation.

## 🚨 API Contract Gaps

### 1. Missing Server-Side Filtering & Pagination
*   **Endpoint:** `GET /api/candidate-papers/project/{projectId}`
*   **Severity:** **BLOCKER** (at scale)
*   **What UI needs:** To request distinct pages, search by text, and filter by status/year efficiently.
*   **What API currently provides:** Returns ALL candidates for a project as a single flat array.
*   **Why this is a problem:** A single systematic review might have 1,000 included papers. If extracted, this generates 30,000+ candidates. Returning 30k+ records in a single GET request will cause massive payload sizes, slow loading, and crash the browser tab trying to render or client-side filter them.
*   **Exact backend change recommendation:** 
    *   Change route to accept query params: `GET /api/candidate-papers/project/{projectId}?page=1&pageSize=50&searchTerm=xyz&status=0&year=2024`
    *   Change response format to a standard Paginated Response:
    ```json
    {
      "items": [
        // ... CandidatePaperDto objects
      ],
      "totalCount": 3500,
      "page": 1,
      "totalPages": 70
    }
    ```

### 2. Meaningless Origin Paper Context
*   **Endpoint:** `GET /api/candidate-papers/project/{projectId}`
*   **Severity:** **WARNING**
*   **What UI needs:** To display to the user *which* paper this reference came from, and allow searching by "origin paper" (as designed in the UI search bar).
*   **What API currently provides:** Only provides `originPaperId` (assumption: a Guid like `550e8400-e29b-41d4-a716-446655440000`).
*   **Why this is a problem:** Displaying "Origin ID: 550e8400..." means nothing to a researcher. They cannot search by origin paper effectively unless they know its raw UUID. 
*   **Exact backend change recommendation:** Add `originPaperTitle` (and optionally `originPaperAuthors`) to the `CandidatePaperDto` return object so the frontend can display: *"Source: An empirical study... (Smith, J.)"*.

---

## ⚠️ Frontend Integration Risk Notes

1. **Client-Side Filtering Performance Risk:** Because we currently lack backend pagination, we have to download the full payload and filter in React as a fallback. If a project has 5,000+ candidates, running `Array.filter` paired with React state updates on keystrokes will cause severe UI lag.
2. **Missing `isLoading` / `isExtracting` States:** The documentation says *"Extraction can take several seconds... FE should show a prominent loading spinner"*, but there is no endpoint provided to poll the extraction job status. The UI will just hang or need a global blocking spinner. If the backend fails silently during GROBID parsing, the user will be stuck without feedback.
3. **N+1 Risk if patching the Origin Paper Gap:** If the frontend tries to solve the `originPaperId` display issue by individually fetching `/api/papers/{originPaperId}` for every candidate in a list of 1,000 items, it will DDoS the backend. We **must** use the raw `originPaperId` GUID in the UI until the backend adds `originPaperTitle` to the `CandidatePaperDto`.