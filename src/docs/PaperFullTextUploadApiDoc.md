# Paper Full-Text Upload API Documentation

## POST `/api/paper-fulltext/upload`

**Purpose**: Upload a PDF file to Supabase Storage and update the Paper's full-text link (`PdfUrl`) and filename (`PdfFileName`) in a single request. Combines two previously separate API calls into one transaction-like workflow.

---

### 1. Basic Info

| Property | Value |
|----------|-------|
| Method | `POST` |
| Route | `/api/paper-fulltext/upload` |
| Content-Type | `multipart/form-data` |
| Auth | None required (optional: reviewer assignment check) |

---

### 2. Request Details

#### Form Data Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | `File` | ✅ | The PDF file to upload (max 20 MB) |
| `projectId` | `string (UUID)` | ✅ | Project ID for storage path organization |
| `processId` | `string (UUID)` | ✅ | Study Selection Process ID |
| `paperId` | `string (UUID)` | ✅ | Paper ID to update with the uploaded PDF URL |

#### Validation Rules

- `file` must not be null or empty
- File extension must be `.pdf`
- File size must not exceed **20 MB** (20,971,520 bytes)

#### TypeScript Request

```typescript
// Use FormData to construct the request
interface UploadPaperFullTextParams {
  file: File;        // PDF file (max 20MB)
  projectId: string; // UUID
  processId: string; // UUID
  paperId: string;   // UUID
}
```

---

### 3. Response Details

#### Success Response — `200 OK`

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: ApiError[] | null;
}

interface PaperWithDecisionsResponse {
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
  pdfUrl: string | null;         // ← Updated with the uploaded file's public URL
  pdfFileName: string | null;    // ← Original uploaded filename (e.g. "study_2024.pdf")
  conferenceName: string | null;
  conferenceLocation: string | null;
  journalIssn: string | null;
  status: PaperSelectionStatus;
  statusText: string;
  finalDecision: ScreeningDecisionType | null;
  finalDecisionText: string | null;
  decisions: ScreeningDecisionResponse[];
  resolution: ScreeningResolutionResponse | null;
}
```

#### Error Responses

| Status | Condition |
|--------|-----------|
| `400` | File is null, empty, not `.pdf`, or exceeds 20 MB |
| `404` | Paper or process not found (thrown by service layer) |
| `500` | Supabase upload failure or unexpected server error |

---

### 4. Business Logic Summary

1. **Validation** — Validates the uploaded file (format, size) before any processing
2. **Upload** — Uploads PDF to Supabase Storage at `papers/{projectId}/{processId}/{guid}_{filename}.pdf`
3. **Database Update** — Updates both `Paper.PdfUrl` (public Supabase URL) and `Paper.PdfFileName` (original filename)
4. **Response** — Returns the full paper object including all screening decisions

> **Important**: If the Supabase upload succeeds but the database update fails, the file will already exist in storage. There is no automatic rollback of uploaded files.

---

### 5. Frontend Integration Notes

#### When to Call
- When user selects a PDF file during full-text screening
- Replaces the previous two-step flow (upload → update) with a single call
- Use `pdfFileName` from the response to display the original filename in the UI

#### Example API Call

```typescript
async function uploadPaperFullText(params: UploadPaperFullTextParams): Promise<ApiResponse<PaperWithDecisionsResponse>> {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('projectId', params.projectId);
  formData.append('processId', params.processId);
  formData.append('paperId', params.paperId);

  const response = await fetch('/api/paper-fulltext/upload', {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type header — browser sets it with boundary automatically
  });

  return response.json();
}
```

#### Common Pitfalls
- **Do NOT** set `Content-Type: multipart/form-data` manually — the browser must set the boundary automatically
- Validate file size and type on the frontend **before** uploading to avoid unnecessary network requests
- Show a loading indicator — uploads may take several seconds for large PDFs

#### Loading / Error Handling
- Display a progress indicator during upload
- On `400` errors, show the validation message from `response.message`
- On `500` errors, prompt the user to retry
