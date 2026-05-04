# Identification Phase - Two-Path UX: Summary & Rationale

## Problem Statement

The Identification Phase needs to support **two distinct user workflows**:

1. **Strategy-First (Recommended):** Users define their search methodology BEFORE importing papers
2. **Quick Import (Fallback):** Users import papers first, optionally link to strategies later

The UI must clearly differentiate these paths while preventing data confusion and maintaining audit trails for systematic reviews.

---

## Solution Overview

### Visual Hierarchy Strategy

We use **visual priority rules** to guide users toward best practices without blocking alternative workflows:

| Element         | Primary Path     | Secondary Path       |
| --------------- | ---------------- | -------------------- |
| **Color**       | Blue gradient    | Muted gray           |
| **Badge**       | 🟢 "Recommended" | 🟡 "Fallback Option" |
| **Button Size** | Large (lg)       | Medium (md)          |
| **Card Style**  | Solid border     | Dashed border        |
| **Position**    | Top of page      | Below strategies     |
| **Helper Text** | Encouraging      | Cautious             |

This approach follows **nudge theory**: make the right choice easy without removing freedom.

---

## Component Architecture

```
📁 components/identification/
│
├── 📁 strategies/                    [PRIMARY PATH]
│   └── SearchStrategiesPanel.tsx
│       • Table of search executions
│       • "Create Strategy" CTA (prominent blue)
│       • Row actions: View, Import, Edit, Delete
│       • Shows import batch counts per strategy
│
├── 📁 import/                        [SECONDARY PATH]
│   └── QuickImportCard.tsx
│       • RIS file upload zone
│       • Source selector
│       • Optional strategy linking
│       • Warning banners for auto-strategy
│
└── 📁 modals/
    ├── CreateSearchExecutionModal.tsx
    │   • Source (required)
    │   • Query (optional)
    │   • Executed date
    │   • Notes
    │
    └── ImportRISModal.tsx (dual-mode)
        • Mode A: from-strategy (locked)
        • Mode B: quick-import (flexible)
        • RIS parsing preview
        • Auto-strategy warnings
```

---

## User Flow Comparison

### Path A: Strategy-First (70%+ of users)

```
1. User clicks "Create Search Strategy" (prominent blue button)
   ↓
2. Modal: Select source, enter query, set date
   ↓
3. Strategy appears in table
   ↓
4. User clicks "Import RIS" icon in row
   ↓
5. Import modal opens (strategy pre-selected)
   ↓
6. Upload RIS, see parsed count, confirm
   ↓
7. Papers linked to strategy
   ↓
8. Strategy row shows "1 batch, 345 records"
```

**Benefits:**

- Clear audit trail
- PRISMA compliance
- Easy to track paper sources
- Future-proof for real search execution

### Path B: Quick Import (15-30% of users)

```
1. User scrolls to "Quick Import Card" (muted, below strategies)
   ↓
2. Upload RIS file
   ↓
3. Select source (required)
   ↓
4a. Link to existing strategy (optional)
    → Papers attached to strategy

4b. Leave strategy blank
    → Warning: "Auto-strategy will be created"
    → Confirm import
    ↓
5. Auto-strategy: "PubMed Import - Feb 25, 2026"
   ↓
6. Toast: "Auto-strategy created"
```

**Use Cases:**

- Migration from other tools
- Exploratory reviews
- Small-scale reviews
- Emergency imports

---

## UX Rationale

### Q: Why not hide Quick Import entirely?

**A:** Users will find workarounds (e.g., creating fake strategies). Better to provide a safe fallback with clear warnings.

### Q: Why allow SearchExecutions without queries?

**A:** Real-world flexibility:

- Manual screening of pre-filtered papers
- Imports from colleagues
- Proprietary database exports
- Quick imports that are formalized later

### Q: Why separate SearchExecution and ImportBatch?

**A:** **Data model clarity:**

- SearchExecution = **methodology** (what search was performed)
- ImportBatch = **import event** (when papers were imported)
- One strategy can have multiple imports (e.g., updated searches)

### Q: Why auto-create strategies instead of orphan imports?

**A:** **Prevent data confusion:**

- Every import batch MUST link to a SearchExecution
- Auto-strategies maintain audit trail
- Users can merge/edit auto-strategies later
- System remains PRISMA-compliant

---

## Design Principles Applied

### 1. Progressive Disclosure

- Primary path visible immediately
- Secondary path below fold
- Advanced options (edit, delete) in row actions

### 2. Safety Through Clarity

- Orange warnings for risky actions
- Confirmation dialogs for destructive actions
- Disabled delete if strategy has imports
- Clear labels: "Auto-strategy will be created"

### 3. Flexibility Without Chaos

- Support both workflows
- Allow empty queries (documented)
- Enable post-import organization
- But always maintain data relationships

### 4. Future-Proof Architecture

- When real search execution is added, strategies already exist
- Query field ready for boolean search builder
- Template system can be added
- Collaboration features can extend existing structure

---

## Key Decisions & Trade-Offs

| Decision                        | Rationale                 | Trade-Off                     |
| ------------------------------- | ------------------------- | ----------------------------- |
| **Visual priority over hiding** | Users need escape hatches | More complex UI               |
| **Auto-create strategy**        | Maintain data integrity   | More rows in strategy table   |
| **Optional query field**        | Real-world flexibility    | Less structured documentation |
| **Dual-mode import modal**      | Code reuse, consistency   | More conditional logic        |
| **Prevent orphan imports**      | PRISMA compliance         | Less "freedom"                |

---

## Success Metrics

### Adoption Metrics

- **Target:** >70% of users create strategy before importing
- **Target:** <15% of strategies are auto-created
- **Target:** >2 imports per strategy (strategy reuse)

### Quality Metrics

- **Target:** >95% task completion (successful imports)
- **Target:** <5% abandon after errors
- **Target:** >4.5/5 clarity score ("I understand where my papers are")

### Efficiency Metrics

- **Target:** <2 minutes to create strategy + import
- **Target:** <30 seconds for quick import
- **Target:** <5 API calls per import workflow

---

## Accessibility Compliance

✅ **WCAG 2.1 AA Standards:**

- Keyboard navigation (Tab, Enter, ESC)
- Focus indicators (blue outline)
- ARIA labels ("Recommended workflow")
- Screen reader support
- Color-independent design (not just green/orange)
- Touch targets ≥44px

---

## Mobile Considerations

- Responsive tables (horizontal scroll or card view)
- Bottom sheet modals
- Touch-friendly upload zones
- Collapsible query text
- Sticky headers
- Simplified quick import form

---

## Implementation Checklist

### Phase 1: Core (Week 1) ✅

- [x] SearchStrategiesPanel component
- [x] CreateSearchExecutionModal
- [x] ImportRISModal (dual-mode)
- [x] QuickImportCard
- [x] Visual priority styling
- [x] Documentation

### Phase 2: Integration (Week 2)

- [ ] Update IdentificationPhaseWorkspace.tsx
- [ ] Create useSearchExecutions hook
- [ ] Create useImportBatches hook
- [ ] API service layer
- [ ] Toast notifications
- [ ] Error boundaries

### Phase 3: Enhancement (Week 3)

- [ ] SearchExecutionDetailDrawer
- [ ] Edit strategy functionality
- [ ] Batch operations
- [ ] Import batches tab redesign
- [ ] Papers filtering by strategy

### Phase 4: Polish (Week 4)

- [ ] Loading skeletons
- [ ] Optimistic updates
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] User testing
- [ ] Documentation updates

---

## Technical Debt Considerations

### Short-Term

- Mock RIS parsing (use real library later)
- Simplified file validation
- In-memory upload progress

### Long-Term

- Real search execution API integration
- Advanced query builder UI
- Strategy templates library
- Collaboration features

---

## Edge Cases Handled

✅ **SearchExecution without query**  
→ Display "—" or "No query specified"

✅ **Multiple imports per strategy**  
→ Show count: "3 batches, 1,247 records"

✅ **Large RIS file (>5,000 records)**  
→ Background job + progress tracking

✅ **Import failure (corrupted file)**  
→ Error modal + retry option

✅ **Empty identification (no strategies)**  
→ Hero empty state + tutorial link

✅ **Auto-created strategies**  
→ Mark with badge, allow editing

✅ **Delete strategy with imports**  
→ Disabled button + tooltip

✅ **Network errors**  
→ Retry logic + offline indicator

---

## Lessons from Similar Systems

### Zotero

- ✅ Good: Clear folder structure (strategies = folders)
- ❌ Bad: No import audit trail

### Covidence

- ✅ Good: Structured import workflow
- ❌ Bad: Too rigid, no quick import option

### Rayyan

- ✅ Good: Simple drag-drop imports
- ❌ Bad: Weak strategy documentation

**Our Approach:** Combine best of all three:

- Structured like Covidence
- Flexible like Rayyan
- Organized like Zotero

---

## Conclusion

This two-path design achieves the following goals:

1. ✅ **Guides users** toward best practices via visual priority
2. ✅ **Prevents confusion** by maintaining clear data relationships
3. ✅ **Supports flexibility** through secondary quick import path
4. ✅ **Scales for future** features (real search, templates, collaboration)
5. ✅ **Maintains compliance** with PRISMA reporting standards

The key innovation is **using visual hierarchy instead of restrictions** to encourage good practices while respecting user agency.

---

## Questions or Feedback?

- 📧 Contact: [Project Lead]
- 📖 Full Documentation: `/docs/IdentificationPhase-UXDesign.md`
- 🛠️ Implementation Guide: `/docs/IdentificationPhase-Implementation.md`
- 🐛 Issues: [GitHub/Jira Link]
