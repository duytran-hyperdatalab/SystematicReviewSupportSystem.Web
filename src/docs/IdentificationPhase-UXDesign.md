# Identification Phase - UX Design Specification

## Executive Summary

This document defines the UX architecture for the Identification Phase, supporting two distinct user entry paths while maintaining enterprise-grade clarity and preventing data confusion.

---

## Component Hierarchy

```
IdentificationPhaseWorkspace (main container)
├── IdentificationHeader
│   ├── StatusBadge
│   ├── ProgressSummary
│   └── PhaseActions (Start/Complete)
│
├── TabNavigation
│   ├── Tab: "Search Strategies" (PRIMARY)
│   ├── Tab: "Import Batches"
│   ├── Tab: "Deduplication"
│   └── Tab: "Papers Library"
│
├── SearchStrategiesTab (PRIMARY ENTRY PATH)
│   ├── SearchStrategiesPanel
│   │   ├── SearchStrategiesTable
│   │   │   ├── Column: Source
│   │   │   ├── Column: Query (truncated, nullable)
│   │   │   ├── Column: Executed Date
│   │   │   ├── Column: Result Count
│   │   │   ├── Column: Import Batches (count + icon)
│   │   │   └── Column: Actions (View/Import/Edit/Delete)
│   │   ├── PrimaryCTA: "Create Search Strategy" (blue, prominent)
│   │   └── EmptyState: "Create your first search strategy"
│   │
│   └── QuickImportCard (SECONDARY ENTRY PATH)
│       ├── WarningBadge: "Quick Import Mode"
│       ├── RISUploadZone
│       ├── SourceSelector
│       ├── OptionalStrategySelector
│       ├── InfoBanner: "Auto-strategy will be created if none selected"
│       └── SecondaryCTA: "Import RIS File"
│
├── ImportBatchesTab
│   └── ImportBatchesPanel
│       ├── FilterBar (by strategy, source, date)
│       ├── ImportBatchesTable
│       │   ├── Column: File Name
│       │   ├── Column: Source
│       │   ├── Column: Strategy (linked)
│       │   ├── Column: Total Records
│       │   ├── Column: Imported At
│       │   └── Column: Actions
│       └── Stats: Total batches, records, unique strategies
│
├── DeduplicationTab (existing, enhanced)
│   └── DeduplicationPanel
│
└── PapersLibraryTab (existing, enhanced)
    └── PapersLibraryPanel
        └── FilterByStrategy (new)

Modals & Drawers:
├── CreateSearchExecutionModal
├── ImportRISModal (dual-mode)
├── SearchExecutionDetailDrawer
└── ViewPapersModal
```

---

## Key Component Props

### SearchStrategiesPanel

```typescript
interface SearchStrategiesPanelProps {
  identificationProcessId: string;
  strategies: SearchExecution[];
  isLoading: boolean;
  onCreateStrategy: () => void;
  onImportToStrategy: (strategyId: string) => void;
  onEditStrategy: (strategyId: string) => void;
  onDeleteStrategy: (strategyId: string) => void;
  onViewDetails: (strategyId: string) => void;
}
```

### QuickImportCard

```typescript
interface QuickImportCardProps {
  identificationProcessId: string;
  availableStrategies: SearchExecution[];
  onImport: (file: File, source: string, strategyId?: string) => Promise<void>;
  isUploading: boolean;
}
```

### CreateSearchExecutionModal

```typescript
interface CreateSearchExecutionModalProps {
  identificationProcessId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newStrategy: SearchExecution) => void;
}

interface CreateSearchExecutionForm {
  searchSource: string; // required
  searchQuery?: string; // optional
  executedAt: Date; // default now
  resultCount?: number; // can be 0 initially
}
```

### ImportRISModal

```typescript
interface ImportRISModalProps {
  identificationProcessId: string;
  isOpen: boolean;
  mode: "from-strategy" | "quick-import";
  preselectedStrategyId?: string; // locked if mode = 'from-strategy'
  availableStrategies?: SearchExecution[]; // for quick-import mode
  onClose: () => void;
  onSuccess: (batch: ImportBatch) => void;
}

interface ImportRISForm {
  file: File; // required
  source?: string; // required if mode = quick-import
  searchExecutionId?: string; // optional in quick-import, locked in from-strategy
}
```

### SearchExecutionDetailDrawer

```typescript
interface SearchExecutionDetailDrawerProps {
  isOpen: boolean;
  strategyId: string;
  strategy: SearchExecution;
  importBatches: ImportBatch[];
  totalPapers: number;
  onClose: () => void;
  onImportRIS: () => void;
  onViewPapers: (batchId: string) => void;
}
```

---

## Visual Priority Rules

### PRIMARY Flow (Strategy-First)

**Visual Signals:**

- 🟢 Green "Recommended" badge next to "Create Search Strategy" button
- Large, blue gradient button style
- Positioned above quick import card
- Table has prominent placement
- Helper text: "Import papers to your strategies for better organization"

**Button Hierarchy:**

```tsx
<Button variant="primary" size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700">
  <FiPlus /> Create Search Strategy
  <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">Recommended</span>
</Button>
```

### SECONDARY Flow (Quick Import)

**Visual Signals:**

- 🟡 Yellow/orange warning badge
- Muted gray card background
- Smaller button (size="md")
- Positioned in separate card below strategies
- Dashed border to indicate "alternative path"
- Helper text: "Import without predefined strategy (not recommended for complex reviews)"

**Card Style:**

```tsx
<div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
  <div className="flex items-center gap-2 mb-3">
    <FiAlertCircle className="text-orange-500" />
    <h3 className="font-semibold text-gray-700">Quick Import</h3>
    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
      Fallback Option
    </span>
  </div>
  {/* ... */}
</div>
```

---

## User Flow Diagrams

### PATH A: Strategy-First (Recommended)

```
User lands on Identification Phase
    ↓
[1] Sees "Search Strategies" tab (active by default)
    ↓
[2] Clicks "Create Search Strategy" (prominent blue button)
    ↓
[3] Modal opens:
    - Select source (PubMed, IEEE, etc.)
    - Enter query (optional)
    - Executed date (defaults to now)
    ↓
[4] Submits → Strategy created
    ↓
[5] Dashboard refreshes, new row highlighted
    Success toast: "Strategy created! You can now import RIS files."
    ↓
[6] User clicks "Import RIS" icon in strategy row
    ↓
[7] Import modal opens (strategy pre-selected, locked)
    - Upload RIS file
    - Shows parsed record count preview
    ↓
[8] Confirms import → Papers linked to strategy
    ↓
[9] Strategy row updates: "1 batch imported, 345 records"
```

### PATH B: Quick Import (Fallback)

```
User lands on Identification Phase
    ↓
[1] Scrolls down, sees "Quick Import Card" (muted, secondary)
    ↓
[2] Drops RIS file into upload zone
    ↓
[3] System prompts:
    - Select source
    - OPTIONAL: Link to existing strategy (dropdown)
    ↓
[4a] User selects existing strategy
    → Import attaches to that strategy

[4b] User leaves strategy blank
    → Warning: "System will auto-create a strategy"
    → Confirm import
    ↓
[5] Import completes
    ↓
[6] If auto-created:
    Toast: "RIS imported. Auto-strategy created: 'PubMed Import - Feb 25, 2026'"
    User directed to view new strategy
```

---

## UX Rationale

### Why Prioritize Strategy-First?

1. **Data Organization:** Forces users to think about search methodology before importing
2. **PRISMA Compliance:** Search strategies are documented separately from imports
3. **Audit Trail:** Clear lineage: Strategy → Import → Papers
4. **Prevent Confusion:** Users always know which papers came from which search
5. **Future-Proof:** When real search execution is added, strategies already exist

### Why Support Quick Import?

1. **Practical Reality:** Users may have RIS files before defining formal strategies
2. **Migration Path:** Existing projects can import first, organize later
3. **Flexibility:** Small reviews may not need complex strategy management
4. **Error Recovery:** If strategy creation fails, users can still import

### Visual Differentiation Strategy

- **Primary = Confidence:** Blue, prominent, "recommended" → guides novice users
- **Secondary = Caution:** Orange warning, muted → signals "understand implications"
- **Not Hidden:** Quick import is accessible but not equal priority
- **Educational:** Tooltips and helper texts explain trade-offs

---

## Edge Cases & Error Handling

### Edge Case: SearchExecution Without Query

**Scenario:** User creates strategy but leaves query blank.

**UI Handling:**

- Table shows "—" or "No query specified" in gray text
- Tooltip: "Query is optional for manual imports"
- Valid use case for quick imports that were later formalized

### Edge Case: Multiple Imports Per Strategy

**Scenario:** User imports 3 RIS files to same PubMed strategy.

**UI Handling:**

- Strategy row shows: "3 batches, 1,247 total records"
- Detail drawer lists all 3 batches chronologically
- Each batch retains original file name

### Edge Case: Auto-Created Strategy

**Scenario:** Quick import without strategy selection.

**UI Handling:**

- Auto-name: `{source} Import - {date}`
- Mark with badge: "Auto-created"
- Allow user to edit query later
- Show in separate section: "Auto-Strategies" (can be merged)

### Edge Case: Large RIS File

**Scenario:** User uploads 10,000-record RIS file.

**UI Handling:**

- Show upload progress bar
- Parse and show preview: "10,234 records detected"
- Confirm before import: "This may take a few minutes"
- Background job if >5,000 records
- Real-time import progress

### Edge Case: Import Failure

**Scenario:** RIS file is corrupted or incompatible.

**UI Handling:**

- Catch parse error
- Show error modal: "Unable to parse RIS file"
- Suggest: "Check file format or try different export"
- Log error for debugging
- Don't create ImportBatch record

### Edge Case: Empty Identification

**Scenario:** No strategies or imports exist.

**UI Handling:**

- Hero empty state on Strategies tab
- Large icon, clear messaging
- Primary CTA: "Create Your First Strategy"
- Secondary link: "Or quickly import RIS"
- Tutorial link: "Learn about systematic reviews"

---

## Implementation Phases

### Phase 1: Core Structure (Week 1)

- ✅ SearchStrategiesTable component
- ✅ CreateSearchExecutionModal
- ✅ ImportRISModal (basic)
- ✅ Visual priority styling
- ✅ Empty states

### Phase 2: Quick Import (Week 2)

- ✅ QuickImportCard component
- ✅ Auto-strategy creation logic
- ✅ Strategy selector dropdown
- ✅ Warning banners

### Phase 3: Detail Views (Week 3)

- ✅ SearchExecutionDetailDrawer
- ✅ ImportBatchesTab
- ✅ Papers filtering by strategy
- ✅ Batch actions

### Phase 4: Polish (Week 4)

- ✅ Optimistic updates
- ✅ Loading skeletons
- ✅ Error boundaries
- ✅ Accessibility audit
- ✅ Performance optimization

---

## Success Metrics

### User Behavior Metrics

- **Primary path adoption:** >70% of users create strategy first
- **Quick import usage:** <30% use quick import as first action
- **Auto-strategy rate:** <15% of strategies are auto-created
- **Strategy reuse:** >2 imports per strategy on average

### UX Quality Metrics

- **Task completion:** >95% successfully import papers
- **Error recovery:** <5% abandon after import failure
- **Clarity score:** >4.5/5 on "I understand where my papers are"

---

## Accessibility Requirements

- ✅ Keyboard navigation: Tab through strategies, Enter to open
- ✅ Screen reader: Clear labels for strategy vs quick import
- ✅ Focus indicators: Blue outline on interactive elements
- ✅ ARIA labels: "Recommended workflow" for primary CTA
- ✅ Color independence: Don't rely solely on green/orange

---

## Mobile Considerations

- Stack strategy table and quick import card vertically
- Collapsible query text (tap to expand)
- Bottom sheet modals instead of center modals
- Touch-friendly file upload zones

---

## Future Enhancements

### Phase 5: Real Search Execution (Future)

- Add "Execute Search" button to strategies
- API integration with PubMed, IEEE, etc.
- Live result count before import
- Scheduled search re-execution

### Phase 6: Strategy Templates

- Pre-defined query templates
- Boolean search builder
- Search history across projects

### Phase 7: Collaboration

- Assign strategies to team members
- Review comments on imports
- Approval workflow for strategies

---

## Conclusion

This design prioritizes clarity, prevents data confusion, and scales for future features. The two-path approach balances best practices (strategy-first) with practical reality (quick import), using visual hierarchy to guide users toward the recommended workflow without blocking alternative paths.
