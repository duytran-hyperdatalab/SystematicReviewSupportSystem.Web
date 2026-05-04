import { useState, useCallback } from "react";
import { dataExtractionTemplateService } from "../services/dataExtractionService";
import type { ExtractionTemplateDto, ExtractionTemplateResponseDto } from "../types/dataExtraction";
import { toastError, toastSuccess } from "../utils/toast";

interface UseExtractionTemplatesResult {
  templates: ExtractionTemplateDto[];
  isLoading: boolean;
  error: string | null;
  loadTemplates: (processId: string) => Promise<void>;
  loadTemplate: (templateId: string) => Promise<ExtractionTemplateDto | null>;
  saveTemplate: (template: ExtractionTemplateDto) => Promise<ExtractionTemplateResponseDto | null>;
  deleteTemplate: (templateId: string) => Promise<boolean>;
}

export function useExtractionTemplates(): UseExtractionTemplatesResult {
  const [templates, setTemplates] = useState<ExtractionTemplateDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async (processId: string) => {
    if (!processId || processId === "undefined") {
      setError("Data Extraction Process ID is required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await dataExtractionTemplateService.getByProcessId(processId);
      setTemplates(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load templates";
      setError(errorMessage);
      console.error("Failed to load extraction templates:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTemplate = useCallback(async (templateId: string) => {
    if (!templateId) {
      setError("Template ID is required");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const template = await dataExtractionTemplateService.getById(templateId);
      return template;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load template";
      setError(errorMessage);
      console.error("Failed to load template:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveTemplate = useCallback(async (template: ExtractionTemplateDto) => {
    const isUpdateAction = Boolean(template.templateId);

    try {
      setIsLoading(true);
      setError(null);

      const savedTemplate = await dataExtractionTemplateService.upsert(template);

      // Update local state
      setTemplates((prev) => {
        const index = prev.findIndex((t) => t.templateId === savedTemplate.templateId);
        if (index >= 0) {
          // Update existing
          const updated = [...prev];
          updated[index] = savedTemplate;
          return updated;
        }
        // Add new
        return [...prev, savedTemplate];
      });

      toastSuccess(
        isUpdateAction ? "Template Updated" : "Template Created",
        `Extraction template ${isUpdateAction ? "updated" : "created"} successfully.`
      );

      return savedTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save template";
      setError(errorMessage);
      console.error("Failed to save template:", err);
      toastError("Save Failed", errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await dataExtractionTemplateService.delete(templateId);

      // Remove from local state
      setTemplates((prev) => prev.filter((t) => t.templateId !== templateId));

      toastSuccess("Template Deleted", "Extraction template has been deleted.");

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete template";
      setError(errorMessage);
      console.error("Failed to delete template:", err);
      toastError("Delete Failed", errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    templates,
    isLoading,
    error,
    loadTemplates,
    loadTemplate,
    saveTemplate,
    deleteTemplate,
  };
}