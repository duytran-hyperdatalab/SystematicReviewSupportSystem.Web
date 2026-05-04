import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
  HubConnectionState,
} from "@microsoft/signalr";

const API_BE_URL = import.meta.env.VITE_BE_URL || "";
const HUB_URL = `${API_BE_URL}/hubs/notification`;

class SignalRManager {
  private static instance: SignalRManager;
  private connection: HubConnection | null = null;
  private startedPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): SignalRManager {
    if (!SignalRManager.instance) {
      SignalRManager.instance = new SignalRManager();
    }
    return SignalRManager.instance;
  }

  /**
   * Initializes and starts the connection if it doesn't exist.
   */
  public async start(accessToken: string): Promise<HubConnection> {
    if (this.connection) {
      // If already connected or connecting, return the existing connection
      if (this.connection.state !== HubConnectionState.Disconnected) {
        return this.connection;
      }
    }

    console.log("[SignalR] Initializing connection...");

    this.connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => accessToken,
        transport: HttpTransportType.WebSockets,
        skipNegotiation: false,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          console.log(`[SignalR] Reconnect attempt #${retryContext.previousRetryCount + 1}`);
          return Math.min(10000, retryContext.previousRetryCount * 2000);
        },
      })
      .configureLogging(LogLevel.Information)
      .build();

    // Listen to lifecycle events for debugging
    this.connection.onreconnecting((error) => {
      console.warn("[SignalR] Connection lost, reconnecting...", error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log("[SignalR] Reconnected. Connection ID:", connectionId);
    });

    this.connection.onclose((error) => {
      console.error("[SignalR] Connection closed.", error);
    });

    this.startedPromise = (async () => {
      try {
        await this.connection!.start();
        console.log("[SignalR] Connected successfully. ID:", this.connection!.connectionId);
      } catch (err) {
        console.error("[SignalR] Connection failed:", err);
        this.startedPromise = null;
        throw err;
      }
    })();

    await this.startedPromise;
    return this.connection;
  }

  /**
   * Safe registration of event handlers.
   * Ensures handlers are only added once they are ready.
   */
  public async registerHandler(eventName: string, handler: (...args: any[]) => void) {
    // If we have a started promise, wait for it
    if (this.startedPromise) {
      await this.startedPromise;
    }

    if (this.connection) {
      console.log(`[SignalR] Registering handler for: ${eventName}`);
      // Remove existing handler first to prevent duplicates
      this.connection.off(eventName, handler);
      this.connection.on(eventName, handler);
    } else {
      console.warn(`[SignalR] Cannot register handler for ${eventName}: No connection instance.`);
    }
  }

  public removeHandler(eventName: string, handler: (...args: any[]) => void) {
    if (this.connection) {
      console.log(`[SignalR] Removing handler for: ${eventName}`);
      this.connection.off(eventName, handler);
    }
  }

  public async stop() {
    if (this.connection) {
      console.log("[SignalR] Stopping connection...");
      await this.connection.stop();
      this.connection = null;
      this.startedPromise = null;
    }
  }

  public getConnectionState(): HubConnectionState {
    return this.connection?.state ?? HubConnectionState.Disconnected;
  }
}

export const signalRService = SignalRManager.getInstance();

// Legacy compatibility (if needed)
export const getSignalRConnection = (accessToken?: string) =>
  signalRService.start(accessToken || "");
export const startSignalRConnection = (accessToken?: string) =>
  signalRService.start(accessToken || "");
export const stopSignalRConnection = () => signalRService.stop();
