import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { projectService } from "../services/projectService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { setProjectMember } from "../redux/slices/projectSlice";
import type { RootState } from "../redux/store";

/**
 * Hook to manage and sync the current project member state with Redux.
 * Ensures the membership information is fetched if missing and kept up to date.
 */
export const useProjectMember = (projectId: string | undefined) => {
  const dispatch = useDispatch();
  const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
  const currentProjectMember = useSelector((state: RootState) => state.project.currentProjectMember);

  const query = useQuery({
    queryKey: QUERY_KEYS.projects.myMembership(projectId || ""),
    queryFn: () => (projectId ? projectService.getMyMembership(projectId) : Promise.reject("No project ID")),
    enabled: !!projectId && isAuthenticated && isInitialized,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data?.isSuccess && query.data.data) {
      const { role, roleText } = query.data.data;
      
      // Update Redux if the data is different or missing
      if (
        !currentProjectMember ||
        currentProjectMember.role !== role ||
        currentProjectMember.roleText !== roleText
      ) {
        dispatch(
          setProjectMember({
            role,
            roleText,
            isLeader: role === 1,
          })
        );
      }
    }
  }, [query.data, dispatch, currentProjectMember]);

  return {
    member: currentProjectMember,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};
