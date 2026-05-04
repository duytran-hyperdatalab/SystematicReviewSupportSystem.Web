import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import store, { type RootState } from "./redux/store";
import { updateAccessToken, setInitialized } from "./redux/slices/authSlice";
import { isTokenExpired } from "./utils/auth";
import "./App.css";
import AuthRoutes from "./routes/AuthRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import MainRoutes from "./routes/MainRoutes";
import NotFoundPage from "./pages/not-found/NotFoundPage";
import { authService } from "./services/authService";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, accessTokenExpiresAt, isInitialized } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // 3. Handle Expiration on App Initialization
    const CheckAuthentication = async () => {
      try {
        if (isAuthenticated && isTokenExpired(accessTokenExpiresAt)) {
          try {
            const response = await authService.refresh();

            if (response.isSuccess) {
              const { accessToken, accessTokenExpiresAt } = response.data;

              // Update the store, after this all requests will use the new token (axios apply access token from store before each request)
              store.dispatch(updateAccessToken({ accessToken, accessTokenExpiresAt }));
            } else {
              // dispatch(logout());
              // toastWarning("Session expired", "Session timed out, please sign in again.");
              // navigate("/auth/signin");
              console.log("Session expired.")
            }
          } catch {
            // dispatch(logout());
            // toastWarning("Session expired", "Session timed out, please sign in again.");
            // navigate("/auth/signin");
            console.log("Session expired.")
          }
        }
      } finally {
        dispatch(setInitialized(true));
      }
    };
    CheckAuthentication();
  }, [isAuthenticated, accessTokenExpiresAt, dispatch, navigate]); // Added dependencies for clarity

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium text-muted-foreground animate-pulse">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="auth/*" element={<AuthRoutes />} />
      <Route path="admin/*" element={<AdminRoutes />} />
      <Route path="404" element={<NotFoundPage />} />
      <Route path="*" element={<MainRoutes />} />
    </Routes>
  );
}

export default App;
