# 🚨 Search Execution API Integration - Risk Assessment & Mitigation

## Executive Summary

The Search Execution API provides **partial functionality** for the Identification Phase Workspace UI. **3 BLOCKER issues** prevent full implementation without backend changes.

**Production readiness:** ⚠️ **NOT READY** - Critical gaps exist

---

## 🔴 BLOCKER Risks

### BLOCKER-1: Import Batch Count Missing from API Response

**Risk Level:** 🔴 **HIGH**

**Impact:**

- UI cannot efficiently display import batch counts per search execution
- Forces client to fetch ALL import batches and compute client-side
- N+1 query problem: For 100 search executions, need 1 + 100 = 101 API calls
- Performance degradation with large datasets

**Current Workaround:**

```typescript
// Inefficient client-side counting
const importBatchCounts = useMemo(() => {
  return importBatches.reduce(
    (acc, batch) => {
      if (batch.searchExecutionId) {
        acc[batch.searchExecutionId] = (acc[batch.searchExecutionId] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );
}, [importBatches]);
```

**Mitigation Options:**

1. ✅ **BEST:** Backend adds `importBatchCount` to `SearchExecutionResponse`
2. ⚠️ **TEMP:** Fetch all import batches once, cache client-side (stale data risk)
3. ❌ **BAD:** Make separate API call per search execution (N+1 problem)

**Backend Change Required:** YES - Add computed field to DTO

---

### BLOCKER-2: Import Batch API Not Provided

**Risk Level:** 🔴 **CRITICAL**

**Impact:**

- **Cannot implement UI at all** without import batch data
- Search strategies tab shows incomplete information
- Cannot validate delete operations (allows data loss)
- Cannot display import history

**Required API Endpoints:**

```
GET    /api/search-executions/{id}/import-batches
POST   /api/search-executions/{id}/import-batches
DELETE /api/import-batches/{id}
GET    /api/identification-processes/{id}/import-batches
```

**Mitigation Options:**

1. ✅ **REQUIRED:** Backend must provide Import Batch API
2. ❌ No viable workaround - this is essential

**Backend Change Required:** YES - Complete new API required

**Timeline Impact:** This is a **BLOCKER** for Phase 1 release

---

### BLOCKER-3: PRISMA Statistics Not Provided

**Risk Level:** 🔴 **HIGH**

**Impact:**

- Cannot display key metrics in UI header
- Users lose visibility into overall progress
- PRISMA reporting incomplete

**UI Requirements:**

```typescript
interface PrismaStats {
  recordsImported: number; // Total from all import batches
  duplicateRecords: number; // From deduplication
  afterDeduplication: number; // Unique records
  importBatches: number; // Total count
}
```

**Current Workaround:**

- Mock data (not production-viable)
- Client-side aggregation from multiple API calls (slow)

**Mitigation Options:**

1. ✅ **BEST:** Backend provides aggregated statistics endpoint
2. ⚠️ **TEMP:** Client computes from import batches + deduplication (slow)
3. ❌ **BAD:** Remove metrics from UI (poor UX)

**Backend Change Required:** YES - New statistics endpoint

---

## 🟡 WARNING Risks

### WARNING-1: Delete Operation Not Validated Server-Side

**Risk Level:** 🟡 **MEDIUM**

**Impact:**

- Backend may cascade delete papers and import batches
- Client-side validation can be bypassed
- Data loss risk if UI logic has bugs

**Current Workaround:**

```typescript
// Client-side validation (unsafe!)
const batchCount = importBatchCounts[strategyId] || 0;
if (batchCount > 0) {
  toast.error("Cannot delete strategy with existing imports");
  return;
}
```

**Mitigation Options:**

1. ✅ **BEST:** Backend enforces validation, returns 400 with clear error
2. ⚠️ **TEMP:** Trust client-side validation (risky)
3. ⚠️ Add confirmation dialogs (doesn't prevent cascade)

**Backend Change Required:** YES - Add validation in DeleteSearchExecutionAsync

**Code Example:**

```csharp
if (searchExecution.ImportBatches?.Any() == true) {
    throw new InvalidOperationException(
        "Cannot delete search execution with existing import batches"
    );
}
```

---

### WARNING-2: resultCount Update Mechanism Unclear

**Risk Level:** 🟡 **MEDIUM**

**Impact:**

- resultCount might become out of sync with actual imported papers
- Unclear when/how this field is updated
- Cannot rely on this field for accurate counts

**Questions:**

- Is `resultCount` auto-calculated from import batches?
- Does Import Batch API update this?
- Can it drift from actual count?

**Mitigation Options:**

1. ✅ **BEST:** Backend documents update mechanism clearly
2. ✅ **BETTER:** Make `resultCount` computed field (always accurate)
3. ⚠️ **TEMP:** Display with caveat "approximate count"

**Backend Change Required:** Documentation or implementation change

---

### WARNING-3: No Pagination for List Endpoint

**Risk Level:** 🟡 **LOW** (now), 🔴 **HIGH** (production)

**Impact:**

- Fetches ALL search executions at once
- Slow with 100+ search executions
- High memory usage on client
- Network timeout risk

**Current API:**

```
GET /api/identification-processes/{id}/search-executions
Returns: ALL results (no pagination)
```

**Mitigation Options:**

1. ✅ **BEST:** Backend adds pagination parameters
2. ⚠️ **TEMP:** Client-side pagination (still fetches all)
3. ⚠️ Limit phase to 50 strategies (artificial limit)

**Backend Change Required:** Optional but recommended for production

---

## 🔵 NICE-TO-HAVE Improvements

### Batch Delete Operation

**Risk Level:** 🔵 **LOW**

Users might want to delete multiple strategies at once. Not critical.

**Backend Change Required:** New endpoint for batch operations

---

### Search/Filter on List Endpoint

**Risk Level:** 🔵 **LOW**

UI might want to filter by source, date range, etc. Can be done client-side.

**Backend Change Required:** Query parameters for filtering

---

## 📋 Integration Readiness Matrix

| Feature                  | Backend Ready | Frontend Ready | Blocker | Workaround Available     |
| ------------------------ | ------------- | -------------- | ------- | ------------------------ |
| List search executions   | ✅ Yes        | ✅ Yes         | No      | N/A                      |
| Create search execution  | ✅ Yes        | ✅ Yes         | No      | N/A                      |
| Update search execution  | ✅ Yes        | ✅ Yes         | No      | N/A                      |
| Delete search execution  | ⚠️ Partial    | ✅ Yes         | No      | Client validation        |
| Show import batch counts | ❌ No         | ⚠️ Partial     | **Yes** | Client-side count (slow) |
| Fetch import batches     | ❌ No         | ❌ No          | **Yes** | None                     |
| PRISMA statistics        | ❌ No         | ❌ No          | **Yes** | Mock data only           |
| Delete validation        | ❌ No         | ⚠️ Partial     | No      | Client-side (unsafe)     |

**Legend:**

- ✅ Fully supported
- ⚠️ Partial/workaround
- ❌ Not available

---

## 🎯 Recommended Action Plan

### Phase 1 (CRITICAL - Required for MVP)

1. **Implement Import Batch API** (BLOCKER-2)
   - Minimum endpoints: GET, POST, DELETE
   - Link to search executions via `searchExecutionId`
   - ETA: **REQUIRED BEFORE FRONTEND CAN SHIP**

2. **Add importBatchCount to SearchExecutionResponse** (BLOCKER-1)
   - Simple computed field in existing endpoint
   - Prevents N+1 queries
   - ETA: 1-2 days

3. **Implement DELETE validation** (WARNING-1)
   - Prevent cascade deletes when import batches exist
   - Return 400 with clear error message
   - ETA: 1 day

### Phase 2 (HIGH Priority - Next Sprint)

4. **Create Statistics Endpoint** (BLOCKER-3)
   - Aggregate PRISMA metrics
   - Single endpoint for all stats
   - ETA: 2-3 days

5. **Document resultCount update mechanism** (WARNING-2)
   - Clarify in API docs
   - Or make it computed field
   - ETA: 1 day (docs) or 2 days (computed)

### Phase 3 (Production Hardening)

6. **Add Pagination** (WARNING-3)
   - Prevents performance issues at scale
   - Standard page/pageSize parameters
   - ETA: 2-3 days

---

## 🛡️ Risk Mitigation Strategy

### For Current Sprint (If Backend Changes Delayed)

**Temporary Workarounds:**

1. Use mock data for PRISMA stats
2. Disable delete functionality with "Coming Soon" message
3. Hide import batch counts temporarily
4. Add performance warning for large datasets

**Risks Accepted:**

- Limited functionality in initial release
- Cannot validate full user workflow
- Performance issues with large datasets

### For Production Release

**Non-Negotiable Requirements:**

1. ✅ Import Batch API implemented
2. ✅ PRISMA statistics endpoint
3. ✅ Delete validation server-side
4. ✅ Import batch counts in response

**Optional but Recommended:** 5. Pagination 6. Batch operations 7. resultCount as computed field

---

## 📊 Technical Debt Tracking

| Item                              | Severity | Debt Type     | Estimated Effort to Fix           |
| --------------------------------- | -------- | ------------- | --------------------------------- |
| Client-side import batch counting | HIGH     | Performance   | Backend: 1 day, Frontend: 1 day   |
| Missing Import Batch API          | CRITICAL | Architecture  | Backend: 1 week, Frontend: 2 days |
| Client-side delete validation     | MEDIUM   | Security      | Backend: 1 day, Frontend: 1 day   |
| No pagination                     | LOW→HIGH | Performance   | Backend: 2 days, Frontend: 1 day  |
| Mock PRISMA stats                 | HIGH     | Functionality | Backend: 2 days, Frontend: 1 day  |

**Total Estimated Effort:** 2-3 weeks backend development, 1 week frontend integration

---

## 🔍 Code Review Checklist

Before merging frontend integration:

- [ ] All BLOCKER issues documented in tickets
- [ ] Backend team aware of required changes
- [ ] Temporary workarounds clearly marked with `// TODO: BLOCKER-X`
- [ ] Performance implications documented
- [ ] Error handling for missing data implemented
- [ ] Type safety enforced (no `any` types)
- [ ] Loading states for all API calls
- [ ] Error states with retry logic
- [ ] Client-side validation with warnings
- [ ] Integration tests skipped for missing endpoints (with comments)

---

## 📞 Next Steps

1. **Schedule meeting with backend team** to review gap report
2. **Prioritize BLOCKER issues** for upcoming sprint
3. **Create backend tickets** for each required change
4. **Update frontend timeline** based on backend capacity
5. **Document temporary workarounds** in code
6. **Plan integration testing** once backend changes complete

---

## 📄 Related Documentation

- Gap Report: See Part 2 of this document
- API Documentation: `src/docs/SearchExecutionAPI.md`
- Integration Guide: `src/docs/SearchExecutionIntegrationGuide.tsx`
- TypeScript Types: `src/types/searchExecution.ts`
- Service Layer: `src/services/searchExecutionService.ts`
- React Hook: `src/hooks/useSearchExecutions.ts`
