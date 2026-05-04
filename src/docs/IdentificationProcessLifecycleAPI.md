# Identification Process Lifecycle API Integration Guide

## Scope

This document covers lifecycle endpoints for Identification Process:

- StartIdentificationProcess
- CompleteIdentificationProcess
- ReopenIdentificationProcess

It is written for frontend integration so FE engineers do not need to read backend service code.

## Base URL

- Relative base route: /api
- Controller: IdentificationProcessController

## Authentication and Headers

Current code-level behavior:

- These three endpoints do not have Authorize attribute on the controller/action.
- So authentication is not explicitly required by these endpoints in code.

Recommended FE headers:

- Content-Type: application/json
- Authorization: Bearer <token> (recommended if your environment/gateway expects auth)

Important:

- If Authorization token is sent and is blacklisted, middleware returns 401 with message Token has been revoked.

## Shared Response Contracts

All controller responses use ApiResponse wrappers.

```ts
export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse {
  isSuccess: boolean;
  message: string;
  errors?: ApiError[];
}

export interface ApiResponseWithData<T> extends ApiResponse {
  data?: T;
}
```

Identification process payload returned by lifecycle APIs:

```ts
export type IdentificationStatus = 0 | 1 | 2;
// 0 = NotStarted, 1 = InProgress, 2 = Completed

export interface IdentificationProcessResponse {
  id: string;
  reviewProcessId: string;
  notes?: string | null;
  startedAt?: string | null; // ISO-8601
  completedAt?: string | null; // ISO-8601
  status: IdentificationStatus;
  statusText: "NotStarted" | "InProgress" | "Completed";
  createdAt: string; // ISO-8601
  modifiedAt: string; // ISO-8601

  // Present in DTO but often not populated by lifecycle methods.
  prismaStatistics?: PrismaStatisticsResponse;
}

// Keep as unknown if not needed in lifecycle screens.
export type PrismaStatisticsResponse = unknown;
```

Error shape for model binding / validation failures:

```ts
export interface InvalidModelStateError {
  isSuccess: false;
  message: "Dữ liệu không hợp lệ";
  errors: Array<{
    code: "INVALID_MODEL_STATE";
    message: string;
  }>;
}
```

## Endpoint 1: Start Identification Process

### 1. Basic Info

- Method: POST
- Route: /api/identification-processes/{id}/start
- Purpose: Move process from NotStarted to InProgress

### 2. Request Details

Headers:

- Content-Type: application/json
- Authorization: optional by code, recommended by platform policy

Path params:

- id (required): GUID of Identification Process

Query params:

- None

Request body:

- None

Validation rules:

- id must be valid GUID
- Process must exist
- Current status must be NotStarted

### 3. Response Details

Success:

- HTTP 200
- Body: ApiResponseWithData<IdentificationProcessResponse>

Possible errors:

- HTTP 400: invalid GUID format (model state)
- HTTP 500: business/state failures are currently surfaced as InvalidOperationException

Important response notes:

- startedAt is set to current UTC time when transition succeeds
- status/statusText become InProgress

### 4. Business Logic Summary

- Finds identification process by id
- Loads related review process
- Sets reviewProcess.currentPhase to Identification
- Calls domain transition Start()
- Persists changes

Conditions FE must know:

- Re-calling Start after already started/completed will fail

Side effects:

- Review process phase is forced to Identification

Caching/timing:

- No pagination/caching semantics
- This is a state mutation; invalidate cached process detail after success

### 5. Frontend Integration Notes

When to call:

- User clicks Start Phase from NotStarted state

Common pitfalls:

- Double-click can trigger one success and one failure
- If UI uses stale status, Start may fail due to state already changed elsewhere

Loading/error handling:

- Disable button while request is pending
- On failure, show backend message directly

Race conditions:

- Two clients starting same process simultaneously

### 6. Ready-to-Use FE Types + Example

```ts
export interface StartIdentificationProcessPathParams {
  id: string;
}

export type StartIdentificationProcessResponse = ApiResponseWithData<IdentificationProcessResponse>;
```

```ts
export async function startIdentificationProcess(id: string, token?: string) {
  const res = await fetch(`/api/identification-processes/${id}/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json();
  if (!res.ok || !data?.isSuccess) throw data;
  return data as StartIdentificationProcessResponse;
}
```

## Endpoint 2: Complete Identification Process

### 1. Basic Info

- Method: POST
- Route: /api/identification-processes/{id}/complete
- Purpose: Move process from InProgress to Completed

### 2. Request Details

Headers:

- Content-Type: application/json
- Authorization: optional by code, recommended by platform policy

Path params:

- id (required): GUID of Identification Process

Query params:

- None

Request body:

- None

Validation rules:

- id must be valid GUID
- Process must exist
- Current status must be InProgress
- There must be no pending deduplication results for this process

### 3. Response Details

Success:

- HTTP 200
- Body: ApiResponseWithData<IdentificationProcessResponse>

Possible errors:

- HTTP 400: invalid GUID format
- HTTP 500: business/state violations (status invalid, pending dedup unresolved, not found in service)

Important response notes:

- completedAt is set to current UTC time
- status/statusText become Completed

### 4. Business Logic Summary

- Validates process exists
- Checks deduplication table: no rows with reviewStatus = Pending for this process
- Calls domain Complete()
- Saves changes
- Triggers enrichment orchestrator for identification process

Conditions FE must know:

- Completion is blocked until all pending dedup pairs are resolved

Side effects:

- Enrichment trigger is executed after completion
- Even though comment mentions fire-and-forget via channel, the trigger call is awaited by API method

Caching/timing:

- Completion may be slightly slower than other lifecycle actions due to enrichment trigger call
- After success, FE should refresh process detail and any dataset edit controls

### 5. Frontend Integration Notes

When to call:

- User clicks Complete after dedup review is done

Common pitfalls:

- FE allows Complete before dedup queue is clear
- Repeated clicks can produce transition errors

Loading/error handling:

- Show actionable message when pending dedup blocks completion
- Lock editing UI once completed

Race conditions:

- Another user adds/changes dedup decisions while current user attempts completion

### 6. Ready-to-Use FE Types + Example

```ts
export interface CompleteIdentificationProcessPathParams {
  id: string;
}

export type CompleteIdentificationProcessResponse =
  ApiResponseWithData<IdentificationProcessResponse>;
```

```ts
export async function completeIdentificationProcess(id: string, token?: string) {
  const res = await fetch(`/api/identification-processes/${id}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json();
  if (!res.ok || !data?.isSuccess) throw data;
  return data as CompleteIdentificationProcessResponse;
}
```

## Endpoint 3: Reopen Identification Process

### 1. Basic Info

- Method: POST
- Route: /api/identification-processes/{id}/reopen
- Purpose: Move process from Completed back to InProgress

### 2. Request Details

Headers:

- Content-Type: application/json
- Authorization: optional by code, recommended by platform policy

Path params:

- id (required): GUID of Identification Process

Query params:

- None

Request body:

- None

Validation rules:

- id must be valid GUID
- Process must exist
- Current status must be Completed

### 3. Response Details

Success:

- HTTP 200
- Body: ApiResponseWithData<IdentificationProcessResponse>

Possible errors:

- HTTP 400: invalid GUID format
- HTTP 500: business/state violations (invalid transition, not found)

Important response notes:

- completedAt is cleared to null on reopen
- status/statusText become InProgress
- startedAt is not reset by reopen

### 4. Business Logic Summary

- Validates process exists
- Calls domain Reopen()
- Sets related reviewProcess.currentPhase to Identification
- Saves changes

Conditions FE must know:

- Reopen only works from Completed
- After reopen, editing APIs are allowed again for identification dataset operations

Side effects:

- Completed timestamp is removed
- Review process phase is set to Identification

Caching/timing:

- Standard mutation, low latency expected
- Always refetch process state after success

### 5. Frontend Integration Notes

When to call:

- User needs to resume identification work after phase was completed

Common pitfalls:

- FE still in read-only mode after reopen because cached state was not refreshed

Loading/error handling:

- On success, re-enable import/dedup/snapshot editing actions
- If transition invalid, show backend message and refresh current status

Race conditions:

- Multiple users reopen/complete rapidly causing toggle conflicts

### 6. Ready-to-Use FE Types + Example

```ts
export interface ReopenIdentificationProcessPathParams {
  id: string;
}

export type ReopenIdentificationProcessResponse =
  ApiResponseWithData<IdentificationProcessResponse>;
```

```ts
export async function reopenIdentificationProcess(id: string, token?: string) {
  const res = await fetch(`/api/identification-processes/${id}/reopen`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json();
  if (!res.ok || !data?.isSuccess) throw data;
  return data as ReopenIdentificationProcessResponse;
}
```

## Workflow: Start → Complete → Reopen

### Lifecycle states

- NotStarted
- InProgress
- Completed

### Allowed transitions

- NotStarted -> InProgress using Start
- InProgress -> Completed using Complete
- Completed -> InProgress using Reopen

### FE workflow recommendation

1. Fetch current process status before showing action buttons.
2. Show Start only when status is NotStarted.
3. Show Complete only when status is InProgress and dedup pending count is zero.
4. Show Reopen only when status is Completed.
5. After each mutation, refetch process detail and recalculate UI permissions.

## Frontend Guard Matrix

- status NotStarted:
  - canStart = true
  - canComplete = false
  - canReopen = false
  - canEditIdentificationData = false (until started)

- status InProgress:
  - canStart = false
  - canComplete = true
  - canReopen = false
  - canEditIdentificationData = true

- status Completed:
  - canStart = false
  - canComplete = false
  - canReopen = true
  - canEditIdentificationData = false

## Error Handling Strategy for FE

Because service business-rule failures currently throw InvalidOperationException, many functional errors return HTTP 500 instead of 4xx.

FE should:

- Parse response body message and show it to user.
- Treat known messages as expected user-facing errors, for example:
  - Cannot complete identification process with unresolved duplicate pairs...
  - Cannot start identification process from Completed status.
  - Cannot reopen identification process from InProgress status.
- Optionally map these to localized, friendlier FE messages.

## Minimal FE Utility Types

```ts
export type UUID = string;

export interface LifecycleActionState {
  canStart: boolean;
  canComplete: boolean;
  canReopen: boolean;
  canEditIdentificationData: boolean;
}

export function deriveLifecycleActions(
  statusText: IdentificationProcessResponse["statusText"],
): LifecycleActionState {
  if (statusText === "NotStarted") {
    return {
      canStart: true,
      canComplete: false,
      canReopen: false,
      canEditIdentificationData: false,
    };
  }
  if (statusText === "InProgress") {
    return {
      canStart: false,
      canComplete: true,
      canReopen: false,
      canEditIdentificationData: true,
    };
  }
  return { canStart: false, canComplete: false, canReopen: true, canEditIdentificationData: false };
}
```
