#!/usr/bin/env node

/**
 * QUICK START - Checklist Module Integration Guide
 * Copy & paste snippets to integrate into your routes and pages
 */

// ============================================================================
// 1. ADD ROUTES TO YOUR ROUTER CONFIGURATION
// ============================================================================

/*
In your main router setup file (e.g., src/App.tsx or src/routes/index.tsx):

import ChecklistEditorPage from '@/pages/checklist/ChecklistEditorPage';
import ChecklistDashboardWrapper from '@/pages/checklist/ChecklistDashboardWrapper';
import TemplateManager from '@/pages/admin/TemplateManager';

// Add these routes:
export const checklistRoutes = [
  {
    path: '/projects/:projectId/checklists',
    element: <ChecklistDashboardWrapper />
  },
  {
    path: '/projects/:projectId/checklists/:checklistId',
    element: <ChecklistEditorPage />
  },
  {
    path: '/admin/templates',
    element: <TemplateManager />
  }
];
*/

// ============================================================================
// 2. UPDATE ADMIN DASHBOARD (Already done!)
// ============================================================================

/*
AdminDashboard.tsx - Menu item already added:

import { MdChecklist } from "react-icons/md";

const menuItems: SidebarItem[] = [
  // ... existing items ...
  { icon: MdChecklist, label: "Checklist Templates", path: "/admin/templates" },
];
*/

// ============================================================================
// 3. CONNECT API IN ChecklistEditorPage
// ============================================================================

/*
In src/pages/checklist/ChecklistEditorPage.tsx:

import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '@/config/axios';

export default function ChecklistEditorPage() {
  const { projectId, checklistId } = useParams<{
    projectId: string;
    checklistId: string;
  }>();

  // Fetch checklist data
  const { data: checklist, isLoading, error } = useQuery({
    queryKey: ['checklist', checklistId],
    queryFn: async () => {
      return (await axios.get(`/api/checklists/${checklistId}`)).data;
    },
    enabled: !!checklistId
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (changes: any[]) => {
      return (await axios.post(`/api/checklists/${checklistId}/items`, { 
        items: changes 
      })).data;
    },
    onSuccess: () => {
      // Show success toast
      console.log('Saved successfully');
    },
    onError: (error) => {
      // Show error toast
      console.error('Save failed:', error);
    }
  });

  // Report generation mutation
  const reportMutation = useMutation({
    mutationFn: async ({ format }: { format: 'word' | 'pdf' }) => {
      const response = await axios.get(
        `/api/checklists/${checklistId}/report`,
        { params: { format }, responseType: 'blob' }
      );
      // Download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `checklist.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    }
  });

  return (
    <ChecklistEditor
      checklist={checklist}
      isLoading={isLoading}
      onSave={(changes) => saveMutation.mutateAsync(changes)}
      onGenerateReport={(format) => reportMutation.mutateAsync({ format })}
    />
  );
}
*/

// ============================================================================
// 4. CONNECT API IN ChecklistDashboardWrapper
// ============================================================================

/*
In src/pages/checklist/ChecklistDashboardWrapper.tsx:

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/config/axios';
import type { ChecklistTemplate } from '@/types/checklist';

export default function ChecklistDashboardWrapper() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  // Fetch checklists
  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['checklists', projectId],
    queryFn: async () => {
      return (await axios.get(
        `/api/projects/${projectId || ''}/checklists`
      )).data;
    }
  });

  // Create checklist mutation
  const createMutation = useMutation({
    mutationFn: async (templateType: ChecklistTemplate) => {
      return (await axios.post('/api/checklists', {
        projectId,
        templateId: templateType,
        title: `New ${templateType} Checklist`
      })).data;
    },
    onSuccess: () => {
      // Refetch checklists
      queryClient.invalidateQueries({ queryKey: ['checklists', projectId] });
    }
  });

  return (
    <ChecklistDashboardPage
      projectId={projectId || ''}
      checklists={checklists}
      isLoading={isLoading}
      onCreateChecklist={(templateType) =>
        createMutation.mutateAsync(templateType)
      }
    />
  );
}
*/

// ============================================================================
// 5. CONNECT API IN TemplateManager
// ============================================================================

/*
In src/pages/admin/TemplateManager.tsx:

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/config/axios';

export default function TemplateManager() {
  const queryClient = useQueryClient();

  // Fetch all templates
  const { data: allTemplates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      return (await axios.get('/api/templates')).data;
    }
  });

  // Save template mutation
  const saveMutation = useMutation({
    mutationFn: async (data: UpdateCustomTemplateRequest) => {
      if (data.id === 'new') {
        return (await axios.post('/api/templates', data)).data;
      } else {
        return (await axios.put(`/api/templates/${data.id}`, data)).data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    }
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      return (await axios.delete(`/api/templates/${templateId}`)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    }
  });

  // Your implementation...
}
*/

// ============================================================================
// 6. USE CHECKLIST DATA HOOK
// ============================================================================

/*
Example of using useChecklistData hook:

import { useChecklistData, useChecklistEditorState } from '@/hooks/useChecklistData';

function MyComponent() {
  const {
    sectionProgress,           // Array of sections with completion stats
    updateItemResponse,        // Function to update item
    getItemResponse,           // Get current response
    hasDraftChanges,           // Check for unsaved changes
    getDraftChangesToSubmit,   // Get all pending changes
    clearDraftChanges,         // Reset after save
  } = useChecklistData(checklist);

  const {
    activeSection,
    toggleSidebar,
    setSaving,
    setError,
    showSample,
    closeSample,
  } = useChecklistEditorState();

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    try {
      const changes = getDraftChangesToSubmit();
      await apiCall(changes);
      clearDraftChanges();
    } catch (error) {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };
}
*/

// ============================================================================
// 7. CUSTOMIZE TEMPLATES (Backend Expected Format)
// ============================================================================

/*
POST /api/templates
{
  "name": "Custom Template Name",
  "description": "Optional description",
  "items": [
    {
      "id": "unique-id",
      "itemNumber": "1",
      "topic": "Item Topic",
      "description": "Full description",
      "section": "TITLE",
      "isRequired": true,
      "isSubItem": false,
      "order": 0,
      "defaultSampleAnswer": "Sample text" // optional
    }
  ]
}
*/

// ============================================================================
// 8. CHECKLIST ITEM RESPONSE FORMAT (What Backend Should Return)
// ============================================================================

/*
GET /api/checklists/{checklistId}
{
  "id": "chk-001",
  "projectId": "proj-001",
  "templateId": "tmpl-prisma-main",
  "templateName": "PRISMA 2020 Main Checklist",
  "title": "Systematic Review Title",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-20T15:30:00Z",
  "completionPercentage": 45,
  "totalItems": 27,
  "completedItems": 12,
  "responses": [
    {
      "id": "resp-123",
      "checklistId": "chk-001",
      "itemTemplateId": "item-1",
      "itemNumber": "1",
      "topic": "Identification as a systematic review",
      "content": "User's answer here...",
      "reportLocation": "Section 1, Page 1",
      "isNotApplicable": false,
      "isNotReported": false,
      "isCompleted": true,
      "lastUpdated": "2024-01-20T15:25:00Z"
    }
  ]
}
*/

// ============================================================================
// 9. ERROR HANDLING EXAMPLE
// ============================================================================

/*
In your API integration:

try {
  const changes = getDraftChangesToSubmit();
  await axios.post(`/api/checklists/${checklistId}/items`, { items: changes });
  clearDraftChanges();
  showToast('Changes saved successfully', 'success');
} catch (error) {
  if (error.response?.status === 404) {
    setError('Checklist not found');
  } else if (error.response?.status === 403) {
    setError('You do not have permission to edit this checklist');
  } else if (error.response?.status === 422) {
    setError('Invalid data. Please check your entries.');
  } else {
    setError('Failed to save changes. Please try again.');
  }
}
*/

// ============================================================================
// 10. TESTING WITH MOCK DATA
// ============================================================================

/*
To test locally without backend:

1. Import mock data:
   import { MOCK_REVIEW_CHECKLIST } from '@/constants/checklistData';

2. Use in development:
   const checklist = process.env.NODE_ENV === 'development' 
     ? MOCK_REVIEW_CHECKLIST 
     : dataFromAPI;

3. Or create a feature flag:
   const useMockData = localStorage.getItem('useMockData') === 'true';
   const checklist = useMockData ? MOCK_REVIEW_CHECKLIST : dataFromAPI;
*/

// ============================================================================
// 11. STYLING CUSTOMIZATION
// ============================================================================

/*
To customize colors, update these searchable strings:

Replace: bg-indigo-*    → with your primary color
Replace: bg-emerald-*   → with your success color
Replace: bg-red-*       → with your error color
Replace: text-indigo-*  → matching primary
Replace: text-emerald-* → matching success

Example: Make primary color blue instead of indigo:
  Search: "bg-indigo-" → Replace with: "bg-blue-"
  Search: "text-indigo-" → Replace with: "text-blue-"
*/

// ============================================================================
// 12. PERFORMANCE TIPS
// ============================================================================

/*
For better performance:

1. Lazy load checklist pages:
   const ChecklistEditor = lazy(() => import('@/pages/checklist/ChecklistEditor'));

2. Use React Query cache:
   staleTime: 5 * 60 * 1000, // 5 minutes

3. Implement virtual scrolling for many items:
   <VirtualList items={items} renderItem={renderItem} />

4. Debounce auto-save (already implemented at 800ms)

5. Use Suspense for loading states:
   <Suspense fallback={<LoadingSpinner />}>
     <ChecklistEditor {...props} />
   </Suspense>
*/

// ============================================================================
// 13. COMMON TASKS
// ============================================================================

// Add new item to template
function addItemToTemplate(template: ChecklistTemplateDetail, newItem: ChecklistItemTemplate) {
  return {
    ...template,
    items: [...template.items, { ...newItem, order: template.items.length }],
    totalItems: template.items.length + 1,
  };
}

// Calculate section progress
function getSectionProgress(checklist: ReviewChecklist, section: ChecklistSection) {
  const sectionItems = checklist.responses.filter(r => r.section === section);
  const completed = sectionItems.filter(r => r.isCompleted).length;
  return {
    completed,
    total: sectionItems.length,
    percentage: sectionItems.length > 0 ? Math.round((completed / sectionItems.length) * 100) : 0,
  };
}

// Export checklist as JSON
function exportChecklistAsJSON(checklist: ReviewChecklist) {
  const blob = new Blob([JSON.stringify(checklist, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `checklist-${checklist.id}.json`;
  link.click();
}

// ============================================================================
// 14. DEBUGGING TIPS
// ============================================================================

/*
To debug:

1. Check if checklist loads:
   console.log('Checklist:', checklist);

2. Monitor save operations:
   console.log('Changes to save:', getDraftChangesToSubmit());

3. Check progress calculation:
   console.log('Section progress:', sectionProgress);

4. Verify API response:
   - Open DevTools → Network tab
   - Look for API calls
   - Check response shape

5. Check browser console:
   - Look for TypeScript errors
   - Check for network errors
   - Look for React warnings
*/

// ============================================================================
// 15. NEXT FEATURES TO IMPLEMENT
// ============================================================================

/*
Future enhancements:

1. [ ] Export to PDF
2. [ ] Export to Word (.docx)
3. [ ] Collaborative editing (real-time sync)
4. [ ] Comments/Notes on items
5. [ ] Item validation (custom rules)
6. [ ] Branching/Conditional items
7. [ ] Version history/Compare versions
8. [ ] Template sharing between projects
9. [ ] Integration with Zotero/Mendeley
10. [ ] AI-powered suggestions
11. [ ] Automated compliance checking
12. [ ] Audit trail/Change tracking
*/
