export interface BackendStatus {
  status: "operational" | "degraded";
  version?: string;
  services?: {
    database: DatabaseStatus;
  };
  timestamp: string;
  environment?: string;
  error?: string;
}

export interface DatabaseStatus {
  status: "connected" | "disconnected";
  latency?: string;
  error?: string;
}
