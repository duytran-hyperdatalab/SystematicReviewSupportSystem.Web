import React, { useMemo, useState } from "react";
import { FiPlus, FiChevronLeft, FiCopy } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import TemplateCustoimzer from "./TemplateCustoimzer";
import { checklistApi } from "../../services/checklistService";
import { cn } from "../../utils/cn";
import { ChecklistTemplate, PRISMA_SECTIONS } from "../../types/checklist";
import { buildChecklistTree, flattenChecklistTree, type ChecklistTreeNode } from "./checklistTree";
import type {
  ChecklistItemTemplate,
  ChecklistSection,
  ChecklistTemplateSection,
  ChecklistTemplateDetail,
  UpdateCustomTemplateSection,
  UpdateCustomTemplateRequest,
} from "../../types/checklist";
import type {
  ChecklistItemTemplateDto,
  ChecklistType as ApiChecklistType,
  ChecklistTemplateDetailDto,
  ChecklistTemplateSummaryDto,
  CreateChecklistItemTemplateDto,
  CreateChecklistSectionTemplateDto,
  CreateChecklistTemplateDto,
} from "../../types/checklistApi";
import { ChecklistType as ChecklistTypeValue } from "../../types/checklistApi";
import { toastError, toastSuccess } from "../../utils/toast";

const CHECKLIST_SECTIONS: ChecklistSection[] = [
  "TITLE",
  "ABSTRACT",
  "INTRODUCTION",
  "METHODS",
  "RESULTS",
  "DISCUSSION",
  "OTHER_INFORMATION",
];

const DEFAULT_TEMPLATE_VERSION = "1.0.0";

const SECTION_LABEL_TO_KEY = Object.entries(PRISMA_SECTIONS).reduce<
  Record<string, ChecklistSection>
>((acc, [key, value]) => {
  acc[value.toLowerCase()] = key as ChecklistSection;
  return acc;
}, {});

const isChecklistSection = (value: string): value is ChecklistSection => {
  return CHECKLIST_SECTIONS.includes(value as ChecklistSection);
};

const toChecklistSection = (value: string): ChecklistSection => {
  const raw = value.trim();
  if (!raw) {
    return "OTHER_INFORMATION";
  }

  if (isChecklistSection(raw)) {
    return raw;
  }

  const fromLabel = SECTION_LABEL_TO_KEY[raw.toLowerCase()];
  if (fromLabel) {
    return fromLabel;
  }

  const normalized = raw.replace(/\s+/g, "_").toUpperCase();
  if (isChecklistSection(normalized)) {
    return normalized;
  }

  return raw as ChecklistSection;
};

const toSectionLabel = (section: ChecklistSection): string => {
  return PRISMA_SECTIONS[section as keyof typeof PRISMA_SECTIONS] ?? String(section);
};

const withHierarchyResponseFlags = (items: ChecklistItemTemplate[]): ChecklistItemTemplate[] => {
  const parentIds = new Set(
    items.filter((item) => item.parentId).map((item) => item.parentId as string),
  );

  return items.map((item) => {
    const hasChildren = parentIds.has(item.id);
    const isSectionHeaderOnly = hasChildren;
    const canRespond = !hasChildren && !isSectionHeaderOnly;

    return {
      ...item,
      hasChildren,
      isSectionHeaderOnly,
      canRespond,
    };
  });
};

const flattenNestedItems = (
  items: ChecklistItemTemplateDto[],
  fallbackSection: ChecklistSection,
  parentId?: string,
): ChecklistItemTemplate[] => {
  return items.flatMap((item) => {
    const section = toChecklistSection(item.section || fallbackSection);
    const mappedItem: ChecklistItemTemplate = {
      id: item.id,
      itemNumber: item.itemNumber,
      topic: item.topic,
      description: item.description,
      section,
      isRequired: item.isRequired,
      isSubItem: Boolean(parentId),
      parentId,
      defaultSampleAnswer: item.defaultSampleAnswer ?? undefined,
      hasLocationField: item.hasLocationField,
      isSectionHeaderOnly: item.isSectionHeaderOnly,
      hasChildren: item.hasChildren,
      canRespond: item.canRespond,
      order: item.order,
    };

    const children =
      item.children.length > 0 ? flattenNestedItems(item.children, section, item.id) : [];

    return [mappedItem, ...children];
  });
};

const mapTreeNodeToCreateItem = (
  node: ChecklistTreeNode,
  sectionName: string,
  checklistType: ApiChecklistType,
): CreateChecklistItemTemplateDto => {
  const hasChildren = node.children.length > 0;
  const hasLocationField = hasChildren
    ? false
    : checklistType === ChecklistTypeValue.ABSTRACT
      ? false
      : (node.hasLocationField ?? true);

  return {
    itemNumber: node.itemNumber,
    section: sectionName,
    topic: node.topic,
    description: node.description,
    order: node.order,
    isRequired: node.isRequired,
    hasLocationField,
    isSectionHeaderOnly: hasChildren,
    defaultSampleAnswer: node.defaultSampleAnswer ?? null,
    parentItemNumber: null,
    subItems: node.children.map((child) =>
      mapTreeNodeToCreateItem(child, sectionName, checklistType),
    ),
  };
};

const toLegacyCreateItems = (
  items: ChecklistItemTemplate[],
  checklistType: ApiChecklistType,
): CreateChecklistItemTemplateDto[] => {
  const parentItemNumberById = new Map<string, string>();
  const parentIds = new Set(
    items.filter((item) => item.parentId).map((item) => item.parentId as string),
  );

  items.forEach((item) => {
    parentItemNumberById.set(item.id, item.itemNumber);
  });

  return items.map((item, index) => ({
    itemNumber: item.itemNumber,
    section: toSectionLabel(item.section),
    topic: item.topic,
    description: item.description,
    order: index,
    isRequired: item.isRequired,
    hasLocationField:
      parentIds.has(item.id) || checklistType === ChecklistTypeValue.ABSTRACT
        ? false
        : (item.hasLocationField ?? true),
    isSectionHeaderOnly: parentIds.has(item.id),
    defaultSampleAnswer: item.defaultSampleAnswer ?? null,
    parentItemNumber: item.parentId ? (parentItemNumberById.get(item.parentId) ?? null) : null,
    subItems: [],
  }));
};

const mapTemplateDetail = (template: ChecklistTemplateDetailDto): ChecklistTemplateDetail => {
  const mappedSections: ChecklistTemplateSection[] = (template.sections ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((section) => {
      const sectionKey = toChecklistSection(section.name);
      const flattenedItems = flattenNestedItems(section.items, sectionKey);

      return {
        id: section.id,
        templateId: section.templateId,
        name: section.name,
        description: section.description ?? null,
        order: section.order,
        sectionNumber: section.sectionNumber,
        items: withHierarchyResponseFlags(flattenedItems),
      };
    });

  const sectionItems = (template.sections ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .flatMap((section) => flattenNestedItems(section.items, toChecklistSection(section.name)));

  const fallbackFlatItems = template.items.map((item) => ({
    id: item.id,
    itemNumber: item.itemNumber,
    topic: item.topic,
    description: item.description,
    section: toChecklistSection(item.section),
    isRequired: item.isRequired,
    isSubItem: Boolean(item.parentId),
    parentId: item.parentId ?? undefined,
    defaultSampleAnswer: item.defaultSampleAnswer ?? undefined,
    hasLocationField: item.hasLocationField,
    isSectionHeaderOnly: item.isSectionHeaderOnly,
    hasChildren: item.hasChildren,
    canRespond: item.canRespond,
    order: item.order,
  }));

  const normalizedItems = withHierarchyResponseFlags(
    flattenChecklistTree(
      buildChecklistTree(sectionItems.length > 0 ? sectionItems : fallbackFlatItems),
    ),
  );

  return {
    id: template.id,
    name: template.name,
    description: template.description ?? "",
    type: template.type ?? ChecklistTypeValue.FULL,
    version: template.version,
    isSystem: template.isSystem,
    templateType: template.isSystem
      ? (template.type ?? ChecklistTypeValue.FULL) === ChecklistTypeValue.ABSTRACT
        ? ChecklistTemplate.PRISMA_2020_ABSTRACT
        : ChecklistTemplate.PRISMA_2020_MAIN
      : ChecklistTemplate.CUSTOM,
    isCustom: !template.isSystem,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    sections: mappedSections,
    items: normalizedItems,
    totalItems: normalizedItems.length,
  };
};

const toCreateTemplateRequest = (data: UpdateCustomTemplateRequest): CreateChecklistTemplateDto => {
  const tree = buildChecklistTree(withHierarchyResponseFlags(data.items));
  const templateType: ApiChecklistType = data.type ?? ChecklistTypeValue.FULL;
  const requestedSections: UpdateCustomTemplateSection[] =
    data.sections && data.sections.length > 0
      ? data.sections
      : Array.from(new Set(data.items.map((item) => item.section))).map((section, index) => ({
          key: section,
          name: toSectionLabel(section),
          description: null,
          order: index + 1,
          sectionNumber: String(index + 1),
        }));

  const sections = requestedSections
    .slice()
    .sort((a, b) => a.order - b.order)
    .map(
      (section, index): CreateChecklistSectionTemplateDto => ({
        name: section.name,
        description: section.description ?? null,
        order: index + 1,
        sectionNumber: section.sectionNumber ?? String(index + 1),
        items: tree
          .filter((rootNode) => rootNode.section === section.key)
          .map((rootNode) => mapTreeNodeToCreateItem(rootNode, section.name, templateType)),
      }),
    );

  return {
    name: data.name,
    description: data.description ?? null,
    type: templateType,
    version: DEFAULT_TEMPLATE_VERSION,
    sections,
    // Keep legacy payload for backend compatibility while frontend migrates to section flow.
    items: toLegacyCreateItems(data.items, templateType),
  };
};

export default function TemplateManager() {
  const queryClient = useQueryClient();
  const [showEditor, setShowEditor] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const templatesQuery = useQuery<ChecklistTemplateSummaryDto[]>({
    queryKey: ["checklist-template-summaries"],
    queryFn: () => checklistApi.getTemplates(),
  });

  const templateDetailQuery = useQuery<ChecklistTemplateDetailDto | null>({
    queryKey: ["checklist-template-detail", selectedTemplateId],
    queryFn: async () => {
      if (!selectedTemplateId) return null;
      return checklistApi.getTemplateById(selectedTemplateId);
    },
    enabled: Boolean(selectedTemplateId),
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: UpdateCustomTemplateRequest) => {
      return checklistApi.createCustomTemplate(toCreateTemplateRequest(data));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["checklist-template-summaries"] });
      toastSuccess("Template saved", "The custom checklist template has been created.");
      setShowEditor(false);
      setSelectedTemplateId(null);
    },
    onError: (error) => {
      toastError(
        "Template save failed",
        error instanceof Error ? error.message : "Unable to save template",
      );
    },
  });

  const selectedTemplate = useMemo(
    () => (templateDetailQuery.data ? mapTemplateDetail(templateDetailQuery.data) : undefined),
    [templateDetailQuery.data],
  );

  if (showEditor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <button
            onClick={() => {
              setShowEditor(false);
              setSelectedTemplateId(null);
            }}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <FiChevronLeft className="w-5 h-5" />
            Back to Templates
          </button>
        </div>
        <TemplateCustoimzer
          template={selectedTemplate}
          onSave={async (data) => {
            await createTemplateMutation.mutateAsync(data);
          }}
          onClose={() => {
            setShowEditor(false);
            setSelectedTemplateId(null);
          }}
          isLoading={createTemplateMutation.isPending || templateDetailQuery.isLoading}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-linear-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Checklist Templates</h1>
            <p className="text-gray-600">
              Manage PRISMA and custom checklist templates for your organization
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedTemplateId(null);
              setShowEditor(true);
            }}
            className="inline-flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            New Template
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {templatesQuery.isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (templatesQuery.data ?? []).length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No templates yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first checklist template to get started
            </p>
            <Button
              onClick={() => {
                setSelectedTemplateId(null);
                setShowEditor(true);
              }}
            >
              Create First Template
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(templatesQuery.data ?? []).map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onOpen={() => {
                  setSelectedTemplateId(template.id);
                  setShowEditor(true);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: ChecklistTemplateSummaryDto;
  onOpen: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onOpen }) => {
  return (
    <div className="border rounded-lg p-5 hover:shadow-lg transition-all group bg-white border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded",
                template.isSystem
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-emerald-100 text-emerald-700",
              )}
            >
              {template.isSystem ? "System" : "Custom"}
            </span>
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded",
                template.type === ChecklistTypeValue.ABSTRACT
                  ? "bg-amber-100 text-amber-700"
                  : "bg-sky-100 text-sky-700",
              )}
            >
              {template.type === ChecklistTypeValue.ABSTRACT ? "Abstract" : "Full"}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {template.description || "No description"}
          </p>
        </div>
      </div>

      <div className="mb-4 py-3 border-t border-gray-200 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items:</span>
          <span className="font-semibold text-gray-900">{template.itemCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Version:</span>
          <span className="font-semibold text-gray-900">{template.version}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <button
          onClick={onOpen}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
          title="Use template"
        >
          <FiCopy className="w-4 h-4" />
          <span>{template.isSystem ? "Use as Base" : "Edit as Copy"}</span>
        </button>
      </div>
    </div>
  );
};
