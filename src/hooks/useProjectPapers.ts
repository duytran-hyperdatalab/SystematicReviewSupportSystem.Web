import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paperService } from "../services/paperService";
import type { 
  AssignPapersRequest 
} from "../types/paper";

export const useAssignPapers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: AssignPapersRequest) => paperService.assignPapers(request),
    onSuccess: (_, variables) => {
      // Invalidate papers list for general project views
      queryClient.invalidateQueries({ queryKey: ["project-papers"] });
      queryClient.invalidateQueries({ queryKey: ["project-checked-duplicates"] });
      
      // Invalidate specifically for study selection phases if process ID is present
      if (variables.studySelectionProcessId) {
        queryClient.invalidateQueries({ 
          queryKey: ["title-abstract-assignment-papers", variables.studySelectionProcessId] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ["full-text-assignment-papers", variables.studySelectionProcessId] 
        });

        // Invalidate specific conflict details for each modified paper
        variables.paperIds.forEach((paperId) => {
          queryClient.invalidateQueries({
            queryKey: ["conflict-detail", variables.studySelectionProcessId, paperId, variables.phase],
          });
        });
      }
    },
  });
};
