import { useSelector } from "react-redux";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useProjectMember } from "../../hooks/useProjectMember";
import type { RootState } from "../../redux/store";

interface ProtectedRouteForProjectProps {
  allowedRoles?: number[];
  redirectTo?: string;
  forbiddenTo?: string;
}

/**
 * Resolves route-param placeholders (e.g. `:projectId`) in a path string
 * using the values from the current URL params.
 */
function resolvePath(
  template: string,
  params: Record<string, string | undefined>
): string {
  return template.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => params[key] ?? `:${key}`);
}

const ProtectedRouteForProject: React.FC<ProtectedRouteForProjectProps> = ({
  allowedRoles,
  redirectTo,
  forbiddenTo,
}) => {
  const params = useParams<Record<string, string>>();
  const { projectId } = params;

  const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
  const { member: currentProjectMember, isLoading, isFetching, error } = useProjectMember(projectId);

  // 1. Auth Guard: If not initialized, wait (handled by App.tsx usually)
  if (!isInitialized) return null;

  // 2. Auth Guard: If not authenticated, redirect to signin
  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace state={{ from: window.location.pathname }} />;
  }

  // 3. Project Guard: While fetching membership, show a loading indicator
  // Note: We check isLoading (first fetch) OR (isFetching AND !currentProjectMember) 
  // to handle cases where we are waiting for the API to confirm access.
  if (isLoading || (isFetching && !currentProjectMember)) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-sm text-muted-foreground">Verifying project access...</span>
      </div>
    );
  }

  // Case 1: Fetching failed or user is not a member (and we are NOT loading)
  if (error || !currentProjectMember) {
    if (redirectTo) {
      return <Navigate to={resolvePath(redirectTo, params)} replace />;
    }
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to access this project.</p>
        <button onClick={() => window.history.back()} className="mt-4 text-primary hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  // Case 2: Role not allowed
  if (
    allowedRoles &&
    currentProjectMember &&
    !allowedRoles.includes(currentProjectMember.role)
  ) {
    const fallback = forbiddenTo ?? redirectTo;
    if (fallback) {
      return <Navigate to={resolvePath(fallback, params)} replace />;
    }
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Insufficient Permissions</h2>
        <p className="text-muted-foreground">Your role does not allow access to this section.</p>
        <button onClick={() => window.history.back()} className="mt-4 text-primary hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRouteForProject;
