import React, { useMemo, useState } from "react";
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp, FiSave, FiLayers } from "react-icons/fi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Modal from "../../components/ui/Modal";
import { cn } from "../../utils/cn";
import { buildChecklistTree, flattenChecklistTree, type ChecklistTreeNode } from "./checklistTree";
import type {
  ChecklistItemTemplate,
  ChecklistTemplateDetail,
  ChecklistType,
  ChecklistSection,
  UpdateCustomTemplateSection,
  UpdateCustomTemplateRequest,
} from "../../types/checklist";
import {
  ChecklistType as ChecklistTypeValue,
  PRISMA_SECTIONS,
  SECTION_ORDER,
} from "../../types/checklist";

interface TemplateCustoimzerProps {
  template?: ChecklistTemplateDetail;
  onSave?: (data: UpdateCustomTemplateRequest) => Promise<void>;
  onClose?: () => void;
  isLoading?: boolean;
}

type AddItemMode = "root" | "sub-item";

interface AddChecklistItemInput {
  mode: AddItemMode;
  itemNumber: string;
  topic: string;
  section: ChecklistSection;
  description: string;
  isRequired: boolean;
  hasLocationField: boolean;
  isSectionHeaderOnly: boolean;
  parentId?: string;
}

interface ParentItemOption {
  id: string;
  itemNumber: string;
  topic: string;
  section: ChecklistSection;
}

interface SectionDraft {
  key: ChecklistSection;
  name: string;
  description?: string | null;
  sectionNumber?: string | null;
  order: number;
}

const SECTION_LABEL_TO_KEY = Object.entries(PRISMA_SECTIONS).reduce<
  Record<string, ChecklistSection>
>((acc, [key, value]) => {
  acc[value.toLowerCase()] = key as ChecklistSection;
  return acc;
}, {});

const toChecklistSection = (value: string): ChecklistSection => {
  const raw = value.trim();
  if (!raw) {
    return "OTHER_INFORMATION";
  }

  const normalized = raw.toUpperCase().replace(/\s+/g, "_");
  if (SECTION_ORDER.includes(normalized as ChecklistSection)) {
    return normalized as ChecklistSection;
  }

  const fromLabel = SECTION_LABEL_TO_KEY[raw.toLowerCase()];
  return (fromLabel ?? raw) as ChecklistSection;
};

const getSectionDisplayName = (section: ChecklistSection): string => {
  return PRISMA_SECTIONS[section as keyof typeof PRISMA_SECTIONS] ?? String(section);
};

const ORDER_GAP = 1000;

const getNextRootItemNumber = (
  section: ChecklistSection,
  flatItems: ChecklistItemTemplate[],
): string => {
  const rootNumbers = flatItems
    .filter((item) => item.section === section && !item.parentId)
    .map((item) => Number.parseInt(item.itemNumber, 10))
    .filter((value) => Number.isFinite(value));

  if (rootNumbers.length === 0) {
    return "1";
  }

  return String(Math.max(...rootNumbers) + 1);
};

const getNextSubItemNumber = (parentNumber: string, siblingCount: number): string => {
  return `${parentNumber}.${siblingCount + 1}`;
};

/**
 * Recomputes order after structural changes.
 * Root items are ordered first, then each root's children in sequence.
 */
const normalizeChecklistOrder = (flatItems: ChecklistItemTemplate[]): ChecklistItemTemplate[] => {
  const tree = buildChecklistTree(flatItems);
  const flattened = flattenChecklistTree(tree);

  return flattened.map((item, index) => ({
    ...item,
    order: index * ORDER_GAP,
  }));
};

/**
 * Recursively collects descendant ids for safe parent deletion.
 */
const collectDescendantIds = (node: ChecklistTreeNode): string[] => {
  return node.children.reduce<string[]>((acc, child) => {
    acc.push(child.id);
    acc.push(...collectDescendantIds(child));
    return acc;
  }, []);
};

const findNodeById = (nodes: ChecklistTreeNode[], id: string): ChecklistTreeNode | null => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    if (node.children.length > 0) {
      const nested = findNodeById(node.children, id);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
};

/**
 * Moves a root item (and its whole subtree) up/down among other roots.
 */
const reorderRootNodes = (
  roots: ChecklistTreeNode[],
  itemId: string,
  direction: "up" | "down",
): ChecklistTreeNode[] => {
  const index = roots.findIndex((node) => node.id === itemId);
  if (index < 0) return roots;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= roots.length) return roots;

  const updated = [...roots];
  [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
  return updated;
};

/**
 * Moves a sub-item among siblings under the same parent.
 */
const reorderSubNodes = (
  roots: ChecklistTreeNode[],
  parentId: string,
  itemId: string,
  direction: "up" | "down",
): ChecklistTreeNode[] => {
  return roots.map((root) => {
    if (root.id === parentId) {
      const children = [...root.children];
      const index = children.findIndex((child) => child.id === itemId);
      if (index < 0) return root;

      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= children.length) return root;

      [children[index], children[swapIndex]] = [children[swapIndex], children[index]];
      return { ...root, children };
    }

    if (root.children.length === 0) {
      return root;
    }

    return {
      ...root,
      children: reorderSubNodes(root.children, parentId, itemId, direction),
    };
  });
};

/**
 * Template Customizer for creating and editing PRISMA checklist templates
 * Supports reordering, adding/removing items, and editing descriptions
 */
const TemplateCustoimzerInner: React.FC<TemplateCustoimzerProps> = ({
  template,
  onSave,
  onClose,
  isLoading = false,
}) => {
  const [templateName, setTemplateName] = useState(template?.name || "");
  const [templateDescription, setTemplateDescription] = useState(template?.description || "");
  const [checklistType, setChecklistType] = useState<ChecklistType>(
    template?.type ?? ChecklistTypeValue.FULL,
  );
  const [items, setItems] = useState<ChecklistItemTemplate[]>(template?.items || []);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [addItemSessionId, setAddItemSessionId] = useState(0);
  const [addItemMode, setAddItemMode] = useState<AddItemMode>("root");
  const [addItemParentItem, setAddItemParentItem] = useState<ParentItemOption | undefined>();
  const [newSectionName, setNewSectionName] = useState("");
  const [sections, setSections] = useState<SectionDraft[]>(() => {
    const fromTemplate = (template?.sections ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((section) => ({
        key: toChecklistSection(section.name),
        name: section.name,
        description: section.description ?? null,
        sectionNumber: section.sectionNumber,
        order: section.order,
      }));

    if (fromTemplate.length > 0) {
      return fromTemplate;
    }

    const fromItems = (template?.items ?? [])
      .map((item) => item.section)
      .filter((section, index, arr) => arr.indexOf(section) === index)
      .map((section, index) => ({
        key: section,
        name: getSectionDisplayName(section),
        description: null,
        sectionNumber: String(index + 1),
        order: index + 1,
      }));

    return fromItems;
  });
  const [preferredSectionForAdd, setPreferredSectionForAdd] = useState<ChecklistSection>(() =>
    toChecklistSection(sections[0]?.key ?? template?.items?.[0]?.section ?? "TITLE"),
  );

  // Build a sorted tree for hierarchical rendering while keeping editable state flat.
  const checklistTree = useMemo(() => buildChecklistTree(items), [items]);
  const displayedSections = useMemo(
    () =>
      sections
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((section) => ({
          section: section.key,
          label: section.sectionNumber ? `${section.sectionNumber}. ${section.name}` : section.name,
          description: section.description ?? undefined,
          nodes: checklistTree.filter((node) => node.section === section.key),
        })),
    [checklistTree, sections],
  );
  const normalizedNewSectionName = newSectionName.trim().replace(/\s+/g, " ");
  const hasDuplicateSectionName = useMemo(
    () =>
      sections.some(
        (section) => section.name.toLowerCase() === normalizedNewSectionName.toLowerCase(),
      ),
    [normalizedNewSectionName, sections],
  );

  const handleAddSection = () => {
    const sectionName = normalizedNewSectionName;
    if (!sectionName) {
      return;
    }

    const sectionKey = toChecklistSection(sectionName);
    const nextOrder = sections.length + 1;

    setSections((prev) => [
      ...prev,
      {
        key: sectionKey,
        name: sectionName,
        description: null,
        sectionNumber: String(nextOrder),
        order: nextOrder,
      },
    ]);
    setPreferredSectionForAdd(sectionKey);
    setNewSectionName("");
  };

  const handleRemoveSection = (section: ChecklistSection) => {
    setItems((prevItems) =>
      normalizeChecklistOrder(prevItems.filter((item) => item.section !== section)),
    );
    setSections((prev) => {
      const next = prev
        .filter((current) => current.key !== section)
        .map((current, index) => ({
          ...current,
          order: index + 1,
          sectionNumber: String(index + 1),
        }));

      if (next.length > 0) {
        return next;
      }

      return [];
    });
    setPreferredSectionForAdd((prev) => {
      if (prev !== section) {
        return prev;
      }

      return sections.find((current) => current.key !== section)?.key ?? "TITLE";
    });
  };

  const handleSaveTemplate = async () => {
    if (!onSave) return;

    const normalizedItems = normalizeChecklistOrder(items).map((item) => {
      const isGroupingItem = Boolean(item.isSectionHeaderOnly);

      return {
        ...item,
        hasLocationField:
          isGroupingItem || checklistType === ChecklistTypeValue.ABSTRACT
            ? false
            : (item.hasLocationField ?? true),
      };
    });

    const data: UpdateCustomTemplateRequest = {
      id: template?.id || "new",
      name: templateName,
      description: templateDescription,
      type: checklistType,
      sections: sections
        .slice()
        .sort((a, b) => a.order - b.order)
        .map<UpdateCustomTemplateSection>((section, index) => ({
          key: section.key,
          name: section.name,
          description: section.description ?? null,
          order: index + 1,
          sectionNumber: section.sectionNumber ?? String(index + 1),
        })),
      items: normalizedItems,
    };

    await onSave(data);
    onClose?.();
  };

  const handleAddItem = (newItem: AddChecklistItemInput) => {
    setItems((prevItems) => {
      const parentItem =
        newItem.mode === "sub-item"
          ? prevItems.find((item) => item.id === newItem.parentId)
          : undefined;
      const resolvedSection =
        newItem.mode === "sub-item" && parentItem ? parentItem.section : newItem.section;
      const trimmedItemNumber = newItem.itemNumber.trim();
      const autoItemNumber = (() => {
        if (trimmedItemNumber) {
          return trimmedItemNumber;
        }

        if (newItem.mode === "sub-item" && parentItem) {
          const siblingCount = prevItems.filter((item) => item.parentId === parentItem.id).length;
          return getNextSubItemNumber(parentItem.itemNumber, siblingCount);
        }

        return getNextRootItemNumber(resolvedSection, prevItems);
      })();

      // Grouping/header-only items are organizational and should not carry response-oriented fields.
      const isSectionHeaderOnly = newItem.mode === "sub-item" ? false : newItem.isSectionHeaderOnly;
      const hasLocationField =
        isSectionHeaderOnly || checklistType === ChecklistTypeValue.ABSTRACT
          ? false
          : newItem.hasLocationField;

      const nextItem: ChecklistItemTemplate = {
        id: `${Date.now()}`,
        itemNumber: autoItemNumber,
        topic: newItem.topic,
        description: newItem.description,
        section: resolvedSection,
        isRequired: newItem.isRequired,
        isSubItem: newItem.mode === "sub-item",
        parentId: newItem.mode === "sub-item" ? newItem.parentId : undefined,
        isSectionHeaderOnly,
        hasLocationField,
        defaultSampleAnswer: isSectionHeaderOnly ? undefined : "",
        order: prevItems.length * ORDER_GAP,
      };

      return normalizeChecklistOrder([...prevItems, nextItem]);
    });

    setShowAddItemModal(false);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((prevItems) => {
      const tree = buildChecklistTree(prevItems);
      const nodeToDelete = findNodeById(tree, itemId);
      if (!nodeToDelete) {
        return prevItems;
      }

      const childIds = collectDescendantIds(nodeToDelete);
      const blockedIds = new Set([itemId, ...childIds]);

      return normalizeChecklistOrder(prevItems.filter((item) => !blockedIds.has(item.id)));
    });
  };

  const handleReorderItem = (itemId: string, direction: "up" | "down") => {
    setItems((prevItems) => {
      const tree = buildChecklistTree(prevItems);
      const flat = flattenChecklistTree(tree);
      const target = flat.find((item) => item.id === itemId);

      if (!target) {
        return prevItems;
      }

      const nextTree = target.parentId
        ? reorderSubNodes(tree, target.parentId, itemId, direction)
        : reorderRootNodes(tree, itemId, direction);

      return normalizeChecklistOrder(flattenChecklistTree(nextTree));
    });
  };

  const handleUpdateItem = (itemId: string, updates: Partial<ChecklistItemTemplate>) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const merged = { ...item, ...updates };
        const isGroupingItem = Boolean(merged.isSectionHeaderOnly) || Boolean(merged.hasChildren);

        if (isGroupingItem || checklistType === ChecklistTypeValue.ABSTRACT) {
          return { ...merged, hasLocationField: false };
        }

        return merged;
      }),
    );
  };

  const renderTreeNodes = (nodes: ChecklistTreeNode[], depth = 0) => {
    return nodes.map((node, index) => (
      <React.Fragment key={node.id}>
        <TemplateItemEditor
          item={node}
          sectionOptions={sections.map((section) => section.key)}
          isSubItem={depth > 0}
          depth={depth}
          isExpanded={expandedItemId === node.id}
          onToggleExpand={() => setExpandedItemId(expandedItemId === node.id ? null : node.id)}
          onUpdate={(updates) => handleUpdateItem(node.id, updates)}
          onDelete={() => handleDeleteItem(node.id)}
          onMoveUp={() => handleReorderItem(node.id, "up")}
          onMoveDown={() => handleReorderItem(node.id, "down")}
          onAddSubItem={() => {
            setAddItemMode("sub-item");
            setAddItemParentItem({
              id: node.id,
              itemNumber: node.itemNumber,
              topic: node.topic,
              section: node.section,
            });
            setPreferredSectionForAdd(node.section);
            setAddItemSessionId((prev) => prev + 1);
            setShowAddItemModal(true);
          }}
          canMoveUp={index > 0}
          canMoveDown={index < nodes.length - 1}
          canAddSubItem={!node.isSubItem || Boolean(node.isSectionHeaderOnly)}
          checklistType={checklistType}
          isLoading={isLoading}
        />

        {node.children.length > 0 && (
          <div
            className={cn(
              "space-y-3",
              depth === 0
                ? "ml-8 pl-5 border-l-2 border-slate-200"
                : "ml-6 pl-4 border-l border-slate-200",
            )}
          >
            {renderTreeNodes(node.children, depth + 1)}
          </div>
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {template ? "Edit Template" : "Create Template"}
        </h1>

        {/* Template Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., PRISMA 2020 Main Checklist"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <Textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Optional description of this template"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Checklist Type</label>
            <select
              value={checklistType}
              onChange={(event) => setChecklistType(Number(event.target.value) as ChecklistType)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            >
              <option value={ChecklistTypeValue.FULL}>Full</option>
              <option value={ChecklistTypeValue.ABSTRACT}>Abstract</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Full mode keeps location fields (except grouping/header items). Abstract mode disables
              location fields for all response items.
            </p>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-xl font-semibold text-gray-900">Checklist Items ({items.length})</h2>
          <div className="flex items-center gap-2">
            <Input
              value={newSectionName}
              onChange={(event) => setNewSectionName(event.target.value)}
              placeholder="New section name"
              disabled={isLoading}
              className="min-w-[220px]"
            />
            <Button
              onClick={handleAddSection}
              size="sm"
              variant="secondary"
              className="inline-flex items-center gap-2"
              disabled={isLoading || !normalizedNewSectionName || hasDuplicateSectionName}
              title={hasDuplicateSectionName ? "Section name already exists" : undefined}
            >
              <FiPlus className="w-4 h-4" />
              Add Section
            </Button>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {displayedSections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No sections yet. Add a section to get started.</p>
            </div>
          ) : (
            displayedSections.map((group) => (
              <section key={group.section} className="space-y-3">
                <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-xs border-b border-gray-200 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold tracking-wide text-gray-800 uppercase">
                        {group.label}
                      </h3>
                      {group.description && (
                        <span className="text-xs text-gray-500 max-w-[40ch] truncate">
                          {group.description}
                        </span>
                      )}
                      <span className="text-xs font-medium text-gray-600">
                        {group.nodes.length} item{group.nodes.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          setAddItemMode("root");
                          setAddItemParentItem(undefined);
                          setPreferredSectionForAdd(group.section);
                          setAddItemSessionId((prev) => prev + 1);
                          setShowAddItemModal(true);
                        }}
                        size="sm"
                        variant="secondary"
                        className="inline-flex items-center gap-1"
                        disabled={isLoading}
                      >
                        <FiPlus className="w-4 h-4" />
                        Add Item
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(group.section)}
                        className="px-2 py-1 text-xs rounded-md text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                        disabled={isLoading}
                        title="Remove section and its items"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                {group.nodes.length > 0 ? (
                  renderTreeNodes(group.nodes)
                ) : (
                  <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4">
                    No items in this section yet. Use Add Item to create top-level items.
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6 -mb-6">
        <Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleSaveTemplate}
          disabled={isLoading || !templateName.trim()}
          className="flex-1 inline-flex items-center justify-center gap-2"
        >
          <FiSave className="w-4 h-4" />
          {isLoading ? "Saving..." : "Save Template"}
        </Button>
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        key={addItemSessionId}
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onAdd={handleAddItem}
        existingItems={items}
        existingItemNumbers={items.map((item) => item.itemNumber)}
        mode={addItemMode}
        section={preferredSectionForAdd}
        parentItem={addItemParentItem}
        checklistType={checklistType}
      />
    </div>
  );
};

/**
 * Component for editing a single template item
 */
interface TemplateItemEditorProps {
  item: ChecklistTreeNode;
  sectionOptions: ChecklistSection[];
  isSubItem: boolean;
  depth: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<ChecklistItemTemplate>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddSubItem: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canAddSubItem: boolean;
  checklistType: ChecklistType;
  isLoading?: boolean;
}

const TemplateItemEditor: React.FC<TemplateItemEditorProps> = ({
  item,
  sectionOptions,
  isSubItem,
  depth,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddSubItem,
  canMoveUp,
  canMoveDown,
  canAddSubItem,
  checklistType,
  isLoading = false,
}) => {
  const depthClass = depth > 1 ? "ml-6" : depth === 1 ? "ml-2" : "";
  const isGroupingItem = Boolean(item.isSectionHeaderOnly) || (item.children?.length ?? 0) > 0;
  const isAbstractType = checklistType === ChecklistTypeValue.ABSTRACT;

  return (
    <div
      className={cn(
        "border rounded-lg p-4 transition-colors",
        depthClass,
        isGroupingItem
          ? "bg-amber-50 border-amber-200"
          : isSubItem
            ? "bg-slate-50 border-slate-200"
            : "bg-white border-gray-200 shadow-sm",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-3 flex-1">
          <span
            className={cn(
              "font-bold text-indigo-600 min-w-fit",
              isSubItem ? "text-base" : "text-lg",
            )}
          >
            {item.itemNumber}
          </span>
          <h3 className={cn("text-gray-900", isSubItem ? "text-sm font-medium" : "font-semibold")}>
            {item.topic}
          </h3>
          {isGroupingItem && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 inline-flex items-center gap-1">
              <FiLayers className="w-3 h-3" /> Grouping / Header Only
            </span>
          )}
          {isSubItem && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
              Sub-item
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp || isLoading}
            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 transition-colors"
            title="Move up"
          >
            <FiChevronUp className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown || isLoading}
            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 transition-colors"
            title="Move down"
          >
            <FiChevronDown className="w-4 h-4 text-gray-600" />
          </button>
          {canAddSubItem && (
            <button
              type="button"
              onClick={onAddSubItem}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50"
              title="Add sub-item"
            >
              <FiLayers className="w-4 h-4" />
              Add Sub-item
            </button>
          )}
          <button
            onClick={onToggleExpand}
            className="px-2 py-1 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? "Hide" : "Show"}
          </button>
          <button
            onClick={onDelete}
            disabled={isLoading}
            className="p-1.5 hover:bg-red-100 rounded text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Delete item"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="space-y-3 pt-3 border-t border-gray-200">
          {isGroupingItem && (
            <div className="rounded-md border border-amber-200 bg-amber-100/70 px-3 py-2 text-xs text-amber-900">
              This item is a grouping header. Users will not enter responses here - only fill its
              sub-items.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Section</label>
              <select
                value={item.section}
                onChange={(e) => onUpdate({ section: e.target.value as ChecklistSection })}
                disabled={isLoading}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white"
              >
                {Array.from(new Set([...sectionOptions, item.section])).map((section) => (
                  <option key={section} value={section}>
                    {getSectionDisplayName(section)}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={item.isRequired}
                onChange={(e) => onUpdate({ isRequired: e.target.checked })}
                disabled={isLoading}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 font-medium">Required</span>
            </label>
          </div>

          {!isGroupingItem && !isAbstractType && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={item.hasLocationField !== false}
                onChange={(e) => onUpdate({ hasLocationField: e.target.checked })}
                disabled={isLoading}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 font-medium">Has Location Field</span>
            </label>
          )}

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
            <Textarea
              value={item.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              disabled={isLoading}
              rows={3}
              className="text-sm"
            />
            {isGroupingItem && (
              <p className="text-xs text-sky-700 mt-1">(Grouping item - fill sub-items below)</p>
            )}
          </div>

          {!isGroupingItem && item.defaultSampleAnswer && (
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Sample Answer</label>
              <Textarea
                value={item.defaultSampleAnswer}
                onChange={(e) => onUpdate({ defaultSampleAnswer: e.target.value })}
                disabled={isLoading}
                rows={2}
                className="text-sm"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Modal for adding a new checklist item
 */
interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: AddChecklistItemInput) => void;
  existingItems: ChecklistItemTemplate[];
  existingItemNumbers?: string[];
  mode: AddItemMode;
  section: ChecklistSection;
  parentItem?: ParentItemOption;
  checklistType: ChecklistType;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingItems,
  existingItemNumbers = [],
  mode,
  section,
  parentItem,
  checklistType,
}) => {
  const [itemNumber, setItemNumber] = useState("");
  const [topic, setTopic] = useState("");
  const [selectedSection, setSelectedSection] = useState<ChecklistSection>(section);
  const [description, setDescription] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [itemKind, setItemKind] = useState<"normal" | "grouping">("normal");
  const [hasLocationField, setHasLocationField] = useState(true);

  const effectiveKind = mode === "sub-item" ? "normal" : itemKind;
  const isAbstractType = checklistType === ChecklistTypeValue.ABSTRACT;

  const resolvedSection = mode === "sub-item" && parentItem ? parentItem.section : selectedSection;

  const suggestedItemNumber = useMemo(() => {
    if (mode === "sub-item" && parentItem) {
      const siblingCount = existingItems.filter((item) => item.parentId === parentItem.id).length;
      return getNextSubItemNumber(parentItem.itemNumber, siblingCount);
    }

    return getNextRootItemNumber(resolvedSection, existingItems);
  }, [existingItems, mode, parentItem, resolvedSection]);

  const candidateItemNumber = itemNumber.trim() || suggestedItemNumber;

  const handleCloseModal = () => {
    setItemNumber("");
    setTopic("");
    setDescription("");
    setIsRequired(true);
    setHasLocationField(true);
    setItemKind("normal");
    onClose();
  };

  const applySuggestedNumber = () => {
    setItemNumber(suggestedItemNumber);
  };

  const handleAdd = () => {
    if (!topic.trim()) return;
    if (mode === "sub-item" && !parentItem) return;

    const resolvedItemNumber = itemNumber.trim() || suggestedItemNumber;

    onAdd({
      mode,
      itemNumber: resolvedItemNumber,
      topic,
      description,
      section: resolvedSection,
      isRequired,
      hasLocationField: effectiveKind === "normal" && !isAbstractType ? hasLocationField : false,
      isSectionHeaderOnly: effectiveKind === "grouping",
      parentId: mode === "sub-item" ? parentItem?.id : undefined,
    });

    handleCloseModal();
  };

  const isDuplicateItemNumber = existingItemNumbers.some(
    (existingItemNumber) => existingItemNumber.toLowerCase() === candidateItemNumber.toLowerCase(),
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title={mode === "sub-item" ? "Add Sub-item" : "Add Root Item"}
      size="md"
    >
      <div className="space-y-4">
        {mode === "sub-item" && parentItem && (
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
            Adding as sub-item under: {parentItem.itemNumber} - {parentItem.topic}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Item Kind</label>
          {mode === "sub-item" ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              Normal Item only
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setItemKind("normal")}
                className={cn(
                  "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                  effectiveKind === "normal"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
                )}
              >
                Normal Item
              </button>
              <button
                type="button"
                onClick={() => setItemKind("grouping")}
                className={cn(
                  "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                  effectiveKind === "grouping"
                    ? "border-amber-300 bg-amber-50 text-amber-800"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
                )}
              >
                Grouping Item
              </button>
            </div>
          )}

          {effectiveKind === "grouping" ? (
            <p className="mt-2 text-xs text-amber-800 bg-amber-100 border border-amber-200 rounded-md px-2 py-1">
              This item is a header only. Users will not enter responses here, and sub-items can be
              added underneath it.
            </p>
          ) : mode === "sub-item" ? (
            <p className="mt-2 text-xs text-gray-600">Sub-items are always Normal Items.</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Number</label>
            <div className="flex gap-2">
              <Input
                value={itemNumber}
                onChange={(e) => setItemNumber(e.target.value)}
                placeholder={suggestedItemNumber}
              />
              <Button type="button" variant="secondary" onClick={applySuggestedNumber}>
                Use Suggested
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Suggested: {suggestedItemNumber}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <select
              value={resolvedSection}
              onChange={(e) => setSelectedSection(e.target.value as ChecklistSection)}
              disabled={mode === "sub-item"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            >
              {Array.from(
                new Set([resolvedSection, ...existingItems.map((item) => item.section)]),
              ).map((section) => (
                <option key={section} value={section}>
                  {getSectionDisplayName(section)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Study design"
          />
        </div>

        {isDuplicateItemNumber && (
          <p className="text-sm text-red-600">This item number already exists in the template.</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Full item description"
            rows={4}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isRequired}
            onChange={(e) => setIsRequired(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700 font-medium">Required</span>
        </label>

        {effectiveKind === "normal" && !isAbstractType && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasLocationField}
              onChange={(e) => setHasLocationField(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700 font-medium">Has Location Field</span>
          </label>
        )}

        {effectiveKind === "normal" && isAbstractType && (
          <p className="text-xs text-gray-600">
            Abstract type disables location fields for all response items.
          </p>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={handleCloseModal} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={
              !topic.trim() || isDuplicateItemNumber || (mode === "sub-item" && !parentItem)
            }
            className="flex-1"
          >
            {mode === "sub-item" ? "Add Sub-item" : "Add Root Item"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const TemplateCustoimzer: React.FC<TemplateCustoimzerProps> = (props) => {
  return <TemplateCustoimzerInner key={props.template?.id ?? "new"} {...props} />;
};

export default TemplateCustoimzer;
