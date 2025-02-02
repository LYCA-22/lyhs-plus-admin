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

export type ViewType = "month" | "week" | "day";

export interface EventCategory {
  id: string;
  name: string;
  color?: string;
  textColor?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  color?: string;
  textColor?: string;
  categoryId?: string;
}

export interface CalendarProps {
  events?: CalendarEvent[];
  categories?: EventCategory[];
  onEventAdd?: (event: Omit<CalendarEvent, "id">) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}
