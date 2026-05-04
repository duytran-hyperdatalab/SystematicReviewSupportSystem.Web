# Assigned Papers API Integration Analysis & Gap Report

This document outlines the requirements, current API status, and critical gaps detected while integrating the `GetAssignedPapers` endpoint into the Study Selection UI.

## 1. API ↔ UI Field Mapping

| UI Requirement (Component) | API Field (Proposed) | Status | Priority |
| :--- | :--- | :--- | :--- |
| Paper ID ([PaperQueue](file:///d:/Capstone-project/fe/SystematicReviewSupportSystem.Web/src/pages/reviewProcess/studySelection/titleAbstractScreening/components/PaperQueue.tsx#31-215)) | `paperId` | **Gap** (UI uses [id](file:///d:/Capstone-project/fe/SystematicReviewSupportSystem.Web/src/pages/reviewProcess/prismaReport/sections/PrismaFlowDiagram.tsx#101-109)) | High |
| Title ([PaperQueue](file:///d:/Capstone-project/fe/SystematicReviewSupportSystem.Web/src/pages/reviewProcess/studySelection/titleAbstractScreening/components/PaperQueue.tsx#31-215)) | `title` | Match | - |
| Authors ([PaperQueue](file:///d:/Capstone-project/fe/SystematicReviewSupportSystem.Web/src/pages/reviewProcess/studySelection/titleAbstractScreening/components/PaperQueue.tsx#31-215)) | `authors` | Match | - |
| Pub Year ([PaperQueue](file:///d:/Capstone-project/fe/SystematicReviewSupportSystem.Web/src/pages/reviewProcess/studySelection/titleAbstractScreening/components/PaperQueue.tsx#31-215)) | `publicationYear` | **Gap** (Type: Number vs String) | Medium |
| Status ([PaperQueue](file:///d:/Capstone-project/fe/SystematicReviewSupportSystem.Web/src/pages/reviewProcess/studySelection/titleAbstractScreening/components/PaperQueue.tsx#31-215)) | `status` | Match | - |
| Decisions ([PaperListItem](file:///d:/Capstone-project/fe/SystematicReviewSupportSystem.Web/src/pages/reviewProcess/studySelection/titleAbstractScreening/components/PaperQueue.tsx#220-225)) | [decisions](file:///d:/Capstone-project/fe/SystematicReviewSupportSystem.Web/src/constants/queryKeys.ts#103-105) | Match | - |
| **Abstract** ([PaperViewer](file:///d:/Capstone-project/fe/SystematicReviewSupportSystem.Web/src/pages/reviewProcess/studySelection/titleAbstractScreening/components/PaperViewer.tsx#48-568)) | - | **MISSING** | **BLOCKER** |
| **Journal** ([PaperViewer](file:///d:/Capstone-project/fe/SystematicReviewSupportSystem.Web/src/pages/reviewProcess/studySelection/titleAbstractScreening/components/PaperViewer.tsx#48-568)) | - | **MISSING** | **BLOCKER** |
| **Keywords** ([PaperViewer](file:///d:/Capstone-project/fe/SystematicReviewSupportSystem.Web/src/pages/reviewProcess/studySelection/titleAbstractScreening/components/PaperViewer.tsx#48-568)) | - | **MISSING** | **BLOCKER** |
| AI Analysis ([PaperViewer](file:///d:/Capstone-project/fe/SystematicReviewSupportSystem.Web/src/pages/reviewProcess/studySelection/titleAbstractScreening/components/PaperViewer.tsx#48-568)) | - | **MISSING** | **BLOCKER** |
| Metadata Extraction ([Viewer](file:///d:/Capstone-project/fe/SystematicReviewSupportSystem.Web/src/pages/reviewProcess/studySelection/titleAbstractScreening/components/PaperViewer.tsx#48-568)) | - | **MISSING** | High |

---

## 2. 🚨 API Contract Issues

### [BLOCKER] Missing Core Content (Abstract/Journal/Keywords)
- **Endpoint**: `/api/study-selection/{id}/assigned-papers`
- **What UI needs**: `abstract`, `journal`, `keywords`, `publicationDate`.
- **Why this is a problem**: Reviewers **cannot decide** to include/exclude a paper based on the title alone. The abstract is the primary content used for screening.
- **Recommendation**: Add missing canonical metadata fields to [PaperWithDecisionsResponse](file:///d:/Capstone-project/fe/SystematicReviewSupportSystem.Web/src/types/studySelection.ts#242-278).

### [BLOCKER] Missing AI/Extraction Data
- **Endpoint**: `/api/study-selection/{id}/assigned-papers`
- **What UI needs**: `extraction`, `extractionResult`, `metadataSources`.
- **Why this is a problem**: The "AI Highlights" and "Metadata Enhancement" features will break. Users expect to see these highlights in the abstract during screening.
- **Recommendation**: Include extraction-related fields in the response.

### [WARNING] Inconsistent Data Types
- **What UI needs**: `publicationYear` as `number`.
- **What API provides**: `string`.
- **Why this is a problem**: Breakage in sorting logic and TypeScript validation.
- **Recommendation**: Return `publicationYear` as `int`.

---

## 3. Safe Frontend Integration

### Updated TypeScript Types
```typescript
/**
 * Aligned with current API Doc + UI Requirements
 */
export interface AssignedPaperResponse {
  paperId: string;
  title: string;
  doi?: string;
  authors?: string;
  publicationYear?: string; // GAP: UI expects number
  pdfUrl?: string | null;
  status: number;
  statusText: string;
  decisions: ScreeningDecisionResponse[];
  resolution?: ScreeningResolutionResponse;
  
  // NOTE: Requesting these from Backend
  abstract?: string; 
  journal?: string;
  keywords?: string;
}

export type GetAssignedPapersResponse = ApiResponse<PaginatedResponse<AssignedPaperResponse>>;
```

### Suggested React Query Hook
```typescript
export const useAssignedPapers = (processId: string, params: AssignedPapersParams) => {
  return useQuery({
    queryKey: ['assigned-papers', processId, params],
    queryFn: () => studySelectionService.getAssignedPapers(processId, params),
    select: (data) => ({
      ...data,
      items: data.items.map(paper => ({
        ...paper,
        id: paper.paperId, // Polyfill for UI consistency
        publicationYear: paper.publicationYear ? Number(paper.publicationYear) : undefined
      }))
    })
  });
};
```

---

## 4. Frontend Risk Notes
1. **N+1 Risk**: If the UI tries to fetch the abstract separately for every paper in the queue, it will cause performance degradation.
2. **Race Condition**: If the user switches phases quickly, ensure `AbortController` is used to cancel pending requests.
3. **Stale Data**: Since statistics are updated based on decisions, ensure the `assigned-papers` query is invalidated alongside [statistics](file:///d:/Capstone-project/fe/SystematicReviewSupportSystem.Web/src/constants/queryKeys.ts#100-102).
