# PRISMA Report API Documentation

> **Base URL**: `/api`
> **Last Updated**: 2025
> **Backend**: ASP.NET Core (.NET 8)

---

## Table of Contents

1. [Overview](#overview)
2. [Common Types](#common-types)
3. [Endpoints](#endpoints)
   - [POST Generate PRISMA Report](#1-generate-prisma-report)
   - [GET Report by ID](#2-get-prisma-report-by-id)
   - [GET Reports by Review Process](#3-get-all-prisma-reports-by-review-process)
   - [GET Latest Report](#4-get-latest-prisma-report-by-review-process)
4. [Error Handling](#error-handling)
5. [Frontend Integration Guide](#frontend-integration-guide)
6. [Ready-to-Use TypeScript Types](#ready-to-use-typescript-types)
7. [Example API Calls](#example-api-calls)

---

## Overview

The PRISMA Report API allows frontend applications to **generate** and **retrieve** PRISMA 2020 flow diagram reports for a systematic literature review process. A PRISMA report is a **snapshot** of the current review data at the time of generation — it captures counts for each stage of the PRISMA 2020 flow diagram (records identified, duplicates removed, records screened, etc.).

### Key Concepts

| Concept            | Description                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| **PRISMA Report**  | A frozen snapshot of the PRISMA 2020 flow diagram data for a review process                      |
| **Flow Record**    | A single box/stage in the PRISMA flow diagram (e.g., "Records identified", "Duplicates removed") |
| **PrismaStage**    | An enum representing each stage in the PRISMA 2020 flow diagram                                  |
| **Review Process** | The parent entity that a PRISMA report belongs to                                                |

### PrismaStage Enum Values

| Value | Name                        | Description                                |
| ----- | --------------------------- | ------------------------------------------ |
| 0     | `Identification`            | Identification phase (root)                |
| 1     | `RecordsIdentified`         | Total records identified from all sources  |
| 2     | `DuplicateRecordsRemoved`   | Duplicate records removed                  |
| 3     | `RecordsScreened`           | Records screened (after duplicate removal) |
| 4     | `RecordsExcluded`           | Records excluded during screening          |
| 5     | `ReportsSoughtForRetrieval` | Reports sought for retrieval               |
| 6     | `ReportsNotRetrieved`       | Reports not retrieved                      |
| 7     | `ReportsAssessed`           | Reports assessed for eligibility           |
| 8     | `ReportsExcluded`           | Reports excluded after assessment          |
| 9     | `StudiesIncludedInReview`   | Studies included in final review           |

---

## Common Types

### Standard API Response Wrapper

Every response from this API is wrapped in an `ApiResponse<T>` envelope:

```typescript
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

---

## Endpoints

---

### 1. Generate PRISMA Report

Creates a new PRISMA 2020 flow diagram report by **calculating current counts** from the review process data and saving them as a snapshot.

#### Basic Info

| Property    | Value                                                      |
| ----------- | ---------------------------------------------------------- |
| **Method**  | `POST`                                                     |
| **Route**   | `/api/review-processes/{reviewProcessId}/prisma-report`    |
| **Purpose** | Generate a new PRISMA report snapshot for a review process |

#### Request Details

**Headers**

| Header         | Value              | Required |
| -------------- | ------------------ | -------- |
| `Content-Type` | `application/json` | ✅ Yes   |

**Path Parameters**

| Parameter         | Type            | Required | Description                                           |
| ----------------- | --------------- | -------- | ----------------------------------------------------- |
| `reviewProcessId` | `string (UUID)` | ✅ Yes   | The ID of the review process to generate a report for |

**Request Body**

```typescript
interface GeneratePrismaReportRequest {
  notes?: string | null; // Optional notes about this report generation
  generatedBy?: string | null; // Who generated this report (e.g., username)
  version?: string; // Report version label, defaults to "1.0"
}
```

| Field         | Type             | Required    | Default | Description                                 |
| ------------- | ---------------- | ----------- | ------- | ------------------------------------------- |
| `notes`       | `string \| null` | ❌ Optional | `null`  | Free-text notes about the report            |
| `generatedBy` | `string \| null` | ❌ Optional | `null`  | Name/identifier of who triggered generation |
| `version`     | `string`         | ❌ Optional | `"1.0"` | Version label for the report                |

**Validation Rules**

- `reviewProcessId` must be a valid UUID of an existing review process
- If the review process does not exist → `500 Internal Server Error` (thrown as `InvalidOperationException`)

#### Response Details

**Success Response — `201 Created`**

```typescript
interface ApiResponse<PrismaReportResponse> {
  isSuccess: true;
  message: "PRISMA report generated successfully.";
  data: PrismaReportResponse;
}
```

See [PrismaReportResponse](#prismareportresponse) for the full schema.

**Error Responses**

| Status | Condition                              | Error Code                  |
| ------ | -------------------------------------- | --------------------------- |
| `500`  | Review process with given ID not found | `InvalidOperationException` |

#### Business Logic Summary

1. **Validates** that the review process exists.
2. **Calculates PRISMA counts** in real time by querying:
   - **Records Identified**: Total papers imported across all import batches linked to the review process's identification process → search executions → import batches.
   - **Duplicates Removed**: `totalRecordsImported - uniqueRecords`.
   - **Records Screened**: Count of unique (deduplicated) papers.
   - **Records Excluded**: Currently `0` (TODO — will query screening resolutions with `FinalDecision = Exclude`).
   - **Studies Included**: Currently `0` (TODO — will query screening resolutions with `FinalDecision = Include`).
3. **Creates a PrismaReport** entity with **5 PrismaFlowRecord** children (one per stage).
4. **Saves everything** in a single database transaction (atomically).
5. Returns the created report with all flow records.

> ⚠️ **Important**: `RecordsExcluded` and `StudiesIncluded` are currently always `0` — these will be populated in a future backend release.

#### Frontend Integration Notes

- Call this endpoint when the user clicks a "Generate PRISMA Report" button.
- Each call creates a **new** report snapshot — calling it multiple times will create multiple reports (versioned).
- This is a **write** operation — show a loading spinner; it may take a moment as it calculates counts from the database.
- On success, you can immediately display the returned report data (no need to make a second GET call).
- Consider disabling the button while the request is in flight to prevent duplicate reports.

---

### 2. Get PRISMA Report by ID

Retrieves a specific PRISMA report with all its flow records.

#### Basic Info

| Property    | Value                                         |
| ----------- | --------------------------------------------- |
| **Method**  | `GET`                                         |
| **Route**   | `/api/prisma-reports/{id}`                    |
| **Purpose** | Fetch a single PRISMA report by its unique ID |

#### Request Details

**Path Parameters**

| Parameter | Type            | Required | Description                 |
| --------- | --------------- | -------- | --------------------------- |
| `id`      | `string (UUID)` | ✅ Yes   | The ID of the PRISMA report |

**Query Parameters**: None

**Request Body**: None

#### Response Details

**Success Response — `200 OK`**

```typescript
interface ApiResponse<PrismaReportResponse> {
  isSuccess: true;
  message: "PRISMA report retrieved successfully.";
  data: PrismaReportResponse;
}
```

**Error Responses**

| Status | Condition                      | Error Code  |
| ------ | ------------------------------ | ----------- |
| `404`  | Report with given ID not found | `NOT_FOUND` |

#### Business Logic Summary

- Fetches the report along with its flow records from the database.
- Flow records are returned **sorted by `displayOrder`** (ascending).
- If not found, throws a `NotFoundException` → returns `404`.

#### Frontend Integration Notes

- Use this when navigating to a report detail page (e.g., `/reports/{id}`).
- The `id` is the PRISMA report ID, **not** the review process ID.
- Flow records come pre-sorted by `displayOrder` — render them in array order.

---

### 3. Get All PRISMA Reports by Review Process

Retrieves a list of all PRISMA reports generated for a specific review process (summary view, no flow records).

#### Basic Info

| Property    | Value                                                    |
| ----------- | -------------------------------------------------------- |
| **Method**  | `GET`                                                    |
| **Route**   | `/api/review-processes/{reviewProcessId}/prisma-reports` |
| **Purpose** | List all PRISMA report snapshots for a review process    |

#### Request Details

**Path Parameters**

| Parameter         | Type            | Required | Description                  |
| ----------------- | --------------- | -------- | ---------------------------- |
| `reviewProcessId` | `string (UUID)` | ✅ Yes   | The ID of the review process |

**Query Parameters**: None

**Request Body**: None

#### Response Details

**Success Response — `200 OK`**

```typescript
// When reports exist:
interface ApiResponse<PrismaReportListResponse[]> {
  isSuccess: true;
  message: "Retrieved {N} PRISMA report(s)."; // e.g., "Retrieved 3 PRISMA report(s)."
  data: PrismaReportListResponse[];
}

// When no reports exist:
interface ApiResponse<PrismaReportListResponse[]> {
  isSuccess: true;
  message: "No PRISMA reports found for this review process.";
  data: []; // empty array
}
```

See [PrismaReportListResponse](#prismareportlistresponse) for the full schema.

**Error Responses**: This endpoint always returns `200 OK` even if no reports exist (returns an empty array).

#### Business Logic Summary

- Returns a **lightweight list** of reports (no flow record details — only `totalRecords` count from the "Records Identified" stage).
- Returns an empty array `[]` if no reports exist — **not** a 404.
- Reports are **not paginated** — all reports for the review process are returned.
- The `message` dynamically indicates the count.

#### Frontend Integration Notes

- Call this when displaying a "Report History" or "Report List" page for a review process.
- Use the `id` from each item to navigate to the detail view (endpoint #2).
- **No pagination** — if many reports exist, all are returned. Consider client-side pagination if needed.
- An empty `data` array is a valid success response — show an "empty state" message, not an error.
- `totalRecords` reflects the "Records Identified" count at the time the report was generated.

---

### 4. Get Latest PRISMA Report by Review Process

Retrieves the most recently generated PRISMA report for a review process.

#### Basic Info

| Property    | Value                                                                        |
| ----------- | ---------------------------------------------------------------------------- |
| **Method**  | `GET`                                                                        |
| **Route**   | `/api/review-processes/{reviewProcessId}/prisma-report/latest`               |
| **Purpose** | Fetch the latest PRISMA report (with full flow records) for a review process |

#### Request Details

**Path Parameters**

| Parameter         | Type            | Required | Description                  |
| ----------------- | --------------- | -------- | ---------------------------- |
| `reviewProcessId` | `string (UUID)` | ✅ Yes   | The ID of the review process |

**Query Parameters**: None

**Request Body**: None

#### Response Details

**Success Response — `200 OK`**

```typescript
interface ApiResponse<PrismaReportResponse> {
  isSuccess: true;
  message: "Latest PRISMA report retrieved successfully.";
  data: PrismaReportResponse;
}
```

**Error Responses**

| Status | Condition                                      | Error Code  |
| ------ | ---------------------------------------------- | ----------- |
| `404`  | No PRISMA report exists for the review process | `NOT_FOUND` |

#### Business Logic Summary

- Finds the most recently generated report (based on `GeneratedAt` timestamp).
- Returns the full report with all flow records, sorted by `displayOrder`.
- If **no report has been generated yet** → throws `NotFoundException` → returns `404`.

#### Frontend Integration Notes

- Use this as a **quick access** endpoint — e.g., a "View Latest Report" button on the review process dashboard.
- If the user has never generated a report, this will return `404` — handle this gracefully (e.g., show a "No reports generated yet. Generate one?" prompt).
- After calling the Generate endpoint (#1), you can call this to confirm the latest report.

---

## Error Handling

The API uses centralized error handling via `GlobalExceptionMiddleware`. All errors follow the same `ApiResponse` envelope:

```typescript
// Error response shape
interface ApiErrorResponse {
  isSuccess: false;
  message: string;
  errors?: ApiError[] | null;
  data?: null;
}
```

### Error Status Code Mapping

| Exception Type              | HTTP Status | When It Happens                                 |
| --------------------------- | ----------- | ----------------------------------------------- |
| `NotFoundException`         | `404`       | Entity not found (report, review process, etc.) |
| `InvalidOperationException` | `500`       | Business logic violation or unexpected state    |
| `ArgumentException`         | `500`       | Invalid argument passed                         |
| Other exceptions            | `500`       | Unexpected server errors                        |

### Common Error Scenarios

| Scenario                                        | Status | Message                                                      |
| ----------------------------------------------- | ------ | ------------------------------------------------------------ |
| Generate report for non-existent review process | `500`  | `"ReviewProcess with ID {id} not found."`                    |
| Get report by non-existent ID                   | `404`  | `"Prisma report not found."`                                 |
| Get latest report when none exist               | `404`  | `"No PRISMA report found for the specified review process."` |

---

## Frontend Integration Guide

### Typical User Flow

```
1. User navigates to a Review Process page
       ↓
2. FE calls GET /api/review-processes/{id}/prisma-reports
   → Show report history list (or empty state)
       ↓
3. User clicks "Generate New Report"
   → FE calls POST /api/review-processes/{id}/prisma-report
   → Show loading spinner
   → On success: display the new report or refresh the list
       ↓
4. User clicks on a specific report
   → FE calls GET /api/prisma-reports/{reportId}
   → Display full flow diagram with all stages
       ↓
5. Dashboard "Quick View"
   → FE calls GET /api/review-processes/{id}/prisma-report/latest
   → Display the latest flow diagram
```

### Common Pitfalls

1. **Don't confuse Report ID vs Review Process ID** — the GET by ID endpoint (`/api/prisma-reports/{id}`) uses the **report** ID, not the review process ID.
2. **Empty list ≠ error** — The list endpoint returns `200` with an empty array when no reports exist.
3. **`RecordsExcluded` and `StudiesIncluded` are currently always `0`** — These are not yet implemented in the backend. Don't treat `0` as "no data" for these fields.
4. **Each generate call creates a new report** — There's no "update" mechanism. If the user generates multiple times, they'll have multiple snapshots.
5. **Flow records come pre-sorted** — Use the array order as-is; don't re-sort by `stage` enum value.

### Loading & Error Handling Suggestions

| Endpoint   | Loading                                  | Success                           | Error                        |
| ---------- | ---------------------------------------- | --------------------------------- | ---------------------------- |
| Generate   | Full-page/modal spinner + disable button | Show report or redirect to detail | Show error toast             |
| Get by ID  | Skeleton loader                          | Render flow diagram               | Show "Report not found" page |
| Get list   | Skeleton list                            | Render table/cards                | Show error toast             |
| Get latest | Skeleton loader                          | Render flow diagram               | Show "No reports yet" prompt |

### Race Conditions to Watch

- **Double-click on Generate**: Disable the button immediately after the first click to prevent creating duplicate reports.
- **Stale list after Generate**: After a successful generate, refresh the report list or append the new report to the UI state.

---

## Ready-to-Use TypeScript Types

```typescript
// ==========================================
// Enums
// ==========================================

export enum PrismaStage {
  Identification = 0,
  RecordsIdentified = 1,
  DuplicateRecordsRemoved = 2,
  RecordsScreened = 3,
  RecordsExcluded = 4,
  ReportsSoughtForRetrieval = 5,
  ReportsNotRetrieved = 6,
  ReportsAssessed = 7,
  ReportsExcluded = 8,
  StudiesIncludedInReview = 9,
}

// ==========================================
// API Response Wrapper
// ==========================================

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T = undefined> {
  isSuccess: boolean;
  message: string;
  errors?: ApiError[] | null;
  data?: T | null;
}

// ==========================================
// Request Types
// ==========================================

export interface GeneratePrismaReportRequest {
  /** Optional notes about this report generation */
  notes?: string | null;
  /** Who generated this report (e.g., username or user ID) */
  generatedBy?: string | null;
  /** Report version label. Defaults to "1.0" if omitted */
  version?: string;
}

// ==========================================
// Response Types
// ==========================================

export interface PrismaFlowRecordResponse {
  id: string;
  /** Numeric enum value of PrismaStage */
  stage: PrismaStage;
  /** Human-readable stage name (e.g., "RecordsIdentified") */
  stageText: string;
  /** Display label (e.g., "Records identified  */
  label: string;
  /** The count/value for this stage */
  count: number;
  /** Optional description or breakdown text */
  description?: string | null;
  /** Order for rendering in the flow diagram (1-based, ascending) */
  displayOrder: number;
}

export interface PrismaReportResponse {
  id: string;
  reviewProcessId: string;
  version: string;
  generatedAt: string; // ISO 8601 DateTimeOffset
  notes?: string | null;
  generatedBy?: string | null;
  /** Flow records sorted by displayOrder ascending */
  flowRecords: PrismaFlowRecordResponse[];
  createdAt: string; // ISO 8601 DateTimeOffset
  modifiedAt: string; // ISO 8601 DateTimeOffset
}

export interface PrismaReportListResponse {
  id: string;
  reviewProcessId: string;
  version: string;
  generatedAt: string; // ISO 8601 DateTimeOffset
  generatedBy?: string | null;
  /** Count from the "Records Identified" stage */
  totalRecords: number;
  createdAt: string; // ISO 8601 DateTimeOffset
}
```

---

## Example API Calls

### Using `fetch`

```typescript
const BASE_URL = "https://your-api-domain.com/api";

// 1. Generate a PRISMA Report
async function generatePrismaReport(
  reviewProcessId: string,
  request: GeneratePrismaReportRequest,
): Promise<ApiResponse<PrismaReportResponse>> {
  const response = await fetch(`${BASE_URL}/review-processes/${reviewProcessId}/prisma-report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return response.json();
}

// 2. Get a PRISMA Report by ID
async function getPrismaReportById(reportId: string): Promise<ApiResponse<PrismaReportResponse>> {
  const response = await fetch(`${BASE_URL}/prisma-reports/${reportId}`);
  return response.json();
}

// 3. Get All PRISMA Reports for a Review Process
async function getPrismaReportsByReviewProcess(
  reviewProcessId: string,
): Promise<ApiResponse<PrismaReportListResponse[]>> {
  const response = await fetch(`${BASE_URL}/review-processes/${reviewProcessId}/prisma-reports`);
  return response.json();
}

// 4. Get Latest PRISMA Report for a Review Process
async function getLatestPrismaReport(
  reviewProcessId: string,
): Promise<ApiResponse<PrismaReportResponse>> {
  const response = await fetch(
    `${BASE_URL}/review-processes/${reviewProcessId}/prisma-report/latest`,
  );
  return response.json();
}
```

### Using `axios`

```typescript
import axios from "axios";

const api = axios.create({ baseURL: "https://your-api-domain.com/api" });

// 1. Generate a PRISMA Report
export const generatePrismaReport = (reviewProcessId: string, data: GeneratePrismaReportRequest) =>
  api.post<ApiResponse<PrismaReportResponse>>(
    `/review-processes/${reviewProcessId}/prisma-report`,
    data,
  );

// 2. Get a PRISMA Report by ID
export const getPrismaReportById = (reportId: string) =>
  api.get<ApiResponse<PrismaReportResponse>>(`/prisma-reports/${reportId}`);

// 3. Get All PRISMA Reports for a Review Process
export const getPrismaReportsByReviewProcess = (reviewProcessId: string) =>
  api.get<ApiResponse<PrismaReportListResponse[]>>(
    `/review-processes/${reviewProcessId}/prisma-reports`,
  );

// 4. Get Latest PRISMA Report for a Review Process
export const getLatestPrismaReport = (reviewProcessId: string) =>
  api.get<ApiResponse<PrismaReportResponse>>(
    `/review-processes/${reviewProcessId}/prisma-report/latest`,
  );
```

### Usage Example (React)

```tsx
import { useEffect, useState } from "react";

function PrismaReportPage({ reviewProcessId }: { reviewProcessId: string }) {
  const [reports, setReports] = useState<PrismaReportListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Load report list
  useEffect(() => {
    setLoading(true);
    getPrismaReportsByReviewProcess(reviewProcessId)
      .then((res) => res.json())
      .then((json) => {
        if (json.isSuccess && json.data) {
          setReports(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, [reviewProcessId]);

  // Generate new report
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generatePrismaReport(reviewProcessId, {
        version: "1.0",
        notes: "Generated from dashboard",
        generatedBy: "current-user",
      });
      const json = await res.json();
      if (json.isSuccess && json.data) {
        // Refresh the list or navigate to the new report
        alert(`Report generated! ID: ${json.data.id}`);
      }
    } catch (err) {
      alert("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={generating}>
        {generating ? "Generating..." : "Generate PRISMA Report"}
      </button>

      {loading ? (
        <p>Loading reports...</p>
      ) : reports.length === 0 ? (
        <p>No reports generated yet.</p>
      ) : (
        <ul>
          {reports.map((r) => (
            <li key={r.id}>
              v{r.version} — {new Date(r.generatedAt).toLocaleString()} — {r.totalRecords} records
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Quick Reference Card

| Action            | Method | Route                                                          | Returns                              |
| ----------------- | ------ | -------------------------------------------------------------- | ------------------------------------ |
| Generate report   | `POST` | `/api/review-processes/{reviewProcessId}/prisma-report`        | `201` — `PrismaReportResponse`       |
| Get report by ID  | `GET`  | `/api/prisma-reports/{id}`                                     | `200` — `PrismaReportResponse`       |
| List reports      | `GET`  | `/api/review-processes/{reviewProcessId}/prisma-reports`       | `200` — `PrismaReportListResponse[]` |
| Get latest report | `GET`  | `/api/review-processes/{reviewProcessId}/prisma-report/latest` | `200` — `PrismaReportResponse`       |
