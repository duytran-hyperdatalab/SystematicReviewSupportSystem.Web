# PRISMA 2020 Checklist Module - Implementation Guide

## Overview

This is a comprehensive implementation of the PRISMA 2020 checklist module for systematic review management. The module provides a beautiful, professional interface for researchers to complete PRISMA compliance checklists with real-time progress tracking, sample answers, and export capabilities.

## Architecture

### File Structure

```
src/
├── components/
│   └── checklist/
│       ├── ChecklistEditor.tsx           # Main editor component (form builder style)
│       ├── ChecklistItem.tsx             # Individual item component
│       ├── CompletionProgress.tsx        # Progress bar component
│       ├── SampleAnswerModal.tsx         # Modal for showing sample answers
│       └── SectionSidebar.tsx            # Navigation sidebar by section
├── pages/
│   ├── checklist/
│   │   ├── ChecklistDashboard.tsx        # Dashboard/Overview page
│   │   ├── ChecklistDashboardWrapper.tsx # Wrapper/Integration point
│   │   ├── ChecklistEditorPage.tsx       # Editor integration point
│   ├── admin/
│   │   ├── TemplateCustoimzer.tsx        # Template editor/customizer
│   │   └── TemplateManager.tsx           # Admin template management page
├── hooks/
│   └── useChecklistData.ts               # State management hook
├── types/
│   └── checklist.ts                      # TypeScript interfaces & types
└── constants/
    └── checklistData.ts                  # Mock data & sample templates
```

## Type System

All types are defined in `src/types/checklist.ts`:

### Core Types

- **ChecklistSection**: Union type for 7 PRISMA sections
- **ChecklistItemTemplate**: Single checklist item definition
- **ChecklistTemplateDetail**: Complete template with all items
- **ChecklistItemResponse**: User response to a checklist item
- **ReviewChecklist**: Complete checklist for a review

### Request/Response Types

- **CreateChecklistRequest**: For creating new checklists
- **SaveChecklistItemRequest**: For saving item responses
- **UpdateCustomTemplateRequest**: For updating templates

## Components

### 1. ChecklistEditor (Main Component)

The primary component for editing checklists. Features:

- **Top Navbar**: Project title, progress bar, Save/Preview/Generate buttons
- **Left Sidebar**: Section navigation with completion indicators
- **Main Content**: Accordion-style items grouped by section
- **Mobile Support**: Collapsible sidebar, drawer for actions

**Usage:**

```tsx
import ChecklistEditor from "@/components/checklist/ChecklistEditor";

<ChecklistEditor
  checklist={checklistData}
  isLoading={false}
  onSave={async (changes) => {
    // Handle saving
  }}
  onGenerateReport={async (format) => {
    // Handle report generation
  }}
/>;
```

### 2. ChecklistItem (Reusable Component)

Individual checklist item with:

- Expandable description
- Content textarea (auto-save with debounce)
- Report location field
- Not Applicable / Not Reported checkboxes
- Sample answer button

**Usage:**

```tsx
<ChecklistItem
  template={itemTemplate}
  response={itemResponse}
  onUpdate={(itemId, updates) => {
    // Handle updates
  }}
  onShowSample={() => {
    // Show sample answer modal
  }}
  isSubItem={false}
/>
```

### 3. CompletionProgress

Progress bar component with customizable sizes and styling.

**Usage:**

```tsx
<CompletionProgress completed={25} total={100} size="lg" showLabel={true} />
```

### 4. SectionSidebar

Navigation sidebar showing all sections with progress.

**Usage:**

```tsx
<SectionSidebar
  sections={sectionProgress}
  activeSection={activeSection}
  onSectionClick={setActiveSection}
  isCollapsed={false}
/>
```

### 5. SampleAnswerModal

Modal displaying example answers from PRISMA guidelines.

**Usage:**

```tsx
<SampleAnswerModal isOpen={showModal} onClose={() => setShowModal(false)} data={sampleAnswerData} />
```

### 6. TemplateCustoimzer

Form-based template editor for creating/editing custom checklist templates.

**Usage:**

```tsx
<TemplateCustoimzer
  template={existingTemplate}
  onSave={async (templateData) => {
    // Save template
  }}
  onClose={() => {}}
/>
```

## Pages & Integration

### ChecklistDashboardPage

Shows all checklists for a project. Located at `/projects/:projectId/checklists`

**Features:**

- View existing checklists with progress
- Create new checklist (choose template)
- Delete checklists
- Filter and sort

**Integration Point:** `/src/pages/checklist/ChecklistDashboardWrapper.tsx`

### ChecklistEditorPage

Main editing interface. Located at `/projects/:projectId/checklists/:checklistId`

**Integration Point:** `/src/pages/checklist/ChecklistEditorPage.tsx`

### TemplateManager

Admin page for managing templates. Located at `/admin/templates`

**Features:**

- View built-in templates (read-only)
- Create custom templates
- Edit custom templates
- Delete custom templates

**Integration Point:** `/src/pages/admin/TemplateManager.tsx`

## Hooks

### useChecklistData

State management hook for checklist operations.

```tsx
const {
  sectionProgress, // Progress per section
  updateItemResponse, // Update an item
  getItemResponse, // Get current response
  hasDraftChanges, // Check for unsaved changes
  getDraftChangesToSubmit, // Get all changes
  clearDraftChanges, // Clear after save
} = useChecklistData(checklist);
```

### useChecklistEditorState

UI state management for the editor.

```tsx
const {
  activeSection,
  isSidebarCollapsed,
  isSaving,
  saveError,
  showSampleModal,
  selectedSampleItem,
  setActiveSection,
  toggleSidebar,
  // ... other handlers
} = useChecklistEditorState();
```

## Mock Data

Sample data is provided in `src/constants/checklistData.ts`:

- `PRISMA_2020_MAIN_ITEMS`: 17 main PRISMA items
- `PRISMA_2020_ABSTRACT_ITEMS`: 6 abstract items
- `MOCK_REVIEW_CHECKLIST`: Sample checklist with responses

## Integration Steps

### Step 1: Add Routes

Update your route configuration to include checklist routes:

```tsx
// admin routes
<Route path="/admin/templates" element={<TemplateManager />} />

// project routes
<Route path="/projects/:projectId/checklists" element={<ChecklistDashboardWrapper />} />
<Route path="/projects/:projectId/checklists/:checklistId" element={<ChecklistEditorPage />} />
```

### Step 2: Update ProjectListPage

The checklist column is already added to ProjectTable. The `onChecklistClick` callback navigates to the dashboard:

```tsx
onChecklistClick={(projectId) => {
  navigate(`/projects/${projectId}/checklists`);
}}
```

### Step 3: Connect to API

Replace mock data calls with actual API calls:

**In ChecklistEditorPage.tsx:**

```tsx
const { data: checklist } = useQuery({
  queryKey: ["checklist", checklistId],
  queryFn: async () => {
    const response = await axios.get(`/api/checklists/${checklistId}`);
    return response.data;
  },
});

const handleSave = async (changes) => {
  await axios.post(`/api/checklists/${checklistId}/items`, changes);
};
```

**In ChecklistDashboardWrapper.tsx:**

```tsx
const { data: checklists } = useQuery({
  queryKey: ["checklists", projectId],
  queryFn: async () => {
    const response = await axios.get(`/api/projects/${projectId}/checklists`);
    return response.data;
  },
});
```

### Step 4: API Endpoints Required

Your backend should provide:

```
GET  /api/checklists/:id                    # Get checklist
POST /api/checklists/:id/items              # Save items
POST /api/checklists                        # Create checklist
GET  /api/projects/:projectId/checklists    # List project checklists
GET  /api/templates/:id                     # Get template
GET  /api/templates                         # List templates
POST /api/templates                         # Create template
PUT  /api/templates/:id                     # Update template
DELETE /api/templates/:id                   # Delete template
```

## Styling

All components use **Tailwind CSS v3+** with these color schemes:

- **Primary**: Indigo (indigo-600, indigo-50, etc.)
- **Success**: Emerald (emerald-600, emerald-50, etc.)
- **Error**: Red (red-600, red-50, etc.)
- **Neutral**: Gray/Slate

### Customization

To customize colors, update Tailwind classes in components:

```tsx
// Change primary color from indigo to blue
className = "bg-blue-50 text-blue-600";

// Add custom max-width
className = "max-w-7xl mx-auto";
```

## Features

### ✅ Implemented

- [x] Section-based navigation (7 PRISMA sections)
- [x] Real-time progress tracking
- [x] Auto-save on blur (debounced)
- [x] Sample answers modal
- [x] Desktop + Mobile responsive
- [x] Collapsible sidebar
- [x] Not Applicable / Not Reported flags
- [x] Report location field
- [x] Beautiful, professional UI
- [x] Keyboard friendly
- [x] Loading states
- [x] Error handling
- [x] Template management (CRUD)
- [x] Built-in & custom templates

### 🚀 Future Enhancements

- [ ] Drag & drop to reorder items
- [ ] Rich text editor for content
- [ ] Collaboration features (comments, mentions)
- [ ] Version history / audit trail
- [ ] Multiple export formats (PDF, Word, LaTeX)
- [ ] Real-time sync with other users
- [ ] Item-level permissions
- [ ] Validation rules per item
- [ ] Integration with reference managers
- [ ] AI-powered suggestions

## Performance Optimizations

1. **Debounced Auto-save**: Content updates are debounced by 800ms
2. **Lazy Loading**: Sections load on-demand
3. **Memoization**: Components use React.memo for optimized re-renders
4. **Code Splitting**: Each page can be lazy-loaded at route level

## Accessibility

- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation support
- ✅ Color contrast ratios meet WCAG AA
- ✅ Focus indicators on all buttons
- ✅ Semantic HTML structure

## Testing

To test with mock data:

1. Navigate to `/projects/proj-001/checklists`
2. Create a new checklist (select PRISMA 2020 Main)
3. Edit items and save
4. View progress updates in real-time

## Troubleshooting

### Checklist not loading

- Check that the API endpoints are correctly configured
- Verify authentication token is included in requests
- Check browser console for error messages

### Save not working

- Ensure API endpoint is correct and returns proper response
- Check for network errors in browser DevTools
- Verify checklist ID is correct

### Components not rendering

- Ensure all imports are correct
- Check that Tailwind CSS is properly configured
- Verify React Router setup includes checklist routes

## Support & Questions

For detailed API integration help or questions about the design, refer to:

- Backend API documentation
- Type definitions in `src/types/checklist.ts`
- Mock data in `src/constants/checklistData.ts`
- Component documentation in component files (JSDoc comments)

---

**Last Updated**: 2024
**Version**: 1.0.0
