import { useState, useCallback } from "react";
import { AxiosError, type AxiosRequestConfig } from "axios";
import api from "../config/axios";
import { type UseHttpResponse } from "../types/http";

export const useHttp = <TResponse = unknown, TPayload = unknown>(): UseHttpResponse<
  TResponse,
  TPayload
> => {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (
      method: string,
      url: string,
      payload?: TPayload,
      params?: Record<string, unknown>
    ): Promise<TResponse | null> => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const config: AxiosRequestConfig = {
          method,
          url,
          data: payload,
          params,
        };

        const response = await api.request<TResponse>(config);
        setData(response.data);
        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          "An unexpected error occurred.";
        setError(errorMessage);
        return null; // Return null on error so component can handle if needed
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    data,
    loading,
    error,
    execute,
  };
};
