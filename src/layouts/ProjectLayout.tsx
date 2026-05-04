import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCurrentProject } from "../redux/slices/projectSlice";
import { useProjectMember } from "../hooks/useProjectMember";

export default function ProjectLayout() {
  const dispatch = useDispatch();
  const { id, projectId } = useParams();
  const activeProjectId = projectId || id;

  // This ensures that currentProjectMember is always fetched and saved to Redux
  // whenever any subroute starting with /projects/{projectId} is accessed.
  // Handles reload/reconnect automatically via React Query.
  useProjectMember(activeProjectId);

  useEffect(() => {
    return () => {
      dispatch(clearCurrentProject());
    };
  }, [dispatch]);

  return <Outlet />;
}
