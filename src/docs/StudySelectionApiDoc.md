# Study Selection (Screening) API Documentation

> **Base URL**: `/api`  
> **Last Updated**: 2025  
> **Backend**: ASP.NET Core (.NET 8)

---

## Table of Contents

1. [Overview](#overview)
2. [Common Types](#common-types)
3. [Endpoints](#endpoints)
   - [POST Create Study Selection Process](#1-create-study-selection-process)
   - [GET Study Selection Process by ID](#2-get-study-selection-process-by-id)
   - [POST Start Study Selection Process](#3-start-study-selection-process)
   - [POST Complete Study Selection Process](#4-complete-study-selection-process)
   - [GET Eligible Papers](#5-get-eligible-papers)
   - [POST Submit Screening Decision](#6-submit-screening-decision)
   - [GET Decisions by Paper](#7-get-decisions-by-paper)
   - [GET Conflicted Papers](#8-get-conflicted-papers)
   - [POST Resolve Conflict](#9-resolve-conflict)
   - [GET Paper Selection Status](#10-get-paper-selection-status)
   - [GET Selection Statistics](#11-get-selection-statistics)
   - [GET Papers with Decisions](#12-get-papers-with-decisions)
4. [Error Handling](#error-handling)
5. [Frontend Integration Guide](#frontend-integration-guide)
6. [Ready-to-Use TypeScript Types](#ready-to-use-typescript-types)
7. [Example API Calls](#example-api-calls)

---

## Overview

The Study Selection API manages the **screening phase** of a systematic literature review. After the Identification phase (where papers are imported and duplicates removed), the Study Selection phase allows multiple reviewers to independently screen papers for inclusion or exclusion. Conflicts (where reviewers disagree) are tracked and must be resolved before the process can be completed.

### Key Concepts

| Concept | Description |
|---|---|
| **Study Selection Process** | The screening phase entity, linked to a Review Process. Has a lifecycle: `NotStarted` → `InProgress` → `Completed`. |
| **Eligible Papers** | All project papers **minus** duplicates identified during the Identification phase. These are the papers that need screening. |
| **Screening Decision** | An individual reviewer's Include/Exclude decision on a specific paper. One decision per reviewer per paper. |
| **Conflict** | When two or more reviewers submit **different** decisions (Include vs Exclude) for the same paper. |
| **Screening Resolution** | A final authoritative decision made by a resolver to settle a conflict. One resolution per paper. |
| **Paper Selection Status** | The computed status of a paper: Pending, Included, Excluded, Conflict, or Resolved. |

### Workflow Summary

```
1. Create a Study Selection Process for a Review Process
2. Start the process (requires Identification phase to be Completed)
3. Reviewers submit Include/Exclude decisions for each eligible paper
4. System detects conflicts (disagreements between reviewers)
5. Resolver resolves each conflict with a final decision
6. Complete the process (all conflicts must be resolved first)
```

### Enums

#### SelectionProcessStatus

| Value | Name | Description |
|---|---|---|
| 0 | `NotStarted` | Process created but not yet started |
| 1 | `InProgress` | Reviewers are actively screening papers |
| 2 | `Completed` | All screening is done, no unresolved conflicts |

#### ScreeningDecisionType

| Value | Name | Description |
|---|---|---|
| 0 | `Include` | Paper should be included in the review |
| 1 | `Exclude` | Paper should be excluded from the review |

#### PaperSelectionStatus

| Value | Name | Description |
|---|---|---|
| 0 | `Pending` | No decisions submitted yet |
| 1 | `Included` | Unanimous Include or resolved as Include |
| 2 | `Excluded` | Unanimous Exclude or resolved as Exclude |
| 3 | `Conflict` | Reviewers disagree (Include vs Exclude), not yet resolved |
| 4 | `Resolved` | Conflict has been resolved with a final decision |

#### PaperSortBy

| Value | Name | Description |
|---|---|---|
| 0 | `TitleAsc` | Sort by title A → Z (default) |
| 1 | `TitleDesc` | Sort by title Z → A |
| 2 | `YearNewest` | Sort by publication year descending (newest first) |
| 3 | `YearOldest` | Sort by publication year ascending (oldest first) |

---

## Common Types

### Standard API Response Wrapper

Every response is wrapped in an `ApiResponse<T>` envelope:

```json
{
  "isSuccess": true,
  "message": "Human-readable message",
  "errors": null,
  "data": { ... }
}
```

### Error Response

```json
{
  "isSuccess": false,
  "message": "Error description",
  "errors": [
    {
      "code": "ERROR_CODE",
      "message": "Detailed error message"
    }
  ],
  "data": null
}
```

---

## Endpoints

---

### 1. Create Study Selection Process

Creates a new Study Selection Process for a given Review Process.

| Property | Value |
|---|---|
| **Method** | `POST` |
| **Route** | `/api/review-processes/{reviewProcessId}/study-selection` |
| **Success Status** | `201 Created` |

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `reviewProcessId` | `string (UUID)` | ✅ | The ID of the parent Review Process |

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `reviewProcessId` | `string (UUID)` | ❌ | Overridden by path param — do not send |
| `notes` | `string \| null` | ❌ | Optional notes for this selection process |

```json
{
  "notes": "First round of screening based on title and abstract"
}
```

#### Success Response — `201 Created`

```json
{
  "isSuccess": true,
  "message": "Study Selection Process created successfully.",
  "errors": null,
  "data": {
    "id": "uuid",
    "reviewProcessId": "uuid",
    "notes": "First round of screening based on title and abstract",
    "startedAt": null,
    "completedAt": null,
    "status": 0,
    "statusText": "NotStarted",
    "createdAt": "2025-01-01T00:00:00+00:00",
    "modifiedAt": "2025-01-01T00:00:00+00:00",
    "screenedStudy": 0,
    "studyToScreen": 0
  }
}
```

#### Business Logic

- Validates that the Review Process exists.
- Calls domain guard `EnsureCanCreateStudySelectionProcess()` — the Review Process enforces rules about whether a selection process can be created (e.g., may prevent duplicates).
- Initial status is always `NotStarted`.

#### Error Scenarios

| Condition | HTTP Status | Message |
|---|---|---|
| Review Process not found | 500 | `ReviewProcess with ID {id} not found.` |
| Business rule violation | 500 | Domain-specific error message |

#### Frontend Integration Notes

- Call this **once** per Review Process to initialize the screening phase.
- You do **not** need to send `reviewProcessId` in the body — it is injected from the URL path parameter.
- After creation, the process is in `NotStarted` — you must call the Start endpoint to begin screening.

---

### 2. Get Study Selection Process by ID

Retrieves a Study Selection Process with computed screening progress.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/study-selection/{id}` |
| **Success Status** | `200 OK` |

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string (UUID)` | ✅ | Study Selection Process ID |

#### Success Response — `200 OK`

```json
{
  "isSuccess": true,
  "message": "Study Selection Process retrieved successfully.",
  "errors": null,
  "data": {
    "id": "uuid",
    "reviewProcessId": "uuid",
    "notes": "string or null",
    "startedAt": "2025-01-01T00:00:00+00:00",
    "completedAt": null,
    "status": 1,
    "statusText": "InProgress",
    "createdAt": "2025-01-01T00:00:00+00:00",
    "modifiedAt": "2025-01-01T00:00:00+00:00",
    "screenedStudy": 15,
    "studyToScreen": 35
  }
}
```

#### Business Logic

- Returns the process metadata plus **computed fields**:
  - `screenedStudy`: Number of papers that have at least one screening decision.
  - `studyToScreen`: Number of eligible papers that still have **no** decisions (`eligiblePapers - screenedStudy`).
- These are calculated on every call (not cached).

#### Error Scenarios

| Condition | HTTP Status | Message |
|---|---|---|
| Process not found | 500 | `StudySelectionProcess with ID {id} not found.` |

#### Frontend Integration Notes

- Use this endpoint to **display process status and progress** on a dashboard.
- `screenedStudy` + `studyToScreen` gives you the total eligible papers.
- Poll or re-fetch this endpoint to show live progress while reviewers are screening.

---

### 3. Start Study Selection Process

Transitions the process from `NotStarted` to `InProgress`.

| Property | Value |
|---|---|
| **Method** | `POST` |
| **Route** | `/api/study-selection/{id}/start` |
| **Success Status** | `200 OK` |

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string (UUID)` | ✅ | Study Selection Process ID |

#### Request Body

None.

#### Success Response — `200 OK`

```json
{
  "isSuccess": true,
  "message": "Study Selection Process started successfully.",
  "errors": null,
  "data": {
    "id": "uuid",
    "reviewProcessId": "uuid",
    "notes": "string or null",
    "startedAt": "2025-01-01T12:00:00+00:00",
    "completedAt": null,
    "status": 1,
    "statusText": "InProgress",
    "createdAt": "...",
    "modifiedAt": "...",
    "screenedStudy": 0,
    "studyToScreen": 0
  }
}
```

#### Business Logic

- **Prerequisite**: The Identification Process for this review must exist **and** be `Completed`.
- The process must currently be in `NotStarted` status.
- Sets `status` to `InProgress` and records `startedAt` timestamp.

#### Error Scenarios

| Condition | HTTP Status | Message |
|---|---|---|
| Process not found | 500 | `StudySelectionProcess with ID {id} not found.` |
| Review Process not found | 500 | `ReviewProcess not found.` |
| Process not in NotStarted status | 500 | `Cannot start selection process from {status} status.` |
| Identification process doesn't exist | 500 | `Cannot start study selection before identification process exists.` |
| Identification process not completed | 500 | `Cannot start study selection before identification process is completed.` |

#### Frontend Integration Notes

- **Gate the Start button**: Only show/enable the "Start Screening" button when the Identification phase is completed. Otherwise the call will fail.
- After starting, reviewers can begin submitting decisions.
- Once started, the process **cannot** be restarted.

---

### 4. Complete Study Selection Process

Transitions the process from `InProgress` to `Completed`.

| Property | Value |
|---|---|
| **Method** | `POST` |
| **Route** | `/api/study-selection/{id}/complete` |
| **Success Status** | `200 OK` |

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string (UUID)` | ✅ | Study Selection Process ID |

#### Request Body

None.

#### Success Response — `200 OK`

```json
{
  "isSuccess": true,
  "message": "Study Selection Process completed successfully.",
  "errors": null,
  "data": {
    "id": "uuid",
    "reviewProcessId": "uuid",
    "notes": "string or null",
    "startedAt": "2025-01-01T12:00:00+00:00",
    "completedAt": "2025-01-15T18:30:00+00:00",
    "status": 2,
    "statusText": "Completed",
    "createdAt": "...",
    "modifiedAt": "...",
    "screenedStudy": 50,
    "studyToScreen": 0
  }
}
```

#### Business Logic

- The process must currently be in `InProgress` status.
- **All conflicts must be resolved** before completion. If any unresolved conflicts remain, the call fails.
- Sets `status` to `Completed` and records `completedAt` timestamp.

#### Error Scenarios

| Condition | HTTP Status | Message |
|---|---|---|
| Process not found | 500 | `StudySelectionProcess with ID {id} not found.` |
| Process not in InProgress status | 500 | `Cannot complete selection process from {status} status.` |
| Unresolved conflicts exist | 500 | `Cannot complete process with {count} unresolved conflicts.` |

#### Frontend Integration Notes

- **Before calling Complete**: Check for unresolved conflicts using the [Get Conflicted Papers](#8-get-conflicted-papers) endpoint. Show a warning or disable the "Complete" button if conflicts remain.
- Once completed, the process is **finalized** and decisions cannot be modified.
- After completion, the data becomes available for PRISMA reporting.

---

### 5. Get Eligible Papers

Returns the list of paper IDs eligible for screening (all project papers minus duplicates).

| Property | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/study-selection/{id}/eligible-papers` |
| **Success Status** | `200 OK` |

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string (UUID)` | ✅ | Study Selection Process ID |

#### Success Response — `200 OK`

```json
{
  "isSuccess": true,
  "message": "Retrieved 50 eligible papers.",
  "errors": null,
  "data": [
    "uuid-1",
    "uuid-2",
    "uuid-3"
  ]
}
```

#### Business Logic

- Retrieves all papers belonging to the project linked to the Review Process.
- Subtracts any papers marked as duplicates by the Identification Process (via deduplication results).
- **Eligible Papers = All Project Papers − Duplicate Papers**.
- Returns only paper IDs (not full paper objects).

#### Error Scenarios

| Condition | HTTP Status | Message |
|---|---|---|
| Process not found | 500 | `StudySelectionProcess with ID {id} not found.` |
| Review Process not found | 500 | `ReviewProcess not found.` |

#### Frontend Integration Notes

- Use this to get the **total list of papers to screen**.
- Returns only UUIDs — you will need to fetch paper details separately or use the [Get Papers with Decisions](#12-get-papers-with-decisions) endpoint for full details.
- This list is **computed each call** based on current project papers and deduplication results.

---

### 6. Submit Screening Decision

Submit a reviewer's Include/Exclude decision for a specific paper.

| Property | Value |
|---|---|
| **Method** | `POST` |
| **Route** | `/api/study-selection/{id}/papers/{paperId}/decision` |
| **Success Status** | `201 Created` |

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string (UUID)` | ✅ | Study Selection Process ID |
| `paperId` | `string (UUID)` | ✅ | The paper being screened |

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `reviewerId` | `string (UUID)` | ✅ | The user/reviewer submitting the decision |
| `decision` | `number (enum)` | ✅ | `0` = Include, `1` = Exclude |
| `reason` | `string \| null` | ❌ | Optional justification for the decision |

```json
{
  "reviewerId": "uuid-of-reviewer",
  "decision": 0,
  "reason": "Paper is relevant to RQ1 based on title and abstract"
}
```

#### Success Response — `201 Created`

```json
{
  "isSuccess": true,
  "message": "Screening decision submitted successfully.",
  "errors": null,
  "data": {
    "id": "uuid",
    "studySelectionProcessId": "uuid",
    "paperId": "uuid",
    "paperTitle": "Machine Learning in Software Engineering: A Systematic Review",
    "reviewerId": "uuid",
    "reviewerName": "John Doe",
    "decision": 0,
    "decisionText": "Include",
    "reason": "Paper is relevant to RQ1 based on title and abstract",
    "decidedAt": "2025-01-05T14:30:00+00:00"
  }
}
```

#### Business Logic

- The process must be in `InProgress` status.
- **One decision per reviewer per paper** — a reviewer cannot submit two decisions for the same paper.
- The paper must exist in the system.
- Decisions are **immutable** once submitted — there is no update/delete endpoint.
- If two reviewers submit conflicting decisions (one Include, one Exclude), the paper's status automatically becomes `Conflict`.

#### Error Scenarios

| Condition | HTTP Status | Message |
|---|---|---|
| Process not found | 500 | `StudySelectionProcess with ID {id} not found.` |
| Process not InProgress | 500 | `Cannot submit decisions for process in {status} status.` |
| Reviewer already decided | 500 | `Reviewer has already submitted a decision for this paper.` |
| Paper not found | 500 | `Paper with ID {paperId} not found.` |

#### Frontend Integration Notes

- **Disable the submit button** after a successful submission to prevent duplicate attempts.
- Show the decision type as a clear toggle/button pair: **Include** vs **Exclude**.
- Encourage reviewers to provide a `reason` for auditability (though it's optional).
- After submission, refresh the paper list or status to reflect the new decision.
- **Race condition warning**: If two reviewers submit simultaneously for the same paper, both will succeed (by design — multi-reviewer workflow).

---

### 7. Get Decisions by Paper

Get all screening decisions for a specific paper within a selection process.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/study-selection/{id}/papers/{paperId}/decisions` |
| **Success Status** | `200 OK` |

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string (UUID)` | ✅ | Study Selection Process ID |
| `paperId` | `string (UUID)` | ✅ | The paper to get decisions for |

#### Success Response — `200 OK`

```json
{
  "isSuccess": true,
  "message": "Retrieved 2 decisions.",
  "errors": null,
  "data": [
    {
      "id": "uuid",
      "studySelectionProcessId": "uuid",
      "paperId": "uuid",
      "paperTitle": "Paper Title",
      "reviewerId": "reviewer-uuid-1",
      "reviewerName": "Alice Smith",
      "decision": 0,
      "decisionText": "Include",
      "reason": "Relevant to RQ1",
      "decidedAt": "2025-01-05T14:30:00+00:00"
    },
    {
      "id": "uuid",
      "studySelectionProcessId": "uuid",
      "paperId": "uuid",
      "paperTitle": "Paper Title",
      "reviewerId": "reviewer-uuid-2",
      "reviewerName": "Bob Johnson",
      "decision": 1,
      "decisionText": "Exclude",
      "reason": "Out of scope",
      "decidedAt": "2025-01-05T15:00:00+00:00"
    }
  ]
}
```

#### Business Logic

- Returns all decisions from all reviewers for this paper.
- If no decisions exist, returns an empty array.
- No pagination — returns all decisions at once (typically 2-3 reviewers).

#### Error Scenarios

No specific error beyond network/server errors — returns empty array if no decisions found.

#### Frontend Integration Notes

- Use this to show a **decision detail panel** for a paper — displaying each reviewer's verdict.
- Useful for the conflict resolution workflow to see who voted what.
- Compare the `decision` values: if they differ, the paper is in conflict.

---

### 8. Get Conflicted Papers

Get all papers with unresolved conflicting decisions.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/study-selection/{id}/conflicts` |
| **Success Status** | `200 OK` |

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string (UUID)` | ✅ | Study Selection Process ID |

#### Success Response — `200 OK`

```json
{
  "isSuccess": true,
  "message": "Found 3 conflicted papers.",
  "errors": null,
  "data": [
    {
      "paperId": "uuid",
      "title": "Paper Title",
      "doi": "10.1234/example",
      "conflictingDecisions": [
        {
          "id": "uuid",
          "studySelectionProcessId": "uuid",
          "paperId": "uuid",
          "paperTitle": "Paper Title",
          "reviewerId": "uuid-1",
          "reviewerName": "Alice Smith",
          "decision": 0,
          "decisionText": "Include",
          "reason": "Relevant to RQ1",
          "decidedAt": "2025-01-05T14:30:00+00:00"
        },
        {
          "id": "uuid",
          "studySelectionProcessId": "uuid",
          "paperId": "uuid",
          "paperTitle": "Paper Title",
          "reviewerId": "uuid-2",
          "reviewerName": "Bob Johnson",
          "decision": 1,
          "decisionText": "Exclude",
          "reason": "Out of scope",
          "decidedAt": "2025-01-05T15:00:00+00:00"
        }
      ]
    }
  ]
}
```

#### Business Logic

- A paper has a **conflict** when different reviewers submitted different decisions (Include vs Exclude).
- **Only returns unresolved conflicts** — papers that already have a resolution are excluded.
- Each conflicted paper includes the full list of conflicting decisions for context.

#### Error Scenarios

No specific errors — returns empty array if no conflicts exist.

#### Frontend Integration Notes

- Use this endpoint to build a **Conflict Resolution Queue** page.
- Show the conflicting decisions side by side so the resolver can make an informed final decision.
- **Poll or re-fetch** after resolving a conflict to update the count.
- The count from this endpoint determines whether the "Complete" button should be enabled.
- **Important**: An empty array means all conflicts are resolved and the process can be completed.

---

### 9. Resolve Conflict

Submit a final decision to resolve a conflicted paper.

| Property | Value |
|---|---|
| **Method** | `POST` |
| **Route** | `/api/study-selection/{id}/papers/{paperId}/resolve` |
| **Success Status** | `201 Created` |

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string (UUID)` | ✅ | Study Selection Process ID |
| `paperId` | `string (UUID)` | ✅ | The conflicted paper |

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `finalDecision` | `number (enum)` | ✅ | `0` = Include, `1` = Exclude |
| `resolvedBy` | `string (UUID)` | ✅ | The user resolving the conflict |
| `resolutionNotes` | `string \| null` | ❌ | Optional notes explaining the resolution |

```json
{
  "finalDecision": 0,
  "resolvedBy": "uuid-of-resolver",
  "resolutionNotes": "Paper is relevant after re-reading the full abstract"
}
```

#### Success Response — `201 Created`

```json
{
  "isSuccess": true,
  "message": "Conflict resolved successfully.",
  "errors": null,
  "data": {
    "id": "uuid",
    "studySelectionProcessId": "uuid",
    "paperId": "uuid",
    "paperTitle": "Paper Title",
    "finalDecision": 0,
    "finalDecisionText": "Include",
    "resolutionNotes": "Paper is relevant after re-reading the full abstract",
    "resolvedBy": "uuid-of-resolver",
    "resolverName": "Dr. Jane Wilson",
    "resolvedAt": "2025-01-10T09:00:00+00:00"
  }
}
```

#### Business Logic

- **One resolution per paper** — if a resolution already exists for this paper, the call fails.
- Resolutions are **immutable** — there is no update or delete endpoint.
- The final decision overrides the conflicting reviewer decisions for this paper.
- After resolution, the paper's status becomes `Included` or `Excluded` based on `finalDecision`.

#### Error Scenarios

| Condition | HTTP Status | Message |
|---|---|---|
| Resolution already exists | 500 | `Resolution already exists for this paper.` |

#### Frontend Integration Notes

- Show this form **only for papers in Conflict status** (from the conflicts endpoint).
- Pre-populate context by showing the conflicting decisions above the resolution form.
- After resolving, refresh the conflicts list to update the queue.
- **No undo**: Once resolved, the decision is final. Consider a confirmation dialog before submission.

---

### 10. Get Paper Selection Status

Get the computed selection status for a single paper.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/study-selection/{id}/papers/{paperId}/status` |
| **Success Status** | `200 OK` |

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string (UUID)` | ✅ | Study Selection Process ID |
| `paperId` | `string (UUID)` | ✅ | The paper to check |

#### Success Response — `200 OK`

```json
{
  "isSuccess": true,
  "message": "Paper selection status retrieved successfully.",
  "errors": null,
  "data": 1
}
```

> **Note**: The `data` field is a raw enum integer value (`0`–`4`), not an object.

#### Status Computation Logic

The status is **computed on the fly** based on the current state:

| Priority | Condition | Returned Status |
|---|---|---|
| 1st | Resolution exists → `FinalDecision == Include` | `1` (Included) |
| 2nd | Resolution exists → `FinalDecision == Exclude` | `2` (Excluded) |
| 3rd | No decisions submitted | `0` (Pending) |
| 4th | Decisions exist but disagree | `3` (Conflict) |
| 5th | All decisions agree → Include | `1` (Included) |
| 6th | All decisions agree → Exclude | `2` (Excluded) |

#### Frontend Integration Notes

- Useful for checking a **single paper's status** without fetching all papers.
- For bulk status display, prefer the [Get Papers with Decisions](#12-get-papers-with-decisions) endpoint.
- The response is a raw number — map it using the `PaperSelectionStatus` enum on the frontend.

---

### 11. Get Selection Statistics

Get aggregated selection statistics for PRISMA reporting.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/study-selection/{id}/statistics` |
| **Success Status** | `200 OK` |

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string (UUID)` | ✅ | Study Selection Process ID |

#### Success Response — `200 OK`

```json
{
  "isSuccess": true,
  "message": "Selection statistics retrieved successfully.",
  "errors": null,
  "data": {
    "studySelectionProcessId": "uuid",
    "totalPapers": 100,
    "includedCount": 35,
    "excludedCount": 50,
    "conflictCount": 5,
    "pendingCount": 10,
    "completionPercentage": 90.0
  }
}
```

#### Business Logic

- `totalPapers`: Number of eligible papers (all papers minus duplicates).
- `includedCount`: Papers with computed status `Included` — includes both unanimous reviewer Include decisions **and** resolved-as-Include papers.
- `excludedCount`: Papers with computed status `Excluded` — includes both unanimous reviewer Exclude decisions **and** resolved-as-Exclude papers.
- `conflictCount`: Papers with unresolved conflicts (different reviewer decisions, no resolution yet).
- `pendingCount`: Papers with no decisions submitted yet.
- `completionPercentage`: `((includedCount + excludedCount + conflictCount) / totalPapers) * 100`, rounded to 2 decimal places.

> **Note**: Statistics now use the same computed status logic as `GetPaperSelectionStatus`. This means `includedCount` / `excludedCount` will match what users see in the paper list.

#### Frontend Integration Notes

- Use for **dashboard/progress display** — show a progress bar based on `completionPercentage`.
- Use `conflictCount` to show a badge/notification on the "Resolve Conflicts" section.
- All values are **computed on every call** (no caching).
- Consider polling this endpoint to show real-time progress during active screening.

---

### 12. Get Papers with Decisions (Paginated)

Get eligible papers with their full screening details, with server-side search, filtering, sorting, and pagination.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/study-selection/{id}/papers` |
| **Success Status** | `200 OK` |

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string (UUID)` | ✅ | Study Selection Process ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `search` | `string` | ❌ | `null` | Search by paper title (case-insensitive, partial match) |
| `status` | `number (enum)` | ❌ | `null` (all) | Filter by computed status: `0`=Pending, `1`=Included, `2`=Excluded, `3`=Conflict |
| `sortBy` | `number (enum)` | ❌ | `0` (TitleAsc) | Sort order: `0`=Title A-Z, `1`=Title Z-A, `2`=Year Newest, `3`=Year Oldest |
| `pageNumber` | `number` | ❌ | `1` | Page number (1-based) |
| `pageSize` | `number` | ❌ | `20` | Items per page (min: 1, max: 100) |

**Example request:**
```
GET /api/study-selection/{id}/papers?search=machine&status=3&sortBy=2&pageNumber=1&pageSize=10
```

#### Success Response — `200 OK`

```json
{
  "isSuccess": true,
  "message": "Retrieved 10 of 42 papers (page 1/5).",
  "errors": null,
  "data": {
    "items": [
      {
        "paperId": "uuid",
        "title": "Machine Learning in SE: A Review",
        "doi": "10.1234/example",
        "authors": "Smith, J.; Doe, A.",
        "publicationYear": 2023,
        "abstract": "This paper presents a systematic review of machine learning applications in software engineering...",
        "journal": "IEEE Transactions on Software Engineering",
        "source": "Scopus",
        "keywords": "machine learning; software engineering; systematic review",
        "publicationType": "Journal Article",
        "volume": "49",
        "issue": "3",
        "pages": "123-145",
        "publisher": "IEEE",
        "language": "English",
        "url": "https://doi.org/10.1234/example",
        "pdfUrl": "https://example.com/paper.pdf",
        "conferenceName": null,
        "conferenceLocation": null,
        "journalIssn": "0098-5589",
        "status": 3,
        "statusText": "Conflict",
        "decisions": [
          {
            "id": "uuid",
            "studySelectionProcessId": "uuid",
            "paperId": "uuid",
            "paperTitle": "Machine Learning in SE: A Review",
            "reviewerId": "uuid-1",
            "reviewerName": "Alice Smith",
            "decision": 0,
            "decisionText": "Include",
            "reason": "Relevant to RQ1",
            "decidedAt": "2025-01-05T14:30:00+00:00"
          },
          {
            "id": "uuid",
            "studySelectionProcessId": "uuid",
            "paperId": "uuid",
            "paperTitle": "Machine Learning in SE: A Review",
            "reviewerId": "uuid-2",
            "reviewerName": "Bob Johnson",
            "decision": 1,
            "decisionText": "Exclude",
            "reason": "Out of scope",
            "decidedAt": "2025-01-05T15:00:00+00:00"
          }
        ],
        "resolution": null
      }
    ],
    "totalCount": 42,
    "pageNumber": 1,
    "pageSize": 10,
    "totalPages": 5,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

#### Business Logic

- Returns eligible papers (project papers minus duplicates) matching the filter criteria.
- **Search**: Case-insensitive partial match on paper `title`.
- **Status filter**: Filters by the computed `PaperSelectionStatus` (Pending, Included, Excluded, Conflict). When omitted, returns all statuses.
- **Sorting**:
  - `TitleAsc (0)`: A → Z by title (default)
  - `TitleDesc (1)`: Z → A by title
  - `YearNewest (2)`: Newest year first, then by title
  - `YearOldest (3)`: Oldest year first (papers with no year sort last), then by title
- **Pagination**: `pageSize` is clamped to 1–100. `pageNumber` starts at 1.
- Each paper includes full metadata, all screening decisions (with `reviewerName`), resolution (if any, with `resolverName`), and computed `status`/`statusText`.

#### Frontend Integration Notes

- This is the **primary endpoint for the screening table/list view**.
- Use `status` query param for filter tabs (e.g., "All" = omit param, "Pending" = `status=0`, etc.).
- Use `sortBy` for sort dropdown / column headers.
- Use `search` for the search input — debounce 300–500ms before calling.
- Use `totalCount`, `totalPages`, `hasPreviousPage`, `hasNextPage` to build pagination controls.
- `resolution` is `null` when no resolution exists — check before rendering.
- After submitting a decision or resolving a conflict, re-fetch the current page to see updated status.

---

## Error Handling

All errors follow the standard `ApiResponse` envelope. The backend uses **centralized exception handling** — all `InvalidOperationException` and `ArgumentException` errors thrown in the service layer are caught by the global middleware.

### Common Error Pattern

```json
{
  "isSuccess": false,
  "message": "Cannot submit decisions for process in NotStarted status.",
  "errors": [
    {
      "code": "INTERNAL_SERVER_ERROR",
      "message": "Cannot submit decisions for process in NotStarted status."
    }
  ],
  "data": null
}
```

### Error Handling Strategy for Frontend

```typescript
async function callApi<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(url, options);
  const body: ApiResponse<T> = await response.json();

  if (!body.isSuccess) {
    // Show error toast/notification with body.message
    throw new Error(body.message);
  }

  return body;
}
```

---

## Frontend Integration Guide

### Recommended Page Structure

#### 1. Study Selection Dashboard

- **Fetch**: `GET /api/study-selection/{id}` for process info + `GET /api/study-selection/{id}/statistics` for stats
- **Display**: Process status, progress bar, quick stat cards (included/excluded/conflict/pending counts)
- **Actions**: Start / Complete buttons (conditionally shown based on status)

#### 2. Paper Screening List

- **Fetch**: `GET /api/study-selection/{id}/papers` for the full list
- **Display**: Table with columns: Title, Authors, Year, Status, Actions
- **Filter tabs**: All | Pending | Included | Excluded | Conflict
- **Actions per row**: Submit Decision (if Pending), View Decisions, Resolve Conflict (if Conflict)

#### 3. Submit Decision Modal/Panel

- **Trigger**: Click on a Pending paper
- **Fetch**: `GET /api/study-selection/{id}/papers/{paperId}/decisions` to show existing decisions
- **Action**: `POST /api/study-selection/{id}/papers/{paperId}/decision`

#### 4. Conflict Resolution Queue

- **Fetch**: `GET /api/study-selection/{id}/conflicts`
- **Display**: List of conflicted papers with side-by-side reviewer decisions
- **Action**: `POST /api/study-selection/{id}/papers/{paperId}/resolve`

### State Machine (Process Lifecycle)

```
┌──────────────┐     POST /start     ┌──────────────┐    POST /complete    ┌──────────────┐
│  NotStarted  │ ──────────────────► │  InProgress   │ ──────────────────► │  Completed   │
│   (status=0) │                     │   (status=1)  │                     │   (status=2) │
└──────────────┘                     └──────────────┘                     └──────────────┘
                                           │                                      
                                           │  Submit decisions                     
                                           │  Resolve conflicts                    
                                           │  View statistics                      
```

### Common Pitfalls

| Pitfall | Solution |
|---|---|
| Trying to start before Identification is complete | Check Identification status first; show disabled state |
| Trying to complete with unresolved conflicts | Fetch conflicts count; disable Complete button if > 0 |
| Submitting duplicate decisions for same reviewer+paper | Catch the error; show "Already reviewed" state |
| Assuming `includedCount + excludedCount = totalPapers` | Pending and conflict papers are separate categories |
| Not handling `null` resolution in paper list | Always check `resolution !== null` before accessing fields |

---

## Ready-to-Use TypeScript Types

```typescript
// ============================================
// ENUMS
// ============================================

export enum SelectionProcessStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
}

export enum ScreeningDecisionType {
  Include = 0,
  Exclude = 1,
}

export enum PaperSelectionStatus {
  Pending = 0,
  Included = 1,
  Excluded = 2,
  Conflict = 3,
  Resolved = 4,
}

export enum PaperSortBy {
  TitleAsc = 0,
  TitleDesc = 1,
  YearNewest = 2,
  YearOldest = 3,
}

// ============================================
// API RESPONSE WRAPPER
// ============================================

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T = void> {
  isSuccess: boolean;
  message: string;
  errors: ApiError[] | null;
  data: T | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ============================================
// REQUEST TYPES
// ============================================

export interface CreateStudySelectionProcessRequest {
  notes?: string | null;
}

export interface PapersWithDecisionsParams {
  search?: string;
  status?: PaperSelectionStatus;
  sortBy?: PaperSortBy;
  pageNumber?: number;
  pageSize?: number;
}

export interface SubmitScreeningDecisionRequest {
  reviewerId: string;
  decision: ScreeningDecisionType;
  reason?: string | null;
}

export interface ResolveScreeningConflictRequest {
  finalDecision: ScreeningDecisionType;
  resolvedBy: string;
  resolutionNotes?: string | null;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface StudySelectionProcessResponse {
  id: string;
  reviewProcessId: string;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
  status: SelectionProcessStatus;
  statusText: string;
  createdAt: string;
  modifiedAt: string;
  screenedStudy: number;
  studyToScreen: number;
}

export interface ScreeningDecisionResponse {
  id: string;
  studySelectionProcessId: string;
  paperId: string;
  paperTitle: string;
  reviewerId: string;
  reviewerName: string;
  decision: ScreeningDecisionType;
  decisionText: string;
  reason: string | null;
  decidedAt: string;
}

export interface ScreeningResolutionResponse {
  id: string;
  studySelectionProcessId: string;
  paperId: string;
  paperTitle: string;
  finalDecision: ScreeningDecisionType;
  finalDecisionText: string;
  resolutionNotes: string | null;
  resolvedBy: string;
  resolverName: string;
  resolvedAt: string;
}

export interface PaperWithDecisionsResponse {
  paperId: string;
  title: string;
  doi: string | null;
  authors: string | null;
  publicationYear: number | null;
  abstract: string | null;
  journal: string | null;
  source: string | null;
  keywords: string | null;
  publicationType: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  publisher: string | null;
  language: string | null;
  url: string | null;
  pdfUrl: string | null;
  conferenceName: string | null;
  conferenceLocation: string | null;
  journalIssn: string | null;
  status: PaperSelectionStatus;
  statusText: string;
  decisions: ScreeningDecisionResponse[];
  resolution: ScreeningResolutionResponse | null;
}

export interface ConflictedPaperResponse {
  paperId: string;
  title: string;
  doi: string | null;
  conflictingDecisions: ScreeningDecisionResponse[];
}

export interface SelectionStatisticsResponse {
  studySelectionProcessId: string;
  totalPapers: number;
  includedCount: number;
  excludedCount: number;
  conflictCount: number;
  pendingCount: number;
  completionPercentage: number;
}
```

---

## Example API Calls

### Using Fetch (TypeScript)

```typescript
const BASE_URL = "/api";

// 1. Create Study Selection Process
async function createStudySelectionProcess(
  reviewProcessId: string,
  notes?: string
): Promise<ApiResponse<StudySelectionProcessResponse>> {
  const response = await fetch(
    `${BASE_URL}/review-processes/${reviewProcessId}/study-selection`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    }
  );
  return response.json();
}

// 2. Get Study Selection Process
async function getStudySelectionProcess(
  id: string
): Promise<ApiResponse<StudySelectionProcessResponse>> {
  const response = await fetch(`${BASE_URL}/study-selection/${id}`);
  return response.json();
}

// 3. Start Study Selection Process
async function startStudySelectionProcess(
  id: string
): Promise<ApiResponse<StudySelectionProcessResponse>> {
  const response = await fetch(`${BASE_URL}/study-selection/${id}/start`, {
    method: "POST",
  });
  return response.json();
}

// 4. Complete Study Selection Process
async function completeStudySelectionProcess(
  id: string
): Promise<ApiResponse<StudySelectionProcessResponse>> {
  const response = await fetch(`${BASE_URL}/study-selection/${id}/complete`, {
    method: "POST",
  });
  return response.json();
}

// 5. Get Eligible Papers
async function getEligiblePapers(
  id: string
): Promise<ApiResponse<string[]>> {
  const response = await fetch(
    `${BASE_URL}/study-selection/${id}/eligible-papers`
  );
  return response.json();
}

// 6. Submit Screening Decision
async function submitScreeningDecision(
  processId: string,
  paperId: string,
  request: SubmitScreeningDecisionRequest
): Promise<ApiResponse<ScreeningDecisionResponse>> {
  const response = await fetch(
    `${BASE_URL}/study-selection/${processId}/papers/${paperId}/decision`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );
  return response.json();
}

// 7. Get Decisions by Paper
async function getDecisionsByPaper(
  processId: string,
  paperId: string
): Promise<ApiResponse<ScreeningDecisionResponse[]>> {
  const response = await fetch(
    `${BASE_URL}/study-selection/${processId}/papers/${paperId}/decisions`
  );
  return response.json();
}

// 8. Get Conflicted Papers
async function getConflictedPapers(
  processId: string
): Promise<ApiResponse<ConflictedPaperResponse[]>> {
  const response = await fetch(
    `${BASE_URL}/study-selection/${processId}/conflicts`
  );
  return response.json();
}

// 9. Resolve Conflict
async function resolveConflict(
  processId: string,
  paperId: string,
  request: ResolveScreeningConflictRequest
): Promise<ApiResponse<ScreeningResolutionResponse>> {
  const response = await fetch(
    `${BASE_URL}/study-selection/${processId}/papers/${paperId}/resolve`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );
  return response.json();
}

// 10. Get Paper Selection Status
async function getPaperSelectionStatus(
  processId: string,
  paperId: string
): Promise<ApiResponse<PaperSelectionStatus>> {
  const response = await fetch(
    `${BASE_URL}/study-selection/${processId}/papers/${paperId}/status`
  );
  return response.json();
}

// 11. Get Selection Statistics
async function getSelectionStatistics(
  processId: string
): Promise<ApiResponse<SelectionStatisticsResponse>> {
  const response = await fetch(
    `${BASE_URL}/study-selection/${processId}/statistics`
  );
  return response.json();
}

// 12. Get Papers with Decisions (paginated)
async function getPapersWithDecisions(
  processId: string,
  params?: PapersWithDecisionsParams
): Promise<ApiResponse<PaginatedResponse<PaperWithDecisionsResponse>>> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.status !== undefined) query.set("status", String(params.status));
  if (params?.sortBy !== undefined) query.set("sortBy", String(params.sortBy));
  if (params?.pageNumber) query.set("pageNumber", String(params.pageNumber));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));

  const queryString = query.toString();
  const url = `${BASE_URL}/study-selection/${processId}/papers${queryString ? `?${queryString}` : ""}`;
  const response = await fetch(url);
  return response.json();
}
```

### Usage Example: Full Screening Workflow

```typescript
async function screeningWorkflow() {
  const reviewProcessId = "your-review-process-id";

  // Step 1: Create the selection process
  const createResult = await createStudySelectionProcess(
    reviewProcessId,
    "Title and abstract screening"
  );
  const processId = createResult.data!.id;

  // Step 2: Start the process
  await startStudySelectionProcess(processId);

  // Step 3: Get papers (paginated)
  const papersResult = await getPapersWithDecisions(processId, {
    sortBy: PaperSortBy.TitleAsc,
    pageNumber: 1,
    pageSize: 50,
  });
  const paperIds = papersResult.data!.items.map((p) => p.paperId);

  // Step 4: Submit decisions for each paper
  for (const paperId of paperIds) {
    await submitScreeningDecision(processId, paperId, {
      reviewerId: "current-user-id",
      decision: ScreeningDecisionType.Include,
      reason: "Meets inclusion criteria",
    });
  }

  // Step 5: Check for conflicts
  const conflicts = await getConflictedPapers(processId);
  for (const conflict of conflicts.data!) {
    await resolveConflict(processId, conflict.paperId, {
      finalDecision: ScreeningDecisionType.Include,
      resolvedBy: "resolver-user-id",
      resolutionNotes: "Confirmed relevant after discussion",
    });
  }

  // Step 6: Complete the process
  await completeStudySelectionProcess(processId);

  // Step 7: Get final statistics
  const stats = await getSelectionStatistics(processId);
  console.log(`Included: ${stats.data!.includedCount}, Excluded: ${stats.data!.excludedCount}`);
}
```
