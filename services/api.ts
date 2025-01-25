import { logout } from "@/store/userSlice";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiServices = {
  async getUserData(sessionId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verity`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw Error(result.error);
      }
      const data = await response.json();
      return data;
    } catch (e) {
      console.error("Failed to get user data:", e);
      throw Error("Failed to get user data");
    }
  },
  async getBackendStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/status`, {
        method: "GET",
      });

      if (!response.ok) {
        const result = await response.json();
        throw Error(result.error);
      }
      const data = await response.json();
      return data;
    } catch (e) {
      console.error("Failed to get backend status:", e);
      throw Error("Failed to get backend status");
    }
  },
  async Logout(sessionId: string, email: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          sessionId: sessionId,
        }),
      });

      if (response.ok) {
        document.cookie =
          "sessionId=; path=/; domain=lyhsca.org; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        logout();
        window.location.reload();
      } else {
        const result = await response.json();
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error in Logout:", error);
      throw error;
    }
  },
  async getMailList(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/mail/project/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const result = await response.json();
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error in getMailList:", error);
      throw error;
    }
  },
};
