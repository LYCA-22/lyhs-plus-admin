import { FormattedStudent } from "@/app/app/member/batch/page";
import { userMemberData } from "@/types";

const API_BASE_URL = "https://api.lyhssa.org";

export const ApiService = {
  async getUserData(access_token: string): Promise<userMemberData> {
    const response = await fetch(`${API_BASE_URL}/v1/user/me`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const data = await response.json();
    return data.data as userMemberData;
  },

  async getMemberList(access_token: string): Promise<userMemberData[]> {
    const response = await fetch(`${API_BASE_URL}/v1/admin/user/list`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const data = await response.json();
    return data.data as userMemberData[];
  },

  async batchUser(
    access_token: string,
    students: FormattedStudent[],
  ): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/v1/admin/user/create/batch`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ students: students }),
    });
    return response.ok;
  },
};
