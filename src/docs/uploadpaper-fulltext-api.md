# Paper Full-Text Management API Documentation

This document provides detailed information for frontend developers to integrate paper full-text (PDF) upload and linking features.

## Overview
The system supports two ways to link full-text to a paper:
1.  **Direct Upload**: Uploading a PDF file which is stored in Supabase and automatically linked.
2.  **Manual Linking**: Providing an external URL (PDF or Web) to link the paper.

Additionally, when a PDF is uploaded, the system can use **GROBID** (AI) to extract metadata (Title, Authors, Abstract, etc.) from the PDF header to improve paper quality.

---

## 1. Upload Paper PDF (Single Step)
Uploads a physical PDF file, stores it in Supabase, and links it to the specified paper.

- **Method**: `POST`
- **Route**: `/api/paper-fulltext/upload`
- **Content-Type**: `multipart/form-data`
- **Description**: This is the primary endpoint for "Upload PDF" buttons in the UI.

### Request Body (FormData)
| Key | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `File` | `File` (Binary) | Yes | The PDF file (Max 20MB). |
| `ProjectId` | `string` (UUID) | Yes | The ID of the project for storage organization. |
| `PaperId` | `string` (UUID) | Yes | The ID of the paper to update. |
| `ExtractWithGrobid` | `boolean` | No | If `true`, triggers background AI metadata extraction. Default: `false`. |

### Validation Rules
- **File Type**: Only `.pdf` files are accepted.
- **File Size**: Maximum 20MB.
- **Constraints**: File cannot be empty.

---

## 2. Update Full-Text Links (Manual)
Updates a paper's full-text links (PDF URL or Web URL) manually without uploading a file.

- **Method**: `POST`
- **Route**: `/api/papers/{paperId}/full-text`
- **Content-Type**: `application/json`
- **Description**: Use this when a user provides a link to a PDF or a web page instead of uploading a file.

### Request Body (JSON)
```typescript
interface UpdatePaperFullTextRequest {
  pdfUrl?: string;       // External direct link to a PDF
  pdfFileName?: string;  // Name of the PDF file for display
  url?: string;          // General web link (e.g., publisher page)
  extractWithGrobid?: boolean; // Usually false for manual links
}
```

---

## 3. Retry Metadata Extraction
Triggers or retries the GROBID AI metadata extraction for a paper that already has a PDF linked.

- **Method**: `POST`
- **Route**: `/api/paper-fulltext/{paperId}/extract-metadata`
- **Content-Type**: `application/json`

### Request Body (JSON)
```typescript
interface RetryExtractionRequest {
  provider: "GROBID"; // Currently only "GROBID" is supported
}
```

---

## Response Contracts

### Success Response (`ApiResponse<PaperDetailsResponse>`)
All successful calls return the updated paper object.

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaperDetailsResponse {
  id: string;
  title: string;
  authors?: string;
  abstract?: string;
  doi?: string;
  pdfUrl?: string;       // The final storage/link URL
  pdfFileName?: string;  // The filename
  url?: string;          // Web source link
  fullTextRetrievalStatus: FullTextRetrievalStatus;
  fullTextRetrievalStatusText: string; // e.g., "Retrieved", "NotRetrieved"
  // ... other metadata fields
}

enum FullTextRetrievalStatus {
  NotRetrieved = 0,
  Retrieved = 1,
  Failed = 2
}
```

### Error Responses
The API uses global exception handling. Common error codes:
- `400 Bad Request`: Validation failed (e.g., file too large, not a PDF).
- `404 Not Found`: Paper or Project not found.
- `500 Internal Server Error`: Storage or Extraction service failure.

---

## Business Logic & Behavior

### 1. GROBID Extraction (AI)
- When `ExtractWithGrobid` is `true`, the system starts a background task.
- The PDF header is parsed to find Title, Authors, Abstract, DOI, etc.
- **DOI Validation**: If the PDF's DOI matches the paper's DOI, the extracted metadata is saved as a "Suggestion".
- **DOI Mismatch**: If the uploaded PDF has a different DOI than the paper, the system considers the PDF "Invalid" for this paper and sends a notification.

### 2. Full-Text Status
- Once a PDF is successfully linked/uploaded, `fullTextRetrievalStatus` changes to `Retrieved` (1).
- This enables "View PDF" and "Full-Text Screening" features in the UI.

---

## Frontend Integration Tips

### Calling the Upload API (Axios Example)
```typescript
const uploadPdf = async (paperId: string, projectId: string, file: File) => {
  const formData = new FormData();
  formData.append('File', file);
  formData.append('PaperId', paperId);
  formData.append('ProjectId', projectId);
  formData.append('ExtractWithGrobid', 'true');

  try {
    const response = await axios.post('/api/paper-fulltext/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error("Upload failed", error);
    throw error;
  }
};
```

### When to call which API?
- **User drags/drops a file**: Call `/api/paper-fulltext/upload`.
- **User pastes a PDF link**: Call `/api/papers/{paperId}/full-text` with `pdfUrl`.
- **User pastes a website link**: Call `/api/papers/{paperId}/full-text` with `url`.
- **Extraction failed or was skipped**: Call `/api/paper-fulltext/{paperId}/extract-metadata`.

---

## Ready-to-Use TypeScript Types

```typescript
/**
 * Request for uploading a PDF file via multipart/form-data
 */
export interface UploadPaperFullTextRequest {
  file: File;
  projectId: string;
  paperId: string;
  extractWithGrobid?: boolean;
}

/**
 * Request for updating links manually via JSON
 */
export interface UpdatePaperFullTextRequest {
  pdfUrl?: string;
  pdfFileName?: string;
  url?: string;
  extractWithGrobid?: boolean;
}

/**
 * Retrieval status of full-text
 */
export enum FullTextRetrievalStatus {
  NotRetrieved = 0,
  Retrieved = 1,
  Failed = 2
}
```
