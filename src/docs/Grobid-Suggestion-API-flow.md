# API Documentation: Metadata Suggestions Flow

This document outlines the APIs involved in the new Metadata Suggestions flow, covering PDF uploading, GROBID metadata extraction, and selectively applying extracted metadata to the canonical paper record.

---

## 1. Upload Paper Full-Text & Extract Metadata

### 1. Basic Info
*   **Method**: `POST`
*   **Full route path**: `/api/paper-fulltext/upload`
*   **Short description**: Uploads a PDF file to Supabase Storage, updates the Paper's `PdfUrl`, and optionally performs GROBID metadata extraction. Instead of auto-merging, it returns metadata suggestions for the user to review.

### 2. Request Details
*   **Headers**: 
    *   `Content-Type`: `multipart/form-data`
*   **Query Params**: None
*   **Path Params**: None
*   **Request body schema** (Form Data):
    *   `File` (File, required): The PDF file to upload (max size 20 MB).
    *   `ProjectId` (string/UUID, required): The project ID for storage path organization.
    *   `ProcessId` (string/UUID, required): The Study Selection Process ID.
    *   `PaperId` (string/UUID, required): The ID of the Paper to update.
    *   `ExtractWithGrobid` (boolean, optional, default `false`): If `true`, triggers GROBID extraction during upload.

### 3. Response Details
*   **Success response schema**:
    ```typescript
    interface ApiResponse<T> {
        data: T;
        message: string;
        // other base fields...
    }

    interface PaperWithDecisionsResponse {
        paperId: string;
        title: string;
        // ... standard paper fields ...
        pdfUrl: string;
        pdfFileName: string;
        extractionSuggestion?: ExtractionSuggestionResponse; // <== NEW: Populated if ExtractWithGrobid is true
    }

    interface ExtractionSuggestionResponse {
        sourceMetadataId: string; // The ID you need to pass when applying metadata
        title?: string;
        authors?: string;
        abstract?: string;
        doi?: string;
        journal?: string;
        volume?: string;
        issue?: string;
        pages?: string;
        keywords?: string;
        publisher?: string;
        year?: number;
    }
    ```
*   **Error response schema**: Standard API error response (e.g., File too large, Invalid extension, Not found).
*   **HTTP status codes**:
    *   `200 OK`: Upload and optional extraction successful.
    *   `400 Bad Request`: Validation errors (e.g., missing file, invalid PDF).
    *   `404 Not Found`: Paper or Process not found.

### 4. Business Logic Summary
*   **What it does**: This API takes a PDF file, uploads it to Supabase, and attaches the resulting URL to the canonical Paper. If `ExtractWithGrobid` is `true`, it sends the PDF to the GROBID service to extract metadata (Title, Authors, Abstract, etc.).
*   **Important conditions**: It **does not** automatically overwrite the canonical Paper's metadata. Instead, it creates a `PaperSourceMetadata` record in the database tracking the GROBID extraction, and returns the extracted fields inside `extractionSuggestion`. The user must review these and decide which ones to keep.
*   **Side effects**: Replaces the paper's `PdfUrl`. Creates a new `PaperPdf` and `PaperSourceMetadata` record.

### 5. Frontend Integration Notes
*   **When to call**: Call this when a user uploads a PDF for a specific paper.
*   **Loading/error handling**: Uploads + GROBID extraction can be slow (e.g., 5-15 seconds depending on file size and GROBID load). Show a clear loading state.
*   **Next Steps**: If `extractionSuggestion` is present in the response, prompt the user with a UI (like a modal or comparison view) showing the extracted fields vs current fields. Allow them to check/tick which fields they want to apply.

---

## 2. Apply Metadata Suggestions

### 1. Basic Info
*   **Method**: `POST`
*   **Full route path**: `/api/papers/{paperId}/apply-metadata`
*   **Short description**: Selectively applies specific metadata fields from an extraction suggestion (source metadata) to the canonical paper record.

### 2. Request Details
*   **Headers**:
    *   `Content-Type`: `application/json`
*   **Path Params**:
    *   `paperId` (string/UUID, required): The ID of the Canonical Paper to update.
*   **Query Params**: None
*   **Request body schema**:
    ```typescript
    interface ApplyMetadataRequest {
        sourceMetadataId: string; // From the ExtractionSuggestionResponse
        fields: string[]; // List of fields to apply (e.g. ["Title", "Authors", "Abstract"])
    }
    ```
    *Fields must match the underlying application properties (case-insensitive usually, but prefer exact PascalCase/camelCase matching like "Title", "Authors", "Abstract", "DOI", "Journal", "Volume", "Issue", "Pages", "Keywords", "Publisher", "Year").*

### 3. Response Details
*   **Success response schema**:
    ```typescript
    interface ApiResponse<PaperResponse> {
        data: PaperResponse;
        message: string;
    }

    interface PaperResponse {
        id: string;
        title: string;
        authors: string;
        abstract: string;
        // ... updated fields will be reflected here
        modifiedAt: string;
    }
    ```
*   **HTTP status codes**:
    *   `200 OK`: Metadata successfully synced.
    *   `404 Not Found`: Paper or `SourceMetadataId` not found.

### 4. Business Logic Summary
*   **What it does**: Retrieves the `PaperSourceMetadata` row specified by `sourceMetadataId`. Then, iterates through the `fields` array. For each valid field string provided, it copies the value from the extraction suggestion directly into the canonical Paper record.
*   **Important conditions**: 
    *   Only exactly selected fields are modified.
    *   Unselected fields simply remain as whatever they were previously on the canonical Paper.
    *   The `Paper.ModifiedAt` timestamp is updated.
*   **Side effects**: Overwrites requested Paper fields.

### 5. Frontend Integration Notes
*   **When to call**: Call this immediately after the user confirms which fields they want to accept from the `extractionSuggestion` modal.
*   **Common pitfalls**: Ensure that `sourceMetadataId` is precisely passed as it was received from the upload endpoint. Ensure field strings mapped in the array correlate properly to what the backend expects (e.g., "Title", "Abstract", "Keywords").

---

## 3. Generate Ready-to-Use FE Types

```typescript
// Requests
export interface UploadPaperFullTextRequest {
    file: File;
    projectId: string;
    processId: string;
    paperId: string;
    extractWithGrobid?: boolean;
}

export interface ApplyMetadataRequest {
    sourceMetadataId: string;
    fields: string[]; // e.g., ["Title", "Authors", "DOI"]
}

// Responses
export interface ExtractionSuggestionResponse {
    sourceMetadataId: string;
    title?: string;
    authors?: string;
    abstract?: string;
    doi?: string;
    journal?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    keywords?: string;
    publisher?: string;
    year?: number;
}

export interface PaperWithDecisionsResponse {
    paperId: string;
    title: string;
    url?: string;
    pdfUrl?: string;
    pdfFileName?: string;
    // ...other fields omitted for brevity
    extractionSuggestion?: ExtractionSuggestionResponse;
}

export interface PaperResponse {
    id: string;
    title: string;
    authors: string;
    abstract: string;
    doi: string;
    journal: string;
    volume: string;
    issue: string;
    pages: string;
    keywords: string;
    publisher: string;
    language: string;
    modifiedAt: string;
}
```

### Example Frontend API Call (Axios)

```typescript
import axios from 'axios';

// 1. Upload API
export const uploadAndExtractPdf = async (req: UploadPaperFullTextRequest): Promise<PaperWithDecisionsResponse> => {
    const formData = new FormData();
    formData.append('File', req.file);
    formData.append('ProjectId', req.projectId);
    formData.append('ProcessId', req.processId);
    formData.append('PaperId', req.paperId);
    if (req.extractWithGrobid) {
        formData.append('ExtractWithGrobid', 'true');
    }

    const response = await axios.post('/api/paper-fulltext/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
};

// 2. Apply Metadata API
export const applyMetadata = async (paperId: string, req: ApplyMetadataRequest): Promise<PaperResponse> => {
    const response = await axios.post(`/api/papers/${paperId}/apply-metadata`, req);
    return response.data.data;
};
```