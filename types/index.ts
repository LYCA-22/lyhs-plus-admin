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

export interface UserData {
  sessionId: string;
  id: string;
  name: string;
  email: string;
  level: string;
  type: "staff" | "normal" | "";
  role: string;
  grade: string;
  class: string;
  isLoggedIn: boolean;
}
