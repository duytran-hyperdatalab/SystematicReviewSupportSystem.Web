import api from "../config/axios";
import type { ApiResponse } from "../types/project";

export interface AnalyzeTopicRequest {
  topic: string;
  language: string;
}

export interface AnalyzeTopicResponse {
  objectives: string;
  domain: string;
}

export interface GeneratePicocRequest {
  topic: string;
  objectives: string;
  domain: string;
  language: string;
}

export interface GeneratePicocResponse {
  population: string;
  intervention: string;
  comparator: string;
  outcome: string;
  context: string;
}

export interface GenerateRqsRequest {
  topic: string;
  objectives: string;
  domain: string;
  language: string;
  picoc: GeneratePicocResponse;
}

export interface GenerateRqsResponse {
  suggestedQuestions: string[];
}

export interface ResearchQuestionInputDto {
  id: string | null;
  questionText: string;
}

export interface ResearchQuestionDetailDto {
  id: string;
  questionText: string;
}

export interface ProjectSetupDetailsResponse {
  researchTopic: string;
  researchObjective: string;
  domain: string;
  language: string;
  picoc: GeneratePicocResponse;
  researchQuestions: ResearchQuestionDetailDto[];
}

export interface UpdateSetupRequest {
  researchTopic: string;
  researchObjective: string;
  domain: string;
  language: string;
  picoc: GeneratePicocResponse;
  finalResearchQuestions: ResearchQuestionInputDto[];
}

class AiProjectSetupService {
  private readonly endpoint = "/projects";

  analyzeTopic = async (
    projectId: string,
    payload: AnalyzeTopicRequest,
  ): Promise<ApiResponse<AnalyzeTopicResponse>> => {
    const response = await api.post<ApiResponse<AnalyzeTopicResponse>>(
      `${this.endpoint}/${projectId}/ai-setup/analyze-topic`,
      payload,
    );
    return response.data;
  };

  generatePicoc = async (
    projectId: string,
    payload: GeneratePicocRequest,
  ): Promise<ApiResponse<GeneratePicocResponse>> => {
    const response = await api.post<ApiResponse<GeneratePicocResponse>>(
      `${this.endpoint}/${projectId}/ai-setup/generate-picoc`,
      payload,
    );
    return response.data;
  };

  generateRqs = async (
    projectId: string,
    payload: GenerateRqsRequest,
  ): Promise<ApiResponse<GenerateRqsResponse>> => {
    const response = await api.post<ApiResponse<GenerateRqsResponse>>(
      `${this.endpoint}/${projectId}/ai-setup/generate-rqs`,
      payload,
    );
    return response.data;
  };

  getSetupDetails = async (projectId: string): Promise<ApiResponse<ProjectSetupDetailsResponse>> => {
    const response = await api.get<ApiResponse<ProjectSetupDetailsResponse>>(
      `${this.endpoint}/${projectId}/ai-setup/setup-details`,
    );
    return response.data;
  };

  updateSetup = async (
    projectId: string,
    payload: UpdateSetupRequest,
  ): Promise<ApiResponse<null>> => {
    const response = await api.put<ApiResponse<null>>(
      `${this.endpoint}/${projectId}/ai-setup/setup-details`,
      payload,
    );
    return response.data;
  };
}

export const aiProjectSetupService = new AiProjectSetupService();
