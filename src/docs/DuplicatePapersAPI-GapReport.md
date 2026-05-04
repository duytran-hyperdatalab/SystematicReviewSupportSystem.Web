# Duplicate Papers API — Integration Gap Report

**Endpoint:** `GET /api/identification-processes/{identificationProcessId}/duplicates`  
**Date:** 2026-02-27  
**Analyst:** Frontend Integration Engineer

---

## Step 1: API ↔ UI Mapping

### Current UI: DeduplicationTabContent

| UI Feature | Required Data | API Provides | Status |
|------------|--------------|-------------|--------|
| Paginated duplicate list | `items[]`, pagination fields | ✅ Full pagination (`totalCount`, `pageNumber`, `pageSize`, `totalPages`, `hasNextPage`, `hasPreviousPage`) | ✅ OK |
| Search by title/DOI/authors | `search` query param | ✅ `search` param matches title, DOI, authors | ✅ OK |
| Year filter | `year` query param | ✅ `year` param (exact match) | ✅ OK |
| Duplicate paper full metadata | `PaperResponse` fields | ✅ Full paper metadata returned | ✅ OK |
| Original paper full metadata | title, authors, year, doi, source, abstract | ❌ Only `duplicateOfPaperId` + `duplicateOfTitle` | ⚠️ **GAP** |
| Detection method | method + display text | ✅ `method` (int) + `methodText` (string) | ✅ OK |
| Confidence score | 0-1 float | ✅ `confidenceScore` (0.0–1.0, nullable) | ✅ OK |
| Detection timestamp | ISO datetime | ✅ `detectedAt` | ✅ OK |
| Detection notes | string | ✅ `deduplicationNotes` (nullable) | ✅ OK |
| Resolve/keep actions | resolve endpoint | ❌ No resolve endpoint exists | ⚠️ **GAP** |
| Pair-based comparison | paperA + paperB full data | ❌ Flat list, not paired; original paper lacks metadata | ⚠️ **GAP** |
| Resolution status (pending/resolved) | status field | ❌ No resolution status in response | ⚠️ **GAP** |
| Sort by confidence | sort query param | ❌ Always `detectedAt DESC` | ⚠️ **GAP** |

---

## Step 2: Gap Report

### 🚨 API Contract Issues

---

#### Issue 1: Original Paper Metadata Missing

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/identification-processes/{id}/duplicates` |
| **Severity** | **WARNING** |
| **What UI needs** | Full original paper metadata (title, authors, year, DOI, source, abstract) for side-by-side comparison view |
| **What API provides** | Only `duplicateOfPaperId` (UUID) and `duplicateOfTitle` (string) |
| **Why this is a problem** | The comparison view (showing duplicate vs original side-by-side) can only display the original paper's title. Authors, year, DOI, source, and abstract are missing — making meaningful comparison impossible without a second API call per paper. |
| **Recommendation** | Include embedded original paper metadata in the response: `duplicateOfAuthors`, `duplicateOfYear`, `duplicateOfDoi`, `duplicateOfSource`, `duplicateOfAbstract`. OR return a nested `duplicateOfPaper: PaperResponse` object. The backend query already includes `DuplicateOfPaper` — just surface more fields. |
| **Frontend workaround** | Display `duplicateOfTitle` as the only original paper field. Show "Original paper details unavailable" for other fields. Could add a separate `GET /api/papers/{duplicateOfPaperId}` call per selection, but this creates N+1 risk. |

---

#### Issue 2: No Resolution/Override Endpoint

| Field | Value |
|-------|-------|
| **Endpoint** | N/A — endpoint doesn't exist |
| **Severity** | **WARNING** |
| **What UI needs** | Ability for researcher to confirm or override deduplication decisions (e.g., "keep both — not actually duplicates" or "confirm as duplicate") |
| **What API provides** | Read-only duplicate results. No write endpoint for manual review outcomes. |
| **Why this is a problem** | The current UI designs manual review workflow with "Keep A / Keep B / Keep Both" actions. Without a backend endpoint, these actions have no persistence. |
| **Recommendation** | Create `POST /api/identification-processes/{id}/duplicates/{duplicateId}/resolve` with body `{ resolution: "confirm" | "reject" | "override" }`. |
| **Frontend workaround** | Display deduplication results as read-only. Disable or remove resolve buttons for now. Show detection method and confidence for researcher awareness. |

---

#### Issue 3: No Resolution Status Field

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/identification-processes/{id}/duplicates` |
| **Severity** | **NICE_TO_HAVE** |
| **What UI needs** | A `reviewStatus` field (e.g., "pending" | "confirmed" | "rejected") so researchers can track which detections they've reviewed |
| **What API provides** | No status field at all |
| **Why this is a problem** | Cannot distinguish reviewed vs. unreviewed detections. All appear with the same status. |
| **Recommendation** | Add `reviewStatus` and `reviewedBy` fields to `DeduplicationResult`. |
| **Frontend workaround** | Treat all results as informational. No status tracking. |

---

#### Issue 4: No Server-Side Sort Options

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/identification-processes/{id}/duplicates` |
| **Severity** | **NICE_TO_HAVE** |
| **What UI needs** | Sort by `confidenceScore` (high first) or by `methodText` to group similar detections |
| **What API provides** | Fixed sort: `detectedAt DESC` only |
| **Why this is a problem** | Researchers reviewing duplicates would naturally want to see highest-confidence matches first. Client-side sort only works within current page. |
| **Recommendation** | Add `sortBy` query param supporting `detectedAt`, `confidenceScore`, `title`. Add `sortOrder` param (`asc` | `desc`). |
| **Frontend workaround** | Client-side sort within the current page. Note: this only sorts the visible page, not the full dataset. |

---

#### Issue 5: Confidence Score Nullability

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/identification-processes/{id}/duplicates` |
| **Severity** | **NICE_TO_HAVE** |
| **What UI needs** | Non-null confidence score for confidence badge display |
| **What API provides** | `confidenceScore` can be `null` |
| **Why this is a problem** | UI must handle null confidence gracefully. The display logic has 4 tiers (Very High/High/Medium/Low) but no "Unknown" tier. |
| **Recommendation** | Default `confidenceScore` to method-specific defaults in backend (e.g., DOI_MATCH → 1.0). |
| **Frontend workaround** | Handle null with "Unknown" badge and grey color. Already handled in implementation. |

---

#### Issue 6: Architecture Mismatch — Flat List vs Pair Model

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/identification-processes/{id}/duplicates` |
| **Severity** | **WARNING** |
| **What UI needs** | The existing `DuplicatePair` type expects `paperA` + `paperB` side-by-side. The existing `DeduplicationTabContent` and sub-components (`DuplicateQueuePanel`, `PaperComparisonCard`) all use this pair model. |
| **What API provides** | Flat list where each item is ONE duplicate paper with a reference (`duplicateOfPaperId` + `duplicateOfTitle`) to the original. A single original can be referenced by multiple duplicates. |
| **Why this is a problem** | Cannot directly feed API response into existing `DuplicatePair` type. The data model is fundamentally different — API is "paper-centric" while UI was "pair-centric". |
| **Recommendation** | No backend change needed. Frontend should adapt to a "duplicate results" list view. The pair-comparison model can be supported if Issue #1 is resolved (original paper metadata). |
| **Frontend solution** | Redesign the Deduplication tab as a paginated results table showing detected duplicates. Clicking a row expands/shows the duplicate + original reference. Keep the comparison feature for when the backend adds original paper metadata. |

---

## Step 3: Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| N+1 API calls for original paper data | High latency if fetching each original paper individually | Use only `duplicateOfTitle` from response; flag for backend improvement |
| No persistence for review actions | Resolve buttons non-functional | Display results as read-only; disable resolve UI |
| Client-side sort limited to current page | Misleading sort results on paginated data | Show disclaimer; request server-side sort |
| `confidenceScore` null handling | Crash if not handled | Null-safe display with "Unknown" fallback |
| `PaginatedResponse` type inconsistency | `PaginatedResponse<T>` in project.ts lacks `hasPreviousPage`/`hasNextPage` | Use `PaginatedPaperResponse` pattern from paper.ts instead |

---

## Step 4: Integration Decision

Given the gaps, the frontend integration will:

1. **Create proper TypeScript types** matching the exact API response (no hallucinated fields)
2. **Create service + hook** following the `useUniquePapers` pattern
3. **Redesign DeduplicationTabContent** to show a paginated results table instead of mock pairs
4. **Keep comparison/detail view** for individual duplicates (using only available data)
5. **Disable resolve actions** (no backend support) — show as read-only results
6. **Preserve existing sub-components** (ProgressBanner, QueuePanel, keyboard nav) where possible

---

*Report generated by frontend integration analysis.*
