# API Documentation: Manual Deduplication

This document provides the technical specifications for integrating the manual deduplication endpoint. This API allows users to manually specify that a paper is a duplicate of another paper within a specific Identification Process.

## 1. Basic Information
- **Method**: `POST`
- **Full Route Path**: `/api/identification-processes/{identificationProcessId}/papers/{paperId}/mark-as-duplicate`
- **Purpose**: To manually record a duplicate relationship when the system's automated detection (DOI matching/Embeddings) fails to identify it.

## 2. Request Details
- **Headers**: 
    - `Content-Type: application/json`
    - `Authorization: Bearer <token>` (JWT requirement depends on project-wide auth state)
- **Path Parameters**:
    - `identificationProcessId` (Guid): The ID of the Identification Process.
    - `paperId` (Guid): The ID of the paper that **will be cancelled** (marked as a duplicate).
- **Query Parameters**: None.
- **Request Body Schema (TypeScript)**:
```typescript
interface MarkAsDuplicateRequest {
    /** 
     * The ID of the original paper to keep. 
     */
    duplicateOfPaperId: string; // uuid

    /** 
     * Reasoning for manually marking this as a duplicate. 
     */
    reason?: string;
    
    /**
     * Note: 'paperId' is also present in the DTO but is redundant 
     * as the API uses the 'paperId' from the URL route for the cancelled paper.
     */
    paperId?: string; 
}
```
- **Required vs Optional**:
    - `duplicateOfPaperId`: **Required**.
    - `reason`: Optional (recommended for audit trails).
- **Validation Rules**:
    - Both IDs must be valid GUIDs.
    - Both papers must exist in the database.
    - The Identification Process must exist.

## 3. Response Details
- **Success Response (200 OK)**:
```typescript
interface ApiResponse {
    isSuccess: boolean;
    message: string; // "Paper marked as duplicate successfully."
    errors: null | ApiError[];
}
```
- **Error Response (400 Bad Request)**:
    - Occurs if either paper is not found.
    - Occurs if the Identification Process is already in `Completed` status.
- **HTTP Status Codes**:
    - `200 OK`: Success.
    - `400 Bad Request`: Logic violation or missing entity.
    - `401 Unauthorized`: Missing or invalid token.

## 4. Business Logic Summary
In simple terms, this API does the following:
1. **Status Check**: It first checks if the identification process is still active. If it's already "Completed," the system locks the dataset, and no more duplicates can be marked.
2. **Entity Verification**: It ensures that both the "duplicate" paper and the "original" paper exist.
3. **Record Creation**: It creates a permanent record in the `DeduplicationResults` table with:
    - Method: `MANUAL` (indicates a human researcher made this decision).
    - Status: `Confirmed`.
    - Decision: `CANCEL`.
4. **Side Effects**: Once marked, the `paperId` (the one in the URL) will effectively be filtered out of the "Unique Papers" list for this review process in subsequent screenings.

## 5. Frontend Integration Notes
- **When to call**: Call this when a user selects a paper in a list and clicks "Mark as Duplicate of...", then selects another paper.
- **Common Pitfalls**: 
    - **Reversed IDs**: Ensure the paper to be *removed* is in the URL `{paperId}`, and the paper to *keep* is in the `duplicateOfPaperId` body field.
    - **Process Locked**: If the user has already clicked "Complete Identification," this API will fail. The UI should disable this action for completed processes.
- **Loading/Error Handling**:
    - Show a loading spinner on the "Confirm" button.
    - If a 400 error occurs, display the `message` from the response (e.g., "Identification process is already completed").

## 6. Ready-to-Use FE Types & Example
```typescript
/**
 * Request DTO for manual deduplication
 */
export interface MarkAsDuplicateRequest {
    duplicateOfPaperId: string;
    reason?: string;
}

/**
 * Standard API Response Wrapper
 */
export interface ApiResponse<T = any> {
    isSuccess: boolean;
    message: string;
    data?: T;
    errors?: Array<{ code: string; message: string }>;
}

/**
 * Example API Call (Using fetch)
 */
async function markAsDuplicate(
    processId: string, 
    paperId: string, 
    originalId: string, 
    reason: string
): Promise<ApiResponse> {
    const response = await fetch(
        `/api/identification-processes/${processId}/papers/${paperId}/mark-as-duplicate`, 
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                duplicateOfPaperId: originalId, 
                reason: reason 
            })
        }
    );
    return await response.json();
}
```
