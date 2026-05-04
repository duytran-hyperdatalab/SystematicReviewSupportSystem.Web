# Review Process API Documentation

## Overview

The Review Process API manages the execution phases of systematic review projects following the **PRISMA 2020** workflow. Each project can have multiple review processes that run sequentially, with only one process active at a time.

## Base Information

- **Base URL**: `/api`
- **Content Type**: `application/json`
- **Authentication**: JWT (modular, optional)
- **Framework**: ASP.NET Core (.NET 8)

## API Response Structure

All API responses follow the `ApiResponse<T>` wrapper pattern:

```json
{
  "isSuccess": true,
  "message": "Operation message",
  "data": { ... },
  "errors": null
}
```

**Error responses** include an `errors` array:

```json
{
  "isSuccess": false,
  "message": "Error message",
  "data": null,
  "errors": [
    {
      "code": "ERROR_CODE",
      "message": "Detailed error message"
    }
  ]
}
```

---

## Review Process Workflow

### Process Status Values

| Status | Description | Next States |
|--------|-------------|-------------|
| `Pending` | Process created but not yet started | `InProgress`, `Cancelled` |
| `InProgress` | Process is currently active | `Completed`, `Cancelled` |
| `Completed` | Process has been successfully finished | - (terminal state) |
| `Cancelled` | Process was cancelled before completion | - (terminal state) |

### Sequential Process Rule

⚠️ **Important**: Only **ONE** review process can be `InProgress` at a time per project. Before starting a new process, the current active process must be completed or cancelled.

---

## Endpoints

### 1. Create Review Process

Creates a new review process for a specific project with initial status of `Pending`.

**HTTP Method**: `POST /api/projects/{projectId}/review-processes`

**Path Parameters**:
- `projectId` (UUID, required): Project identifier

**Request Body**:
```json
{
  "name": "Identification Phase",
  "description": "Initial identification of relevant studies through database searches",
  "notes": "Focus on ACM, IEEE, and Springer databases"
}
```

**Response**: `201 Created`
```json
{
  "isSuccess": true,
  "message": "Review process created successfully.",
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "projectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Identification Phase",
    "description": "Initial identification of relevant studies through database searches",
    "notes": "Focus on ACM, IEEE, and Springer databases",
    "status": "Pending",
    "startedAt": null,
    "completedAt": null,
    "createdAt": "2026-02-23T10:35:00Z",
    "updatedAt": "2026-02-23T10:35:00Z"
  },
  "errors": null
}
```

**cURL Example**:
```bash
curl -X POST "http://localhost:5000/api/projects/3fa85f64-5717-4562-b3fc-2c963f66afa6/review-processes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Identification Phase",
    "description": "Initial identification of relevant studies",
    "notes": "Focus on ACM, IEEE, and Springer databases"
  }'
```

---

### 2. Get Review Processes by Project

Retrieves all review processes for a specific project, ordered by creation date.

**HTTP Method**: `GET /api/projects/{projectId}/review-processes`

**Path Parameters**:
- `projectId` (UUID, required): Project identifier

**Response**: `200 OK`
```json
{
  "isSuccess": true,
  "message": "Review processes retrieved successfully.",
  "data": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "projectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Identification Phase",
      "description": "Initial identification of relevant studies",
      "notes": "Focus on ACM, IEEE, and Springer databases",
      "status": "Completed",
      "startedAt": "2026-02-23T11:00:00Z",
      "completedAt": "2026-02-23T14:30:00Z",
      "createdAt": "2026-02-23T10:35:00Z",
      "updatedAt": "2026-02-23T14:30:00Z"
    },
    {
      "id": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
      "projectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Screening Phase",
      "description": "Title and abstract screening",
      "notes": "Apply inclusion/exclusion criteria",
      "status": "InProgress",
      "startedAt": "2026-02-23T15:00:00Z",
      "completedAt": null,
      "createdAt": "2026-02-23T14:35:00Z",
      "updatedAt": "2026-02-23T15:00:00Z"
    },
    {
      "id": "b2c3d4e5-6789-01bc-def2-234567890abc",
      "projectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Quality Assessment Phase",
      "description": "Assess quality of selected studies",
      "notes": null,
      "status": "Pending",
      "startedAt": null,
      "completedAt": null,
      "createdAt": "2026-02-23T14:40:00Z",
      "updatedAt": "2026-02-23T14:40:00Z"
    }
  ],
  "errors": null
}
```

**cURL Example**:
```bash
curl -X GET "http://localhost:5000/api/projects/3fa85f64-5717-4562-b3fc-2c963f66afa6/review-processes"
```

**Use Case - Show Current Phase**:
```javascript
// Filter the response to find the current active phase
const processes = response.data;
const currentPhase = processes.find(p => p.status === "InProgress");

if (currentPhase) {
  console.log(`Current Phase: ${currentPhase.name} (Started: ${currentPhase.startedAt})`);
} else {
  const nextPhase = processes.find(p => p.status === "Pending");
  console.log(nextPhase ? `Next Phase: ${nextPhase.name}` : "All processes completed");
}
```

---

### 3. Get Review Process by ID

Retrieves detailed information about a specific review process.

**HTTP Method**: `GET /api/review-processes/{id}`

**Path Parameters**:
- `id` (UUID, required): Process identifier

**Response**: `200 OK`
```json
{
  "isSuccess": true,
  "message": "Review process retrieved successfully.",
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "projectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Identification Phase",
    "description": "Initial identification of relevant studies through database searches",
    "notes": "Focus on ACM, IEEE, and Springer databases",
    "status": "InProgress",
    "startedAt": "2026-02-23T11:00:00Z",
    "completedAt": null,
    "createdAt": "2026-02-23T10:35:00Z",
    "updatedAt": "2026-02-23T11:00:00Z"
  },
  "errors": null
}
```

**cURL Example**:
```bash
curl -X GET "http://localhost:5000/api/review-processes/7c9e6679-7425-40de-944b-e07fc1f90ae7"
```

---

### 4. Update Review Process

Updates review process notes and description. Status changes are handled through dedicated endpoints.

**HTTP Method**: `PUT /api/review-processes/{id}`

**Path Parameters**:
- `id` (UUID, required): Process identifier

**Request Body**:
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "notes": "Updated notes: Expanded search to include ScienceDirect and PubMed"
}
```

> ⚠️ **Important**: The `id` in the request body must match the `id` in the URL path.

**Response**: `200 OK`
```json
{
  "isSuccess": true,
  "message": "Review process updated successfully.",
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "projectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Identification Phase",
    "description": "Initial identification of relevant studies through database searches",
    "notes": "Updated notes: Expanded search to include ScienceDirect and PubMed",
    "status": "InProgress",
    "startedAt": "2026-02-23T11:00:00Z",
    "completedAt": null,
    "createdAt": "2026-02-23T10:35:00Z",
    "updatedAt": "2026-02-23T13:00:00Z"
  },
  "errors": null
}
```

**cURL Example**:
```bash
curl -X PUT "http://localhost:5000/api/review-processes/7c9e6679-7425-40de-944b-e07fc1f90ae7" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "notes": "Updated notes: Expanded search to include ScienceDirect and PubMed"
  }'
```

**Error Response** (400 Bad Request):
```json
{
  "isSuccess": false,
  "message": "ID in route does not match ID in request body.",
  "data": null,
  "errors": null
}
```

---

### 5. Start Review Process

Transitions a process from `Pending` to `InProgress` status. Sets the `startedAt` timestamp.

**HTTP Method**: `POST /api/review-processes/{id}/start`

**Path Parameters**:
- `id` (UUID, required): Process identifier

**Request Body**: None

**Response**: `200 OK`
```json
{
  "isSuccess": true,
  "message": "Review process started successfully.",
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "projectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Identification Phase",
    "description": "Initial identification of relevant studies",
    "notes": "Focus on ACM, IEEE, and Springer databases",
    "status": "InProgress",
    "startedAt": "2026-02-23T11:00:00Z",
    "completedAt": null,
    "createdAt": "2026-02-23T10:35:00Z",
    "updatedAt": "2026-02-23T11:00:00Z"
  },
  "errors": null
}
```

**cURL Example**:
```bash
curl -X POST "http://localhost:5000/api/review-processes/7c9e6679-7425-40de-944b-e07fc1f90ae7/start"
```

**Business Rules**:
- ✅ Only `Pending` processes can be started
- ✅ Only ONE process per project can be `InProgress`
- ❌ Cannot start if another process in the same project is already `InProgress`

**Error Response** (400 Bad Request):
```json
{
  "isSuccess": false,
  "message": "Cannot start process. Another process in this project is already in progress.",
  "data": null,
  "errors": null
}
```

---

### 6. Complete Review Process

Transitions a process from `InProgress` to `Completed` status. Sets the `completedAt` timestamp.

**HTTP Method**: `POST /api/review-processes/{id}/complete`

**Path Parameters**:
- `id` (UUID, required): Process identifier

**Request Body**: None

**Response**: `200 OK`
```json
{
  "isSuccess": true,
  "message": "Review process completed successfully.",
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "projectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Identification Phase",
    "description": "Initial identification of relevant studies",
    "notes": "Focus on ACM, IEEE, and Springer databases",
    "status": "Completed",
    "startedAt": "2026-02-23T11:00:00Z",
    "completedAt": "2026-02-23T14:30:00Z",
    "createdAt": "2026-02-23T10:35:00Z",
    "updatedAt": "2026-02-23T14:30:00Z"
  },
  "errors": null
}
```

**cURL Example**:
```bash
curl -X POST "http://localhost:5000/api/review-processes/7c9e6679-7425-40de-944b-e07fc1f90ae7/complete"
```

**Allowed Transitions**:
- ✅ `InProgress` → `Completed`
- ❌ Other statuses will result in error

**Error Response** (400 Bad Request):
```json
{
  "isSuccess": false,
  "message": "Cannot complete process from Pending status.",
  "data": null,
  "errors": null
}
```

---

### 7. Cancel Review Process

Transitions a process from `Pending` or `InProgress` to `Cancelled` status.

**HTTP Method**: `POST /api/review-processes/{id}/cancel`

**Path Parameters**:
- `id` (UUID, required): Process identifier

**Request Body**: None

**Response**: `200 OK`
```json
{
  "isSuccess": true,
  "message": "Review process cancelled successfully.",
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "projectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Identification Phase",
    "description": "Initial identification of relevant studies",
    "notes": "Cancelled due to scope change",
    "status": "Cancelled",
    "startedAt": "2026-02-23T11:00:00Z",
    "completedAt": null,
    "createdAt": "2026-02-23T10:35:00Z",
    "updatedAt": "2026-02-23T12:30:00Z"
  },
  "errors": null
}
```

**cURL Example**:
```bash
curl -X POST "http://localhost:5000/api/review-processes/7c9e6679-7425-40de-944b-e07fc1f90ae7/cancel"
```

**Allowed Transitions**:
- ✅ `Pending` → `Cancelled`
- ✅ `InProgress` → `Cancelled`
- ❌ `Completed` or `Cancelled` cannot be cancelled again

---

### 8. Delete Review Process

Permanently deletes a review process.

**HTTP Method**: `DELETE /api/review-processes/{id}`

**Path Parameters**:
- `id` (UUID, required): Process identifier

**Request Body**: None

**Response**: `200 OK`
```json
{
  "isSuccess": true,
  "message": "Review process deleted successfully.",
  "data": null,
  "errors": null
}
```

**cURL Example**:
```bash
curl -X DELETE "http://localhost:5000/api/review-processes/7c9e6679-7425-40de-944b-e07fc1f90ae7"
```

> ⚠️ **Warning**: Deleting an `InProgress` process may affect project state. Consider cancelling instead.

---

## Process Status Lifecycle

### State Transition Diagram

```
┌───────┐
│ START │
└───┬───┘
    │
    ▼
┌─────────┐      ┌────────────┐      ┌───────────┐
│ Pending │─────▶│ InProgress │─────▶│ Completed │
└────┬────┘      └─────┬──────┘      └───────────┘
     │                 │
     │                 │
     ▼                 ▼
┌───────────┐    ┌───────────┐
│ Cancelled │    │ Cancelled │
└───────────┘    └───────────┘
```

### Transition Rules

1. **Pending → InProgress**: Start working on the process (only if no other process is active)
2. **InProgress → Completed**: Finish the process successfully
3. **Pending → Cancelled**: Cancel before starting
4. **InProgress → Cancelled**: Cancel while in progress
5. **Any Status → Delete**: Permanently remove the process

---

## Common Integration Patterns

### Pattern 1: Project Detail Page with Current Phase

```javascript
// Fetch project details
const projectResponse = await fetch(`/api/projects/${projectId}`);
const project = await projectResponse.json();

// Fetch all review processes
const processesResponse = await fetch(`/api/projects/${projectId}/review-processes`);
const processes = await processesResponse.json();

// Identify current phase
const currentPhase = processes.data.find(p => p.status === "InProgress");
const completedPhases = processes.data.filter(p => p.status === "Completed");
const pendingPhases = processes.data.filter(p => p.status === "Pending");

// Display summary
console.log(`Project: ${project.data.title}`);
console.log(`Completed: ${completedPhases.length}`);
console.log(`Current: ${currentPhase?.name || 'None'}`);
console.log(`Pending: ${pendingPhases.length}`);
```

### Pattern 2: Sequential Process Execution

```javascript
// Get all pending processes
const processesResponse = await fetch(`/api/projects/${projectId}/review-processes`);
const processes = await processesResponse.json();

// Find next process to start
const nextProcess = processes.data.find(p => p.status === "Pending");

if (nextProcess) {
  // Start the next process
  await fetch(`/api/review-processes/${nextProcess.id}/start`, {
    method: 'POST'
  });
  console.log(`Started: ${nextProcess.name}`);
}
```

### Pattern 3: Process Progress Tracking

```javascript
// Calculate progress
const processesResponse = await fetch(`/api/projects/${projectId}/review-processes`);
const processes = await processesResponse.json();

const total = processes.data.length;
const completed = processes.data.filter(p => p.status === "Completed").length;
const progressPercentage = (completed / total) * 100;

console.log(`Progress: ${progressPercentage.toFixed(1)}% (${completed}/${total} phases)`);
```

---

## PRISMA 2020 Phase Mapping

### Recommended Process Names

Following PRISMA 2020 guidelines, typical review processes include:

| Phase | Process Name | Description |
|-------|-------------|-------------|
| 1 | **Identification** | Identify studies via databases and registers |
| 2 | **Screening** | Screen titles and abstracts for eligibility |
| 3 | **Eligibility** | Assess full-text articles for eligibility |
| 4 | **Quality Assessment** | Evaluate the quality of included studies |
| 5 | **Data Extraction** | Extract relevant data from included studies |
| 6 | **Synthesis** | Synthesize results and perform meta-analysis |
| 7 | **Reporting** | Prepare final report and PRISMA checklist |

### Example: Creating PRISMA Workflow

```bash
PROJECT_ID="3fa85f64-5717-4562-b3fc-2c963f66afa6"

# 1. Identification Phase
curl -X POST "http://localhost:5000/api/projects/$PROJECT_ID/review-processes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Identification",
    "description": "Database searches and study identification",
    "notes": "Search ACM, IEEE, Springer, ScienceDirect"
  }'

# 2. Screening Phase
curl -X POST "http://localhost:5000/api/projects/$PROJECT_ID/review-processes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Screening",
    "description": "Title and abstract screening",
    "notes": "Apply inclusion/exclusion criteria"
  }'

# 3. Eligibility Assessment
curl -X POST "http://localhost:5000/api/projects/$PROJECT_ID/review-processes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Eligibility Assessment",
    "description": "Full-text review of candidate studies",
    "notes": "Assess full articles against criteria"
  }'

# 4. Quality Assessment
curl -X POST "http://localhost:5000/api/projects/$PROJECT_ID/review-processes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quality Assessment",
    "description": "Evaluate study quality",
    "notes": "Use quality assessment checklist"
  }'

# 5. Data Extraction
curl -X POST "http://localhost:5000/api/projects/$PROJECT_ID/review-processes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Data Extraction",
    "description": "Extract data from included studies",
    "notes": "Use standardized extraction form"
  }'

# 6. Synthesis
curl -X POST "http://localhost:5000/api/projects/$PROJECT_ID/review-processes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Synthesis",
    "description": "Synthesize findings and meta-analysis",
    "notes": "Narrative synthesis + meta-analysis"
  }'

# 7. Reporting
curl -X POST "http://localhost:5000/api/projects/$PROJECT_ID/review-processes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Reporting",
    "description": "Prepare final report",
    "notes": "Complete PRISMA checklist and flow diagram"
  }'
```

---

## Complete Workflow Example

### Sequential Process Execution

```bash
PROJECT_ID="3fa85f64-5717-4562-b3fc-2c963f66afa6"

# Step 1: Create identification process
PROCESS_ID=$(curl -X POST "http://localhost:5000/api/projects/$PROJECT_ID/review-processes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Identification Phase",
    "description": "Database search and study identification"
  }' | jq -r '.data.id')

echo "Created process: $PROCESS_ID"

# Step 2: Start the process
curl -X POST "http://localhost:5000/api/review-processes/$PROCESS_ID/start"

# Step 3: Update notes during execution
curl -X PUT "http://localhost:5000/api/review-processes/$PROCESS_ID" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$PROCESS_ID\",
    \"notes\": \"Found 1,234 initial studies across 5 databases\"
  }"

# Step 4: Complete the process
curl -X POST "http://localhost:5000/api/review-processes/$PROCESS_ID/complete"

# Step 5: Verify all processes
curl -X GET "http://localhost:5000/api/projects/$PROJECT_ID/review-processes"
```

---

## Error Handling

### Common Error Scenarios

#### 1. Starting Process When Another is Active

**Request**:
```bash
curl -X POST "http://localhost:5000/api/review-processes/{id}/start"
```

**Response** (400 Bad Request):
```json
{
  "isSuccess": false,
  "message": "Cannot start process. Another process in this project is already in progress.",
  "data": null,
  "errors": null
}
```

#### 2. Invalid Status Transition

**Request**:
```bash
curl -X POST "http://localhost:5000/api/review-processes/{id}/complete"
```

**Response** (400 Bad Request):
```json
{
  "isSuccess": false,
  "message": "Cannot complete process from Pending status.",
  "data": null,
  "errors": null
}
```

#### 3. Process Not Found

**Request**:
```bash
curl -X GET "http://localhost:5000/api/review-processes/{invalid-id}"
```

**Response** (404 Not Found):
```json
{
  "isSuccess": false,
  "message": "ReviewProcess with ID {invalid-id} not found.",
  "data": null,
  "errors": null
}
```

---

## Data Models

### CreateReviewProcessRequest
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "notes": "string (optional)"
}
```

### UpdateReviewProcessRequest
```json
{
  "id": "uuid (required)",
  "notes": "string (required)"
}
```

### ReviewProcessResponse
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "name": "string",
  "description": "string",
  "notes": "string",
  "status": "Pending | InProgress | Completed | Cancelled",
  "startedAt": "datetime (nullable)",
  "completedAt": "datetime (nullable)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## Best Practices

### 1. Sequential Execution
- Always complete or cancel the current process before starting a new one
- Use the status filter to identify the current active phase
- Monitor process completion before advancing

### 2. Progress Tracking
- Calculate completion percentage based on completed vs. total processes
- Display current phase prominently in the UI
- Show estimated remaining phases

### 3. Notes Management
- Add notes during process execution to track progress
- Update notes with key findings or metrics
- Use notes for audit trail and documentation

### 4. Error Handling
- Check for active processes before attempting to start a new one
- Validate status before attempting transitions
- Handle concurrent access scenarios gracefully

### 5. PRISMA Compliance
- Use standard PRISMA phase names
- Follow the recommended sequence of phases
- Document decisions and exclusions in notes

---

## Testing with Postman

### Environment Variables

Add to your Postman environment:

```json
{
  "baseUrl": "http://localhost:5000",
  "projectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "processId": ""
}
```

### Collection Structure

1. **Review Processes**
   - Create Process (POST) → Save `data.id` to `processId`
   - Get Processes by Project (GET)
   - Get Process by ID (GET)
   - Update Process (PUT)
   - Start Process (POST)
   - Complete Process (POST)
   - Cancel Process (POST)
   - Delete Process (DELETE)

### Test Scenarios

#### Scenario 1: Happy Path
1. Create process → Status: Pending
2. Start process → Status: InProgress
3. Update notes
4. Complete process → Status: Completed

#### Scenario 2: Cancellation
1. Create process → Status: Pending
2. Start process → Status: InProgress
3. Cancel process → Status: Cancelled

#### Scenario 3: Sequential Execution
1. Create Process A
2. Start Process A
3. Try to start Process B → Error (Process A still active)
4. Complete Process A
5. Start Process B → Success

---

## Related Documentation

- [Projects API Documentation](./README.md)
- [PRISMA 2020 Guidelines](http://www.prisma-statement.org/)
- [Kitchenham SLR Methodology](https://www.elsevier.com/books/guidelines-for-performing-systematic-literature-reviews-in-software-engineering/kitchenham/978-0-12-804206-9)

---

## Support

For issues, questions, or contributions:
- **Repository**: https://github.com/namNguyenThanh1511/SystematicReviewSupportSystem.BE
- **Branch**: feat/prisma-report

---

## Additional Notes

- All timestamps are in **ISO 8601 format (UTC)**
- All IDs are **GUIDs (UUID v4)**
- Process names should follow PRISMA 2020 terminology
- The API uses **centralized exception handling** via `GlobalExceptionMiddleware`
- Only **one process per project** can be `InProgress` at a time
