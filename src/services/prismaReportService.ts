// PRISMA Report Service — API calls for PRISMA report endpoints

import api from "../config/axios";
import type { ApiResponse } from "../types/project";
import type {
  GeneratePrismaReportRequest,
  PrismaReportResponse,
  PrismaReportListResponse,
} from "../types/prismaReport";

class PrismaReportService {
  private static instance: PrismaReportService;

  private constructor() {}

  static getInstance(): PrismaReportService {
    if (!PrismaReportService.instance) {
      PrismaReportService.instance = new PrismaReportService();
    }
    return PrismaReportService.instance;
  }

  /** Generate a new PRISMA report snapshot for a review process */
  async generateReport(
    reviewProcessId: string,
    request: GeneratePrismaReportRequest = {},
  ): Promise<ApiResponse<PrismaReportResponse>> {
    const response = await api.post<ApiResponse<PrismaReportResponse>>(
      `/review-processes/${reviewProcessId}/prisma-report`,
      request,
    );
    return response.data;
  }

  /** Get a specific PRISMA report by its ID */
  async getReportById(reportId: string): Promise<ApiResponse<PrismaReportResponse>> {
    const response = await api.get<ApiResponse<PrismaReportResponse>>(
      `/prisma-reports/${reportId}`,
    );
    return response.data;
  }

  /** Get all PRISMA reports for a review process */
  async getReportsByReviewProcess(
    reviewProcessId: string,
  ): Promise<ApiResponse<PrismaReportListResponse[]>> {
    const response = await api.get<ApiResponse<PrismaReportListResponse[]>>(
      `/review-processes/${reviewProcessId}/prisma-reports`,
    );
    return response.data;
  }

  /** Get the latest PRISMA report for a review process */
  async getLatestReport(reviewProcessId: string): Promise<ApiResponse<PrismaReportResponse>> {
    const response = await api.get<ApiResponse<PrismaReportResponse>>(
      `/review-processes/${reviewProcessId}/prisma-report/latest`,
    );
    return response.data;
  }
}

const prismaReportService = PrismaReportService.getInstance();
export default prismaReportService;
