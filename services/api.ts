import { logout } from "@/store/userSlice";
import { Event } from "@/types";
import { store } from "@/store/store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const getUserData = () => store.getState().userData;
const sessionId = () => {
  const userData = getUserData();
  return decodeURIComponent(decodeURIComponent(userData.sessionId));
};

export const apiServices = {
  // user
  async getUserData(sessionId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/user/me`, {
        method: "GET",
        headers: {
          "Session-Id": decodeURIComponent(decodeURIComponent(sessionId)),
          "Login-Type": "WEB",
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
  async verifySessionId(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/v1/auth/verify`, {
      method: "GET",
      headers: {
        "Session-Id": decodeURIComponent(decodeURIComponent(sessionId)),
        "Login-Type": "WEB",
      },
    });

    if (!response.ok) {
      const result = await response.json();
      document.cookie = "sessionId=; path=/; domain=lyhsca.org;";
      window.location.href =
        "https://auth.lyhsca.org/account/login?redirect_url=https://admin.lyhsca.org";
      throw Error(result.error);
    }
  },
  async Logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Session-Id": sessionId(),
          "Login-Type": "WEB",
        },
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

  // service status
  async getBackendStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Login-Type": "WEB",
        },
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
  async getServiceStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/admin/service/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Login-Type": "WEB",
          "Session-Id": sessionId(),
        },
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

  async getMailList() {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/lyps/srm/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Session-Id": sessionId(),
          "Login-Type": "WEB",
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
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
      const response = await fetch(`${API_BASE_URL}/v1/lyps/srm/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Session-Id": sessionId(),
          "Login-Type": "WEB",
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
  async getMailDetail(code: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/lyps/srm/detail?code=${code}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Session-Id": sessionId(),
            "Login-Type": "WEB",
          },
        },
      );

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
            "Session-Id": sessionId(),
            "Login-Type": "WEB",
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
  async getAllCodeData() {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/user/staff/code/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Session-Id": sessionId(),
          "Login-Type": "WEB",
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
  async deleteCode(code: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/user/staff/code?code=${code}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Session-Id": sessionId(),
            "Login-Type": "WEB",
          },
        },
      );

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
      const response = await fetch(`${API_BASE_URL}/v1/cal/events`, {
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
      const response = await fetch(`${API_BASE_URL}/v1/cal/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Session-Id": sessionId(),
          "Login-Type": "WEB",
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

  async deleteProject(code: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/lyps/srm/delete?code=${code}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Session-Id": sessionId(),
            "Login-Type": "WEB",
          },
        },
      );

      if (response.ok) {
        return true;
      } else {
        const result = await response.json();
        console.error(result.error);
        return false;
      }
    } catch (error) {
      console.error("Error in deleteProject:", error);
      throw error;
    }
  },
  async updateEvent(event: Event) {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/cal/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Session-Id": sessionId(),
          "Login-Type": "WEB",
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
      const response = await fetch(`${API_BASE_URL}/v1/cal/event?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Session-Id": sessionId(),
          "Login-Type": "WEB",
        },
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
  async getAccountTotal() {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/admin/account/total`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Session-Id": sessionId(),
          "Login-Type": "WEB",
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      } else {
        const result = await response.json();
        throw new Error(result.error);
      }
    } catch (e) {
      console.error("Error in getAccountTotal:", e);
      throw e;
    }
  },
  async listCases() {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/lyps/repair/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Session-Id": sessionId(),
          "Login-Type": "WEB",
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      } else {
        const result = await response.json();
        throw new Error(result.error);
      }
    } catch (e) {
      console.error("Error in listCases:", e);
      throw e;
    }
  },
};
