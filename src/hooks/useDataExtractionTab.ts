import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useExtractionTemplates } from "./useExtractionTemplates";
import { templateToDataItems, dataItemsToTemplate } from "../services/dataExtractionService";
import type { DataItemDefinitionExtended, ExtractionTemplateDto } from "../types/dataExtraction";
import { generateId } from "../utils/uuid";

interface UseDataExtractionTabResult {
  templates: ExtractionTemplateDto[];
  currentTemplate: ExtractionTemplateDto | null;
  dataItems: DataItemDefinitionExtended[];
  isLoading: boolean;
  error: string | null;
  handleSelectTemplate: (templateId: string) => Promise<void>;
  handleDeleteTemplate: (templateId: string) => Promise<boolean>;
  handleCreateNewTemplate: () => void;
  handleDataItemsChange: (items: DataItemDefinitionExtended[]) => void;
  handleUpdateTemplateMeta: (name: string, description?: string) => void;
  getCurrentTemplateData: () => ExtractionTemplateDto | null;
  refreshTemplates: () => void;
}

export function useDataExtractionTab(): UseDataExtractionTabResult {
  const { processId, protocolId } = useParams<{ processId?: string; protocolId?: string }>();
  const currentProcessId = processId || protocolId || "";
  const {
    templates,
    isLoading,
    error,
    loadTemplates,
    loadTemplate,
    deleteTemplate,
  } = useExtractionTemplates();

  const [currentTemplate, setCurrentTemplate] = useState<ExtractionTemplateDto | null>(null);
  const [dataItems, setDataItems] = useState<DataItemDefinitionExtended[]>([]);

  useEffect(() => {
    if (currentProcessId) {
      void loadTemplates(currentProcessId);
    }
  }, [currentProcessId, loadTemplates]);

  const handleSelectTemplate = useCallback(
    async (templateId: string) => {
      const template = await loadTemplate(templateId);
      if (template) {
        setCurrentTemplate(template);
        const formId = `form_${generateId()}`;
        setDataItems(templateToDataItems(template, formId));
      }
    },
    [loadTemplate]
  );

  const handleDeleteTemplate = useCallback(
    async (templateId: string) => {
      const success = await deleteTemplate(templateId);
      if (success && currentTemplate?.templateId === templateId) {
        setCurrentTemplate(null);
        setDataItems([]);
      }
      return success;
    },
    [deleteTemplate, currentTemplate]
  );

  const handleCreateNewTemplate = useCallback(() => {
    const newTemplate: ExtractionTemplateDto = {
      dataExtractionProcessId: currentProcessId,
      name: "",
      description: "",
      sections: [],
      fields: [],
    };

    setCurrentTemplate(newTemplate);
    setDataItems([]);
  }, [currentProcessId]);

  const handleDataItemsChange = useCallback((items: DataItemDefinitionExtended[]) => {
    setDataItems(items);
  }, []);

  const handleUpdateTemplateMeta = useCallback((name: string, description?: string) => {
    setCurrentTemplate((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        name,
        description: description || "",
      };
    });
  }, []);

  const getCurrentTemplateData = useCallback((): ExtractionTemplateDto | null => {
    if (!currentTemplate || !currentProcessId) {
      return null;
    }

    if (!currentTemplate.name || !currentTemplate.name.trim()) {
      return null;
    }

    const templateData = dataItemsToTemplate(
      dataItems,
      currentProcessId,
      currentTemplate.name,
      currentTemplate.description ?? undefined,
      currentTemplate.templateId ?? undefined
    );

    return {
      ...templateData,
      sections: templateData.sections || [],
      fields: templateData.fields || [],
    };
  }, [currentTemplate, currentProcessId, dataItems]);

  const refreshTemplates = useCallback(() => {
    if (currentProcessId) {
      void loadTemplates(currentProcessId);
    }
  }, [currentProcessId, loadTemplates]);

  return {
    templates,
    currentTemplate,
    dataItems,
    isLoading,
    error,
    handleSelectTemplate,
    handleDeleteTemplate,
    handleCreateNewTemplate,
    handleDataItemsChange,
    handleUpdateTemplateMeta,
    getCurrentTemplateData,
    refreshTemplates,
  };
}