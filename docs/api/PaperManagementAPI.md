# Paper Management API Documentation

This document describes the API endpoints available in the PaperController for managing bibliographic records, paper assignments, and metadata enrichment.

## 1. Get Paper Details
`GET /api/papers/{paperId}`

Retrieves full metadata for a single paper, including core bibliographic data and AI-powered extraction suggestions.

### Request
**Path Params:** `paperId: Guid`

### Response (`ApiResponse<PaperDetailsResponse>`)
```typescript
interface PaperDetailsResponse {
  id: string;
  title: string;
  authors?: string;
  abstract?: string;
  doi?: string;
  publicationYear?: string;
  journal?: string;
  source?: string;
  extractionSuggestion?: {
    sourceMetadataId: string;
    updatedFields: string[]; // Fields where AI suggests changes
    // ... metadata fields ...
  };
  fullTextRetrievalStatus: number; // 0=Unknown, 1=Retrieved, 2=NotRetrieved
  fullTextRetrievalStatusText: string;
  fullTextAvailable: boolean;
  createdAt: string;
  modifiedAt: string;
}
```
