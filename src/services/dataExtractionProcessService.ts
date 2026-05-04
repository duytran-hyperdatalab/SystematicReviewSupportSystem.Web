import api from "../config/axios";
import type { ApiResponse } from "../types/project";
import type { DataExtractionProcess } from "../types/reviewProcess";

type DataExtractionProcessResponse = ApiResponse<DataExtractionProcess>;

export const dataExtractionProcessService = {
  async getById(id: string): Promise<DataExtractionProcess> {
    const response = await api.get<DataExtractionProcessResponse>(
      `/data-extraction-processes/${id}`,
    );
    const data = response.data;
    if (!data.isSuccess || !data.data) {
      throw new Error(data.message || "Failed to get data extraction process");
    }
    return data.data;
  },

  async start(id: string): Promise<DataExtractionProcessResponse> {
    const response = await api.post<DataExtractionProcessResponse>(
      `/data-extraction-processes/${id}/start`,
    );
    const data = response.data;
    if (!data.isSuccess) {
      throw new Error(data.message || "Failed to start data extraction");
    }
    return data;
  },

  async completeProcess(id: string): Promise<DataExtractionProcessResponse> {
    const response = await api.post<DataExtractionProcessResponse>(
      `/data-extraction-processes/${id}/complete`,
    );
    const data = response.data;
    if (!data.isSuccess) {
      throw new Error(data.message || "Failed to complete data extraction");
    }
    return data;
  },
};
