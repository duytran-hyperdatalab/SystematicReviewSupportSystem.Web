# API Documentation: Get Assigned Papers

This guide is designed to help frontend developers integrate with the `GetAssignedPapers` endpoint without needing to deep-dive into backend source code.

## 1. Basic Info
- **Method**: `GET`
- **Route**: `/api/study-selection/{id}/assigned-papers`
- **Purpose**: Retrieves papers assigned ONLY to the currently logged-in reviewer for a specific study selection process.

## 2. Request Details

### Headers
| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | `string` | Yes | `Bearer <JWT_TOKEN>` |
| `Accept` | `string` | Yes | `application/json` |

### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `Guid` | Yes | The ID of the Study Selection (Screening) Process. |

### Query Parameters (Optional)
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `search` | `string` | `null` | Keyword search for titles, DOI, or authors. |
| `status` | `enum` | `null` | Filter by selection status (`0: Pending`, `1: Included`, `2: Excluded`, `3: Conflict`, `4: Resolved`). |
| `sortBy` | `enum` | `0` | Sort order (`0: TitleAsc`, `1: TitleDesc`, `2: YearNewest`, `3: YearOldest`, `4: RelevanceDesc`). |
| `pageNumber` | `number` | `1` | Pagination: target page number. |
| `pageSize` | `number` | `20` | Pagination: items per page. |
| `hasFullText` | `boolean` | `null` | Filter papers by whether they have a linked PDF or URL. |
| `hasConflict` | `boolean` | `null` | Filter papers with conflicting reviewer decisions. |
| `phase` | `enum` | `0` | Screening phase filter (`0: TitleAbstract`, `1: FullText`). |

---

## 3. Response Details

### Success (200 OK)
Returns a paginated response wrapped in a standard API envelope.

**TypeScript Response Interface:**
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface PaperWithDecisionsResponse {
  paperId: string;
  title: string;
  doi?: string;
  authors?: string;
  publicationYear?: string;
  pdfUrl?: string; // Null if no full-text available
  status: number; // enum (0-4)
  statusText: string; // e.g., "Conflict"
  decisions: ScreeningDecisionResponse[];
  resolution?: ScreeningResolutionResponse; // Only if resolved or in conflict
}

interface ScreeningDecisionResponse {
  reviewerName: string;
  decisionText: string; // "Include" or "Exclude"
  phaseText: string; // "TitleAbstract" or "FullText"
  reason?: string;
  decidedAt: string;
}
```

### Error Scenarios
- **401 Unauthorized**: No token or invalid token. 
- **404 Not Found**: Study Selection Process ID not found in database. 
- **500 Internal Error**: Unexpected server-side failure.

---

## 4. Business Logic Summary
1.  **Identity Awareness**: The backend uses the `ICurrentUserService` to extract your identity from the JWT. There is no need to send your `reviewerId` or `projectMemberId`.
2.  **Assignment Filter**: This API applies a strict filter: only papers assigned to YOU in the `PaperAssignment` table for the specified `processId` are returned.
3.  **Phase Differentiation**: Study selection has two stages (Title/Abstract and Full-Text). Use the `phase` query parameter to switch views (default is `TitleAbstract`).
4.  **Pagination**: Results are sorted (default alphabetically) and then paginated to ensure fast response times for large study sets.

---

## 5. Frontend Integration Tips
- **Loading UI**: Use a loader while fetching.
- **Empty State**: Show a friendly message if `totalCount === 0`.
- **Search Debounce**: When the user types in the search bar, debounce the API call to avoid overloading the server.
- **Phase Toggle**: Link your Phase switcher (e.g., Tabs) to the `phase` query parameter.

---

## 6. Ready-to-use TypeScript Snippets

```typescript
// --- Models ---
export enum PaperSelectionStatus {
  Pending = 0,
  Included = 1,
  Excluded = 2,
  Conflict = 3,
  Resolved = 4
}

export enum PaperPhase {
  TitleAbstract = 0,
  FullText = 1
}

// --- API Implementation Example ---
import axios from 'axios';

const api = axios.create({
  baseURL: 'YOUR_API_BASE_URL',
});

// Interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getMyAssignedPapers = async (params: {
  processId: string;
  page?: number;
  search?: string;
  phase?: PaperPhase;
}) => {
  const response = await api.get(`/api/study-selection/${params.processId}/assigned-papers`, {
    params: {
      pageNumber: params.page || 1,
      search: params.search,
      phase: params.phase
    }
  });
  return response.data;
};
```
