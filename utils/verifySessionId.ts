import { apiServices } from "@/services/api";
import { getCookie } from "./getCookie";

export async function verifySessionId(): Promise<{
  sessionId: string;
  status: boolean;
}> {
  try {
    const sessionId = getCookie("sessionId");
    console.log(sessionId);
    if (!sessionId) {
      throw new Error("Session ID not found");
    }

    await apiServices.verifySessionId(sessionId);
    return { status: true, sessionId: sessionId };
  } catch (e) {
    console.log(e);
    return { status: false, sessionId: "" };
  }
}
