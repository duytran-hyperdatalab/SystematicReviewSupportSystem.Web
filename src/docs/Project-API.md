# Systematic Review Projects API

## Overview

The Systematic Review Projects API provides endpoints for managing systematic review projects following **PRISMA 2020 guidelines** and the **Kitchenham SLR lifecycle**.

## Base Information

- **Base URL**: `/api/projects`
- **Content Type**: `application/json`
- **Authentication**: JWT (modular, optional)
- **Framework**: ASP.NET Core (.NET 8)

## API Response Structure

All API responses follow the `ApiResponse<T>` wrapper pattern:

```json
{
  "success": true,
  "message": "Operation message",
  "data": { ... },
  "timestamp": "2026-02-23T10:30:00Z"
}
```

---

## Endpoints

### 1. Create Project

Creates a new systematic review project with initial status of `Draft`.

**HTTP Method**: `POST /api/projects`

**Request Body**:
```json
{
  "title": "AI in Healthcare: A Systematic Review",
  "domain": "Healthcare & Artificial Intelligence",
  "description": "Optional description of the review scope"
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "message": "Project created successfully.",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "AI in Healthcare: A Systematic Review",
    "domain": "Healthcare & Artificial Intelligence",
    "description": "Optional description of the review scope",
    "status": "Draft",
    "createdAt": "2026-02-23T10:30:00Z",
    "updatedAt": "2026-02-23T10:30:00Z"
  },
  "timestamp": "2026-02-23T10:30:00Z"
}
```

**cURL Example**:
```bash
curl -X POST "http://localhost:5000/api/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI in Healthcare: A Systematic Review",
    "domain": "Healthcare & Artificial Intelligence",
    "description": "Optional description"
  }'
```

---

### 2. Get Project by ID

Retrieves detailed information about a specific project, including all associated review processes.

**HTTP Method**: `GET /api/projects/{id}`

**Path Parameters**:
- `id` (UUID, required): Project identifier

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Project retrieved successfully.",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "AI in Healthcare: A Systematic Review",
    "domain": "Healthcare & Artificial Intelligence",
    "description": "Optional description",
    "status": "Active",
    "createdAt": "2026-02-23T10:30:00Z",
    "updatedAt": "2026-02-23T11:00:00Z",
    "reviewProcesses": [
      {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "name": "Initial Screening",
        "status": "InProgress",
        "createdAt": "2026-02-23T10:35:00Z"
      }
    ]
  },
  "timestamp": "2026-02-23T12:00:00Z"
}
```

**cURL Example**:
```bash
curl -X GET "http://localhost:5000/api/projects/3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Project with ID 3fa85f64-5717-4562-b3fc-2c963f66afa6 not found.",
  "data": null,
  "timestamp": "2026-02-23T12:00:00Z"
}
```

---

### 3. Get Projects (Paginated)

Retrieves a paginated list of projects with optional status filtering.

**HTTP Method**: `GET /api/projects`

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | - | Filter by status: `Draft`, `Active`, `Completed` |
| `pageNumber` | integer | No | 1 | Page number (starts from 1) |
| `pageSize` | integer | No | 10 | Items per page (max: 100) |

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Projects retrieved successfully.",
  "data": {
    "items": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "title": "AI in Healthcare",
        "domain": "Healthcare",
        "description": "Review scope",
        "status": "Active",
        "createdAt": "2026-02-23T10:30:00Z",
        "updatedAt": "2026-02-23T11:00:00Z"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 25,
    "totalPages": 3
  },
  "timestamp": "2026-02-23T12:00:00Z"
}
```

**cURL Examples**:
```bash
# Get all projects (first page)
curl -X GET "http://localhost:5000/api/projects"

# Filter by status
curl -X GET "http://localhost:5000/api/projects?status=Active"

# Custom pagination
curl -X GET "http://localhost:5000/api/projects?pageNumber=2&pageSize=20"

# Combined filters
curl -X GET "http://localhost:5000/api/projects?status=Draft&pageNumber=1&pageSize=50"
```

---

### 4. Update Project

Updates project details (title, domain, description). Does not change status.

**HTTP Method**: `PUT /api/projects/{id}`

**Path Parameters**:
- `id` (UUID, required): Project identifier

**Request Body**:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Updated Project Title",
  "domain": "Updated Domain",
  "description": "Updated description"
}
```

> ⚠️ **Important**: The `id` in the request body must match the `id` in the URL path.

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Project updated successfully.",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Updated Project Title",
    "domain": "Updated Domain",
    "description": "Updated description",
    "status": "Draft",
    "createdAt": "2026-02-23T10:30:00Z",
    "updatedAt": "2026-02-23T13:00:00Z"
  },
  "timestamp": "2026-02-23T13:00:00Z"
}
```

**cURL Example**:
```bash
curl -X PUT "http://localhost:5000/api/projects/3fa85f64-5717-4562-b3fc-2c963f66afa6" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Updated Project Title",
    "domain": "Updated Domain",
    "description": "Updated description"
  }'
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "ID in route does not match ID in request body.",
  "data": null,
  "timestamp": "2026-02-23T13:00:00Z"
}
```

---

### 5. Activate Project

Transitions a project from `Draft` to `Active` status.

**HTTP Method**: `POST /api/projects/{id}/activate`

**Path Parameters**:
- `id` (UUID, required): Project identifier

**Request Body**: None

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Project activated successfully.",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "AI in Healthcare",
    "domain": "Healthcare",
    "description": "Review scope",
    "status": "Active",
    "createdAt": "2026-02-23T10:30:00Z",
    "updatedAt": "2026-02-23T14:00:00Z"
  },
  "timestamp": "2026-02-23T14:00:00Z"
}
```

**cURL Example**:
```bash
curl -X POST "http://localhost:5000/api/projects/3fa85f64-5717-4562-b3fc-2c963f66afa6/activate"
```

**Allowed Status Transitions**:
- ✅ `Draft` → `Active`
- ❌ Other statuses will result in error

---

### 6. Complete Project

Transitions a project from `Active` to `Completed` status. All associated review processes must be completed first.

**HTTP Method**: `POST /api/projects/{id}/complete`

**Path Parameters**:
- `id` (UUID, required): Project identifier

**Request Body**: None

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Project completed successfully.",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "AI in Healthcare",
    "domain": "Healthcare",
    "description": "Review scope",
    "status": "Completed",
    "createdAt": "2026-02-23T10:30:00Z",
    "updatedAt": "2026-02-23T15:00:00Z"
  },
  "timestamp": "2026-02-23T15:00:00Z"
}
```

**cURL Example**:
```bash
curl -X POST "http://localhost:5000/api/projects/3fa85f64-5717-4562-b3fc-2c963f66afa6/complete"
```

**Prerequisites**:
- Project must be in `Active` status
- All review processes must be completed

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Cannot complete project. Some review processes are still in progress.",
  "data": null,
  "timestamp": "2026-02-23T15:00:00Z"
}
```

---



---

### 8. Delete Project

Permanently deletes a project and all associated data.

**HTTP Method**: `DELETE /api/projects/{id}`

**Path Parameters**:
- `id` (UUID, required): Project identifier

**Request Body**: None

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Project deleted successfully.",
  "data": null,
  "timestamp": "2026-02-23T17:00:00Z"
}
```

**cURL Example**:
```bash
curl -X DELETE "http://localhost:5000/api/projects/3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

> ⚠️ **Warning**: This action is irreversible.

---

## Project Status Lifecycle

### Status Values

| Status | Description | Next States |
|--------|-------------|-------------|
| `Draft` | Newly created project, not yet started | `Active`, Delete |
| `Active` | Project is currently in progress | `Completed`, `Archived` |
| `Completed` | All review processes are finished | Delete |

### State Transition Diagram

┌───────┐
│ START │
└───┬───┘
    │
    ▼
┌───────┐      ┌────────┐      ┌───────────┐
│ Draft │─────▶│ Active │─────▶│ Completed │
└───┬───┘      └────┬───┘      └─────┬─────┘
    │               │                 │
    ▼               ▼                 ▼
┌────────┐    ┌────────┐        ┌────────┐
│ DELETE │    │ DELETE │        │ DELETE │
└────────┘    └────────┘        └────────┘

### Transition Rules

1. **Draft → Active**: Activate a project to start the review process
2. **Active → Completed**: Mark as complete when all review processes are done
3. **Any Status → Delete**: Permanently remove the project

---

## Error Handling

The API uses **centralized exception handling** via `GlobalExceptionMiddleware`. Controllers do not contain try-catch blocks and let exceptions bubble up.

### Common Error Responses

#### 400 Bad Request
Validation errors or invalid operations.

```json
{
  "success": false,
  "message": "ID in route does not match ID in request body.",
  "data": null,
  "timestamp": "2026-02-23T12:00:00Z"
}
```

#### 404 Not Found
Resource not found.

```json
{
  "success": false,
  "message": "Project with ID 3fa85f64-5717-4562-b3fc-2c963f66afa6 not found.",
  "data": null,
  "timestamp": "2026-02-23T12:00:00Z"
}
```

#### 500 Internal Server Error
Unexpected server errors.

```json
{
  "success": false,
  "message": "An unexpected error occurred.",
  "data": null,
  "timestamp": "2026-02-23T12:00:00Z"
}
```

---

## Usage Examples

### Complete Workflow Example

```bash
# 1. Create a new project
PROJECT_ID=$(curl -X POST "http://localhost:5000/api/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Machine Learning in Education",
    "domain": "Education Technology",
    "description": "A systematic review of ML applications in education"
  }' | jq -r '.data.id')

echo "Created project: $PROJECT_ID"

# 2. Get the project details
curl -X GET "http://localhost:5000/api/projects/$PROJECT_ID"

# 3. Update project information
curl -X PUT "http://localhost:5000/api/projects/$PROJECT_ID" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$PROJECT_ID\",
    \"title\": \"Machine Learning in Education (Updated)\",
    \"domain\": \"Educational Technology\",
    \"description\": \"Updated description\"
  }"

# 4. Activate the project
curl -X POST "http://localhost:5000/api/projects/$PROJECT_ID/activate"

# 5. Get all active projects
curl -X GET "http://localhost:5000/api/projects?status=Active"

# 6. Complete the project (after all review processes are done)
curl -X POST "http://localhost:5000/api/projects/$PROJECT_ID/complete"



# 8. Delete the project (optional)
curl -X DELETE "http://localhost:5000/api/projects/$PROJECT_ID"
```

---

## Testing with Postman

### Environment Variables

Create a Postman environment with:

```json
{
  "baseUrl": "http://localhost:5000",
  "projectId": ""
}
```

### Collection Structure

1. **Projects**
   - Create Project (POST) → Save `data.id` to `projectId`
   - Get Project by ID (GET)
   - Get Projects (GET)
   - Update Project (PUT)
   - Activate Project (POST)
   - Complete Project (POST)
   - Delete Project (DELETE)

### Pre-request Script (for Update/Status endpoints)

```javascript
// Automatically use the saved projectId
pm.request.url.variables.add({
  key: "id",
  value: pm.environment.get("projectId")
});
```

---

## Best Practices

### 1. Pagination
- Use reasonable page sizes (10-50 items)
- Maximum page size is 100
- Always handle pagination metadata in responses

### 2. Status Transitions
- Validate status before attempting transitions
- Handle business rule violations gracefully
- Complete all review processes before completing a project

### 3. Idempotency
- PUT and DELETE operations are idempotent
- Safe to retry failed requests

### 4. Error Handling
- Always check `success` field in responses
- Display user-friendly error messages from `message` field
- Log full error responses for debugging

### 5. Performance
- Use status filters to reduce payload size
- Cache GET requests where appropriate
- Implement request cancellation for long-running operations

---

## Data Models

### CreateSystematicReviewProjectRequest
```json
{
  "title": "string (required)",
  "domain": "string (required)",
  "description": "string (optional)"
}
```

### UpdateSystematicReviewProjectRequest
```json
{
  "id": "uuid (required)",
  "title": "string (required)",
  "domain": "string (required)",
  "description": "string (optional)"
}
```

### SystematicReviewProjectResponse
```json
{
  "id": "uuid",
  "title": "string",
  "domain": "string",
  "description": "string",
  "status": "Draft | Active | Completed",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### SystematicReviewProjectDetailResponse
```json
{
  "id": "uuid",
  "title": "string",
  "domain": "string",
  "description": "string",
  "status": "Draft | Active | Completed",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "reviewProcesses": [
    {
      "id": "uuid",
      "name": "string",
      "status": "string",
      "createdAt": "datetime"
    }
  ]
}
```

### PaginatedResponse<T>
```json
{
  "items": ["T"],
  "pageNumber": "integer",
  "pageSize": "integer",
  "totalCount": "integer",
  "totalPages": "integer"
}
```

---

## Additional Notes

- All timestamps are in **ISO 8601 format (UTC)**
- All IDs are **GUIDs (UUID v4)**
- The API supports **cancellation tokens** for all operations
- **CORS** must be configured for cross-origin requests
- Consider implementing **rate limiting** for production use

---

## Related Documentation

- [PRISMA 2020 Guidelines](http://www.prisma-statement.org/)
- [Kitchenham SLR Methodology](https://www.elsevier.com/books/guidelines-for-performing-systematic-literature-reviews-in-software-engineering/kitchenham/978-0-12-804206-9)
- [ASP.NET Core Web API Documentation](https://learn.microsoft.com/en-us/aspnet/core/web-api/)

---

## Support

For issues, questions, or contributions:
- **Repository**: https://github.com/namNguyenThanh1511/SystematicReviewSupportSystem.BE
- **Branch**: feat/prisma-report

---

## License

[Add your license information here]
