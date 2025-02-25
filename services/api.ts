import { logout } from "@/store/userSlice";
import { Event } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiServices = {
  async getUserData(sessionId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/user/data`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        document.cookie = "sessionId=; path=/; domain=lyhsca.org;";
        window.location.href =
          "https://auth.lyhsca.org/account/login?redirect_url=https://admin.lyhsca.org";
        throw Error(result.error);
      }
      const result = await response.json();
      return result.data;
    } catch (e) {
      console.error("Failed to get user data:", e);
      throw Error("Failed to get user data");
    }
  },
  async getBackendStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/status`, {
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
      const response = await fetch(`${API_BASE_URL}/v1/auth/logout`, {
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
  async updateMail(code: string, userName: string, status: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/mail/project/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          handler: userName,
          status: status,
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
      console.error("Error in takeOverMail:", error);
      throw error;
    }
  },
  async getMailDetail(code: string, userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/mail/project/detail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
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
      console.error("Error in getMailDetail:", error);
      throw error;
    }
  },
  async createCode(
    sessionId: string,
    vuli: boolean,
    level: string,
    setError: (error: string) => void,
    setCreateCodeStatus: (createCodeStatus: boolean) => void,
  ) {
    setCreateCodeStatus(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/user/staff/code/create`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionId}`,
          },
          body: JSON.stringify({
            vuli: vuli,
            level: level,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        return data.code;
      } else {
        const result = await response.json();
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error in createCode:", error);
      throw error;
    } finally {
      setCreateCodeStatus(false);
    }
  },
  async getAllCodeData(sessionId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/user/staff/code/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const result = await response.json();
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error in getAllCodeDate:", error);
      throw error;
    }
  },
  async deleteCode(sessionId: string, code: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/code/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          code: code,
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
      console.error("Error in deleteCode:", error);
      throw error;
    }
  },
  async getAllEvent() {
    try {
      const response = await fetch(`${API_BASE_URL}/event/all`, {
        method: "GET",
      });

      if (response.ok) {
        const events = await response.json();
        return events;
      } else {
        const result = await response.json();
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error in getAllEvent:", error);
      throw error;
    }
  },
  async addEvent(event: {
    id: string;
    title: string;
    description: string;
    date: string;
    office: string;
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/event/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          office: event.office,
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
      console.error("Error in createEvent:", error);
      throw error;
    }
  },

  async deleteProject(code: string, userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/mail/project/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
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
      console.error("Error in deleteProject:", error);
      throw error;
    }
  },
  async updateEvent(event: Event) {
    try {
      const response = await fetch(`${API_BASE_URL}/event/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          office: event.office,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const result = await response.json();
        throw new Error(result.error);
      }
    } catch (e) {
      console.error("Error in updateEvent:", e);
      throw e;
    }
  },
  async deleteEvent(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/event/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const result = await response.json();
        throw new Error(result.error);
      }
    } catch (e) {
      console.error("Error in deleteEvent:", e);
      throw e;
    }
  },
};
