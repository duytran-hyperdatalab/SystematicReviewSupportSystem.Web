import { useEffect, useState, useRef } from "react";
import { HubConnectionState } from "@microsoft/signalr";
import { signalRService } from "../services/signalrClient";
import { ConnectionState, type SignalREvents } from "../types/signalr";

/**
 * useSignalRSubscription - Subscribe to a SignalR event with automatic cleanup.
 *
 * Key features:
 * - Handler always receives the latest version (avoids stale closure)
 * - Re-subscribes only when the event name changes (not on handler updates)
 * - Automatic cleanup on unmount or event change
 *
 * @param event - The SignalR event to subscribe to
 * @param handler - The callback function to invoke when the event fires
 */
export const useSignalRSubscription = <E extends keyof SignalREvents>(
  event: E,
  handler: SignalREvents[E],
) => {
  const handlerRef = useRef(handler);

  // Update the ref to the latest handler on every render
  // This ensures the wrapped handler always calls the current version
  useEffect(() => {
    handlerRef.current = handler;
  });

  // Subscribe/unsubscribe effect
  // Depends only on event name, so we only re-subscribe when the event changes
  useEffect(() => {
    if (!event) return;

    // Stable wrapper that delegates to the latest handler via ref
    const wrappedHandler = (...args: any[]) => {
      console.log(`[useSignalRSubscription] Event received: ${event}`, args);
      if (handlerRef.current) {
        (handlerRef.current as any)(...args);
      }
    };

    console.log(`[useSignalRSubscription] Subscribing to: ${event}`);
    signalRService.registerHandler(event, wrappedHandler);

    return () => {
      console.log(`[useSignalRSubscription] Unsubscribing from: ${event}`);
      signalRService.removeHandler(event, wrappedHandler);
    };
  }, [event]); // Only re-subscribe if the event name changes
};

/**
 * useSignalR - Production ready hook for SignalR connection state management.
 *
 * @returns Connection state and utilities for manual event binding
 */
export const useSignalR = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.Disconnected,
  );

  useEffect(() => {
    const updateState = () => {
      const state = signalRService.getConnectionState();
      switch (state) {
        case HubConnectionState.Connected:
          setConnectionState(ConnectionState.Connected);
          break;
        case HubConnectionState.Connecting:
          setConnectionState(ConnectionState.Connecting);
          break;
        case HubConnectionState.Reconnecting:
          setConnectionState(ConnectionState.Reconnecting);
          break;
        case HubConnectionState.Disconnected:
          setConnectionState(ConnectionState.Disconnected);
          break;
      }
    };

    // Initial check
    updateState();

    // Poll connection state since the service is a singleton without an event emitter
    const interval = setInterval(updateState, 2000);

    return () => clearInterval(interval);
  }, []);

  return {
    connectionState,
    // For manual control if ever needed
    on: signalRService.registerHandler.bind(signalRService),
    off: signalRService.removeHandler.bind(signalRService),
  };
};
