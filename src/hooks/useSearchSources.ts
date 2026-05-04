import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchSourceService } from "../services/searchSourceService";
import { masterSourceService } from "../services/masterSourceService";
import { QUERY_KEYS } from "../constants/queryKeys";
import type { SearchSourceDto } from "../types/searchSource";
import toast from "react-hot-toast";

const EMPTY_ARRAY: any[] = [];

export const useSearchSources = (projectId: string) => {
  const queryClient = useQueryClient();

  const { data: searchSources, isLoading: isLoadingSources } = useQuery({
    queryKey: QUERY_KEYS.searchSources.byProject(projectId),
    queryFn: async () => {
      const response = await searchSourceService.getByProjectId(projectId);
      return response.data;
    },
    enabled: !!projectId,
  });

  const { data: availableMasterSources, isLoading: isLoadingMasterSources } = useQuery({
    queryKey: QUERY_KEYS.masterSources.all,
    queryFn: async () => {
      const response = await masterSourceService.getAvailable();
      return response.data;
    },
  });

  const { mutateAsync: bulkUpsert, isPending: isUpserting } = useMutation({
    mutationFn: (sources: SearchSourceDto[]) => searchSourceService.bulkUpsert(sources),
    onSuccess: (response) => {
      if (response.isSuccess) {
        queryClient.setQueryData(QUERY_KEYS.searchSources.byProject(projectId), response.data);
        toast.success("Search sources updated successfully");
      } else {
        toast.error(response.message || "Failed to update search sources");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message || "An error occurred");
    },
  });

  return {
    searchSources: searchSources || EMPTY_ARRAY,
    isLoadingSources,
    availableMasterSources: availableMasterSources || EMPTY_ARRAY,
    isLoadingMasterSources,
    bulkUpsert,
    isUpserting,
    isLoading: isLoadingSources || isLoadingMasterSources,
  };
};
