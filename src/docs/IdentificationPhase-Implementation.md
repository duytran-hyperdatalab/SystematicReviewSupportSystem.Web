# Identification Phase - Implementation Guide

## Overview

This guide explains how to integrate the new two-path strategy-first UX into the existing `IdentificationPhaseWorkspace.tsx`.

---

## Component Integration Map

### New Components Created

```
src/components/identification/
├── strategies/
│   └── SearchStrategiesPanel.tsx          ✅ PRIMARY entry path
├── import/
│   └── QuickImportCard.tsx                ✅ SECONDARY entry path
└── modals/
    ├── CreateSearchExecutionModal.tsx     ✅ Strategy creation
    └── ImportRISModal.tsx                 ✅ Dual-mode import
```

### Existing Components to Enhance

```
src/pages/reviewProcess/
└── IdentificationPhaseWorkspace.tsx       🔄 Update to use new components
```

---

## Integration Steps

### Step 1: Update Tab Structure

**Current tabs:**

- imports
- deduplication
- library
- searches

**New recommended structure:**

```tsx
<TabNavigation>
  <Tab id="strategies" label="Search Strategies" primary /> {/* NEW - combines search + import */}
  <Tab id="deduplication" label="Deduplication" />
  <Tab id="library" label="Papers Library" />
</TabNavigation>
```

**Alternative (keep separate):**

```tsx
<TabNavigation>
  <Tab id="strategies" label="Search Strategies" primary />
  <Tab id="imports" label="Import Batches" />
  <Tab id="deduplication" label="Deduplication" />
  <Tab id="library" label="Papers Library" />
</TabNavigation>
```

---

### Step 2: Update State Management

Add modal state:

```tsx
const [isCreateStrategyModalOpen, setIsCreateStrategyModalOpen] = useState(false);
const [isImportModalOpen, setIsImportModalOpen] = useState(false);
const [importModalMode, setImportModalMode] = useState<"from-strategy" | "quick-import">(
  "quick-import",
);
const [selectedStrategyId, setSelectedStrategyId] = useState<string | undefined>();
```

Add data fetching (React Query recommended):

```tsx
// Using custom hooks (to be created in hooks/useSearchExecutions.ts)
const {
  searchExecutions,
  isLoading: strategiesLoading,
  createSearchExecution,
  updateSearchExecution,
  deleteSearchExecution,
} = useSearchExecutions(identificationPhaseId);

const {
  importBatches,
  isLoading: batchesLoading,
  importRIS,
} = useImportBatches(identificationPhaseId);

// Count batches per strategy
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

---

### Step 3: Implement Handlers

```tsx
// Create Strategy Handler
const handleCreateStrategy = async (data: CreateSearchExecutionRequest) => {
  try {
    const newStrategy = await createSearchExecution(data);
    toast.success("Search strategy created! You can now import RIS files.");
    setIsCreateStrategyModalOpen(false);
    // Optional: Auto-open import modal
    setSelectedStrategyId(newStrategy.id);
    setImportModalMode("from-strategy");
    setIsImportModalOpen(true);
  } catch (error) {
    toast.error("Failed to create search strategy");
  }
};

// Import from Strategy Handler
const handleImportToStrategy = (strategyId: string) => {
  setSelectedStrategyId(strategyId);
  setImportModalMode("from-strategy");
  setIsImportModalOpen(true);
};

// Quick Import Handler
const handleQuickImport = async (file: File, source: string, strategyId?: string) => {
  try {
    // If no strategyId, auto-create strategy
    let finalStrategyId = strategyId;
    if (!strategyId) {
      const autoStrategy = await createSearchExecution({
        identificationProcessId: identificationPhaseId,
        searchSource: source,
        searchQuery: null,
        resultCount: 0,
        type: 1, // ManualImport
        notes: `Auto-created from import: ${file.name}`,
      });
      finalStrategyId = autoStrategy.id;
      toast.info(`Auto-strategy created: ${source} Import - ${new Date().toLocaleDateString()}`);
    }

    // Import RIS
    await importRIS({
      file,
      source,
      searchExecutionId: finalStrategyId,
    });

    toast.success("RIS file imported successfully!");
  } catch (error) {
    toast.error("Failed to import RIS file");
  }
};

// Import RIS Modal Handler
const handleImportSubmit = async (file: File, source?: string, strategyId?: string) => {
  try {
    await importRIS({
      file,
      source: source || searchExecutions.find((s) => s.id === strategyId)?.searchSource,
      searchExecutionId: strategyId,
    });
    toast.success("RIS file imported successfully!");
    setIsImportModalOpen(false);
  } catch (error) {
    toast.error("Failed to import RIS file");
  }
};

// Delete Strategy Handler
const handleDeleteStrategy = async (strategyId: string) => {
  const batchCount = importBatchCounts[strategyId] || 0;
  if (batchCount > 0) {
    toast.error("Cannot delete strategy with existing imports");
    return;
  }

  if (window.confirm("Are you sure you want to delete this search strategy?")) {
    try {
      await deleteSearchExecution(strategyId);
      toast.success("Search strategy deleted");
    } catch (error) {
      toast.error("Failed to delete search strategy");
    }
  }
};
```

---

### Step 4: Update JSX Layout

Replace existing tab content with new components:

```tsx
{/* Strategies Tab */}
{activeTab === "strategies" && (
  <div className="space-y-8">
    {/* PRIMARY: Search Strategies Panel */}
    <SearchStrategiesPanel
      identificationProcessId={identificationPhaseId}
      strategies={searchExecutions}
      isLoading={strategiesLoading}
      onCreateStrategy={() => setIsCreateStrategyModalOpen(true)}
      onImportToStrategy={handleImportToStrategy}
      onEditStrategy={(id) => {/* TODO: implement edit */}}
      onDeleteStrategy={handleDeleteStrategy}
      onViewDetails={(id) => {/* TODO: open detail drawer */}}
      importBatchCounts={importBatchCounts}
    />

    {/* SECONDARY: Quick Import Card */}
    <QuickImportCard
      identificationProcessId={identificationPhaseId}
      availableStrategies={searchExecutions}
      onImport={handleQuickImport}
      isUploading={/* TODO: track upload state */}
    />
  </div>
)}

{/* Modals */}
<CreateSearchExecutionModal
  identificationProcessId={identificationPhaseId}
  isOpen={isCreateStrategyModalOpen}
  onClose={() => setIsCreateStrategyModalOpen(false)}
  onSubmit={handleCreateStrategy}
/>

<ImportRISModal
  identificationProcessId={identificationPhaseId}
  isOpen={isImportModalOpen}
  mode={importModalMode}
  preselectedStrategyId={selectedStrategyId}
  availableStrategies={searchExecutions}
  onClose={() => setIsImportModalOpen(false)}
  onSubmit={handleImportSubmit}
/>
```

---

## Custom Hooks to Create

### 1. useSearchExecutions.ts

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchExecutionService } from "../services/searchExecutionService";

export function useSearchExecutions(identificationProcessId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["searchExecutions", identificationProcessId],
    queryFn: () => searchExecutionService.getAll(identificationProcessId),
  });

  const createMutation = useMutation({
    mutationFn: searchExecutionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchExecutions", identificationProcessId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: searchExecutionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchExecutions", identificationProcessId] });
    },
  });

  return {
    searchExecutions: data?.data || [],
    isLoading,
    error,
    createSearchExecution: createMutation.mutateAsync,
    deleteSearchExecution: deleteMutation.mutateAsync,
  };
}
```

### 2. useImportBatches.ts

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { importBatchService } from "../services/importBatchService";

export function useImportBatches(identificationProcessId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["importBatches", identificationProcessId],
    queryFn: () => importBatchService.getAll(identificationProcessId),
  });

  const importMutation = useMutation({
    mutationFn: importBatchService.import,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["importBatches", identificationProcessId] });
      queryClient.invalidateQueries({ queryKey: ["papers", identificationProcessId] });
    },
  });

  return {
    importBatches: data?.data || [],
    isLoading,
    importRIS: importMutation.mutateAsync,
  };
}
```

---

## Service Layer (API Integration)

### searchExecutionService.ts

```tsx
import { httpClient } from "../config/axios";
import type {
  SearchExecution,
  CreateSearchExecutionRequest,
  SearchExecutionListResponse,
} from "../types/identification";

export const searchExecutionService = {
  async getAll(identificationProcessId: string): Promise<SearchExecutionListResponse> {
    const response = await httpClient.get(
      `/identification/${identificationProcessId}/search-executions`,
    );
    return response.data;
  },

  async create(data: CreateSearchExecutionRequest): Promise<SearchExecution> {
    const response = await httpClient.post(
      `/identification/${data.identificationProcessId}/search-executions`,
      data,
    );
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/search-executions/${id}`);
  },
};
```

### importBatchService.ts

```tsx
import { httpClient } from "../config/axios";
import type { ImportBatch, ImportBatchListResponse } from "../types/identification";

export const importBatchService = {
  async getAll(identificationProcessId: string): Promise<ImportBatchListResponse> {
    const response = await httpClient.get(
      `/identification/${identificationProcessId}/import-batches`,
    );
    return response.data;
  },

  async import(data: {
    file: File;
    source?: string;
    searchExecutionId?: string;
  }): Promise<ImportBatch> {
    const formData = new FormData();
    formData.append("file", data.file);
    if (data.source) formData.append("source", data.source);
    if (data.searchExecutionId) formData.append("searchExecutionId", data.searchExecutionId);

    const response = await httpClient.post("/import-batches/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },
};
```

---

## Testing Checklist

### Path A: Strategy-First (Primary)

- [ ] User can create search strategy
- [ ] Form validates required fields
- [ ] Query field is optional
- [ ] New strategy appears in table
- [ ] User can click "Import RIS" from strategy row
- [ ] Import modal opens with strategy pre-selected (locked)
- [ ] File upload works
- [ ] Parsed record count displays
- [ ] Import attaches to correct strategy
- [ ] Strategy row updates with batch count

### Path B: Quick Import (Secondary)

- [ ] Quick import card is visually secondary (muted)
- [ ] User can upload RIS without strategy
- [ ] Source selector is required
- [ ] Strategy selector is optional
- [ ] Warning shows when no strategy selected
- [ ] Auto-strategy is created with correct name
- [ ] Import works with auto-created strategy
- [ ] Success toast mentions auto-creation

### Edge Cases

- [ ] Empty state shows when no strategies exist
- [ ] Cannot delete strategy with existing imports
- [ ] Large file upload shows progress
- [ ] Invalid RIS file shows error
- [ ] Network error is handled gracefully

---

## Accessibility

- [ ] Keyboard navigation works for all buttons
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] ARIA labels on icon buttons
- [ ] Screen reader announces "Recommended" badge
- [ ] Modal traps focus
- [ ] ESC closes modals

---

## Performance Optimization

- [ ] React Query caching prevents unnecessary API calls
- [ ] Optimistic updates for create/delete
- [ ] File upload progress is tracked
- [ ] Large tables virtualized (if >100 rows)
- [ ] Images lazy-loaded

---

## Next Steps

1. ✅ Create custom hooks (useSearchExecutions, useImportBatches)
2. ✅ Implement service layer (API integration)
3. ✅ Update IdentificationPhaseWorkspace.tsx
4. ✅ Add toast notifications
5. ✅ Create SearchExecutionDetailDrawer (future enhancement)
6. ✅ Add batch operations (bulk delete, export)
7. ✅ Implement real RIS parsing library
8. ✅ Add unit tests for components
9. ✅ Add integration tests for workflows

---

## Migration Path (for existing users)

If users have existing ImportBatches without SearchExecutions:

1. Show banner: "Some imports don't have strategies"
2. Provide "Migrate Imports" action
3. Bulk-create auto-strategies for orphan imports
4. Log migration in system audit trail

---

## Future Enhancements

- Real search execution (API integration with PubMed, IEEE)
- Search query builder UI
- Strategy templates library
- Scheduled re-execution
- Collaboration features (assign strategies to team members)
- Approval workflow for imports
