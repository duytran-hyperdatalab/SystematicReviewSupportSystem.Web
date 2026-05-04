# Study Selection GROBID Integration Gap Report

> Status: Resolved by backend updates.
>
> Resolution details: see [src/docs/resolution/grobid_itegrate_gap_report_resolution.md](src/docs/resolution/grobid_itegrate_gap_report_resolution.md)
>
> Note: This file is kept as historical context for the original gap analysis.

## API ↔ UI Mapping

### Endpoint used

- `POST /api/paper-fulltext/upload`

### Current frontend usage

- Upload PDF file
- Optionally enable GROBID extraction
- Show different loading and success messaging
- Show a session-local preview of fields that changed after extraction by diffing paper data before/after upload

### UI features that are fully supported today

- Optional AI extraction toggle
- Dynamic upload button text
- Different loading copy for upload-only vs upload+extract
- Incomplete metadata hint before upload
- Success toast variations
- Session-local extraction result preview based on detected field changes

## API Contract Issues

### 1. No explicit extraction status in response

- Endpoint: `POST /api/paper-fulltext/upload`
- Severity: `BLOCKER`
- What UI needs: A reliable way to know whether PDF upload succeeded, extraction succeeded, extraction was skipped, or extraction failed.
- What API currently provides: Only the updated paper payload.
- Why this is a problem: The UI cannot safely implement the required warning state `"PDF uploaded successfully, but metadata extraction failed."` because there is no dedicated extraction outcome.
- Exact backend change recommendation:
  Add response fields such as:
  ```ts
  extraction: {
    requested: boolean;
    provider: "GROBID" | null;
    status: "not_requested" | "succeeded" | "failed" | "partial";
    message?: string | null;
    retryToken?: string | null;
  }
  ```

### 2. No field-level metadata source attribution

- Endpoint: `GET /study-selection/{processId}/papers` and `POST /api/paper-fulltext/upload`
- Severity: `BLOCKER`
- What UI needs: Per-field sources for transparency, e.g. title from RIS, authors from GROBID.
- What API currently provides: A single paper object with merged values only.
- Why this is a problem: The UI cannot truthfully render persistent `RIS` / `GROBID` source badges per field without inventing provenance.
- Exact backend change recommendation:
  Add a metadata provenance object:
  ```ts
  metadataSources: {
    title?: "RIS" | "GROBID" | "MANUAL";
    authors?: "RIS" | "GROBID" | "MANUAL";
    abstract?: "RIS" | "GROBID" | "MANUAL";
    doi?: "RIS" | "GROBID" | "MANUAL";
    journal?: "RIS" | "GROBID" | "MANUAL";
  }
  ```

### 3. No extraction result payload

- Endpoint: `POST /api/paper-fulltext/upload`
- Severity: `WARNING`
- What UI needs: The actual extraction output to show `AI Extracted Metadata` clearly and accurately.
- What API currently provides: Only final merged paper fields.
- Why this is a problem: The frontend can only infer changes by comparing before/after values in the current session. It cannot show extracted values that were discarded, normalized, or unchanged.
- Exact backend change recommendation:
  Add a payload such as:
  ```ts
  extractionResult?: {
    title?: string | null;
    authors?: string | null;
    abstract?: string | null;
    doi?: string | null;
    journal?: string | null;
    updatedFields: string[];
  }
  ```

### 4. No retry extraction endpoint

- Endpoint: missing
- Severity: `WARNING`
- What UI needs: `Retry Extraction` after upload succeeds but extraction fails.
- What API currently provides: No separate extraction retry operation.
- Why this is a problem: The required recovery UX cannot be implemented without re-uploading the file or inventing client behavior.
- Exact backend change recommendation:
  Add an endpoint such as:
  ```
  POST /api/paper-fulltext/{paperId}/extract-metadata
  ```
  Request:
  ```ts
  {
    provider: "GROBID";
  }
  ```

### 5. No persisted extraction audit metadata

- Endpoint: paper detail/list responses
- Severity: `NICE_TO_HAVE`
- What UI needs: Transparency over when metadata was enhanced and by which method.
- What API currently provides: No extraction timestamp or audit metadata.
- Why this is a problem: The UI can only show local-session enhancement info, not persistent workflow history.
- Exact backend change recommendation:
  Add:
  ```ts
  metadataEnhancement?: {
    provider: "GROBID";
    extractedAt: string;
    updatedFields: string[];
  }
  ```

## Frontend Risk Notes

- The current implementation uses safe session-local diffing to preview fields changed after GROBID extraction.
- Persistent field provenance is intentionally not fabricated because the backend does not provide it.
- Extraction failure after successful upload cannot be represented correctly until backend adds explicit extraction status.
