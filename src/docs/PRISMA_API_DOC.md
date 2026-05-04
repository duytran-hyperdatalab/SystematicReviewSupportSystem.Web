# PRISMA 2020 API Integration Guide

This document describes the API endpoints for generating and retrieving PRISMA 2020 flow diagram data. The backend provides a **data-driven node structure** that matches the PRISMA 2020 standard.

## 🧱 Core Data Structures (TypeScript)

The following interfaces define the response shape. Use these to type your state and components.

```typescript
export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors?: ApiError[];
}

export interface ApiError {
  code: string;
  message: string;
}

export interface PrismaReportResponse {
  id: string;
  reviewProcessId: string;
  version: string;
  generatedAt: string; // ISO Date
  notes?: string;
  generatedBy?: string;
  nodes: PrismaNodeResponse[];
  included: PrismaNodeResponse;
}

export interface PrismaNodeResponse {
  stage: PrismaStage;     // Enum string (e.g. "RecordsIdentified")
  total: number;
  breakdown?: PrismaBreakdownResponse[]; // e.g. ["IEEE: 10", "PubMed: 20"]
  reasons?: PrismaBreakdownResponse[];    // e.g. ["Wrong Study Design: 5"]
  sideBox?: PrismaSideBoxResponse;        // Right-hand exclusion box
}

export interface PrismaSideBoxResponse {
  stage: string;
  total: number;
  breakdown?: PrismaBreakdownResponse[];
  reasons?: PrismaBreakdownResponse[];
}

export interface PrismaBreakdownResponse {
  label: string;
  count: number;
}

export type PrismaStage = 
  | "RecordsIdentified"
  | "DuplicateRecordsRemoved"
  | "RecordsScreened"
  | "RecordsExcluded"
  | "ReportsSoughtForRetrieval"
  | "ReportsNotRetrieved"
  | "ReportsAssessed"
  | "ReportsExcluded"
  | "StudiesIncludedInReview";
```

---

## 🚀 Endpoints

### 1. Generate New Report
**POST** `/api/review-processes/{reviewProcessId}/prisma-report`

Generates a fresh PRISMA snapshot based on the current state of the SLR (Identification & Selection).

- **Body**:
  ```typescript
  {
    notes?: string;
    generatedBy?: string;
    version?: string; // default "1.0"
  }
  ```
- **Logic**: 
    - Scans [ImportBatch](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Repositories/Entities/ImportBatch.cs#5-21) for identification sources.
    - Scans [IdentificationProcessPaper](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Repositories/Entities/IdentificationProcessPaper.cs#11-22) for the unique paper snapshot.
    - Scans [ScreeningResolution](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Repositories/Entities/ScreeningResolution.cs#10-24) and [ScreeningDecision](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Repositories/Entities/ScreeningDecision.cs#10-26) for exclusion counts and reasons.
- **When to call**: When the user clicks "Generate Report" or "Refresh Diagram".

### 2. Get Report by ID
**GET** `/api/prisma-reports/{id}`

- **Description**: Retrieves a previously generated report. 
- **Response**: `ApiResponse<PrismaReportResponse>`

### 3. Get Latest Report
**GET** `/api/review-processes/{reviewProcessId}/prisma-report/latest`

- **Description**: Quickly fetches the most recent report generated for a review.
- **Use Case**: Initial dashboard load to show the current progress diagram.

### 4. List All Reports
**GET** `/api/review-processes/{reviewProcessId}/prisma-reports`

- **Description**: Returns a history of generated reports (simple version without full node data).
- **Use Case**: Showing a "Version History" list where users can pick an older snapshot.

---

## 🧠 Business Logic Summary

1.  **Data-Driven Layout**: The `nodes` array is returned in the correct PRISMA sequence. You should iterate over `nodes` to render the main vertical flow and check `sideBox` on each node to render the horizontal exclusion branches.
2.  **Snapshot Nature**: A report is a *Snapshot*. Once generated, it does not change even if papers are excluded/included later. To update the diagram, you must call the **Generate** endpoint.
3.  **Breakdowns**:
    - **Identification Node**: Contains a breakdown of records by source (e.g., "IEEE", "PubMed", "Snowballing").
    - **Side Boxes**: For "RecordsExcluded" and "ReportsExcluded", the `reasons` array contains a count for each `ExclusionReasonCode` provided by reviewers.
4.  **Zero-Safety**: All counts will be returned as `0` instead of `null`. If a stage has no data, it still exists in the response.

## 🛠️ Frontend Integration Example (React + Axios)

```typescript
const fetchPrismaDiagram = async (reviewProcessId: string) => {
  const response = await axios.get<ApiResponse<PrismaReportResponse>>(
    `/api/review-processes/${reviewProcessId}/prisma-report/latest`
  );

  if (response.data.isSuccess) {
    const report = response.data.data;
    console.log("Studies Included:", report.included.total);
    
    // Render the main flow
    return report.nodes.map(node => (
      <PrismaBox 
        key={node.stage} 
        data={node} 
        sideData={node.sideBox} 
      />
    ));
  }
};
```

## ⚠️ Potential Pitfalls
- **Missing Decisions**: If a reviewer hasn't finished screening, the counts might be lower than expected until the "Generate" endpoint is called again after more resolutions are made.
- **IDs**: Always use `reviewProcessId` for process-scoped calls and the specific report [id](file:///d:/Capstone-project/be/SRSS/SRSS.IAM/SRSS.IAM.Services/DTOs/PrismaReport/PrismaReportDto.cs#28-35) for fetching a fixed snapshot.
