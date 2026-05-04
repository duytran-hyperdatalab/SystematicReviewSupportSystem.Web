# Paper Import API Documentation

**Version:** 1.0  
**Base URL:** `/api/papers`  
**Last Updated:** 2024

---

## Overview

The Paper Import API provides endpoints for importing bibliographic records into the Systematic Literature Review system. Currently, the API supports:

1. **RIS File Import** - Import papers from standardized RIS bibliographic format files

This endpoint is part of the PRISMA 2020 **Identification Phase**, where researchers collect potential studies from various databases (Scopus, IEEE Xplore, PubMed, Web of Science, etc.).

---

## Table of Contents

1. [Import RIS File](#1-import-ris-file)
2. [Common Response Structure](#common-response-structure)
3. [Error Handling](#error-handling)
4. [TypeScript Interfaces](#typescript-interfaces)
5. [Frontend Integration Examples](#frontend-integration-examples)
6. [Frontend Integration Notes](#frontend-integration-notes)

---

## 1. Import RIS File

### Basic Info

- **Method:** `POST`
- **Route:** `/api/papers/import/ris`
- **Content-Type:** `multipart/form-data`
- **Description:** Import bibliographic records from a RIS file exported from academic databases (Scopus, IEEE, PubMed, etc.)

### Request Details

#### Headers
```
Content-Type: multipart/form-data
```

#### Form Data Parameters

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `file` | File | ✅ Yes | RIS file (.ris extension) | Max 10MB, must be .ris format |
| `source` | string | ❌ No | Source database name | Example: "Scopus", "IEEE Xplore", "PubMed" |
| `importedBy` | string | ❌ No | Username/ID of person importing | Free text |
| `searchExecutionId` | Guid (UUID) | ❌ No | ID of SearchExecution to link papers to | Must be valid GUID if provided |
| `identificationProcessId` | Guid (UUID) | ✅ Yes | ID of IdentificationProcess | Must be a valid existing IdentificationProcess |
| `cancellationToken` | - | - | Automatic cancellation token | Handled by ASP.NET Core |

#### Validation Rules

✅ **File Validation:**
- File must be present and non-empty
- File extension must be `.ris` (case-insensitive)
- File size must not exceed 10MB (10,485,760 bytes)

✅ **Business Rules:**
- `identificationProcessId` must exist in the system
- Duplicate detection is performed automatically based on DOI and title
- Papers are linked to `ImportBatch` for tracking

### Response Details

#### Success Response (200 OK)

```json
{
  "isSuccess": true,
  "message": "Successfully imported 45 records.",
  "data": {
    "importBatchId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "totalRecords": 50,
    "importedRecords": 45,
    "duplicateRecords": 3,
    "skippedRecords": 2,
    "updatedRecords": 0,
    "errors": [],
    "importedPaperIds": [
      "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "8f5c7e2a-4d3b-4a1c-9f6e-5e8d4b2a1c3f"
    ]
  },
  "errors": null
}
```

#### Success with Warnings (200 OK)

When no new records imported but file was valid:

```json
{
  "isSuccess": true,
  "message": "No new records imported. All records were duplicates or skipped.",
  "data": {
    "importBatchId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "totalRecords": 10,
    "importedRecords": 0,
    "duplicateRecords": 8,
    "skippedRecords": 2,
    "updatedRecords": 0,
    "errors": ["Invalid author format on record 3", "Missing DOI on record 7"],
    "importedPaperIds": []
  },
  "errors": null
}
```

#### Error Responses

**400 Bad Request - No File Uploaded**
```json
{
  "isSuccess": false,
  "message": "No file uploaded.",
  "data": null,
  "errors": null
}
```

**400 Bad Request - Invalid File Format**
```json
{
  "isSuccess": false,
  "message": "Invalid file format. Only .ris files are accepted.",
  "data": null,
  "errors": null
}
```

**400 Bad Request - File Too Large**
```json
{
  "isSuccess": false,
  "message": "File size exceeds the maximum allowed size of 10MB.",
  "data": null,
  "errors": null
}
```

**400 Bad Request - Import Failed**
```json
{
  "isSuccess": false,
  "message": "Failed to import RIS file.",
  "data": {
    "importBatchId": null,
    "totalRecords": 0,
    "importedRecords": 0,
    "duplicateRecords": 0,
    "skippedRecords": 0,
    "updatedRecords": 0,
    "errors": [
      "Invalid RIS format at line 15",
      "Unable to parse record starting at line 42"
    ],
    "importedPaperIds": []
  },
  "errors": null
}
```

**500 Internal Server Error**
```json
{
  "isSuccess": false,
  "message": "An unexpected error occurred while processing the RIS file.",
  "data": null,
  "errors": [
    {
      "code": "INTERNAL_ERROR",
      "message": "Database connection failed"
    }
  ]
}
```

### Business Logic Summary

#### What This API Does:

1. **File Validation:**
   - Checks if file exists and is not empty
   - Validates file extension is `.ris`
   - Ensures file size is under 10MB

2. **RIS Parsing:**
   - Parses RIS format records from the file
   - Extracts bibliographic metadata (title, authors, DOI, abstract, year, journal, etc.)
   - Handles various RIS tag formats from different databases

3. **Duplicate Detection:**
   - Checks existing papers by DOI (primary identifier)
   - Falls back to title-based matching if DOI is missing
   - Counts duplicates but doesn't import them again

4. **Import Batch Creation:**
   - Creates an `ImportBatch` entity to group all papers from this upload
   - Links batch to the specified `IdentificationProcess`
   - Optionally links to a specific `SearchExecution` if provided

5. **Paper Creation:**
   - Creates `Paper` entities for each valid, non-duplicate record
   - Associates papers with the import batch
   - Returns list of newly created paper IDs

#### Important Conditions:

⚠️ **Frontend Must Handle:**
- Empty file scenarios
- File format validation before upload
- Large file warnings (approaching 10MB)
- Partial success (some records imported, some failed)
- All-duplicate scenarios (nothing new to import)

#### Side Effects:

- Creates `ImportBatch` record in database
- Creates multiple `Paper` records
- Updates `IdentificationProcess` paper counts
- May update existing papers if update logic is implemented

#### Performance Considerations:

- **Processing Time:** Depends on file size and record count
  - Small files (<100 records): < 2 seconds
  - Medium files (100-1000 records): 2-10 seconds
  - Large files (1000-5000 records): 10-30 seconds
- **Timeout:** Consider 60-120 second timeout for large files
- **Memory:** Files are streamed, not loaded entirely into memory

---

## Common Response Structure

All endpoints follow the standard `ApiResponse<T>` pattern:

```typescript
interface ApiResponse<T> {
  isSuccess: boolean;        // true if operation succeeded
  message: string;           // Human-readable message
  data: T | null;           // Response payload (null on error)
  errors: ApiError[] | null; // Array of errors (null on success)
}

interface ApiError {
  code: string;    // Error code for programmatic handling
  message: string; // Human-readable error description
}
```

### HTTP Status Codes

| Status Code | Meaning | When It Occurs |
|-------------|---------|----------------|
| 200 OK | Success | Import completed successfully |
| 400 Bad Request | Client error | Invalid file, validation failed, business rule violated |
| 404 Not Found | Resource not found | Referenced IDs don't exist |
| 500 Internal Server Error | Server error | Unexpected server-side error |

---

## Error Handling

### Frontend Error Handling Strategy

```typescript
async function importRisFile(formData: FormData): Promise<RisImportResult> {
  try {
    const response = await fetch('/api/papers/import/ris', {
      method: 'POST',
      body: formData,
    });

    const result: ApiResponse<RisImportResultDto> = await response.json();

    // Check if API returned success
    if (!result.isSuccess || !result.data) {
      throw new Error(result.message);
    }

    // Check if any records were imported
    if (result.data.importedRecords === 0) {
      console.warn('No new records imported:', result.message);
      // Show warning to user
    }

    // Check for partial errors
    if (result.data.errors.length > 0) {
      console.warn('Import completed with errors:', result.data.errors);
      // Show warning toast with error details
    }

    return result.data;
  } catch (error) {
    // Handle network errors, parsing errors, etc.
    console.error('Import failed:', error);
    throw error;
  }
}
```

### Common Error Scenarios

| Scenario | Status | Error Message | Frontend Action |
|----------|--------|---------------|-----------------|
| No file selected | 400 | "No file uploaded." | Show validation error before submit |
| Wrong file type | 400 | "Invalid file format..." | Validate file extension before upload |
| File too large | 400 | "File size exceeds..." | Check file size before upload, show warning at 8MB |
| All duplicates | 200 | "No new records imported..." | Show info message, not error |
| Parsing errors | 400 | "Failed to import RIS file." | Show errors from `data.errors` array |
| Invalid ID reference | 404/400 | Various | Verify IDs before sending request |
| Server error | 500 | "An unexpected error occurred..." | Show generic error, log to monitoring |

---

## TypeScript Interfaces

### Request Types

```typescript
// ============================================
// RIS File Import Request
// ============================================
interface RisFileImportRequest {
  file: File;                          // .ris file, max 10MB
  source?: string;                     // e.g., "Scopus", "IEEE Xplore"
  importedBy?: string;                 // Username or email
  searchExecutionId?: string;          // UUID format
  identificationProcessId: string;     // UUID format (required)
}
```

### Response Types

```typescript
// ============================================
// Common Response Wrapper
// ============================================
interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T | null;
  errors: ApiError[] | null;
}

interface ApiError {
  code: string;
  message: string;
}

// ============================================
// RIS Import Response
// ============================================
interface RisImportResultDto {
  importBatchId: string | null;        // UUID of created ImportBatch
  totalRecords: number;                // Total records found in file
  importedRecords: number;             // Successfully imported (new)
  duplicateRecords: number;            // Skipped because already exist
  skippedRecords: number;              // Skipped due to validation errors
  updatedRecords: number;              // Updated existing records
  errors: string[];                    // Array of error messages
  importedPaperIds: string[];          // UUIDs of newly created papers
}
```

---

## Frontend Integration Examples

### Example 1: RIS File Upload with React

```typescript
import React, { useState } from 'react';

interface RisUploadProps {
  identificationProcessId: string;
  searchExecutionId?: string;
}

export const RisFileUploader: React.FC<RisUploadProps> = ({
  identificationProcessId,
  searchExecutionId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<RisImportResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    // Validate file extension
    if (!selectedFile.name.toLowerCase().endsWith('.ris')) {
      setError('Please select a .ris file');
      return;
    }

    // Validate file size (10MB = 10485760 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('identificationProcessId', identificationProcessId);
    
    if (searchExecutionId) {
      formData.append('searchExecutionId', searchExecutionId);
    }
    
    formData.append('source', 'Scopus'); // Optional
    formData.append('importedBy', 'user@example.com'); // Optional

    try {
      const response = await fetch('/api/papers/import/ris', {
        method: 'POST',
        body: formData,
      });

      const apiResponse: ApiResponse<RisImportResultDto> = await response.json();

      if (!apiResponse.isSuccess || !apiResponse.data) {
        throw new Error(apiResponse.message);
      }

      setResult(apiResponse.data);

      // Show warnings if there were errors during import
      if (apiResponse.data.errors.length > 0) {
        console.warn('Import warnings:', apiResponse.data.errors);
        // You might want to show these to the user
      }

      // Show success message
      if (apiResponse.data.importedRecords > 0) {
        alert(`Successfully imported ${apiResponse.data.importedRecords} papers`);
      } else {
        alert('No new papers were imported. All records were duplicates or invalid.');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      console.error('RIS upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="ris-uploader">
      <input
        type="file"
        accept=".ris"
        onChange={handleFileChange}
        disabled={uploading}
      />
      
      {error && <div className="error">{error}</div>}
      
      {file && (
        <div className="file-info">
          <p>Selected: {file.name}</p>
          <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload RIS File'}
      </button>

      {result && (
        <div className="result">
          <h3>Import Results</h3>
          <ul>
            <li>Total Records: {result.totalRecords}</li>
            <li>Imported: {result.importedRecords}</li>
            <li>Duplicates: {result.duplicateRecords}</li>
            <li>Skipped: {result.skippedRecords}</li>
          </ul>
          
          {result.errors.length > 0 && (
            <div className="warnings">
              <h4>Warnings:</h4>
              <ul>
                {result.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

### Example 2: File Upload with Progress and Validation

```typescript
import { useState } from 'react';

export function useRisImport(identificationProcessId: string) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file exists
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    // Check file extension
    const ext = file.name.toLowerCase().split('.').pop();
    if (ext !== 'ris') {
      return { valid: false, error: 'Only .ris files are supported' };
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size is 10MB, your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    // Warn if file is getting large (over 8MB)
    if (file.size > 8 * 1024 * 1024) {
      console.warn('Large file detected. Upload may take longer.');
    }

    return { valid: true };
  };

  const importRisFile = async (
    file: File,
    options?: {
      source?: string;
      importedBy?: string;
      searchExecutionId?: string;
    }
  ): Promise<RisImportResultDto> => {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('identificationProcessId', identificationProcessId);

      if (options?.source) formData.append('source', options.source);
      if (options?.importedBy) formData.append('importedBy', options.importedBy);
      if (options?.searchExecutionId) {
        formData.append('searchExecutionId', options.searchExecutionId);
      }

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      // Create promise wrapper for XHR
      const response = await new Promise<RisImportResultDto>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const apiResponse: ApiResponse<RisImportResultDto> = JSON.parse(xhr.responseText);
            
            if (!apiResponse.isSuccess || !apiResponse.data) {
              reject(new Error(apiResponse.message));
            } else {
              resolve(apiResponse.data);
            }
          } else {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || 'Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'));
        });

        xhr.addEventListener('timeout', () => {
          reject(new Error('Upload timeout. Please try again.'));
        });

        xhr.open('POST', '/api/papers/import/ris');
        xhr.timeout = 120000; // 2 minute timeout for large files
        xhr.send(formData);
      });

      return response;

    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    importRisFile,
    uploading,
    progress,
    validateFile,
  };
}
```

---

## Frontend Integration Notes

### When to Call This API

#### RIS File Import (`POST /api/papers/import/ris`)

**Use when:**
- User exports bibliography from academic database (Scopus, IEEE, PubMed, Web of Science, etc.)
- Bulk importing papers from search results
- Initial population of papers in identification phase
- User has a .ris file ready to upload

**Typical workflow:**
1. User completes a database search (e.g., in Scopus)
2. User exports results as RIS file
3. User navigates to "Import Papers" page in your app
4. User selects the RIS file
5. Your app validates file locally (extension, size)
6. Your app uploads file to this endpoint
7. Show progress indicator during upload
8. Display import results (success count, duplicates, errors)

---

### Common Pitfalls

❌ **Don't:**
1. **Upload files over 10MB** - Validate file size client-side first
2. **Forget to handle duplicates** - Import count may be less than total records
3. **Ignore `errors` array in response** - Important for debugging partial imports
4. **Hard-code GUIDs** - Always get them from previous API calls or route params
5. **Block UI without cancellation** - Allow users to cancel long uploads
6. **Assume all imports succeed** - Check `importedRecords` vs `totalRecords`

✅ **Do:**
1. **Validate files client-side** before uploading (save bandwidth)
2. **Show upload progress** for better UX (especially for large files)
3. **Display detailed results** - Tell users how many records imported, duplicated, failed
4. **Handle partial success** - Some records may import while others fail
5. **Provide retry mechanism** for failed imports
6. **Log import events** for audit trail
7. **Offer duplicate resolution** if many duplicates detected

---

### Loading & Error Handling Suggestions

#### Loading States

```typescript
enum ImportState {
  IDLE = 'idle',
  VALIDATING = 'validating',    // Client-side validation
  UPLOADING = 'uploading',       // File upload in progress
  PROCESSING = 'processing',     // Server processing
  SUCCESS = 'success',
  ERROR = 'error',
}

// Usage
const [importState, setImportState] = useState<ImportState>(ImportState.IDLE);

// Show different UI based on state
{importState === ImportState.UPLOADING && <ProgressBar progress={progress} />}
{importState === ImportState.PROCESSING && <Spinner text="Processing RIS file..." />}
```

#### Error Messages

```typescript
const ERROR_MESSAGES = {
  NO_FILE: 'Please select a RIS file to upload',
  INVALID_FORMAT: 'Invalid file format. Please select a .ris file',
  FILE_TOO_LARGE: 'File size must be less than 10MB',
  NETWORK_ERROR: 'Network error. Please check your connection and try again',
  TIMEOUT: 'Upload timeout. The file may be too large or your connection is slow',
  SERVER_ERROR: 'Server error occurred. Please try again later',
  VALIDATION_ERROR: 'Validation failed. Please check your data',
  ALL_DUPLICATES: 'All records already exist in the system',
  PARTIAL_SUCCESS: 'Some records were imported, but others failed',
};
```

#### User Feedback

```typescript
interface ImportFeedback {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: string[];
}

// Example feedback messages
const feedbackExamples: ImportFeedback[] = [
  {
    type: 'success',
    message: 'Successfully imported 45 papers',
    details: ['3 duplicates were skipped', '2 records had minor errors but were imported'],
  },
  {
    type: 'warning',
    message: 'No new papers were imported',
    details: ['All 10 records already exist in the database'],
  },
  {
    type: 'error',
    message: 'Import failed',
    details: ['Invalid RIS format at line 23', 'Unable to parse author names'],
  },
];
```

---

### Race Conditions & Timing

⚠️ **Potential Race Conditions:**

1. **Multiple simultaneous uploads** - Don't allow multiple RIS uploads for the same IdentificationProcess at once
   ```typescript
   // Use a flag to prevent concurrent uploads
   const [isUploading, setIsUploading] = useState(false);
   
   if (isUploading) {
     alert('An upload is already in progress');
     return;
   }
   ```

2. **Deleting IdentificationProcess during upload** - Disable delete button while import is active

3. **Navigating away during upload** - Warn user before leaving page
   ```typescript
   useEffect(() => {
     if (uploading) {
       const handler = (e: BeforeUnloadEvent) => {
         e.preventDefault();
         e.returnValue = '';
       };
       window.addEventListener('beforeunload', handler);
       return () => window.removeEventListener('beforeunload', handler);
     }
   }, [uploading]);
   ```

---

### Testing Checklist

Before deploying, test these scenarios:

- [ ] Upload valid RIS file (< 10MB)
- [ ] Upload RIS file with 0 records
- [ ] Upload file that's not .ris
- [ ] Upload file > 10MB
- [ ] Upload file with all duplicates
- [ ] Upload file with mix of valid/invalid records
- [ ] Upload with valid `searchExecutionId`
- [ ] Upload with invalid `searchExecutionId`
- [ ] Upload with missing required `identificationProcessId`
- [ ] Cancel upload mid-progress
- [ ] Network disconnect during upload
- [ ] Server timeout (very large file)
- [ ] Concurrent uploads
- [ ] Upload while IdentificationProcess is deleted

---

## API Client Example (Complete)

```typescript
// api/paperImportClient.ts

import axios, { AxiosProgressEvent } from 'axios';

export class PaperImportClient {
  private baseURL: string;

  constructor(baseURL: string = '/api/papers') {
    this.baseURL = baseURL;
  }

  /**
   * Import papers from RIS file
   */
  async importRisFile(
    request: {
      file: File;
      identificationProcessId: string;
      source?: string;
      importedBy?: string;
      searchExecutionId?: string;
    },
    onProgress?: (progress: number) => void
  ): Promise<RisImportResultDto> {
    // Client-side validation
    this.validateRisFile(request.file);

    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('identificationProcessId', request.identificationProcessId);
    
    if (request.source) formData.append('source', request.source);
    if (request.importedBy) formData.append('importedBy', request.importedBy);
    if (request.searchExecutionId) formData.append('searchExecutionId', request.searchExecutionId);

    const response = await axios.post<ApiResponse<RisImportResultDto>>(
      `${this.baseURL}/import/ris`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );

    if (!response.data.isSuccess || !response.data.data) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  }

  /**
   * Validate RIS file before upload
   */
  private validateRisFile(file: File): void {
    if (!file) {
      throw new Error('No file provided');
    }

    const ext = file.name.toLowerCase().split('.').pop();
    if (ext !== 'ris') {
      throw new Error('Only .ris files are supported');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`File size must be less than 10MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    }
  }
}

// Export singleton instance
export const paperImportClient = new PaperImportClient();
```

---

## Summary

This API provides a method for importing papers into the systematic review system through **RIS File Import** - the primary method for bulk importing bibliographic records from academic databases.

### Key Takeaways for Frontend Developers:

✅ **Always validate files client-side** before uploading (extension, size)  
✅ **Show progress indicators** for better UX, especially on large files  
✅ **Handle partial success** - Not all records may import successfully  
✅ **Display detailed results** - Show counts for imported, duplicates, skipped, errors  
✅ **Implement proper error handling** - Network errors, timeouts, validation errors  
✅ **Prevent concurrent uploads** - Use loading states to disable UI  
✅ **Warn before navigation** - Don't let users lose progress  
✅ **Test edge cases** - Empty files, all duplicates, oversized files, invalid formats  

### Questions or Issues?

If you encounter any issues with these APIs or need clarification, please contact the backend team or refer to the source code documentation.

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Maintained by:** Backend Team
