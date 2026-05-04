# Citation API Gap Report Resolution

## 1. Validation of each reported issue

1. **N+1 Performance (CRITICAL)**: **Valid**. Generating citation/reference counts for an array of 50 papers independently causes significant N+1 queries. Adding counts to the existing `PaperWithDecisionsResponse` (the main screening item) is efficient and avoids separate calls entirely.
2. **Missing Metadata in Node DTOs**: **Valid**. The existing `PaperNodeDto` was returning titles and years without author tracking and DOIs, making it hard for users to recognize and cross-reference papers. This requirement aligns with the purpose of a semantic graph.
3. **Missing Suggested/Recommended Papers API**: **Valid**. Displaying related / suggested papers is a requested UI feature and retrieving the full graph to find top suggested items on the frontend is inefficient and causes over-fetching data.

## 2. Summary of backend changes

- **Safely appended `CitationCount` and `ReferenceCount`** integer properties to `PaperWithDecisionsResponse`.
- **Implemented batching for N+1 issues** in `StudySelectionService` by fetching count metrics in bulk directly from `PaperCitationRepository` through `CountBySourcesAsync` and `CountByTargetsAsync`.
- **Extended `PaperNodeDto`** to include `Authors` and `Doi` as nullable string properties. Mapped them correctly in the DTO projections inside `CitationService`.
- **Added `/api/papers/{id}/suggestions` API** in `CitationController` and `CitationService` returning adjacent citation papers sorted by popularity (incoming citations) and limited by standard defaults (5 papers) to facilitate UI discovery.

## 3. Updated code snippets

**Added Bulk Query Method (Repository)**
```csharp
public async Task<Dictionary<Guid, int>> CountByTargetsAsync(IEnumerable<Guid> targetPaperIds, CancellationToken cancellationToken = default)
{
    var results = await _context.Set<PaperCitation>()
        .Where(c => targetPaperIds.Contains(c.TargetPaperId))
        .GroupBy(c => c.TargetPaperId)
        .Select(g => new { PaperId = g.Key, Count = g.Count() })
        .ToDictionaryAsync(x => x.PaperId, x => x.Count, cancellationToken);
        
    return results;
}
```

**Added Suggested Papers Implementation (CitationService)**
```csharp
public async Task<List<PaperNodeDto>> GetSuggestedPapersAsync(Guid paperId, int limit = 5, CancellationToken cancellationToken = default)
{
    // Fetches References + Citations and then selects distinct, sorted by popularity.
    // ... maps to PaperNodeDto ...
}
```

## 4. Updated API schemas

**PaperWithDecisionsResponse (Main Screening List Endpoint)**
```ts
export interface PaperWithDecisionsResponse {
  paperId: string;
  // ... existing fields ...
  status: PaperSelectionStatus;
  statusText: string;
  finalDecision: ScreeningDecisionType | null;
  finalDecisionText: string | null;

  // Added Fields
  citationCount: number;
  referenceCount: number;

  decisions: ScreeningDecisionResponse[];
  resolution: ScreeningResolutionResponse | null;
}
```

**PaperNodeDto (All Citation Endpoint Responses)**
```ts
export interface PaperNodeDto {
  id: string;          
  title: string;
  year: number | null;
  citationCount: number;
  
  // Added Fields
  authors: string | null;
  doi: string | null;
}
```

**New Endpoint: `GET /api/papers/{id}/suggestions?limit=5`**
Request:
```ts
interface GetSuggestedPapersQuery {
  limit?: number; // default: 5
}
```

Response:
```ts
type GetSuggestedPapersResponse = ApiResponse<PaperNodeDto[]>;
```

## 5. Frontend impact notes

- **Fully Backward Compatible**: No existing fields were removed or renamed in `PaperWithDecisionsResponse` or `PaperNodeDto`. Existing components binding to these interfaces will continue working without refactoring.
- **Rollout Considerations**: 
  - Frontend developers should immediately migrate from doing N+1 separate calls for counters to directly reading `citationCount` and `referenceCount` populated in the main queue's `PaperWithDecisionsResponse`.
  - The suggestions layout can now query `GET /api/papers/{id}/suggestions?limit=5` directly rather than fetching and mutating the full generic network citation graph locally.
  - The Citation Graph modal/ui components can start binding `authors` and `doi` metrics without additional endpoints directly from the node definitions.
