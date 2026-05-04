# PRISMA Report — API ↔ UI Integration Analysis

> Generated from `be-integrate-prompt.md` workflow.
> Date: 2025-01-XX | Feature: PRISMA Report Workspace

---

## 1. API Endpoints Consumed

| #   | Method | Endpoint                                          | UI Consumer                              |
| --- | ------ | ------------------------------------------------- | ---------------------------------------- |
| 1   | `POST` | `/api/review-processes/{id}/prisma-report`        | `usePrismaReport.generateReport()`       |
| 2   | `GET`  | `/api/review-processes/{id}/prisma-report/latest` | `usePrismaReport.fetchLatestReport()`    |
| 3   | `GET`  | `/api/review-processes/{id}/prisma-reports`       | `usePrismaReport.fetchReportHistory()`   |
| 4   | `GET`  | `/api/prisma-reports/{reportId}`                  | Not yet wired (reserved for detail view) |

---

## 2. Field Mapping Summary

### `PrismaReportResponse` (GET latest / GET by ID)

| API Field         | Type                         | UI Component(s)                              | Status                      |
| ----------------- | ---------------------------- | -------------------------------------------- | --------------------------- |
| `id`              | `string`                     | Internal key                                 | ✅                          |
| `reviewProcessId` | `string`                     | N/A (implicit from route)                    | ✅                          |
| `version`         | `string`                     | `PrismaExportActions` badge                  | ✅                          |
| `generatedAt`     | `string`                     | `PrismaSummaryHeader`, `PrismaExportActions` | ✅                          |
| `notes`           | `string?`                    | **Not displayed**                            | ℹ️ Available for future use |
| `generatedBy`     | `string?`                    | `PrismaReportHistory` (list variant)         | ✅                          |
| `flowRecords[]`   | `PrismaFlowRecordResponse[]` | All visual components                        | ⚠️ See Issue #1             |
| `createdAt`       | `string`                     | Not used                                     | ✅ ignored                  |
| `modifiedAt`      | `string`                     | Not used                                     | ✅ ignored                  |

### `PrismaFlowRecordResponse` (nested in report)

| API Field      | Type                | UI Component(s)                                                    | Status                    |
| -------------- | ------------------- | ------------------------------------------------------------------ | ------------------------- |
| `id`           | `string`            | Internal key                                                       | ✅                        |
| `stage`        | `PrismaStage (int)` | `PrismaFlowDiagram`, `PrismaExclusionTable`, `PrismaSummaryHeader` | ⚠️ Only 5 stages returned |
| `stageText`    | `string`            | Not used (enum labels used instead)                                | ✅                        |
| `label`        | `string`            | Not used (hardcoded labels in UI)                                  | ✅                        |
| `count`        | `number`            | All visual components                                              | ✅                        |
| `description`  | `string?`           | Not used                                                           | ✅                        |
| `displayOrder` | `number`            | Not used (implicit from stage enum)                                | ✅                        |

### `PrismaReportListResponse` (GET list)

| API Field      | Type      | UI Component  | Status           |
| -------------- | --------- | ------------- | ---------------- |
| `id`           | `string`  | Row key       | ✅               |
| `version`      | `string`  | History table | ✅               |
| `generatedAt`  | `string`  | History table | ✅               |
| `generatedBy`  | `string?` | History table | ✅ Now populated |
| `totalRecords` | `number`  | History table | ✅               |

### `GeneratePrismaReportRequest` (POST generate)

| API Field     | Type      | Sent by UI                  | Status                 |
| ------------- | --------- | --------------------------- | ---------------------- |
| `version`     | `string?` | ✅ Auto-incremented         | ✅ Fixed: `toFixed(1)` |
| `notes`       | `string?` | ✅ Static string            | ✅                     |
| `generatedBy` | `string?` | ✅ Now sent from Redux user | ✅ Fixed               |

---

## 3. Gap Report

### 🚨 BLOCKER — Backend creates only 5 flow records; UI renders 9 stages

- **Endpoint**: `POST /api/review-processes/{id}/prisma-report`
- **Impact**: Stages 5 (`ReportsSoughtForRetrieval`), 6 (`ReportsNotRetrieved`), 7 (`ReportsAssessed`), 8 (`ReportsExcluded`) are **never returned** by the API.
- **Current UI behavior**: `getCount()` helper returns `0` safely ← no crash, but the Eligibility section is visually misleading (all zeros with no distinction from "not computed").
- **Backend recommendation**: Generate all 10 `PrismaFlowRecord` children (stages 0–9) even when stages 5–8 have `count = 0`. This ensures the frontend can differentiate "exists as zero" from "not yet implemented".

### ⚠️ WARNING — `RecordsExcluded` (stage 4) & `StudiesIncluded` (stage 9) always `0`

- **Per API doc**: "RecordsExcluded and StudiesIncluded are currently always 0" (backend TODO).
- **Impact**: Summary card "Studies Included" and flow box "Records excluded" will always show `0`.
- **Frontend handling**: Safe — displays `0`. But misleading after screening decisions have been made.
- **Backend recommendation**: Wire screening resolution queries to populate these. Optionally add a `computed: boolean` flag per flow record so UI can display "Pending" instead of `0`.

### ⚠️ WARNING — No per-reason exclusion detail

- **Impact**: `PrismaExclusionTable` can only aggregate by stage (e.g., "Duplicate records removed: 150"). Cannot show granular reasons like "Wrong population: 45".
- **Frontend handling**: Works — shows 4 aggregate rows derived from stage counts. Functional for MVP.
- **Backend recommendation (future)**: Add optional `exclusionReasons: { reason: string; count: number }[]` to `PrismaFlowRecordResponse` for PRISMA 2020 detailed reporting.

### ℹ️ NICE_TO_HAVE — `notes` not shown in UI

- **Impact**: `PrismaReportResponse.notes` is fetched but not displayed anywhere.
- **Recommendation**: Add a collapsible notes section below the export actions if `notes` is non-null.

---

## 4. Frontend Fixes Applied

### Fix 1: Floating-point version precision

- **File**: `PrismaReportWorkspace.tsx`
- **Before**: `String(Number(latestReport.version) + 0.1)` → could produce `"1.2000000000000002"`
- **After**: `(Number(latestReport.version) + 0.1).toFixed(1)` → always produces `"1.1"`, `"1.2"`, etc.

### Fix 2: Populate `generatedBy` from authenticated user

- **File**: `PrismaReportWorkspace.tsx`
- **Before**: `generatedBy` was not sent in the generate request.
- **After**: Reads `user` from Redux auth state via `useSelector`. Sends `user.name ?? user.email` as `generatedBy`.

---

## 5. Risk Notes

### Race condition: concurrent generate requests

- **Risk**: User double-clicks "Generate" → two reports created with the same version.
- **Mitigation**: `isGenerating` flag disables the button. Low risk, but backend should consider idempotency or version uniqueness constraint.

### Stale data after navigation

- **Risk**: User navigates away and back; `refreshAll()` re-fires, but if the network is slow, they see the old report briefly.
- **Mitigation**: `isLoadingLatest` flag shows skeleton. Acceptable UX.

### 404 treated as "no report"

- **Risk**: A genuine 404 (e.g., wrong reviewProcessId) is indistinguishable from "first time, no report yet".
- **Mitigation**: Would need a dedicated "existence check" endpoint or the backend returning a distinguishable 204 for "no report exists yet" vs. 404 for "process not found". Low priority.

### Version auto-increment assumes numeric versions

- **Risk**: If someone manually sets version to `"alpha"`, the next auto-increment produces `NaN`. `toFixed(1)` on `NaN` returns `"NaN"`.
- **Mitigation**: Backend should validate version format. Frontend could add a regex check fallback.

### Print layout

- **Risk**: Tailwind `print:` utilities are used for basic print-friendliness, but complex flow diagrams may not paginate well.
- **Mitigation**: Add `@media print` CSS rules if users report print issues. Not a blocker.

---

## 6. Summary

| Category                    | Count                                                                      |
| --------------------------- | -------------------------------------------------------------------------- |
| Endpoints consumed          | 3 of 4 (detail endpoint reserved)                                          |
| Fields mapped & used        | 17                                                                         |
| Fields available but unused | 4 (`notes`, `stageText`, `label`, `description`)                           |
| **BLOCKER gaps**            | **1** — Missing flow records for stages 5-8                                |
| WARNING gaps                | 3 — Always-zero stages, no per-reason exclusion, `generatedBy` was missing |
| Frontend fixes applied      | 2 — Version precision, `generatedBy` population                            |
| Risk items                  | 5 — All low-to-medium severity                                             |
