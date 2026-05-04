// Paper Import Service - API Integration Layer
// Handles RIS file upload with progress tracking
// Source: PaperAPI.md

import api from "../config/axios";
import type { RisFileImportRequest, RisImportResponse, FileValidationResult } from "../types/paper";

/**
 * File Upload Configuration
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = [".ris"];

/**
 * Validate RIS file before upload
 */
export const validateRisFile = (file: File): FileValidationResult => {
  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(", ")} files are allowed.`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
    };
  }

  // Check file not empty
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty.",
    };
  }

  return { valid: true };
};

/**
 * Progress callback function type
 */
export type ProgressCallback = (progressPercent: number) => void;

/**
 * Paper Import Service
 * Implements RIS file import endpoint from PaperAPI.md
 */
export const paperImportService = {
  /**
   * Import RIS file with progress tracking
   * POST /api/papers/import/ris
   * Content-Type: multipart/form-data
   *
   * @param request - RIS file import request
   * @param onProgress - Optional callback for upload progress
   * @returns Import result with statistics
   */
  async importRisFile(
    request: RisFileImportRequest,
    onProgress?: ProgressCallback,
  ): Promise<RisImportResponse> {
    // Client-side validation
    const validation = validateRisFile(request.file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Build FormData
    const formData = new FormData();
    formData.append("file", request.file);
    formData.append("projectId", request.projectId);

    if (request.searchSourceId) {
      formData.append("searchSourceId", request.searchSourceId);
    }

    // Upload with progress tracking
    const response = await api.post<RisImportResponse>("/papers/import/ris", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    const result = response.data;
    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to import RIS file");
    }
    return result;
  },

  /**
   * Quick import for drag-and-drop or single file upload
   * Wrapper around importRisFile with simplified parameters
   */
  async quickImport(
    file: File,
    projectId: string,
    searchSourceId?: string,
    onProgress?: ProgressCallback,
  ): Promise<RisImportResponse> {
    return this.importRisFile(
      {
        file,
        projectId,
        searchSourceId,
      },
      onProgress,
    );
  },
};
