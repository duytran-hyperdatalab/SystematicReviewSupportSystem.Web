import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../redux/store";
import { signalRService } from "../services/signalrClient";
import { useSignalR } from "../hooks/useSignalR";

/**
 * SignalRConnectionManager
 *
 * This component handles the lifecycle of the SignalR service.
 */
const SignalRConnectionManager: React.FC = () => {
  const { isAuthenticated, accessToken } = useSelector((state: RootState) => state.auth);

  // Initialize the hook to track connection state
  useSignalR();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      console.log("[SignalRManager] Starting connection as user is authenticated...");
      signalRService.start(accessToken).catch((err) => {
        console.error("[SignalRManager] Failed to start connection:", err);
      });
    } else {
      console.log("[SignalRManager] User logged out, stopping connection...");
      signalRService.stop();
    }
  }, [isAuthenticated, accessToken]);

  return null;
};

export default SignalRConnectionManager;
